// ============================================================================
// Signal Firmware Ops — Build Guides (sg-21 through sg-25)
// Custom firmware, badge hacking, field terminals, and IDS
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-21: Custom Firmware: ESP32 from Scratch
    // ========================================================================
    'sg-21': {
        intro: '<p>Up to this point, you have been using the Arduino framework &mdash; a simplified wrapper that hides the ESP32\'s real power. In this project, you go underneath the abstraction and write firmware using PlatformIO with the ESP-IDF (Espressif IoT Development Framework), the official native SDK.</p>' +
               '<p>ESP-IDF gives you direct access to the RTOS task scheduler, partition tables, NVS (non-volatile storage), OTA updates, and fine-grained control over WiFi and BLE. This is how professional ESP32 products are built &mdash; from smart locks to industrial sensors.</p>' +
               '<p>You will set up a PlatformIO project from scratch, understand the ESP32 boot process, write firmware with WiFi connectivity, BLE, and OTA update capability, then flash and monitor it over serial.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

            '<defs>' +
            '<pattern id="sg21-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="680" height="380" fill="url(#sg21-grid)" rx="4"/>' +

            '<!-- Title -->' +
            '<text x="350" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">ESP32 FIRMWARE DEVELOPMENT SETUP</text>' +

            '<!-- ESP32 DevKit -->' +
            '<g>' +
            '<rect x="80" y="80" width="200" height="220" rx="10" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="80" y="80" width="200" height="28" rx="10" fill="rgba(59,130,246,0.15)"/>' +
            '<rect x="80" y="100" width="200" height="8" fill="rgba(59,130,246,0.15)"/>' +
            '<text x="180" y="98" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="600">ESP32 DevKit V1</text>' +
            '<!-- Chip -->' +
            '<rect x="130" y="130" width="100" height="60" rx="6" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="180" y="155" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">ESP32-WROOM</text>' +
            '<text x="180" y="170" text-anchor="middle" fill="#4488cc" font-size="7">Dual-Core 240MHz</text>' +
            '<text x="180" y="182" text-anchor="middle" fill="#4488cc" font-size="7">WiFi + BLE</text>' +
            '<!-- Onboard LED -->' +
            '<circle cx="140" cy="215" r="6" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<text x="155" y="218" fill="#8b949e" font-size="7">LED (GPIO2)</text>' +
            '<!-- Boot button -->' +
            '<rect x="120" y="240" width="30" height="16" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>' +
            '<text x="155" y="252" fill="#8b949e" font-size="7">BOOT</text>' +
            '<!-- EN button -->' +
            '<rect x="120" y="264" width="30" height="16" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>' +
            '<text x="155" y="276" fill="#8b949e" font-size="7">EN/RST</text>' +
            '<!-- USB port -->' +
            '<rect x="155" y="288" width="50" height="16" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="180" y="300" text-anchor="middle" fill="#888" font-size="7">USB</text>' +
            '</g>' +

            '<!-- USB Cable -->' +
            '<line x1="205" y1="296" x2="420" y2="296" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>' +
            '<line x1="205" y1="296" x2="420" y2="296" stroke="#eab308" stroke-width="1" stroke-dasharray="6,4" opacity="0.5"/>' +
            '<rect x="290" y="283" width="80" height="16" rx="3" fill="rgba(0,0,0,0.7)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="330" y="294" text-anchor="middle" fill="#fde68a" font-size="8">USB Cable</text>' +

            '<!-- PC / Laptop -->' +
            '<g>' +
            '<rect x="420" y="80" width="230" height="220" rx="10" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="420" y="80" width="230" height="28" rx="10" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="420" y="100" width="230" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="535" y="98" text-anchor="middle" fill="#22c55e" font-size="11" font-weight="600">PC / LAPTOP</text>' +
            '<!-- PlatformIO -->' +
            '<rect x="445" y="125" width="180" height="50" rx="6" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.25)" stroke-width="0.5"/>' +
            '<text x="535" y="145" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">PlatformIO + VS Code</text>' +
            '<text x="535" y="160" text-anchor="middle" fill="#a78bfa" font-size="7">ESP-IDF Framework</text>' +
            '<!-- Serial Monitor -->' +
            '<rect x="445" y="185" width="85" height="35" rx="4" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="488" y="200" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">Serial Mon</text>' +
            '<text x="488" y="212" text-anchor="middle" fill="#a3860f" font-size="6">115200 baud</text>' +
            '<!-- Flash Tool -->' +
            '<rect x="540" y="185" width="85" height="35" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="583" y="200" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">Flash Tool</text>' +
            '<text x="583" y="212" text-anchor="middle" fill="#b03030" font-size="6">esptool.py</text>' +
            '<!-- Firmware binary -->' +
            '<rect x="445" y="232" width="180" height="30" rx="4" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="535" y="250" text-anchor="middle" fill="#60a5fa" font-size="7">.pio/build/esp32dev/firmware.bin</text>' +
            '</g>' +

            '<!-- Data flow arrows -->' +
            '<text x="330" y="270" text-anchor="middle" fill="#eab308" font-size="7">Flash + Serial + OTA</text>' +
            '<polygon points="280,296 270,290 270,302" fill="#eab308" opacity="0.6"/>' +
            '<polygon points="380,296 390,290 390,302" fill="#eab308" opacity="0.6"/>' +

            '<!-- Bottom info bar -->' +
            '<rect x="40" y="330" width="620" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
            '<text x="60" y="348" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">NO EXTERNAL WIRING</text>' +
            '<text x="60" y="366" fill="#8b949e" font-size="8">USB cable carries power, flash data, and serial debug. PlatformIO auto-detects the port.</text>' +

            '</svg>' +
            '</div>',

        wiring: '    ESP32 DevKit V1\n' +
                '    +---------------------------+\n' +
                '    |                           |\n' +
                '    |   No external wiring      |\n' +
                '    |                           |\n' +
                '    |   USB  ===cable===  PC    |\n' +
                '    |   (flash + serial)        |\n' +
                '    |                           |\n' +
                '    +---------------------------+\n' +
                '\n' +
                '    PlatformIO handles flashing and monitoring.\n' +
                '    No Arduino IDE needed for this project.',

        wiringNotes: '<p><strong>PlatformIO vs Arduino IDE:</strong> PlatformIO is a professional embedded development platform that runs as a VS Code extension. It handles toolchains, libraries, and build configurations automatically. It supports both Arduino framework and native ESP-IDF.</p>' +
                     '<p><strong>Boot button:</strong> If upload fails, hold the BOOT button on the DevKit while the upload starts. Release after you see "Connecting..." in the terminal. Some clones require this every time.</p>',

        steps: [
            {
                title: 'Install PlatformIO',
                content: '<p>Install VS Code, then add the PlatformIO IDE extension from the marketplace. After installation, restart VS Code. The PlatformIO icon (alien head) appears in the left sidebar.</p>' +
                         '<p>Create a new project: PlatformIO Home &gt; New Project. Name it "sg21-firmware". Board: "Espressif ESP32 Dev Module". Framework: select <strong>espidf</strong> (not Arduino). Click Finish.</p>',
                code: '# Project structure created by PlatformIO:\n# sg21-firmware/\n#   platformio.ini      -- build config\n#   src/\n#     main.c            -- your firmware entry point\n#   sdkconfig.defaults  -- ESP-IDF menuconfig defaults\n#   CMakeLists.txt      -- build system\n\n# platformio.ini contents:\n[env:esp32dev]\nplatform = espressif32\nboard = esp32dev\nframework = espidf\nmonitor_speed = 115200\nboard_build.partitions = default.csv',
                language: 'Bash',
                tip: '<strong>Tip:</strong> The first build takes several minutes while PlatformIO downloads the ESP-IDF toolchain (~1.5GB). Subsequent builds are much faster. Do not interrupt the first build.'
            },
            {
                title: 'Write Your First ESP-IDF Application',
                content: '<p>ESP-IDF uses FreeRTOS under the hood. Your entry point is <code>app_main()</code>, not <code>setup()/loop()</code>. The RTOS lets you create multiple tasks that run concurrently &mdash; far more powerful than Arduino\'s single-threaded model.</p>',
                code: '#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "esp_log.h"\n#include "esp_system.h"\n\nstatic const char *TAG = "SG21";\n\nvoid blink_task(void *pvParams) {\n    gpio_reset_pin(GPIO_NUM_2);\n    gpio_set_direction(GPIO_NUM_2, GPIO_MODE_OUTPUT);\n    \n    while (1) {\n        gpio_set_level(GPIO_NUM_2, 1);\n        vTaskDelay(500 / portTICK_PERIOD_MS);\n        gpio_set_level(GPIO_NUM_2, 0);\n        vTaskDelay(500 / portTICK_PERIOD_MS);\n    }\n}\n\nvoid app_main(void) {\n    ESP_LOGI(TAG, "SG-21: Custom firmware starting");\n    ESP_LOGI(TAG, "Free heap: %lu bytes", esp_get_free_heap_size());\n    ESP_LOGI(TAG, "IDF version: %s", esp_get_idf_version());\n    \n    // Create a blink task on core 1\n    xTaskCreatePinnedToCore(\n        blink_task,    // function\n        "blink",       // name\n        2048,          // stack size\n        NULL,          // parameters\n        5,             // priority\n        NULL,          // task handle\n        1              // core ID\n    );\n    \n    // Main task continues here\n    while (1) {\n        ESP_LOGI(TAG, "Main task running, heap: %lu",\n                 esp_get_free_heap_size());\n        vTaskDelay(5000 / portTICK_PERIOD_MS);\n    }\n}',
                language: 'C',
                tip: '<strong>Tip:</strong> <code>ESP_LOGI</code> (info), <code>ESP_LOGW</code> (warning), <code>ESP_LOGE</code> (error) are the ESP-IDF logging macros. They include the TAG, timestamps, and can be filtered by log level. Far superior to <code>printf</code> for embedded debugging.'
            },
            {
                title: 'Understand Partition Tables',
                content: '<p>The ESP32 flash is divided into partitions: bootloader, NVS (settings storage), OTA partitions, and your application. Understanding this layout is essential for OTA updates and persistent storage.</p>',
                code: '# Default partition table (default.csv):\n# Name,    Type, SubType, Offset,   Size\n# nvs,     data, nvs,     0x9000,   0x6000\n# phy_init,data, phy,     0xf000,   0x1000\n# factory, app,  factory, 0x10000,  1M\n\n# OTA-capable partition table (ota.csv):\n# Name,    Type, SubType, Offset,   Size\n# nvs,     data, nvs,     0x9000,   0x4000\n# otadata, data, ota,     0xd000,   0x2000\n# phy_init,data, phy,     0xf000,   0x1000\n# ota_0,   app,  ota_0,   0x10000,  0x1E0000\n# ota_1,   app,  ota_1,   0x1F0000, 0x1E0000\n\n# To use OTA partitions, change platformio.ini:\n# board_build.partitions = partitions_ota.csv\n\n# Read partition info at runtime:\n#include "esp_partition.h"\n\nvoid print_partitions() {\n    esp_partition_iterator_t it = esp_partition_find(\n        ESP_PARTITION_TYPE_ANY, ESP_PARTITION_SUBTYPE_ANY, NULL);\n    while (it != NULL) {\n        const esp_partition_t *p = esp_partition_get(it);\n        ESP_LOGI(TAG, "Partition: %s, type:%d, subtype:%d, offset:0x%lx, size:0x%lx",\n                 p->label, p->type, p->subtype, p->address, p->size);\n        it = esp_partition_next(it);\n    }\n    esp_partition_iterator_release(it);\n}',
                language: 'C',
                tip: '<strong>Tip:</strong> OTA requires two app partitions (ota_0 and ota_1). The running firmware writes the new version to the other partition, then sets the bootloader to boot from it on restart. If the new firmware fails, the bootloader falls back to the previous version.'
            },
            {
                title: 'Add WiFi Station Mode',
                content: '<p>Connect to a WiFi network using the ESP-IDF WiFi driver. This is more verbose than Arduino\'s <code>WiFi.begin()</code> but gives you full control over events, error handling, and reconnection logic.</p>',
                code: '#include "esp_wifi.h"\n#include "esp_event.h"\n#include "nvs_flash.h"\n\n#define WIFI_SSID "YourNetwork"\n#define WIFI_PASS "YourPassword"\n\nstatic void wifi_event_handler(void *arg, esp_event_base_t base,\n                               int32_t id, void *data) {\n    if (base == WIFI_EVENT && id == WIFI_EVENT_STA_START) {\n        esp_wifi_connect();\n    } else if (base == WIFI_EVENT && id == WIFI_EVENT_STA_DISCONNECTED) {\n        ESP_LOGW(TAG, "Disconnected, reconnecting...");\n        esp_wifi_connect();\n    } else if (base == IP_EVENT && id == IP_EVENT_STA_GOT_IP) {\n        ip_event_got_ip_t *event = (ip_event_got_ip_t *)data;\n        ESP_LOGI(TAG, "Connected! IP: " IPSTR, IP2STR(&event->ip_info.ip));\n    }\n}\n\nvoid wifi_init_sta(void) {\n    // Initialize NVS (required for WiFi)\n    esp_err_t ret = nvs_flash_init();\n    if (ret == ESP_ERR_NVS_NO_FREE_PAGES) {\n        nvs_flash_erase();\n        nvs_flash_init();\n    }\n    \n    // Initialize network stack\n    esp_netif_init();\n    esp_event_loop_create_default();\n    esp_netif_create_default_wifi_sta();\n    \n    // Configure WiFi\n    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();\n    esp_wifi_init(&cfg);\n    \n    // Register event handlers\n    esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID,\n                               &wifi_event_handler, NULL);\n    esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP,\n                               &wifi_event_handler, NULL);\n    \n    // Set credentials\n    wifi_config_t wifi_config = {\n        .sta = {\n            .ssid = WIFI_SSID,\n            .password = WIFI_PASS,\n        },\n    };\n    \n    esp_wifi_set_mode(WIFI_MODE_STA);\n    esp_wifi_set_config(WIFI_IF_STA, &wifi_config);\n    esp_wifi_start();\n    \n    ESP_LOGI(TAG, "WiFi STA init complete");\n}',
                language: 'C',
                tip: '<strong>Tip:</strong> NVS (Non-Volatile Storage) must be initialized before WiFi. It stores WiFi calibration data and your application settings. Think of it as the ESP32\'s EEPROM replacement.'
            },
            {
                title: 'Implement OTA Firmware Updates',
                content: '<p>OTA (Over-The-Air) updates let you flash new firmware over WiFi without a USB cable. Essential for deployed devices. The ESP32 downloads the new firmware, writes it to the inactive OTA partition, and reboots into it.</p>',
                code: '#include "esp_ota_ops.h"\n#include "esp_http_client.h"\n#include "esp_https_ota.h"\n\n#define OTA_URL "http://192.168.1.100:8080/firmware.bin"\n\nvoid ota_task(void *pvParams) {\n    ESP_LOGI(TAG, "Starting OTA update from %s", OTA_URL);\n    \n    esp_http_client_config_t config = {\n        .url = OTA_URL,\n        .timeout_ms = 10000,\n    };\n    \n    esp_https_ota_config_t ota_config = {\n        .http_config = &config,\n    };\n    \n    esp_err_t ret = esp_https_ota(&ota_config);\n    \n    if (ret == ESP_OK) {\n        ESP_LOGI(TAG, "OTA succeeded. Rebooting...");\n        esp_restart();\n    } else {\n        ESP_LOGE(TAG, "OTA failed: %s", esp_err_to_name(ret));\n    }\n    \n    vTaskDelete(NULL);\n}\n\n// To serve firmware for OTA testing:\n// On your PC, build the firmware:\n//   pio run\n// Serve the binary:\n//   cd .pio/build/esp32dev/\n//   python3 -m http.server 8080\n// Trigger OTA on the ESP32 (e.g., via serial command or button)',
                language: 'C',
                tip: '<strong>Tip:</strong> Always validate OTA images before applying. In production, use HTTPS with certificate pinning and sign your firmware images. An attacker who can push a malicious OTA update owns the device.'
            },
            {
                title: 'Build, Flash, and Monitor',
                content: '<p>Use PlatformIO\'s build system to compile, flash, and monitor your firmware. The <code>pio</code> CLI gives you full control from the terminal.</p>',
                code: '# Build the project:\npio run\n\n# Flash to the ESP32:\npio run --target upload\n\n# Monitor serial output:\npio device monitor\n\n# Build + flash + monitor in one command:\npio run --target upload && pio device monitor\n\n# Clean build (if things go wrong):\npio run --target clean\n\n# Run menuconfig (ESP-IDF configuration):\npio run --target menuconfig\n# Navigate: Component config > ESP32-specific >\n#   CPU frequency, flash size, log level, etc.',
                language: 'Bash',
                tip: '<strong>Tip:</strong> <code>menuconfig</code> is where you configure low-level ESP32 settings: CPU frequency (80/160/240MHz), flash mode (QIO/DIO), log verbosity, watchdog timers, and hundreds of other options. Explore it &mdash; this is where the real power is.'
            }
        ],

        testing: '<p>Verify each component:</p>' +
                 '<ul>' +
                 '<li><strong>Build:</strong> <code>pio run</code> completes without errors. Note the firmware size &mdash; it should be under 1MB for the default partition table.</li>' +
                 '<li><strong>Flash:</strong> Upload succeeds. Serial monitor shows "SG-21: Custom firmware starting" with heap size and IDF version.</li>' +
                 '<li><strong>LED blink:</strong> The onboard LED blinks at 1Hz, confirming the FreeRTOS task is running.</li>' +
                 '<li><strong>WiFi:</strong> Serial shows "Connected!" with an IP address. Verify by pinging the IP from your PC.</li>' +
                 '<li><strong>OTA:</strong> Serve a modified firmware (change the log message). Trigger OTA. The device reboots and prints the new message.</li>' +
                 '<li><strong>Partitions:</strong> The <code>print_partitions()</code> function lists all partitions with correct sizes.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Build fails with "component not found":</strong> ESP-IDF components are included via <code>CMakeLists.txt</code>. Add missing components with <code>REQUIRES</code> or <code>PRIV_REQUIRES</code> in the file.</li>' +
                         '<li><strong>Upload fails with "Failed to connect":</strong> Hold the BOOT button while upload starts. Release after "Connecting..." appears. Some DevKits need this every time.</li>' +
                         '<li><strong>WiFi connects but no internet:</strong> Check your router\'s DHCP. The ESP32 should get an IP in your subnet. DNS may not work if <code>esp_netif_create_default_wifi_sta()</code> is missing.</li>' +
                         '<li><strong>OTA fails with "image too large":</strong> The default partition table has ~1MB for the app. Switch to the OTA partition table which splits the remaining flash between two app partitions. Each is ~1.9MB.</li>' +
                         '<li><strong>Stack overflow crash:</strong> FreeRTOS tasks need enough stack. If a task crashes with "stack overflow", increase the stack size parameter in <code>xTaskCreate()</code>. Start with 4096 for complex tasks.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: BLE GATT Server</strong> &mdash; Add a BLE GATT server that exposes a custom characteristic. Write a phone app (or use nRF Connect) to read the ESP32\'s sensor data over BLE. This is how BLE fitness trackers and smart home devices work.</p>' +
                    '<p><strong>Challenge 2: NVS Configuration</strong> &mdash; Store WiFi credentials in NVS instead of hardcoding them. On first boot, start a WiFi AP with a captive portal where the user enters their SSID/password. Save to NVS and reboot into STA mode. This is the standard provisioning flow for IoT devices.</p>' +
                    '<p><strong>Challenge 3: Dual-Core Workload</strong> &mdash; Create two tasks: one on Core 0 that reads sensors, one on Core 1 that handles WiFi/BLE communication. Use a FreeRTOS queue to pass data between them. This is the producer-consumer pattern used in real embedded systems.</p>'
    },

    // ========================================================================
    // SG-22: Conference Badge Hacking Lab
    // ========================================================================
    'sg-22': {
        intro: '<p>At security conferences like DEF CON, BSides, and CCC, the electronic badge is a tradition. These badges are custom PCBs with microcontrollers, LEDs, displays, and wireless communication &mdash; and they often contain hidden challenges (CTF puzzles, secret messages, hidden features) that attendees race to solve.</p>' +
               '<p>In this project you build your own conference badge: an ESP32 with an OLED display, NeoPixel LEDs, and BLE communication. You will create interactive menus, LED animations, badge-to-badge discovery over BLE, and even embed a simple CTF challenge.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

            '<defs>' +
            '<pattern id="sg22-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="680" height="380" fill="url(#sg22-grid)" rx="4"/>' +

            '<!-- Title -->' +
            '<text x="350" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">CONFERENCE BADGE WIRING</text>' +

            '<!-- Breadboard -->' +
            '<rect x="50" y="55" width="600" height="260" rx="6" fill="#1a1f2b" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>' +
            '<text x="350" y="48" text-anchor="middle" fill="#444" font-size="9" letter-spacing="0.1em">BREADBOARD LAYOUT</text>' +

            '<!-- ESP32 DevKit -->' +
            '<g>' +
            '<rect x="70" y="75" width="160" height="220" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="70" y="75" width="160" height="26" rx="8" fill="rgba(59,130,246,0.15)"/>' +
            '<rect x="70" y="93" width="160" height="8" fill="rgba(59,130,246,0.15)"/>' +
            '<text x="150" y="92" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ESP32 DevKit</text>' +
            '<!-- Chip -->' +
            '<rect x="100" y="115" width="100" height="40" rx="4" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="150" y="135" text-anchor="middle" fill="#4488cc" font-size="7">ESP32-WROOM</text>' +
            '<text x="150" y="147" text-anchor="middle" fill="#4488cc" font-size="6">WiFi + BLE</text>' +
            '<!-- USB -->' +
            '<rect x="125" y="280" width="50" height="16" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="150" y="291" text-anchor="middle" fill="#888" font-size="7">USB</text>' +
            '</g>' +

            '<!-- ESP32 Pins -->' +
            '<circle cx="232" cy="170" r="4" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/><text x="218" y="170" text-anchor="end" fill="#8b949e" font-size="8" dominant-baseline="middle">3V3</text>' +
            '<circle cx="232" cy="192" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="218" y="192" text-anchor="end" fill="#8b949e" font-size="8" dominant-baseline="middle">GND</text>' +
            '<circle cx="232" cy="214" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/><text x="218" y="214" text-anchor="end" fill="#8b949e" font-size="8" dominant-baseline="middle">D21</text>' +
            '<circle cx="232" cy="236" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="218" y="236" text-anchor="end" fill="#8b949e" font-size="8" dominant-baseline="middle">D22</text>' +
            '<circle cx="232" cy="258" r="4" fill="#a855f7" stroke="#d8b4fe" stroke-width="0.5"/><text x="218" y="258" text-anchor="end" fill="#8b949e" font-size="8" dominant-baseline="middle">D5</text>' +
            '<circle cx="232" cy="278" r="4" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/><text x="218" y="278" text-anchor="end" fill="#8b949e" font-size="8" dominant-baseline="middle">5V</text>' +

            '<!-- OLED Display -->' +
            '<g>' +
            '<rect x="310" y="75" width="140" height="130" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<rect x="310" y="75" width="140" height="26" rx="8" fill="rgba(234,179,8,0.12)"/>' +
            '<rect x="310" y="93" width="140" height="8" fill="rgba(234,179,8,0.12)"/>' +
            '<text x="380" y="92" text-anchor="middle" fill="#eab308" font-size="10" font-weight="600">OLED 0.96&quot;</text>' +
            '<!-- Screen -->' +
            '<rect x="325" y="112" width="110" height="55" rx="4" fill="#0a0a0a" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="380" y="135" text-anchor="middle" fill="#eab308" font-size="7" opacity="0.6">128 x 64</text>' +
            '<text x="380" y="148" text-anchor="middle" fill="#eab308" font-size="7" opacity="0.6">SSD1306 I2C</text>' +
            '</g>' +

            '<!-- OLED Pins -->' +
            '<circle cx="308" cy="170" r="4" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/><text x="322" y="170" fill="#8b949e" font-size="8" dominant-baseline="middle">VCC</text>' +
            '<circle cx="308" cy="192" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="322" y="192" fill="#8b949e" font-size="8" dominant-baseline="middle">GND</text>' +

            '<!-- OLED SDA/SCL pins -->' +
            '<circle cx="452" cy="170" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/><text x="440" y="170" text-anchor="end" fill="#8b949e" font-size="8" dominant-baseline="middle">SDA</text>' +
            '<circle cx="452" cy="192" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="440" y="192" text-anchor="end" fill="#8b949e" font-size="8" dominant-baseline="middle">SCL</text>' +

            '<!-- NeoPixel Strip -->' +
            '<g>' +
            '<rect x="490" y="75" width="150" height="130" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="490" y="75" width="150" height="26" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<rect x="490" y="93" width="150" height="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="565" y="92" text-anchor="middle" fill="#c084fc" font-size="10" font-weight="600">NeoPixel Strip</text>' +
            '<!-- LEDs -->' +
            '<circle cx="510" cy="130" r="8" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="0.5"/>' +
            '<circle cx="530" cy="130" r="8" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="0.5"/>' +
            '<circle cx="550" cy="130" r="8" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<circle cx="570" cy="130" r="8" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<circle cx="590" cy="130" r="8" fill="rgba(168,85,247,0.3)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<circle cx="610" cy="130" r="8" fill="rgba(236,72,153,0.3)" stroke="#ec4899" stroke-width="0.5"/>' +
            '<circle cx="530" cy="155" r="8" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" stroke-width="0.5"/>' +
            '<circle cx="550" cy="155" r="8" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="0.5"/>' +
            '<text x="565" y="180" text-anchor="middle" fill="#c084fc" font-size="7">WS2812B x 8</text>' +
            '</g>' +

            '<!-- NeoPixel Pins -->' +
            '<circle cx="488" cy="170" r="4" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/><text x="502" y="170" fill="#8b949e" font-size="8" dominant-baseline="middle">VCC</text>' +
            '<circle cx="488" cy="192" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="502" y="192" fill="#8b949e" font-size="8" dominant-baseline="middle">GND</text>' +
            '<circle cx="488" cy="214" r="4" fill="#a855f7" stroke="#d8b4fe" stroke-width="0.5"/><text x="502" y="214" fill="#8b949e" font-size="8" dominant-baseline="middle">DIN</text>' +

            '<!-- Wires: 3V3 to OLED VCC -->' +
            '<line x1="236" y1="170" x2="304" y2="170" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>' +
            '<!-- GND to OLED GND -->' +
            '<line x1="236" y1="192" x2="304" y2="192" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>' +
            '<!-- SDA wire (D21 to OLED SDA) -->' +
            '<path d="M236,214 L260,214 L260,170 L452,170" stroke="#eab308" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>' +
            '<!-- SCL wire (D22 to OLED SCL) -->' +
            '<path d="M236,236 L268,236 L268,192 L452,192" stroke="#22c55e" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>' +
            '<!-- Data wire (D5 to NeoPixel DIN) -->' +
            '<path d="M236,258 L275,258 L275,214 L484,214" stroke="#a855f7" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>' +
            '<!-- 5V to NeoPixel VCC -->' +
            '<path d="M236,278 L283,278 L283,170 L484,170" stroke="#ef4444" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="6,3" opacity="0.7"/>' +
            '<!-- GND to NeoPixel GND -->' +
            '<path d="M236,192 L270,192 L270,230 L470,230 L470,192 L484,192" stroke="#555" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="6,3" opacity="0.6"/>' +

            '<!-- Wire labels -->' +
            '<rect x="250" y="158" width="40" height="14" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="270" y="168" text-anchor="middle" fill="#fca5a5" font-size="7">3V3</text>' +
            '<rect x="250" y="182" width="40" height="14" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(136,136,136,0.3)" stroke-width="0.5"/>' +
            '<text x="270" y="192" text-anchor="middle" fill="#aaa" font-size="7">GND</text>' +

            '<!-- Pin legend -->' +
            '<rect x="50" y="330" width="600" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
            '<text x="70" y="348" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">CONNECTIONS</text>' +
            '<circle cx="70" cy="366" r="4" fill="#ef4444"/><text x="80" y="369" fill="#8b949e" font-size="7">3V3 / 5V (power)</text>' +
            '<circle cx="170" cy="366" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="180" y="369" fill="#8b949e" font-size="7">GND</text>' +
            '<circle cx="230" cy="366" r="4" fill="#eab308"/><text x="240" y="369" fill="#8b949e" font-size="7">SDA (D21)</text>' +
            '<circle cx="320" cy="366" r="4" fill="#22c55e"/><text x="330" y="369" fill="#8b949e" font-size="7">SCL (D22)</text>' +
            '<circle cx="410" cy="366" r="4" fill="#a855f7"/><text x="420" y="369" fill="#8b949e" font-size="7">Data (D5)</text>' +
            '<text x="500" y="369" fill="#555" font-size="7">OLED addr: 0x3C</text>' +

            '</svg>' +
            '</div>',

        wiring: '    ESP32 DevKit V1              OLED 0.96" I2C    NeoPixel Strip\n' +
                '    +--------------+             +----------+      +-----------+\n' +
                '    |         3V3  |---red-------|VCC       |      |           |\n' +
                '    |         GND  |---black-----|GND       |  +---|GND        |\n' +
                '    |         D21  |---yellow----|SDA       |  |   |           |\n' +
                '    |         D22  |---green-----|SCL       |  |   |DIN  <--+  |\n' +
                '    |              |             +----------+  |   +-----------+\n' +
                '    |         D5   |---data-line-+-------------+----(to DIN)   \n' +
                '    |         GND  |---common gnd-+\n' +
                '    |         5V   |---red (LED power)---NeoPixel VCC\n' +
                '    +--------------+\n' +
                '\n' +
                '    OLED: I2C on pins 21 (SDA) / 22 (SCL), address 0x3C\n' +
                '    NeoPixel: data on pin 5, power from 5V (up to 8 LEDs)',

        wiringNotes: '<p><strong>OLED:</strong> The SSD1306 0.96" OLED is I2C. Most are 3.3V compatible. Address is usually 0x3C (some are 0x3D). Run the I2C scanner from SG-04 if unsure.</p>' +
                     '<p><strong>NeoPixels:</strong> WS2812B LEDs run on 5V but accept 3.3V data from the ESP32. Keep the strip short (8 LEDs max from the DevKit 5V pin). Add a 330&Omega; resistor on the data line and a 100&micro;F capacitor across VCC/GND.</p>' +
                     '<p><strong>Battery operation:</strong> For portable use, power from a LiPo via the DevKit\'s VIN pin. The onboard regulator handles 5-12V input.</p>',

        steps: [
            {
                title: 'Set Up OLED Display',
                content: '<p>Install the <strong>Adafruit SSD1306</strong> and <strong>Adafruit GFX</strong> libraries. The OLED gives you a 128x64 pixel monochrome display &mdash; perfect for menus, text, and simple graphics.</p>',
                code: '#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\n#define SCREEN_W 128\n#define SCREEN_H 64\n#define OLED_ADDR 0x3C\n\nAdafruit_SSD1306 oled(SCREEN_W, SCREEN_H, &Wire, -1);\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin(21, 22);\n  \n  if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {\n    Serial.println("OLED init failed!");\n    while (1);\n  }\n  \n  oled.clearDisplay();\n  oled.setTextSize(1);\n  oled.setTextColor(SSD1306_WHITE);\n  oled.setCursor(0, 0);\n  oled.println("HEXWORTH BADGE");\n  oled.println("v1.0");\n  oled.println();\n  oled.println("SG-22 Lab");\n  oled.display();\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The SSD1306 OLED has a framebuffer in RAM (~1KB for 128x64). Call <code>oled.display()</code> to push the buffer to the screen. Without it, nothing appears.'
            },
            {
                title: 'Add NeoPixel LED Animations',
                content: '<p>Install the <strong>FastLED</strong> library. Create several animation patterns that cycle automatically or respond to button presses. These are the "bling" that makes a badge stand out.</p>',
                code: '#include <FastLED.h>\n\n#define LED_PIN    5\n#define NUM_LEDS   8\n#define BRIGHTNESS 50\n\nCRGB leds[NUM_LEDS];\nint animMode = 0;\n\nvoid setupLEDs() {\n  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);\n  FastLED.setBrightness(BRIGHTNESS);\n}\n\nvoid animRainbow() {\n  static uint8_t hue = 0;\n  fill_rainbow(leds, NUM_LEDS, hue++, 256 / NUM_LEDS);\n  FastLED.show();\n  delay(20);\n}\n\nvoid animCyanPulse() {\n  static uint8_t val = 0;\n  static int8_t dir = 1;\n  val += dir * 3;\n  if (val >= 250 || val <= 5) dir = -dir;\n  fill_solid(leds, NUM_LEDS, CRGB(0, val, val));\n  FastLED.show();\n  delay(15);\n}\n\nvoid animScanner() {\n  static int pos = 0;\n  static int8_t dir = 1;\n  fadeToBlackBy(leds, NUM_LEDS, 80);\n  leds[pos] = CRGB::Cyan;\n  FastLED.show();\n  pos += dir;\n  if (pos >= NUM_LEDS - 1 || pos <= 0) dir = -dir;\n  delay(60);\n}\n\nvoid runAnimation() {\n  switch (animMode % 3) {\n    case 0: animRainbow(); break;\n    case 1: animCyanPulse(); break;\n    case 2: animScanner(); break;\n  }\n}',
                language: 'Arduino',
                tip: null
            },
            {
                title: 'Build an Interactive Menu',
                content: '<p>Create a menu system on the OLED controlled by a button (or touch pin). The menu lets you switch LED animations, view badge info, start BLE discovery, and access the hidden CTF challenge.</p>',
                code: '#define BTN_PIN 0  // ESP32 DevKit BOOT button\n\nconst char* menuItems[] = {\n  "LED Mode",\n  "Badge Info",\n  "BLE Discover",\n  "Secret CTF",\n  "Sleep"\n};\nconst int MENU_SIZE = 5;\nint menuIdx = 0;\nunsigned long lastPress = 0;\n\nvoid drawMenu() {\n  oled.clearDisplay();\n  oled.setTextSize(1);\n  oled.setCursor(0, 0);\n  oled.println("=== BADGE MENU ===");\n  oled.println();\n  \n  for (int i = 0; i < MENU_SIZE; i++) {\n    if (i == menuIdx) {\n      oled.print("> ");\n    } else {\n      oled.print("  ");\n    }\n    oled.println(menuItems[i]);\n  }\n  oled.display();\n}\n\nvoid handleButton() {\n  if (digitalRead(BTN_PIN) == LOW && millis() - lastPress > 300) {\n    lastPress = millis();\n    \n    // Short press = scroll, long press = select\n    unsigned long start = millis();\n    while (digitalRead(BTN_PIN) == LOW && millis() - start < 800);\n    \n    if (millis() - start >= 800) {\n      // Long press: select\n      executeMenuItem(menuIdx);\n    } else {\n      // Short press: next item\n      menuIdx = (menuIdx + 1) % MENU_SIZE;\n      drawMenu();\n    }\n  }\n}\n\nvoid executeMenuItem(int idx) {\n  switch (idx) {\n    case 0: animMode++; break;       // cycle LED mode\n    case 1: showBadgeInfo(); break;\n    case 2: startBLEDiscovery(); break;\n    case 3: startCTF(); break;\n    case 4: esp_deep_sleep_start(); break;\n  }\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The BOOT button (GPIO 0) is always available on DevKits. Using it for navigation means zero extra wiring for a basic badge. For a better UX, add a second button for "select" so you do not need long-press detection.'
            },
            {
                title: 'BLE Badge Discovery',
                content: '<p>Implement BLE advertising with custom manufacturer data so badges can discover each other. Each badge broadcasts its name and a unique ID. When it finds another badge, it displays a "handshake" animation.</p>',
                code: '#include <BLEDevice.h>\n#include <BLEUtils.h>\n#include <BLEServer.h>\n\n#define BADGE_SERVICE_UUID "12345678-1234-1234-1234-123456789abc"\n#define BADGE_NAME "HEX-BADGE"\n\nint badgesFound = 0;\nString discoveredBadges[20];\n\nvoid startBLEAdvertising() {\n  BLEDevice::init(BADGE_NAME);\n  BLEServer *pServer = BLEDevice::createServer();\n  BLEService *pService = pServer->createService(BADGE_SERVICE_UUID);\n  pService->start();\n  \n  BLEAdvertising *pAdv = BLEDevice::getAdvertising();\n  pAdv->addServiceUUID(BADGE_SERVICE_UUID);\n  pAdv->setScanResponse(true);\n  pAdv->start();\n  \n  ESP_LOGI(TAG, "Badge advertising started");\n}\n\nclass BadgeScanner : public BLEAdvertisedDeviceCallbacks {\n  void onResult(BLEAdvertisedDevice dev) {\n    if (dev.haveServiceUUID() &&\n        dev.isAdvertisingService(BLEUUID(BADGE_SERVICE_UUID))) {\n      String name = dev.haveName() ? dev.getName().c_str() : "unknown";\n      \n      // Check if already discovered\n      bool known = false;\n      for (int i = 0; i < badgesFound; i++) {\n        if (discoveredBadges[i] == name) { known = true; break; }\n      }\n      \n      if (!known && badgesFound < 20) {\n        discoveredBadges[badgesFound++] = name;\n        Serial.printf("NEW BADGE: %s (total: %d)\\n", name.c_str(), badgesFound);\n        \n        // Handshake animation\n        for (int i = 0; i < 3; i++) {\n          fill_solid(leds, NUM_LEDS, CRGB::Green);\n          FastLED.show(); delay(150);\n          fill_solid(leds, NUM_LEDS, CRGB::Black);\n          FastLED.show(); delay(150);\n        }\n        \n        // Show on OLED\n        oled.clearDisplay();\n        oled.setCursor(0, 0);\n        oled.println("BADGE FOUND!");\n        oled.println(name);\n        oled.printf("Total: %d\\n", badgesFound);\n        oled.display();\n      }\n    }\n  }\n};',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Use a custom Service UUID so badges only discover other badges, not random BLE devices. In a real conference badge CTF, the UUID itself might be a clue to a puzzle.'
            },
            {
                title: 'Embed a CTF Challenge',
                content: '<p>Hide a capture-the-flag challenge in the badge. The player must find a hidden BLE characteristic that contains an encoded flag. Access requires knowing the correct UUID and decoding the value.</p>',
                code: '#define CTF_SERVICE  "deadbeef-cafe-face-1234-abcdef012345"\n#define CTF_CHAR     "cafebabe-dead-face-5678-abcdef012345"\n\n// The flag, XOR-encoded with key 0x42\nconst uint8_t encodedFlag[] = {\n  0x28, 0x2c, 0x25, 0x2b, 0x63, 0x74, 0x25, 0x26,\n  0x21, 0x23, 0x36, 0x63, 0x30, 0x25, 0x31, 0x22, 0x23\n};\n// Decodes to: "flag{badge_h4ck3d}" when XORed with 0x42\n\nvoid setupCTFService(BLEServer *pServer) {\n  BLEService *ctf = pServer->createService(CTF_SERVICE);\n  BLECharacteristic *flag = ctf->createCharacteristic(\n    CTF_CHAR,\n    BLECharacteristic::PROPERTY_READ\n  );\n  \n  flag->setValue((uint8_t*)encodedFlag, sizeof(encodedFlag));\n  ctf->start();\n  \n  // This service is NOT advertised — players must\n  // discover it by scanning or guessing the UUID\n}\n\nvoid startCTF() {\n  oled.clearDisplay();\n  oled.setCursor(0, 0);\n  oled.println("=== CTF MODE ===");\n  oled.println();\n  oled.println("A hidden BLE");\n  oled.println("service holds");\n  oled.println("the flag.");\n  oled.println();\n  oled.println("Hint: 0x42");\n  oled.display();\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Real conference badge CTFs use multiple layers: XOR, Base64, ROT13, hidden services, timing-based challenges, and inter-badge cooperation requirements. Start simple and layer complexity.'
            }
        ],

        testing: '<p>Test each badge feature:</p>' +
                 '<ul>' +
                 '<li><strong>OLED:</strong> Text displays clearly at 128x64. Menu navigation works with button (short press = scroll, long press = select).</li>' +
                 '<li><strong>LEDs:</strong> All 3 animation modes work and cycle smoothly. Brightness is comfortable (not blinding).</li>' +
                 '<li><strong>BLE advertising:</strong> Use the nRF Connect app on your phone. The badge should appear as "HEX-BADGE" with the custom service UUID.</li>' +
                 '<li><strong>Badge discovery:</strong> Run two badges simultaneously. Each should detect the other and show the "BADGE FOUND" screen with a green LED flash.</li>' +
                 '<li><strong>CTF challenge:</strong> Use nRF Connect to browse BLE services on the badge. Find the hidden service, read the characteristic, decode the XOR-encoded flag.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>OLED blank/garbled:</strong> Check I2C address (run scanner). Verify SDA=21, SCL=22. Some OLEDs are 0x3D not 0x3C. Try both.</li>' +
                         '<li><strong>NeoPixels wrong color order:</strong> Change <code>GRB</code> to <code>RGB</code> in <code>FastLED.addLeds<>()</code>. Different LED manufacturers use different color byte ordering.</li>' +
                         '<li><strong>BLE not advertising:</strong> <code>BLEDevice::init()</code> must be called with a non-empty name. Check that advertising is started after the service is created. Monitor with nRF Connect.</li>' +
                         '<li><strong>Two badges do not discover each other:</strong> Both must be advertising AND scanning. Run advertising on a background task and scanning periodically. BLE scanning and advertising can happen simultaneously on ESP32.</li>' +
                         '<li><strong>Memory crash when running BLE + display + LEDs:</strong> BLE uses significant RAM. Reduce BLE scan duration, limit discovered device cache, and avoid dynamic string allocation. Check heap with <code>ESP.getFreeHeap()</code>.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Badge Scoreboard</strong> &mdash; Track how many unique badges each badge discovers. When two badges meet, they exchange their discovery counts over a BLE write characteristic. Display a leaderboard on the OLED showing the top badge collectors at the conference.</p>' +
                    '<p><strong>Challenge 2: Multi-Layer CTF</strong> &mdash; Add 3 CTF levels: Level 1 is the XOR flag (easy). Level 2 requires connecting to a hidden WiFi AP the badge creates and accessing a webpage. Level 3 requires two badges to collaborate &mdash; each holds half of a key that must be combined.</p>' +
                    '<p><strong>Challenge 3: SAO Connector</strong> &mdash; Design your badge to support the Shitty Add-On (SAO) standard used at DEF CON. Add a 2x3 pin header that provides I2C, power, and GPIO. Build a small SAO accessory (extra LEDs, a sensor, or a mini display) that the badge detects and integrates.</p>'
    },

    // ========================================================================
    // SG-23: Portable WiFi Field Terminal
    // ========================================================================
    'sg-23': {
        intro: '<p>This is the ultimate pocket-sized WiFi tool &mdash; a battery-powered ESP32 CYD running a multi-mode firmware that combines WiFi scanning, BLE scanning, deauth detection, and packet monitoring into a single touch-driven interface. It is the handheld equivalent of carrying a laptop with Kismet, Wireshark, and Bluetooth tools.</p>' +
               '<p>Building on SG-06 (WiFi scanner), SG-21 (custom firmware), and lessons from other projects, you will create a field-deployable security tool with SD card logging, battery monitoring, and a polished UI.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

            '<defs>' +
            '<pattern id="sg23-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="680" height="380" fill="url(#sg23-grid)" rx="4"/>' +

            '<!-- Title -->' +
            '<text x="350" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">PORTABLE WIFI FIELD TERMINAL</text>' +

            '<!-- ESP32 CYD (center) -->' +
            '<g>' +
            '<rect x="200" y="55" width="300" height="170" rx="10" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="200" y="55" width="300" height="26" rx="10" fill="rgba(59,130,246,0.15)"/>' +
            '<rect x="200" y="73" width="300" height="8" fill="rgba(59,130,246,0.15)"/>' +
            '<text x="350" y="72" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="600">ESP32 CYD (Cheap Yellow Display)</text>' +
            '<!-- Screen -->' +
            '<rect x="230" y="92" width="180" height="110" rx="6" fill="#0a0a0a" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="320" y="130" text-anchor="middle" fill="#3b82f6" font-size="8" opacity="0.5">2.8&quot; TFT 320x240</text>' +
            '<text x="320" y="145" text-anchor="middle" fill="#3b82f6" font-size="7" opacity="0.4">Resistive Touch</text>' +
            '<text x="320" y="165" text-anchor="middle" fill="#22c55e" font-size="8" opacity="0.4">FIELD TERMINAL v1.0</text>' +
            '<text x="320" y="180" text-anchor="middle" fill="#8b949e" font-size="6" opacity="0.4">WiFi | BLE | Packet | Deauth</text>' +
            '<!-- Built-in labels -->' +
            '<text x="430" y="110" fill="#8b949e" font-size="6">WiFi built-in</text>' +
            '<text x="430" y="122" fill="#8b949e" font-size="6">BT built-in</text>' +
            '<text x="430" y="134" fill="#8b949e" font-size="6">Touch built-in</text>' +
            '<!-- USB-C -->' +
            '<rect x="325" y="210" width="50" height="14" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="350" y="220" text-anchor="middle" fill="#888" font-size="6">USB-C</text>' +
            '</g>' +

            '<!-- CYD Pins (right side) -->' +
            '<circle cx="502" cy="140" r="4" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/><text x="490" y="140" text-anchor="end" fill="#8b949e" font-size="7" dominant-baseline="middle">VIN</text>' +
            '<circle cx="502" cy="160" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="490" y="160" text-anchor="end" fill="#8b949e" font-size="7" dominant-baseline="middle">GND</text>' +
            '<circle cx="502" cy="180" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/><text x="490" y="180" text-anchor="end" fill="#8b949e" font-size="7" dominant-baseline="middle">D34</text>' +

            '<!-- CYD SPI Pins (bottom) -->' +
            '<circle cx="220" cy="228" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="220" y="245" text-anchor="middle" fill="#8b949e" font-size="6">D15</text>' +
            '<circle cx="250" cy="228" r="4" fill="#3b82f6" stroke="#93c5fd" stroke-width="0.5"/><text x="250" y="245" text-anchor="middle" fill="#8b949e" font-size="6">D13</text>' +
            '<circle cx="280" cy="228" r="4" fill="#f97316" stroke="#fdba74" stroke-width="0.5"/><text x="280" y="245" text-anchor="middle" fill="#8b949e" font-size="6">D12</text>' +
            '<circle cx="310" cy="228" r="4" fill="#a855f7" stroke="#d8b4fe" stroke-width="0.5"/><text x="310" y="245" text-anchor="middle" fill="#8b949e" font-size="6">D14</text>' +

            '<!-- TP4056 Battery Module (left) -->' +
            '<g>' +
            '<rect x="30" y="260" width="150" height="100" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="30" y="260" width="150" height="24" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="30" y="276" width="150" height="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="105" y="276" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">TP4056 Charger</text>' +
            '<!-- LiPo battery -->' +
            '<rect x="50" y="295" width="80" height="30" rx="4" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.25)" stroke-width="0.5"/>' +
            '<text x="90" y="310" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">3.7V LiPo</text>' +
            '<text x="90" y="322" text-anchor="middle" fill="#a3860f" font-size="6">1000mAh+</text>' +
            '<!-- Labels -->' +
            '<text x="145" y="300" fill="#fca5a5" font-size="6">OUT+</text>' +
            '<text x="145" y="315" fill="#888" font-size="6">OUT-</text>' +
            '</g>' +

            '<!-- Wires: TP4056 to CYD -->' +
            '<path d="M180,298 L190,298 L190,140 L498,140" stroke="#ef4444" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
            '<path d="M180,313 L195,313 L195,160 L498,160" stroke="#555" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +

            '<!-- Voltage divider -->' +
            '<g>' +
            '<rect x="530" y="120" width="130" height="80" rx="6" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="595" y="138" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">Voltage Divider</text>' +
            '<!-- Resistors -->' +
            '<rect x="555" y="148" width="35" height="12" rx="2" fill="rgba(234,179,8,0.12)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="573" y="157" text-anchor="middle" fill="#eab308" font-size="6">100K</text>' +
            '<rect x="555" y="168" width="35" height="12" rx="2" fill="rgba(234,179,8,0.12)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="573" y="177" text-anchor="middle" fill="#eab308" font-size="6">100K</text>' +
            '<text x="600" y="157" fill="#8b949e" font-size="6">BAT+</text>' +
            '<text x="600" y="177" fill="#8b949e" font-size="6">GND</text>' +
            '<line x1="573" y1="160" x2="520" y2="160" stroke="#eab308" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<text x="625" y="167" fill="#fde68a" font-size="6">--> D34</text>' +
            '</g>' +

            '<!-- SD Card Module (bottom right) -->' +
            '<g>' +
            '<rect x="390" y="260" width="150" height="100" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="390" y="260" width="150" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="390" y="276" width="150" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="465" y="276" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">SD Card Module</text>' +
            '<!-- Card slot -->' +
            '<rect x="420" y="300" width="80" height="25" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="0.5"/>' +
            '<text x="460" y="316" text-anchor="middle" fill="#666" font-size="7">MicroSD</text>' +
            '<!-- Pin labels -->' +
            '<text x="410" y="345" fill="#22c55e" font-size="6">CS</text>' +
            '<text x="435" y="345" fill="#3b82f6" font-size="6">MOSI</text>' +
            '<text x="468" y="345" fill="#f97316" font-size="6">MISO</text>' +
            '<text x="502" y="345" fill="#a855f7" font-size="6">CLK</text>' +
            '</g>' +

            '<!-- Wires: CYD SPI to SD -->' +
            '<path d="M220,232 L220,310 L390,310" stroke="#22c55e" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>' +
            '<path d="M250,232 L250,320 L395,320" stroke="#3b82f6" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>' +
            '<path d="M280,232 L280,330 L400,330" stroke="#f97316" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>' +
            '<path d="M310,232 L310,340 L405,340" stroke="#a855f7" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>' +

            '<!-- Wire labels -->' +
            '<rect x="190" y="135" width="40" height="12" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="210" y="144" text-anchor="middle" fill="#fca5a5" font-size="6">VIN</text>' +
            '<rect x="190" y="155" width="40" height="12" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(136,136,136,0.3)" stroke-width="0.5"/>' +
            '<text x="210" y="164" text-anchor="middle" fill="#aaa" font-size="6">GND</text>' +

            '</svg>' +
            '</div>',

        wiring: '    ESP32 CYD + Battery\n' +
                '    +---------------------------+\n' +
                '    |   2.8" TFT (built-in)     |\n' +
                '    |   Touch (built-in)        |\n' +
                '    |   WiFi/BT (built-in)      |\n' +
                '    |                           |\n' +
                '    |   USB-C (charging + data) |\n' +
                '    |                           |\n' +
                '    +-----+-----+-----+--------+\n' +
                '          |     |     |\n' +
                '    TP4056 module     SD Card module\n' +
                '    +--------+       +---------+\n' +
                '    | BAT+   |--LiPo | CS  D15 |\n' +
                '    | BAT-   |--GND  | MOSI D13|\n' +
                '    | OUT+   |--VIN  | MISO D12|\n' +
                '    | OUT-   |--GND  | CLK  D14|\n' +
                '    +--------+       +---------+\n' +
                '\n' +
                '    Battery voltage divider:\n' +
                '    BAT+ --[100K]--+--[100K]-- GND\n' +
                '                   |\n' +
                '                  D34 (ADC)',

        wiringNotes: '<p><strong>TP4056:</strong> This module handles LiPo charging (via USB or external 5V) and provides regulated output. Connect its OUT+/OUT- to the CYD\'s VIN/GND. The module has over-discharge protection.</p>' +
                     '<p><strong>Battery monitoring:</strong> LiPo voltage ranges from 4.2V (full) to 3.0V (empty). The voltage divider halves it to stay within the ESP32\'s 3.3V ADC range. Read on GPIO 34 (ADC input only).</p>' +
                     '<p><strong>SD card:</strong> Shares the SPI bus with the display. Use a different CS pin (GPIO 15). The CYD\'s display uses CS=15 by default &mdash; check your board and reassign if needed.</p>',

        steps: [
            {
                title: 'Multi-Mode Firmware Architecture',
                content: '<p>Structure the firmware as a state machine with distinct modes. Each mode has its own initialization, loop, and draw functions. A common menu lets you switch between modes via touch.</p>',
                code: '#include <WiFi.h>\n#include <TFT_eSPI.h>\n#include "esp_wifi.h"\n\nTFT_eSPI tft = TFT_eSPI();\n\nenum Mode {\n  MODE_MENU,\n  MODE_WIFI_SCAN,\n  MODE_BLE_SCAN,\n  MODE_PACKET_MON,\n  MODE_DEAUTH_DET,\n  MODE_SETTINGS\n};\n\nMode currentMode = MODE_MENU;\n\nconst char* modeNames[] = {\n  "Main Menu",\n  "WiFi Scanner",\n  "BLE Scanner",\n  "Packet Monitor",\n  "Deauth Detector",\n  "Settings"\n};\n\nvoid setup() {\n  Serial.begin(115200);\n  tft.init();\n  tft.setRotation(1);\n  setupTouch();\n  setupBattery();\n  setupSD();\n  \n  drawMenu();\n}\n\nvoid loop() {\n  handleTouch();\n  \n  switch (currentMode) {\n    case MODE_MENU:       break;  // touch handles navigation\n    case MODE_WIFI_SCAN:  loopWiFiScan(); break;\n    case MODE_BLE_SCAN:   loopBLEScan(); break;\n    case MODE_PACKET_MON: loopPacketMon(); break;\n    case MODE_DEAUTH_DET: loopDeauthDet(); break;\n    case MODE_SETTINGS:   break;\n  }\n  \n  // Status bar (always visible)\n  drawStatusBar();\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Each mode should clean up when exiting (disable promiscuous mode, stop BLE scan, etc). Leaving WiFi in promiscuous mode while switching to BLE mode will crash.'
            },
            {
                title: 'Touch Menu System',
                content: '<p>Draw a clean menu with touch-sensitive regions. Each menu item is a rectangular button. Touching it enters that mode. A "Back" button in each mode returns to the menu.</p>',
                code: 'struct MenuItem {\n  const char* label;\n  Mode mode;\n  uint16_t color;\n};\n\nMenuItem menu[] = {\n  {"WiFi Scan",    MODE_WIFI_SCAN,  TFT_CYAN},\n  {"BLE Scan",     MODE_BLE_SCAN,   TFT_BLUE},\n  {"Packets",      MODE_PACKET_MON, TFT_GREEN},\n  {"Deauth Det",   MODE_DEAUTH_DET, TFT_RED},\n  {"Settings",     MODE_SETTINGS,   TFT_DARKGREY}\n};\nconst int MENU_COUNT = 5;\n\nvoid drawMenu() {\n  tft.fillScreen(TFT_BLACK);\n  tft.setTextColor(TFT_CYAN);\n  tft.drawString("FIELD TERMINAL v1.0", 60, 5);\n  \n  int y = 30;\n  for (int i = 0; i < MENU_COUNT; i++) {\n    tft.fillRoundRect(20, y, 280, 35, 5, menu[i].color);\n    tft.setTextColor(TFT_BLACK);\n    tft.drawString(menu[i].label, 30, y + 10);\n    y += 42;\n  }\n}\n\nvoid handleMenuTouch(int tx, int ty) {\n  if (tx < 20 || tx > 300) return;\n  int idx = (ty - 30) / 42;\n  if (idx >= 0 && idx < MENU_COUNT) {\n    currentMode = menu[idx].mode;\n    initMode(currentMode);\n  }\n}\n\nvoid initMode(Mode m) {\n  tft.fillScreen(TFT_BLACK);\n  switch (m) {\n    case MODE_WIFI_SCAN:  initWiFiScan(); break;\n    case MODE_BLE_SCAN:   initBLEScan(); break;\n    case MODE_PACKET_MON: initPacketMon(); break;\n    case MODE_DEAUTH_DET: initDeauthDet(); break;\n    default: break;\n  }\n}',
                language: 'Arduino',
                tip: null
            },
            {
                title: 'Battery Monitoring',
                content: '<p>Read the LiPo voltage through the ADC and display a battery icon in the status bar. Alert when voltage drops below 3.3V (low battery).</p>',
                code: '#define BATT_PIN 34\n#define BATT_SAMPLES 10\n\nfloat readBatteryVoltage() {\n  long sum = 0;\n  for (int i = 0; i < BATT_SAMPLES; i++) {\n    sum += analogRead(BATT_PIN);\n    delay(2);\n  }\n  float adc = sum / BATT_SAMPLES;\n  // Voltage divider: Vbat = ADC * (3.3/4095) * 2\n  return (adc / 4095.0) * 3.3 * 2.0;\n}\n\nint batteryPercent(float voltage) {\n  // LiPo discharge curve (approximate)\n  if (voltage >= 4.15) return 100;\n  if (voltage >= 3.95) return 80;\n  if (voltage >= 3.80) return 60;\n  if (voltage >= 3.70) return 40;\n  if (voltage >= 3.55) return 20;\n  if (voltage >= 3.40) return 10;\n  return 0;\n}\n\nvoid drawStatusBar() {\n  static unsigned long lastUpdate = 0;\n  if (millis() - lastUpdate < 5000) return;\n  lastUpdate = millis();\n  \n  float v = readBatteryVoltage();\n  int pct = batteryPercent(v);\n  \n  tft.fillRect(0, 0, 320, 16, 0x0841);\n  tft.setTextColor(TFT_WHITE);\n  tft.drawString(modeNames[currentMode], 5, 2);\n  \n  // Battery indicator\n  uint16_t clr = (pct > 20) ? TFT_GREEN : TFT_RED;\n  tft.drawRect(270, 2, 30, 12, clr);\n  tft.fillRect(300, 5, 3, 6, clr);\n  int fillW = (pct * 28) / 100;\n  tft.fillRect(271, 3, fillW, 10, clr);\n  tft.drawString(String(pct) + "%", 240, 2);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> ESP32 ADC is noisy. Average multiple samples and add a smoothing capacitor (100nF) near the ADC pin. For critical applications, use an external ADC (ADS1115) for much better accuracy.'
            },
            {
                title: 'SD Card Logging',
                content: '<p>Log scan results and events to the SD card with timestamps. Each mode writes to a different log file. This creates a permanent record for later analysis.</p>',
                code: '#include <SD.h>\n#include <SPI.h>\n\n#define SD_CS 15\n\nbool sdReady = false;\n\nvoid setupSD() {\n  if (SD.begin(SD_CS)) {\n    sdReady = true;\n    Serial.println("SD card initialized");\n  } else {\n    Serial.println("SD card failed (continuing without logging)");\n  }\n}\n\nvoid logToSD(const char* filename, String data) {\n  if (!sdReady) return;\n  \n  File f = SD.open(filename, FILE_APPEND);\n  if (f) {\n    f.printf("[%lu] %s\\n", millis() / 1000, data.c_str());\n    f.close();\n  }\n}\n\n// Usage in WiFi scan mode:\n// logToSD("/wifi_scan.csv", ssid + "," + channel + "," + rssi + "," + enc);\n\n// Usage in deauth mode:\n// logToSD("/deauth_log.csv", srcMAC + "," + dstMAC + "," + channel);\n\n// Usage in BLE mode:\n// logToSD("/ble_scan.csv", name + "," + mac + "," + rssi + "," + type);',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Always close files after writing. If the device loses power with an open file, data may be corrupted. For critical logging, call <code>f.flush()</code> after each write to force data to disk.'
            },
            {
                title: 'Auto-Dimming and Power Management',
                content: '<p>Extend battery life by dimming the display after inactivity and entering light sleep during idle periods. The backlight PWM pin on the CYD controls brightness.</p>',
                code: '#define BL_PIN 21  // CYD backlight pin (varies by board)\n#define DIM_TIMEOUT 30000  // 30 seconds\n#define SLEEP_TIMEOUT 120000  // 2 minutes\n\nunsigned long lastActivity = 0;\nbool dimmed = false;\n\nvoid updateActivity() {\n  lastActivity = millis();\n  if (dimmed) {\n    ledcWrite(0, 255);  // full brightness\n    dimmed = false;\n  }\n}\n\nvoid checkPowerSaving() {\n  unsigned long idle = millis() - lastActivity;\n  \n  if (idle > SLEEP_TIMEOUT && currentMode == MODE_MENU) {\n    // Deep sleep with touch wakeup\n    oled_clear();\n    tft.fillScreen(TFT_BLACK);\n    tft.drawString("Sleeping... touch to wake", 50, 120);\n    delay(1000);\n    esp_sleep_enable_ext0_wakeup(GPIO_NUM_36, 0);  // touch IRQ\n    esp_deep_sleep_start();\n  }\n  else if (idle > DIM_TIMEOUT && !dimmed) {\n    ledcWrite(0, 30);  // dim to ~12%\n    dimmed = true;\n  }\n}\n\n// In setup():\n// ledcSetup(0, 5000, 8);  // channel 0, 5KHz, 8-bit\n// ledcAttachPin(BL_PIN, 0);\n// ledcWrite(0, 255);  // full brightness\n\n// In loop(): checkPowerSaving();\n// In touch handler: updateActivity();',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Deep sleep draws ~10&micro;A. A 500mAh LiPo lasts over 5 years in deep sleep. Active WiFi scanning draws ~100-200mA, giving about 2.5-5 hours of continuous scanning on a 500mAh battery.'
            }
        ],

        testing: '<p>Test with battery power (not USB):</p>' +
                 '<ul>' +
                 '<li><strong>Menu navigation:</strong> All 5 modes accessible via touch. Back button returns to menu. Mode switching is clean (no crashes or leftover state).</li>' +
                 '<li><strong>WiFi scan mode:</strong> Displays networks with RSSI, channel, encryption. Results match SG-06 output.</li>' +
                 '<li><strong>Battery indicator:</strong> Shows correct percentage. Decreases over time during active use. Low battery warning at 20%.</li>' +
                 '<li><strong>SD logging:</strong> After running each mode, eject SD card and check CSV files on a computer. Data should be properly formatted with timestamps.</li>' +
                 '<li><strong>Auto-dim:</strong> Display dims after 30 seconds of no touch. Touch the screen and it brightens immediately.</li>' +
                 '<li><strong>Battery life:</strong> Run a continuous WiFi scan and time how long the battery lasts. Target: 2+ hours on 500mAh.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>CYD does not power from battery:</strong> Check TP4056 OUT+ is connected to VIN (not 3V3). The CYD needs 5V input on VIN for its onboard regulator. Some TP4056 modules output 3.7V (LiPo raw) &mdash; add a boost converter if needed.</li>' +
                         '<li><strong>SD card not detected:</strong> SPI bus conflict with display. Ensure SD card CS is on a different pin than display CS. Call <code>SD.begin(SD_CS)</code> after <code>tft.init()</code>.</li>' +
                         '<li><strong>Mode switch crashes:</strong> Clean up each mode before switching. Disable promiscuous mode, stop BLE scan, delete tasks. Switching from WiFi promiscuous to BLE without cleanup crashes the radio.</li>' +
                         '<li><strong>Battery percentage jumps around:</strong> ADC noise. Average more samples (20+). Add a smoothing cap. Or use a fuel gauge IC (MAX17048) for accurate state-of-charge reporting.</li>' +
                         '<li><strong>Touch inaccurate after adding battery:</strong> Electrical noise from the TP4056 switching can affect the resistive touchscreen. Add a 100nF capacitor near the touch controller pins.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: GPS Wardriving</strong> &mdash; Add a GPS module (NEO-6M, ~$5). Log WiFi scan results with GPS coordinates to a CSV. Import into Google Earth or Wigle.net to create a wireless coverage map of your neighborhood.</p>' +
                    '<p><strong>Challenge 2: Mesh Networking</strong> &mdash; Deploy 3 field terminals. Use ESP-NOW (ESP32 peer-to-peer protocol) to form a mesh network. When one terminal detects a deauth attack, it alerts the other two. Distributed detection system.</p>' +
                    '<p><strong>Challenge 3: 3D Printed Enclosure</strong> &mdash; Design a custom case in Fusion 360 or TinkerCAD. Include slots for the display, cutouts for USB-C and SD card, a battery compartment, and a belt clip mount. Print and assemble for a professional field tool.</p>'
    },

    // ========================================================================
    // SG-24: Network Anomaly Monitor
    // ========================================================================
    'sg-24': {
        intro: '<p>Security tools that scan on demand are useful, but real threats happen between scans. This project builds a passive anomaly monitor that sits on your network 24/7, learns what "normal" looks like, and alerts when something deviates &mdash; a new device appears, traffic spikes at 3AM, or an unusual protocol shows up.</p>' +
               '<p>Using the ESP32 CYD in WiFi promiscuous mode, you will capture traffic metadata (not payload), build statistical baselines using moving averages and standard deviation, track every MAC address on the network, and visualize anomaly scores on the TFT display in real time. Baselines persist to SD card so the device remembers your network across reboots.</p>' +
               '<p>This is the same principle behind commercial SIEM systems and network behavior analysis tools &mdash; scaled down to a $15 microcontroller.</p>',

        wiring: '    ESP32 CYD + SD Card\n' +
                '    +---------------------------+\n' +
                '    |   2.8" TFT (built-in)     |\n' +
                '    |   Touch (built-in)        |\n' +
                '    |   WiFi (built-in)         |\n' +
                '    |                           |\n' +
                '    |   USB-C (power + data)    |\n' +
                '    +-----+-----+--------------+\n' +
                '          |     |\n' +
                '    SD Card Module\n' +
                '    +---------+\n' +
                '    | CS  D15 |\n' +
                '    | MOSI D13|\n' +
                '    | MISO D12|\n' +
                '    | CLK  D14|\n' +
                '    | VCC 3V3 |\n' +
                '    | GND GND |\n' +
                '    +---------+\n' +
                '\n' +
                '    No other external wiring.\n' +
                '    WiFi promiscuous mode uses the built-in radio.',

        wiringNotes: '<p><strong>SD card SPI:</strong> The CYD\'s display also uses SPI. The SD card must use a separate CS pin (GPIO 15). Initialize the display first, then the SD card. Both share MOSI/MISO/CLK but each has its own chip select.</p>' +
                     '<p><strong>Power:</strong> This device runs continuously, so use a USB-C power adapter (5V/1A minimum). Promiscuous mode increases power draw to ~180mA sustained. A powered USB hub works well for desk deployment.</p>' +
                     '<p><strong>Placement:</strong> WiFi reception matters. Place the device centrally in the area you want to monitor. The ESP32\'s built-in PCB antenna has roughly 10-15m indoor range. Near a wall or inside a metal enclosure degrades performance significantly.</p>',

        steps: [
            {
                title: 'Promiscuous Mode Packet Counter',
                content: '<p>Set up WiFi promiscuous mode to capture all 802.11 frames on the current channel. Instead of storing full packets (impossible with ESP32 memory), count packets per type and track source MAC addresses.</p>',
                code: '#include <WiFi.h>\n#include "esp_wifi.h"\n#include <TFT_eSPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\n// Traffic counters (reset each sample window)\nvolatile uint32_t mgmtCount = 0;   // beacons, probes, auth\nvolatile uint32_t dataCount = 0;   // data frames\nvolatile uint32_t ctrlCount = 0;   // ACK, RTS/CTS\nvolatile uint32_t deauthCount = 0; // deauth/disassoc specifically\nvolatile uint32_t totalCount = 0;\n\n// Promiscuous callback\nvoid IRAM_ATTR snifferCallback(void *buf, wifi_promiscuous_pkt_type_t type) {\n  const wifi_promiscuous_pkt_t *pkt = (wifi_promiscuous_pkt_t *)buf;\n  totalCount++;\n  \n  if (type == WIFI_PKT_MGMT) {\n    mgmtCount++;\n    // Check for deauth (subtype 0xC0) or disassoc (0xA0)\n    uint8_t frameType = pkt->payload[0];\n    if (frameType == 0xC0 || frameType == 0xA0) {\n      deauthCount++;\n    }\n  } else if (type == WIFI_PKT_DATA) {\n    dataCount++;\n  } else if (type == WIFI_PKT_CTRL) {\n    ctrlCount++;\n  }\n}\n\nvoid setupSniffer() {\n  WiFi.mode(WIFI_STA);\n  WiFi.disconnect();\n  \n  esp_wifi_set_promiscuous(true);\n  esp_wifi_set_promiscuous_rx_cb(&snifferCallback);\n  \n  // Start on channel 1\n  esp_wifi_set_channel(1, WIFI_SECOND_CHAN_NONE);\n  \n  Serial.println("Promiscuous mode active");\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  tft.init();\n  tft.setRotation(1);\n  tft.fillScreen(TFT_BLACK);\n  tft.setTextColor(TFT_CYAN, TFT_BLACK);\n  tft.drawString("ANOMALY MONITOR", 70, 5);\n  \n  setupSniffer();\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The <code>IRAM_ATTR</code> attribute places the callback in IRAM (instruction RAM) instead of flash. This is critical for interrupt-speed callbacks &mdash; flash access can stall during WiFi operations, causing watchdog resets.'
            },
            {
                title: 'Channel Hopping and Sample Windows',
                content: '<p>Hop across all 2.4GHz channels (1-13) to capture a complete picture. Collect samples in fixed windows (10 seconds per channel) and aggregate the counts into per-window snapshots for analysis.</p>',
                code: '#define NUM_CHANNELS 13\n#define SAMPLE_WINDOW_MS 10000  // 10 seconds per channel\n#define HOP_INTERVAL_MS 2000   // stay 2s per channel in hop mode\n\ntypedef struct {\n  uint32_t timestamp;\n  uint8_t channel;\n  uint32_t total;\n  uint32_t mgmt;\n  uint32_t data;\n  uint32_t ctrl;\n  uint32_t deauth;\n  uint8_t uniqueMACs;\n} TrafficSample;\n\n// Ring buffer of samples\n#define MAX_SAMPLES 60\nTrafficSample samples[MAX_SAMPLES];\nint sampleIdx = 0;\nint sampleCount = 0;\n\nuint8_t currentChannel = 1;\nbool hopMode = true;  // true = hop, false = lock on one channel\nunsigned long lastHop = 0;\nunsigned long windowStart = 0;\n\nvoid resetCounters() {\n  totalCount = 0;\n  mgmtCount = 0;\n  dataCount = 0;\n  ctrlCount = 0;\n  deauthCount = 0;\n}\n\nvoid recordSample() {\n  TrafficSample s;\n  s.timestamp = millis() / 1000;\n  s.channel = currentChannel;\n  s.total = totalCount;\n  s.mgmt = mgmtCount;\n  s.data = dataCount;\n  s.ctrl = ctrlCount;\n  s.deauth = deauthCount;\n  s.uniqueMACs = getUniqueDeviceCount();  // from MAC tracker\n  \n  samples[sampleIdx] = s;\n  sampleIdx = (sampleIdx + 1) % MAX_SAMPLES;\n  if (sampleCount < MAX_SAMPLES) sampleCount++;\n  \n  resetCounters();\n}\n\nvoid loopChannelHop() {\n  unsigned long now = millis();\n  \n  // Record sample at end of each window\n  if (now - windowStart >= SAMPLE_WINDOW_MS) {\n    recordSample();\n    windowStart = now;\n  }\n  \n  // Hop channels\n  if (hopMode && now - lastHop >= HOP_INTERVAL_MS) {\n    currentChannel = (currentChannel % NUM_CHANNELS) + 1;\n    esp_wifi_set_channel(currentChannel, WIFI_SECOND_CHAN_NONE);\n    lastHop = now;\n  }\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Channel hopping means you miss packets on other channels while listening to one. A 2-second dwell time across 13 channels gives you a 26-second full sweep. For focused monitoring, lock onto the channel your target AP uses.'
            },
            {
                title: 'Statistical Anomaly Engine',
                content: '<p>Build a simple anomaly detection engine using exponentially weighted moving averages (EWMA) and z-scores. The engine learns the baseline over time and flags deviations. A z-score above 2.0 means the observation is more than 2 standard deviations from the mean &mdash; unusual enough to investigate.</p>',
                code: 'typedef struct {\n  float mean;       // EWMA of packet counts\n  float variance;   // EWMA of variance\n  float alpha;      // smoothing factor (0.1 = slow adapt, 0.3 = fast)\n  bool initialized;\n} Baseline;\n\nBaseline blTotal  = {0, 0, 0.1, false};\nBaseline blMgmt   = {0, 0, 0.1, false};\nBaseline blData   = {0, 0, 0.1, false};\nBaseline blDeauth = {0, 0, 0.15, false};\n\nfloat anomalyScore = 0;\nfloat maxScore = 0;\n\nvoid updateBaseline(Baseline *bl, float value) {\n  if (!bl->initialized) {\n    bl->mean = value;\n    bl->variance = 0;\n    bl->initialized = true;\n    return;\n  }\n  \n  float diff = value - bl->mean;\n  bl->mean = bl->mean + bl->alpha * diff;\n  bl->variance = (1.0 - bl->alpha) * (bl->variance + bl->alpha * diff * diff);\n}\n\nfloat getZScore(Baseline *bl, float value) {\n  if (!bl->initialized || bl->variance < 1.0) return 0;\n  float stddev = sqrt(bl->variance);\n  return fabs(value - bl->mean) / stddev;\n}\n\nvoid analyzeLatestSample() {\n  if (sampleCount < 2) return;  // need history\n  \n  int idx = (sampleIdx - 1 + MAX_SAMPLES) % MAX_SAMPLES;\n  TrafficSample *s = &samples[idx];\n  \n  float zTotal  = getZScore(&blTotal,  s->total);\n  float zMgmt   = getZScore(&blMgmt,   s->mgmt);\n  float zData   = getZScore(&blData,   s->data);\n  float zDeauth = getZScore(&blDeauth, s->deauth);\n  \n  // Weighted composite score (deauth weighs heavily)\n  anomalyScore = (zTotal * 0.2) + (zMgmt * 0.2) +\n                 (zData * 0.2) + (zDeauth * 0.4);\n  \n  if (anomalyScore > maxScore) maxScore = anomalyScore;\n  \n  // Update baselines with current observation\n  updateBaseline(&blTotal,  s->total);\n  updateBaseline(&blMgmt,   s->mgmt);\n  updateBaseline(&blData,   s->data);\n  updateBaseline(&blDeauth, s->deauth);\n  \n  // Alert threshold\n  if (anomalyScore > 2.0) {\n    Serial.printf("ANOMALY ALERT! Score: %.2f\\n", anomalyScore);\n    Serial.printf("  Total: %lu (z=%.1f) Mgmt: %lu (z=%.1f)\\n",\n                  s->total, zTotal, s->mgmt, zMgmt);\n    Serial.printf("  Deauth: %lu (z=%.1f) Devices: %d\\n",\n                  s->deauth, zDeauth, s->uniqueMACs);\n  }\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The alpha value controls how quickly the baseline adapts. Lower alpha (0.05) means slow learning &mdash; good for stable networks. Higher alpha (0.3) adapts fast but is less sensitive to subtle changes. Start at 0.1 and adjust based on your environment.'
            },
            {
                title: 'MAC Address Tracker',
                content: '<p>Maintain a registry of every device seen on the network. When a new MAC address appears for the first time, trigger an alert. Track when devices were first and last seen to build a device inventory.</p>',
                code: '#define MAX_DEVICES 128\n\ntypedef struct {\n  uint8_t mac[6];\n  uint32_t firstSeen;  // seconds since boot\n  uint32_t lastSeen;\n  uint32_t packetCount;\n  int8_t lastRSSI;\n  bool isNew;          // true until acknowledged\n} DeviceEntry;\n\nDeviceEntry devices[MAX_DEVICES];\nint deviceCount = 0;\nint newDeviceAlerts = 0;\n\nvoid macToString(const uint8_t *mac, char *buf) {\n  sprintf(buf, "%02X:%02X:%02X:%02X:%02X:%02X",\n          mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);\n}\n\nint findDevice(const uint8_t *mac) {\n  for (int i = 0; i < deviceCount; i++) {\n    if (memcmp(devices[i].mac, mac, 6) == 0) return i;\n  }\n  return -1;\n}\n\nvoid trackDevice(const uint8_t *mac, int8_t rssi) {\n  int idx = findDevice(mac);\n  uint32_t now = millis() / 1000;\n  \n  if (idx >= 0) {\n    // Known device\n    devices[idx].lastSeen = now;\n    devices[idx].packetCount++;\n    devices[idx].lastRSSI = rssi;\n  } else if (deviceCount < MAX_DEVICES) {\n    // New device!\n    DeviceEntry *d = &devices[deviceCount];\n    memcpy(d->mac, mac, 6);\n    d->firstSeen = now;\n    d->lastSeen = now;\n    d->packetCount = 1;\n    d->lastRSSI = rssi;\n    d->isNew = true;\n    deviceCount++;\n    newDeviceAlerts++;\n    \n    char macStr[18];\n    macToString(mac, macStr);\n    Serial.printf("NEW DEVICE: %s (RSSI: %d, total: %d)\\n",\n                  macStr, rssi, deviceCount);\n  }\n}\n\nuint8_t getUniqueDeviceCount() {\n  return deviceCount;\n}\n\n// Update the sniffer callback to track MACs:\n// void IRAM_ATTR snifferCallback(void *buf, wifi_promiscuous_pkt_type_t type) {\n//   const wifi_promiscuous_pkt_t *pkt = (wifi_promiscuous_pkt_t *)buf;\n//   // ... existing counting code ...\n//   \n//   // Extract source MAC (bytes 10-15 of 802.11 header)\n//   if (pkt->rx_ctrl.sig_len >= 24) {\n//     trackDevice(&pkt->payload[10], pkt->rx_ctrl.rssi);\n//   }\n// }',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Randomized MAC addresses (used by modern phones during probe requests) will inflate your device count. Filter by checking the locally-administered bit: if <code>mac[0] & 0x02</code> is set, the MAC is randomized. Track these separately or ignore them for device counting.'
            },
            {
                title: 'TFT Anomaly Dashboard',
                content: '<p>Visualize the anomaly score, device count, traffic breakdown, and alert history on the CYD\'s 320x240 TFT display. Use color coding: green for normal, yellow for elevated, red for anomaly. Draw a scrolling graph of the anomaly score over time.</p>',
                code: '#define GRAPH_X 10\n#define GRAPH_Y 80\n#define GRAPH_W 300\n#define GRAPH_H 80\n#define GRAPH_POINTS 60\n\nfloat scoreHistory[GRAPH_POINTS];\nint historyIdx = 0;\n\nuint16_t scoreColor(float score) {\n  if (score < 1.0) return TFT_GREEN;\n  if (score < 2.0) return TFT_YELLOW;\n  return TFT_RED;\n}\n\nvoid drawDashboard() {\n  // Header\n  tft.fillRect(0, 0, 320, 20, 0x0841);\n  tft.setTextColor(TFT_CYAN);\n  tft.drawString("ANOMALY MONITOR", 5, 3);\n  tft.drawString("Ch:" + String(currentChannel), 200, 3);\n  tft.drawString(String(deviceCount) + " dev", 260, 3);\n  \n  // Anomaly score (big number)\n  tft.setTextSize(2);\n  uint16_t clr = scoreColor(anomalyScore);\n  tft.setTextColor(clr, TFT_BLACK);\n  tft.fillRect(10, 25, 150, 40, TFT_BLACK);\n  tft.drawFloat(anomalyScore, 2, 10, 25);\n  tft.setTextSize(1);\n  tft.setTextColor(TFT_WHITE);\n  tft.drawString("ANOMALY SCORE", 10, 50);\n  \n  // Traffic breakdown bars\n  int total = mgmtCount + dataCount + ctrlCount;\n  if (total > 0) {\n    int barY = 65;\n    int mW = (mgmtCount * GRAPH_W) / total;\n    int dW = (dataCount * GRAPH_W) / total;\n    int cW = GRAPH_W - mW - dW;\n    tft.fillRect(GRAPH_X, barY, mW, 8, TFT_BLUE);\n    tft.fillRect(GRAPH_X + mW, barY, dW, 8, TFT_GREEN);\n    tft.fillRect(GRAPH_X + mW + dW, barY, cW, 8, TFT_DARKGREY);\n  }\n  \n  // Scrolling anomaly graph\n  tft.drawRect(GRAPH_X - 1, GRAPH_Y - 1, GRAPH_W + 2, GRAPH_H + 2, 0x4208);\n  tft.fillRect(GRAPH_X, GRAPH_Y, GRAPH_W, GRAPH_H, TFT_BLACK);\n  \n  // Threshold line at 2.0\n  float maxY = max(maxScore, 4.0f);\n  int threshY = GRAPH_Y + GRAPH_H - (int)((2.0 / maxY) * GRAPH_H);\n  tft.drawFastHLine(GRAPH_X, threshY, GRAPH_W, 0x4208);\n  tft.setTextColor(0x4208);\n  tft.drawString("2.0", GRAPH_X + GRAPH_W - 20, threshY - 10);\n  \n  // Plot score history\n  for (int i = 1; i < GRAPH_POINTS && i < sampleCount; i++) {\n    int prev = (historyIdx - i - 1 + GRAPH_POINTS) % GRAPH_POINTS;\n    int curr = (historyIdx - i + GRAPH_POINTS) % GRAPH_POINTS;\n    \n    int x1 = GRAPH_X + GRAPH_W - (i * (GRAPH_W / GRAPH_POINTS));\n    int x2 = GRAPH_X + GRAPH_W - ((i - 1) * (GRAPH_W / GRAPH_POINTS));\n    int y1 = GRAPH_Y + GRAPH_H - (int)((scoreHistory[prev] / maxY) * GRAPH_H);\n    int y2 = GRAPH_Y + GRAPH_H - (int)((scoreHistory[curr] / maxY) * GRAPH_H);\n    \n    y1 = constrain(y1, GRAPH_Y, GRAPH_Y + GRAPH_H);\n    y2 = constrain(y2, GRAPH_Y, GRAPH_Y + GRAPH_H);\n    \n    tft.drawLine(x1, y1, x2, y2, scoreColor(scoreHistory[curr]));\n  }\n  \n  // New device alerts\n  if (newDeviceAlerts > 0) {\n    tft.fillRect(10, 170, 300, 20, TFT_RED);\n    tft.setTextColor(TFT_WHITE);\n    tft.drawString("NEW DEVICES: " + String(newDeviceAlerts), 15, 174);\n  }\n  \n  // Device list (last 3 new)\n  tft.setTextColor(TFT_WHITE, TFT_BLACK);\n  int listY = 195;\n  for (int i = deviceCount - 1; i >= 0 && listY < 235; i--) {\n    if (devices[i].isNew) {\n      char mac[18];\n      macToString(devices[i].mac, mac);\n      tft.drawString(String(mac) + " RSSI:" + String(devices[i].lastRSSI),\n                     10, listY);\n      listY += 12;\n    }\n  }\n}\n\n// In analyzeLatestSample(), after computing anomalyScore:\n// scoreHistory[historyIdx] = anomalyScore;\n// historyIdx = (historyIdx + 1) % GRAPH_POINTS;',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Redrawing the full screen every cycle causes flicker. Only redraw regions that changed: clear the number area before drawing the new score, and redraw the graph by filling it black first. The status bar and labels can be drawn once in <code>setup()</code>.'
            },
            {
                title: 'SD Card Baseline Persistence',
                content: '<p>Save learned baselines to the SD card so the monitor remembers what is normal across reboots. On startup, load the saved baseline. Periodically update the saved file as the baseline evolves. Also log all anomaly alerts with timestamps to a CSV file for later review.</p>',
                code: '#include <SD.h>\n#include <ArduinoJson.h>  // install via Library Manager\n\n#define SD_CS 15\n#define BASELINE_FILE "/baseline.json"\n#define ALERT_LOG "/alerts.csv"\n\nbool sdReady = false;\n\nvoid setupSD() {\n  if (SD.begin(SD_CS)) {\n    sdReady = true;\n    Serial.println("SD card ready");\n  } else {\n    Serial.println("SD card not found (running without persistence)");\n  }\n}\n\nvoid saveBaseline() {\n  if (!sdReady) return;\n  \n  StaticJsonDocument<512> doc;\n  \n  JsonObject total = doc.createNestedObject("total");\n  total["mean"] = blTotal.mean;\n  total["variance"] = blTotal.variance;\n  \n  JsonObject mgmt = doc.createNestedObject("mgmt");\n  mgmt["mean"] = blMgmt.mean;\n  mgmt["variance"] = blMgmt.variance;\n  \n  JsonObject data = doc.createNestedObject("data");\n  data["mean"] = blData.mean;\n  data["variance"] = blData.variance;\n  \n  JsonObject deauth = doc.createNestedObject("deauth");\n  deauth["mean"] = blDeauth.mean;\n  deauth["variance"] = blDeauth.variance;\n  \n  doc["deviceCount"] = deviceCount;\n  doc["sampleCount"] = sampleCount;\n  doc["uptimeHours"] = millis() / 3600000;\n  \n  File f = SD.open(BASELINE_FILE, FILE_WRITE);\n  if (f) {\n    serializeJson(doc, f);\n    f.close();\n    Serial.println("Baseline saved");\n  }\n}\n\nbool loadBaseline() {\n  if (!sdReady) return false;\n  if (!SD.exists(BASELINE_FILE)) return false;\n  \n  File f = SD.open(BASELINE_FILE, FILE_READ);\n  if (!f) return false;\n  \n  StaticJsonDocument<512> doc;\n  DeserializationError err = deserializeJson(doc, f);\n  f.close();\n  \n  if (err) {\n    Serial.printf("Baseline parse error: %s\\n", err.c_str());\n    return false;\n  }\n  \n  blTotal.mean = doc["total"]["mean"];\n  blTotal.variance = doc["total"]["variance"];\n  blTotal.initialized = true;\n  \n  blMgmt.mean = doc["mgmt"]["mean"];\n  blMgmt.variance = doc["mgmt"]["variance"];\n  blMgmt.initialized = true;\n  \n  blData.mean = doc["data"]["mean"];\n  blData.variance = doc["data"]["variance"];\n  blData.initialized = true;\n  \n  blDeauth.mean = doc["deauth"]["mean"];\n  blDeauth.variance = doc["deauth"]["variance"];\n  blDeauth.initialized = true;\n  \n  Serial.printf("Baseline loaded (last session: %d samples)\\n",\n                (int)doc["sampleCount"]);\n  return true;\n}\n\nvoid logAlert(float score, const char* reason) {\n  if (!sdReady) return;\n  \n  File f = SD.open(ALERT_LOG, FILE_APPEND);\n  if (f) {\n    f.printf("%lu,%s,%.2f,%d,%lu,%lu,%lu,%lu\\n",\n            millis() / 1000, reason, score, deviceCount,\n            totalCount, mgmtCount, dataCount, deauthCount);\n    f.close();\n  }\n}\n\n// In setup():\n// setupSD();\n// if (loadBaseline()) {\n//   tft.drawString("Baseline loaded!", 10, 220);\n// } else {\n//   tft.drawString("Learning baseline...", 10, 220);\n// }\n\n// Save baseline every 10 minutes:\n// static unsigned long lastSave = 0;\n// if (millis() - lastSave > 600000) {\n//   saveBaseline();\n//   lastSave = millis();\n// }',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The <code>ArduinoJson</code> library is the standard for JSON on embedded devices. Use <code>StaticJsonDocument</code> (stack allocated) for small documents and <code>DynamicJsonDocument</code> (heap allocated) for larger ones. The size parameter is bytes of memory, not JSON length.'
            }
        ],

        testing: '<p>Test each component individually, then the full system:</p>' +
                 '<ul>' +
                 '<li><strong>Packet capture:</strong> Run the monitor near your router. Serial output should show packet counts increasing. Management frames dominate on quiet networks (beacons every 100ms from each AP).</li>' +
                 '<li><strong>Channel hopping:</strong> Verify the channel indicator changes on the display. Lock onto your router\'s channel and confirm higher packet counts.</li>' +
                 '<li><strong>Anomaly detection:</strong> Let the baseline stabilize for 5-10 minutes. Then generate anomalous traffic: start a large download, connect a new device, or run a port scan from another machine. The anomaly score should spike.</li>' +
                 '<li><strong>MAC tracker:</strong> Connect your phone to WiFi. Its MAC should appear in the new device list. Disconnect and reconnect &mdash; it should be recognized, not re-alerted.</li>' +
                 '<li><strong>Dashboard:</strong> The graph should scroll left with new data points. Colors should change based on score (green &rarr; yellow &rarr; red).</li>' +
                 '<li><strong>SD persistence:</strong> Let it learn for 10+ minutes. Power cycle. On reboot, serial should print "Baseline loaded" and the monitor should not re-alert on normal traffic.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Zero packets captured:</strong> Verify promiscuous mode is enabled (<code>esp_wifi_set_promiscuous(true)</code>). Check that WiFi mode is STA and disconnected. Some boards require calling <code>WiFi.mode(WIFI_STA)</code> before enabling promiscuous mode.</li>' +
                         '<li><strong>Very low packet counts:</strong> You may be on an empty channel. Switch to the channel your router uses (check in router admin). Channels 1, 6, and 11 are most commonly used.</li>' +
                         '<li><strong>Anomaly score always zero:</strong> The engine needs at least 2 samples to compute z-scores and the variance must be above 1.0. Wait for the baseline to accumulate data. If your network is extremely stable, lower the variance threshold.</li>' +
                         '<li><strong>False positives everywhere:</strong> Lower the alpha value (0.05) so the baseline adapts slower. Increase the alert threshold from 2.0 to 3.0. Normal networks have periodic traffic bursts (DHCP renewals, NTP syncs).</li>' +
                         '<li><strong>SD card fails after display init:</strong> SPI bus conflict. Ensure the SD card CS pin is different from the display CS. Call <code>SPI.begin(14, 12, 13)</code> explicitly if the default SPI pins do not match your wiring.</li>' +
                         '<li><strong>Crash when tracking many MACs:</strong> The fixed 128-device array uses ~3KB of RAM. If you are in a dense environment (apartment building, office), increase <code>MAX_DEVICES</code> but check free heap with <code>ESP.getFreeHeap()</code>. Below 20KB free, expect instability.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Protocol Fingerprinting</strong> &mdash; Parse the 802.11 management frame subtypes (beacon, probe request, probe response, authentication, association, deauthentication) and track their ratios independently. A spike in probe requests means someone is actively scanning. A spike in authentication frames could indicate a brute-force attack.</p>' +
                    '<p><strong>Challenge 2: Time-of-Day Profiling</strong> &mdash; If you add an RTC module (DS3231, ~$2), build separate baselines for different times of day. A network that is quiet at 3AM and busy at 2PM should have different "normal" profiles. An alert at 3AM for traffic that would be normal at 2PM is a stronger signal.</p>' +
                    '<p><strong>Challenge 3: Integration with SG-25</strong> &mdash; Connect this ESP32 monitor to the Raspberry Pi IDS (SG-25) via WiFi. When the anomaly score exceeds a threshold, send an HTTP POST to the Pi\'s alert dashboard with the anomaly details. The ESP32 handles lightweight monitoring; the Pi handles deep packet inspection.</p>'
    },

    // ========================================================================
    // SG-25: Pi Network IDS (Intrusion Detection)
    // ========================================================================
    'sg-25': {
        intro: '<p>An Intrusion Detection System (IDS) inspects every packet crossing your network and compares it against a database of known attack signatures &mdash; SQL injection payloads, malware callbacks, port scan patterns, brute-force attempts, and thousands of other threats. Commercial IDS appliances cost thousands of dollars. You can build one on a Raspberry Pi for the cost of an Ethernet adapter.</p>' +
               '<p>In this project you install and configure <strong>Suricata</strong>, the open-source IDS/IPS engine used by enterprises and governments worldwide. You will set up the Pi as an inline network tap using two Ethernet interfaces, write custom detection rules, parse the EVE JSON alert logs with Python, and build a real-time Flask dashboard to monitor and triage alerts.</p>' +
               '<p>This is the capstone of the Firmware Ops track &mdash; a full network security appliance running on a $50 single-board computer.</p>',

        wiring: '    Network Topology (Inline Tap Mode)\n' +
                '\n' +
                '    Internet\n' +
                '        |\n' +
                '    [Router/Modem]\n' +
                '        |\n' +
                '        | eth0 (built-in Ethernet)\n' +
                '    [Raspberry Pi 4]\n' +
                '        | eth1 (USB Ethernet adapter)\n' +
                '        |\n' +
                '    [Network Switch]\n' +
                '        |\n' +
                '    [Your Devices]\n' +
                '\n' +
                '    The Pi bridges eth0 <-> eth1, inspecting\n' +
                '    all traffic passing through.\n' +
                '\n' +
                '    Alternative: Mirror/SPAN Mode\n' +
                '    If your switch supports port mirroring,\n' +
                '    mirror the uplink port to a port connected\n' +
                '    to the Pi. Only needs one Ethernet interface.',

        wiringNotes: '<p><strong>USB Ethernet adapter:</strong> Get a USB 3.0 Gigabit adapter with the ASIX AX88179 or Realtek RTL8153 chipset &mdash; both work plug-and-play on Raspberry Pi OS. Avoid USB 2.0 adapters (100Mbps bottleneck).</p>' +
                     '<p><strong>Inline vs mirror:</strong> Inline mode (bridge) sees every packet but adds latency and creates a single point of failure &mdash; if the Pi crashes, the network goes down. Mirror/SPAN mode is passive (read-only) but requires a managed switch. For a home lab, start with inline mode. For production, use SPAN.</p>' +
                     '<p><strong>Performance:</strong> The Pi 4 can handle ~500Mbps of Suricata inspection. This is fine for most home/small office networks. If you have gigabit internet, some packets will bypass inspection under heavy load.</p>',

        steps: [
            {
                title: 'Install Suricata on Raspberry Pi',
                content: '<p>Suricata is available in the Raspberry Pi OS repositories, but the version is often outdated. Install from the official Suricata PPA for the latest stable release with full feature support.</p>',
                code: '# Update system\nsudo apt update && sudo apt upgrade -y\n\n# Install dependencies\nsudo apt install -y software-properties-common \\\n  libpcre2-dev libyaml-dev libjansson-dev \\\n  libpcap-dev libnet1-dev libcap-ng-dev \\\n  python3-pip python3-yaml jq\n\n# Add Suricata PPA and install\nsudo add-apt-repository ppa:oisf/suricata-stable\nsudo apt update\nsudo apt install -y suricata suricata-update\n\n# Verify installation\nsuricata --build-info\nsuricata -V\n# Should show Suricata 7.x\n\n# Download latest rulesets\nsudo suricata-update\n# This pulls Emerging Threats (ET) Open rules\n# Rules are stored in /var/lib/suricata/rules/\n\n# Check rule count\nsudo suricata-update list-sources\nwc -l /var/lib/suricata/rules/suricata.rules\n# Expect 30,000+ rules from ET Open',
                language: 'Bash',
                tip: '<strong>Tip:</strong> <code>suricata-update</code> manages rule sources. ET Open (free) covers most threats. For more comprehensive coverage, register for a free ET Pro trial or add the Abuse.ch URLhaus and SSLBL rule sources.'
            },
            {
                title: 'Configure Network Bridge',
                content: '<p>Set up a transparent bridge between the built-in Ethernet (eth0) and the USB adapter (eth1). All traffic passes through the bridge, and Suricata inspects it on the bridge interface (br0). The bridge is invisible to other devices &mdash; it does not have an IP address on the monitored network.</p>',
                code: '# Identify your interfaces\nip link show\n# Look for eth0 (built-in) and eth1 (USB adapter)\n# USB adapter may show as enx... (rename it below)\n\n# Install bridge utilities\nsudo apt install -y bridge-utils\n\n# Create the bridge — edit /etc/network/interfaces:\nsudo tee /etc/network/interfaces.d/bridge.conf << \'BRIDGECONF\'\n# Bridge for IDS inline mode\nauto br0\niface br0 inet manual\n  bridge_ports eth0 eth1\n  bridge_stp off\n  bridge_fd 0\n  bridge_maxwait 0\n\n# Management interface (for SSH access)\n# Use WiFi so the bridge stays transparent\nauto wlan0\niface wlan0 inet dhcp\n  wpa-ssid "YourNetwork"\n  wpa-psk "YourPassword"\nBRIDGECONF\n\n# Enable IP forwarding\nsudo sysctl -w net.ipv4.ip_forward=1\necho "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf\n\n# Bring up the bridge\nsudo systemctl restart networking\n# Or reboot: sudo reboot\n\n# Verify bridge is working\nbrctl show\n# Should show br0 with eth0 and eth1 as members\n\n# Test: plug a device into eth1 side\n# It should get an IP from your router (through the bridge)\n# and have full internet access',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Always keep SSH access via WiFi (wlan0) when configuring the bridge. If the bridge misconfiguration breaks Ethernet, WiFi is your fallback. Test the bridge with a single device before routing your whole network through it.'
            },
            {
                title: 'Configure Suricata for Bridge Mode',
                content: '<p>Point Suricata at the bridge interface and configure it for your network. The main configuration file is <code>/etc/suricata/suricata.yaml</code> &mdash; a large file with hundreds of options. Focus on the critical settings.</p>',
                code: '# Edit the main config\nsudo nano /etc/suricata/suricata.yaml\n\n# Key settings to change:\n\n# 1. Set HOME_NET to your LAN subnet\n# vars:\n#   address-groups:\n#     HOME_NET: "[192.168.1.0/24]"\n#     EXTERNAL_NET: "!$HOME_NET"\n\n# 2. Set the capture interface to br0\n# af-packet:\n#   - interface: br0\n#     cluster-id: 99\n#     cluster-type: cluster_flow\n#     defrag: yes\n\n# 3. Enable EVE JSON logging (the good stuff)\n# outputs:\n#   - eve-log:\n#       enabled: yes\n#       filetype: regular\n#       filename: eve.json\n#       types:\n#         - alert\n#         - http\n#         - dns\n#         - tls\n#         - files\n#         - stats:\n#             totals: yes\n#             threads: no\n\n# 4. Performance tuning for Pi\n# threading:\n#   set-cpu-affinity: yes\n#   detect-thread-ratio: 1.0\n# (Pi 4 has 4 cores — Suricata will use them all)\n\n# Test the configuration\nsudo suricata -T -c /etc/suricata/suricata.yaml\n# Should print "Configuration provided was successfully loaded"\n\n# Start Suricata\nsudo systemctl enable suricata\nsudo systemctl start suricata\nsudo systemctl status suricata\n\n# Watch alerts in real time\nsudo tail -f /var/log/suricata/eve.json | jq \'select(.event_type=="alert")\'',
                language: 'Bash',
                tip: '<strong>Tip:</strong> The <code>HOME_NET</code> variable is critical. Rules use it to distinguish inbound vs outbound traffic. If set wrong, you will get thousands of false positives or miss real attacks. Set it to your actual LAN subnet (check with <code>ip addr</code>).'
            },
            {
                title: 'Write Custom IDS Rules',
                content: '<p>Suricata rules follow a specific syntax: <code>action protocol source port -> dest port (rule options)</code>. Write custom rules to detect activity specific to your network that the default rules do not cover.</p>',
                code: '# Create a custom rules file\nsudo tee /var/lib/suricata/rules/local.rules << \'RULES\'\n# =============================================\n# SG-25 Custom Rules\n# =============================================\n\n# Detect internal port scans (SYN to 10+ ports from one host)\nalert tcp $HOME_NET any -> $HOME_NET any (\\\n  msg:"SG25 - Internal Port Scan Detected"; \\\n  flags:S; \\\n  threshold: type both, track by_src, count 10, seconds 60; \\\n  classtype:attempted-recon; \\\n  sid:9000001; rev:1;)\n\n# Detect DNS queries to known malware domains\nalert dns $HOME_NET any -> any any (\\\n  msg:"SG25 - DNS Query to Suspicious TLD"; \\\n  dns.query; content:".xyz"; endswith; \\\n  classtype:bad-unknown; \\\n  sid:9000002; rev:1;)\n\n# Detect SSH brute force (5+ auth attempts in 30 seconds)\nalert ssh any any -> $HOME_NET 22 (\\\n  msg:"SG25 - SSH Brute Force Attempt"; \\\n  flow:to_server,established; \\\n  threshold: type both, track by_src, count 5, seconds 30; \\\n  classtype:attempted-admin; \\\n  sid:9000003; rev:1;)\n\n# Detect ICMP flood (ping flood / DoS)\nalert icmp any any -> $HOME_NET any (\\\n  msg:"SG25 - ICMP Flood Detected"; \\\n  threshold: type both, track by_src, count 100, seconds 10; \\\n  classtype:attempted-dos; \\\n  sid:9000004; rev:1;)\n\n# Detect outbound connections to Tor exit nodes\nalert tcp $HOME_NET any -> any 9001 (\\\n  msg:"SG25 - Possible Tor Connection"; \\\n  flow:to_server; \\\n  classtype:policy-violation; \\\n  sid:9000005; rev:1;)\n\n# Detect plaintext HTTP credentials (POST with password field)\nalert http $HOME_NET any -> any any (\\\n  msg:"SG25 - Plaintext Password in HTTP POST"; \\\n  flow:to_server,established; \\\n  http.method; content:"POST"; \\\n  http.request_body; content:"password="; \\\n  classtype:bad-unknown; \\\n  sid:9000006; rev:1;)\nRULES\n\n# Add local.rules to suricata.yaml\n# Under rule-files: section, add:\n#   - /var/lib/suricata/rules/local.rules\n\n# Test rules\nsudo suricata -T -c /etc/suricata/suricata.yaml\n\n# Reload rules without restarting (no traffic drop)\nsudo suricatasc -c reload-rules',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Custom rule SIDs should start at 9000000 to avoid conflicts with official rulesets. Use <code>suricatasc -c reload-rules</code> to hot-reload rules without restarting Suricata (no traffic interruption). Always test with <code>suricata -T</code> first.'
            },
            {
                title: 'Build a Python Alert Parser',
                content: '<p>Suricata\'s EVE JSON log contains structured data for every alert, DNS query, HTTP request, TLS handshake, and more. Write a Python script that reads the log, categorizes alerts by severity and type, and prepares the data for the dashboard.</p>',
                code: '#!/usr/bin/env python3\n"""SG-25 EVE JSON Alert Parser"""\n\nimport json\nimport os\nfrom collections import Counter, defaultdict\nfrom datetime import datetime\n\nEVE_LOG = "/var/log/suricata/eve.json"\n\ndef parse_alerts(filepath=EVE_LOG, max_lines=10000):\n    """Parse EVE JSON and extract alerts."""\n    alerts = []\n    \n    # Read from end of file for recent events\n    with open(filepath, "r") as f:\n        lines = f.readlines()[-max_lines:]\n    \n    for line in lines:\n        try:\n            event = json.loads(line.strip())\n        except json.JSONDecodeError:\n            continue\n        \n        if event.get("event_type") != "alert":\n            continue\n        \n        alert = {\n            "timestamp": event.get("timestamp", ""),\n            "src_ip": event.get("src_ip", ""),\n            "src_port": event.get("src_port", 0),\n            "dest_ip": event.get("dest_ip", ""),\n            "dest_port": event.get("dest_port", 0),\n            "proto": event.get("proto", ""),\n            "signature": event["alert"].get("signature", ""),\n            "sid": event["alert"].get("signature_id", 0),\n            "severity": event["alert"].get("severity", 0),\n            "category": event["alert"].get("category", ""),\n            "action": event["alert"].get("action", ""),\n        }\n        alerts.append(alert)\n    \n    return alerts\n\n\ndef summarize(alerts):\n    """Generate summary statistics."""\n    summary = {\n        "total": len(alerts),\n        "by_severity": Counter(a["severity"] for a in alerts),\n        "by_category": Counter(a["category"] for a in alerts),\n        "top_signatures": Counter(a["signature"] for a in alerts).most_common(10),\n        "top_sources": Counter(a["src_ip"] for a in alerts).most_common(10),\n        "top_targets": Counter(a["dest_ip"] for a in alerts).most_common(10),\n    }\n    return summary\n\n\ndef get_recent_alerts(count=50):\n    """Get the N most recent alerts for the dashboard."""\n    alerts = parse_alerts()\n    return sorted(alerts, key=lambda a: a["timestamp"], reverse=True)[:count]\n\n\nif __name__ == "__main__":\n    alerts = parse_alerts()\n    stats = summarize(alerts)\n    \n    print(f"Total alerts: {stats[\'total\']}")\n    print(f"\\nBy severity:")\n    for sev, count in sorted(stats["by_severity"].items()):\n        label = {1: "HIGH", 2: "MEDIUM", 3: "LOW"}.get(sev, f"S{sev}")\n        print(f"  {label}: {count}")\n    \n    print(f"\\nTop 10 signatures:")\n    for sig, count in stats["top_signatures"]:\n        print(f"  [{count:>5}] {sig}")\n    \n    print(f"\\nTop 10 source IPs:")\n    for ip, count in stats["top_sources"]:\n        print(f"  [{count:>5}] {ip}")',
                language: 'Python',
                tip: '<strong>Tip:</strong> EVE JSON lines can be large (1KB+ each). On a busy network, the log grows fast. Set up log rotation with <code>logrotate</code> to prevent filling the SD card. A 32GB card can hold about 2-4 weeks of moderate traffic logs.'
            },
            {
                title: 'Flask Real-Time Alert Dashboard',
                content: '<p>Build a web dashboard with Flask that shows live alerts, severity breakdown, top talkers, and allows searching and filtering. The Pi serves this on port 5000, accessible from any device on the network.</p>',
                code: '#!/usr/bin/env python3\n"""SG-25 IDS Alert Dashboard"""\n\nfrom flask import Flask, render_template_string, jsonify\nfrom eve_parser import parse_alerts, summarize, get_recent_alerts\nimport threading\nimport time\n\napp = Flask(__name__)\n\n# Cache alerts (refresh every 30 seconds)\ncached_alerts = []\ncached_summary = {}\nlock = threading.Lock()\n\ndef refresh_cache():\n    global cached_alerts, cached_summary\n    while True:\n        alerts = parse_alerts()\n        summary = summarize(alerts)\n        with lock:\n            cached_alerts = alerts\n            cached_summary = summary\n        time.sleep(30)\n\nDAShBOARD_HTML = \"\"\"\n<!DOCTYPE html>\n<html>\n<head>\n  <title>SG-25 Network IDS</title>\n  <meta http-equiv=\"refresh\" content=\"30\">\n  <style>\n    body { background: #0a0e1a; color: #e0e0e0;\n           font-family: monospace; margin: 20px; }\n    h1 { color: #00e5ff; border-bottom: 1px solid #1a3a4a; padding-bottom: 10px; }\n    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }\n    .card { background: #111827; border: 1px solid #1e3a5f;\n            border-radius: 6px; padding: 15px; }\n    .card h3 { color: #00e5ff; margin-top: 0; }\n    .sev-1 { color: #ff4444; } .sev-2 { color: #ffaa00; } .sev-3 { color: #44ff44; }\n    table { width: 100%%; border-collapse: collapse; margin-top: 15px; }\n    th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #1e3a5f; }\n    th { color: #00e5ff; }\n    .alert-row:hover { background: #1a2744; }\n    .count { font-size: 2em; color: #00e5ff; }\n  </style>\n</head>\n<body>\n  <h1>SG-25 NETWORK IDS DASHBOARD</h1>\n  <div class=\"grid\">\n    <div class=\"card\">\n      <h3>TOTAL ALERTS</h3>\n      <div class=\"count\">{{ summary.total }}</div>\n    </div>\n    <div class=\"card\">\n      <h3>BY SEVERITY</h3>\n      <p class=\"sev-1\">HIGH: {{ summary.by_severity.get(1, 0) }}</p>\n      <p class=\"sev-2\">MEDIUM: {{ summary.by_severity.get(2, 0) }}</p>\n      <p class=\"sev-3\">LOW: {{ summary.by_severity.get(3, 0) }}</p>\n    </div>\n    <div class=\"card\">\n      <h3>TOP SOURCES</h3>\n      {% for ip, count in summary.top_sources[:5] %}\n      <p>{{ ip }} ({{ count }})</p>\n      {% endfor %}\n    </div>\n  </div>\n\n  <h2>Recent Alerts</h2>\n  <table>\n    <tr><th>Time</th><th>Sev</th><th>Source</th><th>Dest</th><th>Signature</th></tr>\n    {% for a in alerts[:30] %}\n    <tr class=\"alert-row\">\n      <td>{{ a.timestamp[:19] }}</td>\n      <td class=\"sev-{{ a.severity }}\">{{ a.severity }}</td>\n      <td>{{ a.src_ip }}:{{ a.src_port }}</td>\n      <td>{{ a.dest_ip }}:{{ a.dest_port }}</td>\n      <td>{{ a.signature }}</td>\n    </tr>\n    {% endfor %}\n  </table>\n</body>\n</html>\n\"\"\"\n\n@app.route("/")\ndef dashboard():\n    with lock:\n        return render_template_string(DASHBOARD_HTML,\n                                      summary=cached_summary,\n                                      alerts=cached_alerts[-50:])\n\n@app.route("/api/alerts")\ndef api_alerts():\n    with lock:\n        return jsonify(get_recent_alerts(100))\n\n@app.route("/api/summary")\ndef api_summary():\n    with lock:\n        return jsonify(cached_summary)\n\nif __name__ == "__main__":\n    t = threading.Thread(target=refresh_cache, daemon=True)\n    t.start()\n    time.sleep(2)  # let cache populate\n    app.run(host="0.0.0.0", port=5000)',
                language: 'Python',
                tip: '<strong>Tip:</strong> The dashboard auto-refreshes every 30 seconds via the <code>meta refresh</code> tag. For real-time updates without page reload, add a WebSocket layer with Flask-SocketIO. But for a home IDS, polling every 30 seconds is plenty.'
            }
        ],

        testing: '<p>Test each layer from bottom to top:</p>' +
                 '<ul>' +
                 '<li><strong>Bridge connectivity:</strong> Plug a laptop into the eth1 side. Verify it gets a DHCP address and has full internet access. The bridge should be invisible &mdash; <code>traceroute</code> should not show the Pi as a hop.</li>' +
                 '<li><strong>Suricata running:</strong> <code>sudo systemctl status suricata</code> shows active. Check <code>/var/log/suricata/suricata.log</code> for startup errors. The EVE log should be growing: <code>ls -la /var/log/suricata/eve.json</code>.</li>' +
                 '<li><strong>Rule triggering:</strong> From another machine, run <code>nmap -sS &lt;pi_ip&gt;</code> to trigger the port scan rule. Run <code>curl http://example.com</code> to generate HTTP events. Check EVE for alerts: <code>sudo tail -f /var/log/suricata/eve.json | jq \'select(.event_type=="alert")\'</code>.</li>' +
                 '<li><strong>Custom rules:</strong> Trigger each custom rule: ping flood (<code>ping -f</code>), SSH brute force (5 rapid <code>ssh</code> attempts), DNS to .xyz domain (<code>nslookup test.xyz</code>). Each should generate an alert with the correct SID (9000001-9000006).</li>' +
                 '<li><strong>Dashboard:</strong> Open <code>http://&lt;pi_wifi_ip&gt;:5000</code> in a browser. Alerts should appear in the table. Severity colors should be correct (red/yellow/green). Summary cards should show accurate counts.</li>' +
                 '<li><strong>Performance:</strong> Run <code>iperf3</code> through the bridge. Throughput should be 400Mbps+ on Pi 4. Check CPU with <code>htop</code> &mdash; Suricata should distribute across all 4 cores.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Bridge has no connectivity:</strong> Check <code>brctl show</code> &mdash; both interfaces must be listed under br0. If eth1 shows a different name (like enxXXXXXX), update the bridge config with the actual name. Run <code>ip link show</code> to find it.</li>' +
                         '<li><strong>Suricata fails to start:</strong> Check <code>journalctl -u suricata -n 50</code>. Common causes: invalid YAML syntax in config (use spaces, not tabs), interface name mismatch, or insufficient permissions (must run as root or with <code>cap_net_raw</code>).</li>' +
                         '<li><strong>No alerts generated:</strong> Verify <code>HOME_NET</code> matches your actual subnet. Run <code>suricata -T</code> to check config. Ensure rules are loaded: <code>suricatasc -c ruleset-stats</code> should show thousands of loaded rules.</li>' +
                         '<li><strong>Too many alerts (false positives):</strong> Emerging Threats rules cast a wide net. Use <code>suricata-update</code> with a disable.conf to suppress noisy SIDs: <code>echo "2013504" >> /etc/suricata/disable.conf</code>. Or adjust thresholds in <code>/etc/suricata/threshold.config</code>.</li>' +
                         '<li><strong>Dashboard shows no data:</strong> Verify the EVE log path in the parser matches your Suricata config. Check file permissions &mdash; the Flask app needs read access to <code>/var/log/suricata/eve.json</code>. Run the parser standalone first: <code>python3 eve_parser.py</code>.</li>' +
                         '<li><strong>Pi overheating under load:</strong> Suricata is CPU-intensive. Use a heatsink and fan case for the Pi 4. If thermals are still an issue, reduce the <code>detect-thread-ratio</code> to 0.5 in <code>suricata.yaml</code> to use 2 cores instead of 4.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Automated Threat Intelligence</strong> &mdash; Write a cron job that runs <code>suricata-update</code> daily to pull fresh rules, then reloads Suricata. Add the Abuse.ch URLhaus and SSLBL rule sources for malware URL and SSL certificate blocklist detection. Log update results to a file the dashboard can display.</p>' +
                    '<p><strong>Challenge 2: Alert Correlation</strong> &mdash; Modify the Python parser to correlate alerts: if the same source IP triggers 3+ different rule categories within 5 minutes, escalate it as a "multi-stage attack" with a combined severity score. Display correlated incidents as a separate section in the dashboard.</p>' +
                    '<p><strong>Challenge 3: SG-24 Integration</strong> &mdash; Add an API endpoint to the Flask dashboard that receives anomaly alerts from the ESP32 Network Anomaly Monitor (SG-24). When the ESP32 detects a traffic anomaly, it sends an HTTP POST to the Pi. The dashboard correlates the anomaly with any Suricata alerts from the same timeframe, giving you both statistical anomaly detection and signature-based detection in one view.</p>'
    }

};
