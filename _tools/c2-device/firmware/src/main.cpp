// ============================================================
//  C2 device firmware — Hexworth Command and Control endpoint
//
//  Lifecycle:
//   1. WiFi provisioning (KBA #6 pattern): NVS-backed creds, captive
//      portal on first boot, BOOT-hold-5s factory reset.
//   2. C2 registration: POST /c2Register once with device type +
//      capabilities. Save returned deviceId + deviceKey to a
//      SEPARATE NVS namespace ("c2dev") so re-pairing WiFi doesn't
//      orphan the device in /c2_devices/.
//   3. Heartbeat loop: POST /c2CheckIn every checkInInterval (default
//      30s for esp32). Response reports pendingCommands count.
//   4. Command poll: GET /c2GetCommands when pendingCommands > 0.
//      Each returned command is dispatched by `action` to a handler.
//   5. Report: POST /c2Result with status + result payload + execMs.
//
//  Capabilities exposed (deliberately minimal v1):
//     ping    — return uptime + freeHeap + rssi + ip
//     echo    — return params.text verbatim
//     blink   — flash onboard LED params.count times
//     reboot  — soft restart after acking result
//
//  Backend documented in KBA #2 "DuckyScript IDE + C2 Infrastructure"
//  (Confluence page 14843915). Backend code at functions/index.js:
//  5251-5654.
// ============================================================

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Preferences.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>

#include "secrets.h"

// -------- Compile-time defaults --------
#ifndef DEFAULT_DEVICE_NAME
#define DEFAULT_DEVICE_NAME ""   // empty -> falls back to "c2-<MAC4>"
#endif
#ifndef C2_BASE_URL
#define C2_BASE_URL "https://us-central1-hexworth-prime.cloudfunctions.net"
#endif
#ifndef BTN_BOOT
#define BTN_BOOT 9
#endif
#ifndef LED_PIN
#define LED_PIN 2
#endif
#define BTN_HOLD_MS  5000
#define FW_VERSION   "c2-device-0.1"

// -------- NVS namespaces --------
#define NVS_WIFI      "hexapp"    // mirrors the WiFiManager template
#define NVS_C2        "c2dev"     // separate so factory-reset WiFi
                                  // doesn't wipe C2 registration

#define NVS_KEY_SSID    "ssid"
#define NVS_KEY_PASS    "pass"
#define NVS_KEY_NAME    "name"
// Pairing code (optional) — captured during the captive portal, used
// once on the next c2Register call, then cleared. If empty, the
// device falls back to the legacy open-enrollment /c2Register endpoint.
#define NVS_KEY_PCODE   "pcode"

#define NVS_KEY_C2_ID       "id"
#define NVS_KEY_C2_KEY      "key"
#define NVS_KEY_C2_CHECKIN  "checkInMs"
#define NVS_KEY_C2_POLL     "pollMs"

// -------- State --------
Preferences prefs;
static String g_ssid;
static String g_pass;
static String g_deviceName;
static String g_pairingCode;   // empty -> legacy /c2Register path

static String g_deviceId;
static String g_deviceKey;
static uint32_t g_checkInIntervalMs = 30000;
static uint32_t g_commandPollIntervalMs = 5000;

static uint32_t g_lastCheckIn = 0;
static uint32_t g_lastPoll = 0;
static int g_pendingCommands = 0;

// ============================================================
//  NVS helpers (WiFi credentials — shared namespace with template)
// ============================================================
static void saveWifiCreds(const String& ssid, const String& pass, const String& name,
                          const String& pairingCode) {
    prefs.begin(NVS_WIFI, false);
    prefs.putString(NVS_KEY_SSID,  ssid);
    prefs.putString(NVS_KEY_PASS,  pass);
    prefs.putString(NVS_KEY_NAME,  name);
    prefs.putString(NVS_KEY_PCODE, pairingCode);
    prefs.end();
    Serial.printf("[nvs/wifi] saved SSID=%s name=%s pcode=%s\n",
                  ssid.c_str(), name.c_str(),
                  pairingCode.length() > 0 ? "(set)" : "(none)");
}

// Clear just the pairing code (after a successful registration consumes it).
static void clearPairingCode() {
    prefs.begin(NVS_WIFI, false);
    prefs.putString(NVS_KEY_PCODE, "");
    prefs.end();
    g_pairingCode = "";
    Serial.println("[nvs/wifi] pairing code cleared (consumed)");
}

static void clearWifiCreds() {
    prefs.begin(NVS_WIFI, false);
    prefs.clear();
    prefs.end();
    Serial.println("[nvs/wifi] cleared");
}

static bool loadWifiCreds() {
    prefs.begin(NVS_WIFI, true);
    g_ssid         = prefs.getString(NVS_KEY_SSID,  "");
    g_pass         = prefs.getString(NVS_KEY_PASS,  "");
    g_deviceName   = prefs.getString(NVS_KEY_NAME,  "");
    g_pairingCode  = prefs.getString(NVS_KEY_PCODE, "");
    prefs.end();

    if (g_ssid.length() > 0) {
        Serial.printf("[nvs/wifi] loaded SSID=%s name=%s pcode=%s\n",
                      g_ssid.c_str(), g_deviceName.c_str(),
                      g_pairingCode.length() > 0 ? "(set)" : "(none)");
        return true;
    }

#if defined(WIFI_SSID) && defined(WIFI_PASSWORD)
    Serial.println("[nvs/wifi] empty -- migrating from secrets.h");
    g_ssid       = String(WIFI_SSID);
    g_pass       = String(WIFI_PASSWORD);
    g_deviceName = String(DEFAULT_DEVICE_NAME);
#  ifdef PAIRING_CODE
    g_pairingCode = String(PAIRING_CODE);
#  else
    g_pairingCode = "";
#  endif
    saveWifiCreds(g_ssid, g_pass, g_deviceName, g_pairingCode);
    return true;
#else
    return false;
#endif
}

// ============================================================
//  NVS helpers (C2 credentials — separate namespace)
// ============================================================
static void saveC2Creds() {
    prefs.begin(NVS_C2, false);
    prefs.putString(NVS_KEY_C2_ID,  g_deviceId);
    prefs.putString(NVS_KEY_C2_KEY, g_deviceKey);
    prefs.putUInt(NVS_KEY_C2_CHECKIN, g_checkInIntervalMs);
    prefs.putUInt(NVS_KEY_C2_POLL,    g_commandPollIntervalMs);
    prefs.end();
    Serial.printf("[nvs/c2] saved deviceId=%s\n", g_deviceId.c_str());
}

static bool loadC2Creds() {
    prefs.begin(NVS_C2, true);
    g_deviceId  = prefs.getString(NVS_KEY_C2_ID,  "");
    g_deviceKey = prefs.getString(NVS_KEY_C2_KEY, "");
    g_checkInIntervalMs       = prefs.getUInt(NVS_KEY_C2_CHECKIN, 30000);
    g_commandPollIntervalMs   = prefs.getUInt(NVS_KEY_C2_POLL,     5000);
    prefs.end();
    if (g_deviceId.length() > 0) {
        Serial.printf("[nvs/c2] loaded deviceId=%s (checkIn=%lu ms, poll=%lu ms)\n",
                      g_deviceId.c_str(),
                      (unsigned long)g_checkInIntervalMs,
                      (unsigned long)g_commandPollIntervalMs);
        return true;
    }
    return false;
}

// ============================================================
//  WiFiManager portal (same shape as the template)
// ============================================================
static void renderSetupBanner(const String& apName) {
    Serial.println("");
    Serial.println("============================================");
    Serial.println("  SETUP MODE");
    Serial.printf ("    Join WiFi: %s\n", apName.c_str());
    Serial.println("    Open captive portal (or 192.168.4.1)");
    Serial.println("    Enter your WiFi + a device name");
    Serial.println("============================================");
    Serial.println("");
}

static void runPortal() {
    String mac = WiFi.macAddress();
    mac.replace(":", "");
    String apName = "HexworthDevice-" + mac.substring(8);

    renderSetupBanner(apName);

    WiFiManager wm;
    wm.setConfigPortalTimeout(600);
    wm.setBreakAfterConfig(true);
    wm.setConnectTimeout(20);

    WiFiManagerParameter nameParam(
        "name",
        "Device name (e.g. lab-c2-01)",
        g_deviceName.length() > 0 ? g_deviceName.c_str() : "c2-XXX",
        32);
    wm.addParameter(&nameParam);

    // Pairing code is OPTIONAL. If supplied, registration uses the
    // authenticated /c2RegisterWithCode endpoint. Leave blank to fall
    // back to the legacy open /c2Register (backwards-compat). Admins
    // mint codes from /admin/c2-pairing-codes.html (KBA #11).
    WiFiManagerParameter pcodeParam(
        "pcode",
        "Pairing code (optional)  e.g. HEX-PAIR-XK7A2P",
        "",
        32);
    wm.addParameter(&pcodeParam);

    bool ok = wm.startConfigPortal(apName.c_str());
    if (ok) {
        String newSsid  = WiFi.SSID();
        String newPass  = WiFi.psk();
        String newName  = String(nameParam.getValue());
        String newCode  = String(pcodeParam.getValue());
        if (newName.length() == 0) newName = "c2-" + mac.substring(8);

        // Normalize: uppercase + strip whitespace so the backend sees
        // the same canonical form the user expects.
        newCode.toUpperCase();
        newCode.replace(" ", "");
        newCode.replace("\t", "");

        if (newSsid.length() > 0) {
            saveWifiCreds(newSsid, newPass, newName, newCode);
        }
    } else {
        Serial.println("[portal] timed out");
    }
    Serial.println("[portal] restarting...");
    delay(500);
    ESP.restart();
}

static bool checkFactoryResetGesture() {
    pinMode(BTN_BOOT, INPUT_PULLUP);
    if (digitalRead(BTN_BOOT) != LOW) return false;

    Serial.printf("[boot] BOOT held -- keep holding %d ms to factory reset WiFi\n", BTN_HOLD_MS);
    uint32_t start = millis();
    while (digitalRead(BTN_BOOT) == LOW) {
        if (millis() - start > BTN_HOLD_MS) {
            Serial.println("[boot] WiFi factory reset confirmed (C2 registration preserved)");
            clearWifiCreds();
            return true;
        }
        delay(50);
    }
    Serial.println("[boot] released early -- no reset");
    return false;
}

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
                  WiFi.localIP().toString().c_str(),
                  WiFi.RSSI());
    return true;
}

// ============================================================
//  C2 protocol — Register / CheckIn / GetCommands / Result
// ============================================================

// One-time: POST /c2Register OR /c2RegisterWithCode depending on
// whether the captive portal supplied a pairing code.
//
// If g_pairingCode is non-empty -> /c2RegisterWithCode (KBA #11). On
// success the code is single-use; we clear it from NVS so a later
// re-registration (e.g. after /c2_devices/ is manually deleted) does
// not retry the same already-consumed code.
//
// If empty -> legacy /c2Register (KBA #2). Backwards-compat path that
// matches the v0.1 firmware behavior; keeps every already-deployed
// device working.
static bool c2Register() {
    const bool usingPairingCode = g_pairingCode.length() > 0;
    Serial.printf("[c2] registering with backend (%s)...\n",
                  usingPairingCode ? "pairing-code path" : "legacy /c2Register");

    WiFiClientSecure client;
    client.setInsecure();  // Phase 1 — pin CA in production
    HTTPClient http;

    String url = String(C2_BASE_URL) +
                 (usingPairingCode ? "/c2RegisterWithCode" : "/c2Register");
    if (!http.begin(client, url)) {
        Serial.println("[c2] register: http.begin failed");
        return false;
    }
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(15000);

    String mac = WiFi.macAddress();
    mac.replace(":", "");
    String name = g_deviceName.length() > 0
        ? g_deviceName
        : (String("c2-") + mac.substring(8));

    JsonDocument req;
    if (usingPairingCode) {
        req["pairingCode"] = g_pairingCode;
    }
    req["deviceType"] = "esp32";
    req["name"]       = name;
    req["firmware"]   = FW_VERSION;
    JsonArray caps = req["capabilities"].to<JsonArray>();
    caps.add("ping");
    caps.add("echo");
    caps.add("blink");
    caps.add("reboot");

    String body;
    serializeJson(req, body);

    int code = http.POST(body);
    String payload = http.getString();
    http.end();

    if (code != 201) {
        Serial.printf("[c2] register HTTP %d: %s\n", code, payload.c_str());
        // 403 from c2RegisterWithCode means the code is unknown / used /
        // expired. Clear it so we don't keep retrying a dead code on
        // every loop iter — the user will need to enter a fresh code.
        if (usingPairingCode && code == 403) {
            Serial.println("[c2] pairing code rejected — clearing so loop retries pause");
            clearPairingCode();
        }
        return false;
    }

    JsonDocument resp;
    DeserializationError err = deserializeJson(resp, payload);
    if (err) {
        Serial.printf("[c2] register: bad JSON: %s\n", err.c_str());
        return false;
    }

    g_deviceId  = resp["deviceId"].as<const char*>();
    g_deviceKey = resp["deviceKey"].as<const char*>();
    uint32_t ci = resp["checkInInterval"].as<uint32_t>();
    uint32_t pi = resp["commandPollInterval"].as<uint32_t>();
    if (ci > 0) g_checkInIntervalMs       = ci * 1000;
    if (pi > 0) g_commandPollIntervalMs   = pi * 1000;

    Serial.printf("[c2] registered: deviceId=%s checkIn=%lus poll=%lus\n",
                  g_deviceId.c_str(),
                  (unsigned long)(g_checkInIntervalMs / 1000),
                  (unsigned long)(g_commandPollIntervalMs / 1000));

    saveC2Creds();

    // Single-use: clear the pairing code after a successful redeem.
    if (usingPairingCode) clearPairingCode();

    return true;
}

// POST /c2CheckIn. Returns pendingCommands count, or -1 on error.
static int c2CheckIn() {
    if (g_deviceKey.length() == 0) return -1;

    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    if (!http.begin(client, String(C2_BASE_URL) + "/c2CheckIn")) return -1;

    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + g_deviceKey);
    http.setTimeout(15000);

    JsonDocument req;
    req["uptime"]   = millis() / 1000;
    req["ip"]       = WiFi.localIP().toString();
    req["rssi"]     = WiFi.RSSI();
    req["freeHeap"] = ESP.getFreeHeap();
    req["firmware"] = FW_VERSION;

    String body;
    serializeJson(req, body);

    int code = http.POST(body);
    String payload = http.getString();
    http.end();

    if (code != 200) {
        Serial.printf("[c2] checkin HTTP %d\n", code);
        return -1;
    }

    JsonDocument resp;
    if (deserializeJson(resp, payload)) return -1;

    int pending = resp["pendingCommands"].as<int>();
    Serial.printf("[c2] checkin ok, pending=%d\n", pending);
    return pending;
}

// GET /c2GetCommands. Returns the raw JSON body, or empty string on error.
static String c2GetCommandsRaw() {
    if (g_deviceKey.length() == 0) return "";
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    if (!http.begin(client, String(C2_BASE_URL) + "/c2GetCommands")) return "";
    http.addHeader("Authorization", "Bearer " + g_deviceKey);
    http.setTimeout(15000);
    int code = http.GET();
    String body = http.getString();
    http.end();
    if (code != 200) {
        Serial.printf("[c2] get-commands HTTP %d\n", code);
        return "";
    }
    return body;
}

// POST /c2Result.
static bool c2Result(const String& commandId, const String& status,
                     const JsonDocument& result, uint32_t execMs) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    if (!http.begin(client, String(C2_BASE_URL) + "/c2Result")) return false;
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + g_deviceKey);
    http.setTimeout(15000);

    JsonDocument req;
    req["commandId"]     = commandId;
    req["status"]        = status;
    req["executionTime"] = execMs;
    req["result"]        = result;

    String body;
    serializeJson(req, body);

    int code = http.POST(body);
    http.end();
    if (code != 200) {
        Serial.printf("[c2] result HTTP %d for cmd %s\n", code, commandId.c_str());
        return false;
    }
    return true;
}

// ============================================================
//  Command dispatch
// ============================================================
static bool handlePing(JsonVariantConst /*params*/, JsonDocument& out) {
    out["uptime"]   = millis() / 1000;
    out["freeHeap"] = ESP.getFreeHeap();
    out["rssi"]     = WiFi.RSSI();
    out["ip"]       = WiFi.localIP().toString();
    out["firmware"] = FW_VERSION;
    return true;
}

static bool handleEcho(JsonVariantConst params, JsonDocument& out) {
    const char* text = params["text"].as<const char*>();
    out["echo"] = text ? text : "";
    return true;
}

static bool handleBlink(JsonVariantConst params, JsonDocument& out) {
    int count   = params["count"].is<int>()   ? params["count"].as<int>()   : 3;
    int delayMs = params["delayMs"].is<int>() ? params["delayMs"].as<int>() : 200;
    if (count < 1)  count = 1;
    if (count > 50) count = 50;
    if (delayMs < 20)   delayMs = 20;
    if (delayMs > 2000) delayMs = 2000;

    pinMode(LED_PIN, OUTPUT);
    for (int i = 0; i < count; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(delayMs);
        digitalWrite(LED_PIN, LOW);
        delay(delayMs);
    }
    out["blinked"] = count;
    out["delayMs"] = delayMs;
    return true;
}

static bool handleReboot(JsonVariantConst /*params*/, JsonDocument& out) {
    out["rebootingIn"] = "500ms";
    return true;  // caller schedules ESP.restart() after acking
}

// Returns true if the command requested a reboot (defer until after report).
static bool dispatchCommand(JsonObjectConst cmd) {
    String commandId = cmd["commandId"].as<const char*>();
    String action    = cmd["action"].as<const char*>();
    JsonVariantConst params = cmd["params"];

    Serial.printf("[c2] dispatch %s (%s)\n", action.c_str(), commandId.c_str());
    uint32_t start = millis();

    JsonDocument out;
    bool ok = false;
    bool reboot = false;

    if      (action == "ping")   { ok = handlePing(params, out); }
    else if (action == "echo")   { ok = handleEcho(params, out); }
    else if (action == "blink")  { ok = handleBlink(params, out); }
    else if (action == "reboot") { ok = handleReboot(params, out); reboot = ok; }
    else {
        out["error"] = "unknown action: " + action;
        ok = false;
    }

    uint32_t execMs = millis() - start;
    c2Result(commandId, ok ? "success" : "error", out, execMs);
    return reboot;
}

// Pull + dispatch all pending commands. Returns true if any handler
// requested a reboot.
static bool drainCommands() {
    String body = c2GetCommandsRaw();
    if (body.length() == 0) return false;

    JsonDocument resp;
    DeserializationError err = deserializeJson(resp, body);
    if (err) {
        Serial.printf("[c2] get-commands: bad JSON: %s\n", err.c_str());
        return false;
    }

    JsonArrayConst cmds = resp["commands"].as<JsonArrayConst>();
    if (cmds.isNull() || cmds.size() == 0) return false;

    bool needReboot = false;
    for (JsonObjectConst cmd : cmds) {
        if (dispatchCommand(cmd)) needReboot = true;
    }
    return needReboot;
}

// ============================================================
//  setup() / loop()
// ============================================================
void setup() {
    Serial.begin(115200);
    delay(1500);
    Serial.println();
    Serial.printf("=== Hexworth C2 Device boot (%s) ===\n", FW_VERSION);

    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    bool wifiReset = checkFactoryResetGesture();

    if (!loadWifiCreds() || wifiReset) {
        Serial.println("[boot] entering captive portal");
        runPortal();  // never returns
    }

    if (!connectWiFi()) {
        Serial.println("[boot] WiFi connect failed -- will retry on next loop iter");
        return;
    }

    if (!loadC2Creds()) {
        Serial.println("[boot] no C2 registration -- registering now");
        for (int attempt = 0; attempt < 3; attempt++) {
            if (c2Register()) break;
            Serial.printf("[c2] register attempt %d failed; retrying in 5s\n", attempt + 1);
            delay(5000);
        }
    }

    if (g_deviceKey.length() == 0) {
        Serial.println("[boot] STILL no C2 registration after retries; loop will keep trying");
    } else {
        // Send an immediate first check-in so the dashboard shows the
        // device as online without waiting a full interval.
        int pending = c2CheckIn();
        if (pending > 0) drainCommands();
        g_lastCheckIn = millis();
        g_lastPoll    = millis();
    }
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[wifi] dropped -- reconnecting");
        if (!connectWiFi()) {
            delay(5000);
            return;
        }
    }

    // Try to register if we haven't yet.
    if (g_deviceKey.length() == 0) {
        if (c2Register()) {
            g_lastCheckIn = millis();
        } else {
            delay(10000);
        }
        return;
    }

    uint32_t now = millis();
    bool rebootRequested = false;

    if (now - g_lastCheckIn >= g_checkInIntervalMs) {
        int pending = c2CheckIn();
        g_lastCheckIn = now;
        if (pending > 0) {
            rebootRequested = drainCommands();
            g_lastPoll = now;
        }
    } else if (now - g_lastPoll >= g_commandPollIntervalMs) {
        // Fallback poll independent of check-in cadence — catches the
        // case where pendingCommands was queued just after our last
        // check-in returned 0.
        rebootRequested = drainCommands();
        g_lastPoll = now;
    }

    if (rebootRequested) {
        Serial.println("[c2] reboot command acknowledged; restarting in 500ms");
        delay(500);
        ESP.restart();
    }

    delay(200);  // light idle so the WDT is happy and we don't spin
}
