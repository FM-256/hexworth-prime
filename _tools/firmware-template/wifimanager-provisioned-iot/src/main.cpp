// ============================================================
//  Hexworth firmware template — WiFiManager-provisioned IoT
//
//  Reference implementation of the captive-portal WiFi pattern
//  documented in KBA #6 "WiFiManager Captive-Portal Provisioning
//  Pattern" (Confluence page 14188547).
//
//  Boot sequence:
//   1. (Optional) factory-reset gesture: BOOT held >5s -> clear NVS.
//   2. Load WiFi creds + device id from NVS.
//      If empty AND secrets.h provides compile-time fallback,
//      migrate the fallback into NVS once.
//      Otherwise open the captive portal AP "HexworthDevice-<MAC4>".
//   3. Connect to WiFi.
//   4. Run your app loop — TODO(app) sections marked below.
//
//  Copy this whole file. Edit the TODO(app) blocks. Drop the
//  hardware-specific includes you don't need. The provisioning
//  code stays untouched.
// ============================================================

#include <Arduino.h>
#include <WiFi.h>
#include <Preferences.h>
#include <WiFiManager.h>

#include "secrets.h"

// -------- Compile-time defaults (overridable in secrets.h) --
#ifndef DEFAULT_DEVICE_ID
#define DEFAULT_DEVICE_ID "device-XXX"
#endif
#ifndef REFRESH_MINUTES
#define REFRESH_MINUTES 15
#endif

// -------- NVS (Preferences) namespace + keys ----------------
// Change NVS_NS to something project-scoped (max 15 chars).
#define NVS_NS          "hexapp"
#define NVS_KEY_SSID    "ssid"
#define NVS_KEY_PASS    "pass"
#define NVS_KEY_DEVICE  "device"

// -------- Hardware --------
// BOOT button GPIO. Defaults to 9 (Seeed XIAO ESP32-C3 / ESP32-S3).
// Override via platformio.ini build_flags for other boards:
//   ESP32 DevKit V1 (38-pin):  -D BTN_BOOT=0
//   ESP32-WROOM modules:        -D BTN_BOOT=0
//   Boards with no BOOT:        -D BTN_BOOT=-1  (disables the gesture)
//
// Note: many ESP32 modules wire BOOT directly to the bootloader-
// flash entry. Holding BOOT during external RESET puts the chip in
// download mode (user code never runs). The factory-reset gesture
// here only works if the user releases BOOT after reset and re-
// presses it during the first second of app boot.
#ifndef BTN_BOOT
#define BTN_BOOT      9
#endif
#define BTN_HOLD_MS   5000

// TODO(app): #include your hardware-specific libraries here.
// e.g. #include <GxEPD2_BW.h> for an e-paper panel,
//      #include <FastLED.h> for an LED strip,
//      #include <MFRC522.h> for an RFID reader.

Preferences prefs;
static String g_ssid;
static String g_pass;
static String g_deviceId;

// ============================================================
//  NVS credential helpers
// ============================================================
static void saveCreds(const String& ssid, const String& pass, const String& deviceId) {
    prefs.begin(NVS_NS, false);
    prefs.putString(NVS_KEY_SSID,   ssid);
    prefs.putString(NVS_KEY_PASS,   pass);
    prefs.putString(NVS_KEY_DEVICE, deviceId);
    prefs.end();
    Serial.printf("[nvs] saved SSID=%s device=%s\n", ssid.c_str(), deviceId.c_str());
}

static void clearCreds() {
    prefs.begin(NVS_NS, false);
    prefs.clear();
    prefs.end();
    Serial.println("[nvs] cleared all credentials");
}

static bool loadCreds() {
    prefs.begin(NVS_NS, true);
    g_ssid     = prefs.getString(NVS_KEY_SSID,   "");
    g_pass     = prefs.getString(NVS_KEY_PASS,   "");
    g_deviceId = prefs.getString(NVS_KEY_DEVICE, "");
    prefs.end();

    if (g_ssid.length() > 0) {
        Serial.printf("[nvs] loaded SSID=%s device=%s\n",
                      g_ssid.c_str(), g_deviceId.c_str());
        return true;
    }

#if defined(WIFI_SSID) && defined(WIFI_PASSWORD)
    Serial.println("[nvs] empty — migrating from secrets.h fallback");
    g_ssid     = String(WIFI_SSID);
    g_pass     = String(WIFI_PASSWORD);
    g_deviceId = String(DEFAULT_DEVICE_ID);
    saveCreds(g_ssid, g_pass, g_deviceId);
    return true;
#else
    Serial.println("[nvs] empty and no compile-time fallback — portal required");
    return false;
#endif
}

// ============================================================
//  Setup-screen renderer (drawn locally, no WiFi needed)
//
//  TODO(app): replace this with your hardware's "show setup
//  instructions" routine. Examples:
//   - On an e-paper: render text via GxEPD2 (see operator-board).
//   - On an OLED: u8g2 / Adafruit_SSD1306 text rendering.
//   - LEDs only: blink an LED in a distinctive setup pattern.
//   - Buzzer: play a setup chime once.
//
//  The user needs to know the AP name to connect to. Without
//  that, the captive portal is invisible to them.
// ============================================================
static void renderSetupScreen(const String& apName) {
    Serial.printf("[setup-ui] SETUP MODE — connect phone to WiFi: %s\n",
                  apName.c_str());
    Serial.println("[setup-ui] (override this with your hardware UI)");
}

// ============================================================
//  WiFi connect (station mode)
// ============================================================
static bool connectWiFi(uint32_t timeoutMs = 20000) {
    if (g_ssid.length() == 0) return false;
    Serial.printf("[wifi] connecting to %s ... ", g_ssid.c_str());
    WiFi.mode(WIFI_STA);
    WiFi.begin(g_ssid.c_str(), g_pass.c_str());

    uint32_t start = millis();
    while (WiFi.status() != WL_CONNECTED) {
        if (millis() - start > timeoutMs) {
            Serial.println("TIMEOUT");
            return false;
        }
        delay(250);
        Serial.print(".");
    }
    Serial.printf(" OK (IP %s, RSSI %d)\n",
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
    return true;
}

// ============================================================
//  Captive portal (blocking until user provisions or timeout)
// ============================================================
static void runPortal() {
    String mac = WiFi.macAddress();
    mac.replace(":", "");
    String apName = "HexworthDevice-" + mac.substring(8);

    renderSetupScreen(apName);

    WiFiManager wm;
    wm.setConfigPortalTimeout(600);   // 10 minutes
    wm.setBreakAfterConfig(true);
    wm.setConnectTimeout(20);

    WiFiManagerParameter deviceIdParam(
        "device",
        "Device ID (e.g. device-001)",
        g_deviceId.length() > 0 ? g_deviceId.c_str() : DEFAULT_DEVICE_ID,
        32);
    wm.addParameter(&deviceIdParam);

    Serial.printf("[portal] opening AP %s — waiting for input\n", apName.c_str());
    bool ok = wm.startConfigPortal(apName.c_str());

    if (ok) {
        String newSsid     = WiFi.SSID();
        String newPass     = WiFi.psk();
        String newDeviceId = String(deviceIdParam.getValue());
        if (newDeviceId.length() == 0) newDeviceId = String(DEFAULT_DEVICE_ID);

        if (newSsid.length() > 0) {
            Serial.printf("[portal] provisioned SSID=%s device=%s\n",
                          newSsid.c_str(), newDeviceId.c_str());
            saveCreds(newSsid, newPass, newDeviceId);
        }
    } else {
        Serial.println("[portal] timed out without input");
    }

    Serial.println("[portal] restarting...");
    delay(500);
    ESP.restart();
}

// ============================================================
//  Factory-reset gesture
// ============================================================
static bool checkFactoryResetGesture() {
    pinMode(BTN_BOOT, INPUT_PULLUP);
    if (digitalRead(BTN_BOOT) != LOW) return false;

    Serial.printf("[boot] BOOT held — keep holding %d ms to factory reset\n",
                  BTN_HOLD_MS);
    uint32_t start = millis();
    while (digitalRead(BTN_BOOT) == LOW) {
        if (millis() - start > BTN_HOLD_MS) {
            Serial.println("[boot] factory reset confirmed");
            clearCreds();
            return true;
        }
        delay(50);
    }
    Serial.println("[boot] released before threshold — no reset");
    return false;
}

// ============================================================
//  TODO(app): your app's one-cycle "do work" routine
//
//  This template assumes a polling app — connect, do something,
//  idle, repeat. If your app needs to stay connected continuously
//  (websocket, MQTT, real-time control), restructure: connect
//  once in setup() and run your event loop in loop().
// ============================================================
static void doAppWork() {
    Serial.printf("[app] device=%s — running one cycle\n", g_deviceId.c_str());

    // TODO(app): replace with real work. Examples:
    //   - HTTP GET your CF endpoint, parse response, update display.
    //   - Publish sensor reading to MQTT broker.
    //   - Pull next command from a queue.
    delay(100);

    Serial.println("[app] cycle complete");
}

// ============================================================
//  setup() / loop()
//
//  DEV MODE: no deep_sleep. USB stays up so you can monitor +
//  reflash. Re-enable deep sleep behind a -D PRODUCTION flag
//  once the full pipeline is verified on real hardware.
// ============================================================
void setup() {
    Serial.begin(115200);
    delay(1500);  // USB CDC settle
    Serial.println();
    Serial.println("=== Hexworth WiFiManager template boot ===");

    bool wasReset = checkFactoryResetGesture();

    // TODO(app): initialize your hardware here (display, sensors,
    // GPIO, SPI, I2C). Do this BEFORE loadCreds so a setup screen
    // can render before WiFi is up.

    bool haveCreds = loadCreds();

    if (!haveCreds || wasReset) {
        Serial.println("[boot] entering captive portal");
        runPortal();  // never returns — reboots after save or timeout
    }

    if (!connectWiFi()) {
        Serial.println("[boot] WiFi connect failed; retry on next loop");
    } else {
        doAppWork();
    }
}

void loop() {
    // Idle, then run another cycle. Heartbeat keeps the serial
    // monitor showing the device is alive during dev.
    for (uint32_t s = 0; s < (uint32_t)REFRESH_MINUTES * 60; s += 10) {
        Serial.printf("[idle] %lu / %lu seconds\n",
                      (unsigned long)s, (unsigned long)REFRESH_MINUTES * 60);
        delay(10000);
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[wifi] dropped — reconnecting");
        if (!connectWiFi()) return;
    }

    doAppWork();
}
