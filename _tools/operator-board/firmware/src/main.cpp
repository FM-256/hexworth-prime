// ============================================================
//  Operator Board — XIAO ESP32-C3 + Waveshare 7.5" V2 ePaper
//  Phase 4: WiFiManager captive-portal provisioning + NVS storage
// ============================================================
//
//  Boot sequence:
//    1. If BOOT button held at startup, clear NVS (factory reset).
//    2. Initialize e-paper display.
//    3. Load WiFi creds + board ID from NVS (Preferences).
//       If empty AND compile-time secrets.h provides WIFI_SSID/
//       WIFI_PASSWORD, migrate them into NVS (one-time bootstrap).
//    4. If we have creds, connect; otherwise open the captive
//       portal AP "HexworthBoard-XXXX" (last 4 hex of MAC).
//    5. Once provisioned, HTTPS GET the board image and render.
//    6. Idle REFRESH_MINUTES, refetch.
//
//  Captive portal flow:
//    - Phone connects to HexworthBoard-XXXX (open AP)
//    - Captive-portal popup appears (or browse to 192.168.4.1)
//    - User picks home WiFi + enters Board ID
//    - Device saves to NVS, restarts, joins home WiFi
//
//  Factory reset: hold the BOOT button for >5s during startup.
// ============================================================

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Preferences.h>
#include <WiFiManager.h>

#include <GxEPD2_BW.h>
#include <Fonts/FreeSansBold24pt7b.h>
#include <Fonts/FreeSans12pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include <PNGdec.h>

#include "secrets.h"

// ─── Compile-time defaults (overridable in secrets.h) ───────
#ifndef BOARD_URL
#define BOARD_URL "https://us-central1-hexworth-prime.cloudfunctions.net/operatorBoard"
#endif
#ifndef REFRESH_MINUTES
#define REFRESH_MINUTES 15
#endif
#ifndef DEFAULT_BOARD_ID
#define DEFAULT_BOARD_ID "room-214"
#endif

// ─── NVS (Preferences) namespace + keys ─────────────────────
#define NVS_NS          "hexops"
#define NVS_KEY_SSID    "ssid"
#define NVS_KEY_PASS    "pass"
#define NVS_KEY_BOARD   "board"

// ─── Hardware ───────────────────────────────────────────────
// XIAO ESP32-C3 pin mapping for the Seeed ePaper Driver Board.
// Verified against Seeed_GFX USE_XIAO_EPAPER_DRIVER_BOARD block.
#define EPD_RST   2   // D0
#define EPD_CS    3   // D1
#define EPD_BUSY  4   // D2
#define EPD_DC    5   // D3

// BOOT button on XIAO ESP32-C3 is wired to GPIO9, active LOW.
// Used here as a factory-reset gesture at boot.
#define BTN_BOOT       9
#define BTN_HOLD_MS    5000

GxEPD2_BW<GxEPD2_750_T7, GxEPD2_750_T7::HEIGHT> display(
    GxEPD2_750_T7(/*CS=*/EPD_CS, /*DC=*/EPD_DC, /*RST=*/EPD_RST, /*BUSY=*/EPD_BUSY));

PNG png;
Preferences prefs;

static uint8_t* pngBuf = nullptr;
static size_t pngLen = 0;

// Runtime credentials (loaded from NVS or provisioned via portal)
static String g_ssid;
static String g_pass;
static String g_boardId;

// ─── PNG decoder callback ───────────────────────────────────
// Render one decoded line to the e-paper buffer. Threshold at 128.
static int pngDrawCallback(PNGDRAW* pDraw) {
    uint16_t lineRGB[800];
    png.getLineAsRGB565(pDraw, lineRGB, PNG_RGB565_BIG_ENDIAN, 0xFFFFFFFF);

    int y = pDraw->y;
    int w = pDraw->iWidth;
    if (w > 800) w = 800;

    for (int x = 0; x < w; x++) {
        uint16_t px = lineRGB[x];
        uint8_t r = (px >> 11) & 0x1F;
        uint8_t g = (px >> 5) & 0x3F;
        uint8_t b = px & 0x1F;
        uint8_t lum = (r << 3) | (g << 2) | (b << 3);
        display.drawPixel(x, y, lum < 128 ? GxEPD_BLACK : GxEPD_WHITE);
    }
    return 1;
}

// ─── NVS credentials helpers ────────────────────────────────
static void saveCreds(const String& ssid, const String& pass, const String& boardId) {
    prefs.begin(NVS_NS, false);
    prefs.putString(NVS_KEY_SSID,  ssid);
    prefs.putString(NVS_KEY_PASS,  pass);
    prefs.putString(NVS_KEY_BOARD, boardId);
    prefs.end();
    Serial.printf("[nvs] saved SSID=%s board=%s\n", ssid.c_str(), boardId.c_str());
}

static void clearCreds() {
    prefs.begin(NVS_NS, false);
    prefs.clear();
    prefs.end();
    Serial.println("[nvs] cleared all credentials");
}

// Load creds from NVS. If empty AND compile-time fallback exists,
// migrate that into NVS once. Returns true if creds are now present.
static bool loadCreds() {
    prefs.begin(NVS_NS, true);
    g_ssid    = prefs.getString(NVS_KEY_SSID, "");
    g_pass    = prefs.getString(NVS_KEY_PASS, "");
    g_boardId = prefs.getString(NVS_KEY_BOARD, "");
    prefs.end();

    if (g_ssid.length() > 0) {
        Serial.printf("[nvs] loaded SSID=%s board=%s\n",
                      g_ssid.c_str(), g_boardId.c_str());
        return true;
    }

    // One-time migration from compile-time secrets.h (lets existing
    // pre-WiFiManager devices upgrade without re-pairing).
#if defined(WIFI_SSID) && defined(WIFI_PASSWORD)
    Serial.println("[nvs] empty — migrating from secrets.h fallback");
    g_ssid    = String(WIFI_SSID);
    g_pass    = String(WIFI_PASSWORD);
    g_boardId = String(DEFAULT_BOARD_ID);
    saveCreds(g_ssid, g_pass, g_boardId);
    return true;
#else
    Serial.println("[nvs] empty and no compile-time fallback — portal required");
    return false;
#endif
}

// ─── Setup-screen renderer (drawn locally, no WiFi needed) ──
static void renderSetupScreen(const String& apName) {
    Serial.println("[disp] rendering setup screen");
    display.setRotation(0);
    display.setTextColor(GxEPD_BLACK);
    display.setFullWindow();
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);

        display.setFont(&FreeSansBold24pt7b);
        display.setCursor(40, 70);
        display.print("HEXWORTH OPERATOR BOARD");

        display.setFont(&FreeSans12pt7b);
        display.setCursor(40, 110);
        display.print("Setup Mode — WiFi configuration required");

        int y = 180;
        display.setCursor(40, y);
        display.print("1.  On your phone or laptop, join this WiFi network:");

        y += 60;
        display.setFont(&FreeSansBold24pt7b);
        display.setCursor(80, y);
        display.print(apName);
        display.setFont(&FreeSans12pt7b);

        y += 50;
        display.setCursor(40, y);
        display.print("2.  A setup page should open automatically.");
        y += 28;
        display.setCursor(70, y);
        display.print("Or open a browser to: http://192.168.4.1");

        y += 50;
        display.setCursor(40, y);
        display.print("3.  Choose your WiFi network and enter a Board ID");
        y += 28;
        display.setCursor(70, y);
        display.print("(e.g. \"room-214\"). The device will reboot when saved.");

        display.setFont(&FreeSans9pt7b);
        display.setCursor(40, 460);
        display.printf("MAC %s   /   firmware: phase-4 wifi-manager",
                       WiFi.macAddress().c_str());
    } while (display.nextPage());
    Serial.println("[disp] setup screen rendered");
}

// ─── WiFi connect ───────────────────────────────────────────
//
// Uses WiFiMulti so the device can roam between the operator's
// primary network (provisioned via captive portal, stored in NVS)
// and a compile-time fallback network (e.g. the classroom WiFi
// defined in secrets.h via FALLBACK_WIFI_SSID/FALLBACK_WIFI_PASSWORD).
// WiFiMulti picks the visible AP with the strongest RSSI, so the
// device "just works" at home and on campus without re-provisioning.
//
static WiFiMulti g_wifiMulti;

static bool connectWiFi(uint32_t timeoutMs = 20000) {
    WiFi.mode(WIFI_STA);

    bool anyConfigured = false;
    if (g_ssid.length() > 0) {
        g_wifiMulti.addAP(g_ssid.c_str(), g_pass.c_str());
        Serial.printf("[wifi] primary AP registered: %s\n", g_ssid.c_str());
        anyConfigured = true;
    }
#if defined(FALLBACK_WIFI_SSID) && defined(FALLBACK_WIFI_PASSWORD)
    g_wifiMulti.addAP(FALLBACK_WIFI_SSID, FALLBACK_WIFI_PASSWORD);
    Serial.printf("[wifi] fallback AP registered: %s\n", FALLBACK_WIFI_SSID);
    anyConfigured = true;
#endif

    if (!anyConfigured) {
        Serial.println("[wifi] no APs configured (NVS empty, no compile-time fallback)");
        return false;
    }

    Serial.print("[wifi] connecting (WiFiMulti strongest-RSSI) ... ");
    uint32_t start = millis();
    while (g_wifiMulti.run() != WL_CONNECTED) {
        if (millis() - start > timeoutMs) {
            Serial.println("TIMEOUT");
            return false;
        }
        delay(250);
        Serial.print(".");
    }
    Serial.printf(" OK on %s (IP %s, RSSI %d)\n",
                  WiFi.SSID().c_str(),
                  WiFi.localIP().toString().c_str(),
                  WiFi.RSSI());
    return true;
}

// ─── Captive portal (blocking until user provisions or timeout) ─
static void runPortal() {
    // Build a stable, human-readable AP name from MAC tail
    String mac = WiFi.macAddress();
    mac.replace(":", "");
    String apName = "HexworthBoard-" + mac.substring(8);

    renderSetupScreen(apName);

    WiFiManager wm;
    wm.setConfigPortalTimeout(600);       // 10 min before reboot
    wm.setBreakAfterConfig(true);
    wm.setConnectTimeout(20);

    WiFiManagerParameter boardIdParam(
        "board",
        "Board ID (e.g. room-214)",
        g_boardId.length() > 0 ? g_boardId.c_str() : "room-XXX",
        32);
    wm.addParameter(&boardIdParam);

    Serial.printf("[portal] opening AP %s — waiting for input\n", apName.c_str());
    bool ok = wm.startConfigPortal(apName.c_str());

    if (ok) {
        String newSsid    = WiFi.SSID();
        String newPass    = WiFi.psk();
        String newBoardId = String(boardIdParam.getValue());
        if (newBoardId.length() == 0) newBoardId = String(DEFAULT_BOARD_ID);

        if (newSsid.length() > 0) {
            Serial.printf("[portal] provisioned SSID=%s board=%s\n",
                          newSsid.c_str(), newBoardId.c_str());
            saveCreds(newSsid, newPass, newBoardId);
        } else {
            Serial.println("[portal] returned ok but no SSID — falling through to restart");
        }
    } else {
        Serial.println("[portal] timed out without input");
    }

    Serial.println("[portal] restarting...");
    delay(500);
    ESP.restart();
}

// ─── HTTPS fetch ────────────────────────────────────────────
static String buildBoardUrl() {
    String base = String(BOARD_URL);
    if (g_boardId.length() == 0) return base;
    String sep = (base.indexOf('?') >= 0) ? "&" : "?";
    return base + sep + "board=" + g_boardId;
}

static bool fetchImage() {
    WiFiClientSecure client;
    client.setInsecure();  // Phase 4 still: pin Google's root CA later

    HTTPClient http;
    String url = buildBoardUrl();
    Serial.printf("[http] GET %s\n", url.c_str());

    if (!http.begin(client, url)) {
        Serial.println("[http] begin failed");
        return false;
    }

    http.setTimeout(20000);
    int code = http.GET();
    if (code != 200) {
        Serial.printf("[http] HTTP %d\n", code);
        http.end();
        return false;
    }

    int contentLen = http.getSize();
    if (contentLen <= 0 || contentLen > 200 * 1024) {
        Serial.printf("[http] bad content length %d\n", contentLen);
        http.end();
        return false;
    }

    if (pngBuf) { free(pngBuf); pngBuf = nullptr; }
    pngBuf = (uint8_t*)ps_malloc(contentLen);
    if (!pngBuf) pngBuf = (uint8_t*)malloc(contentLen);
    if (!pngBuf) {
        Serial.printf("[http] alloc fail (%d bytes)\n", contentLen);
        http.end();
        return false;
    }

    WiFiClient* stream = http.getStreamPtr();
    int read = 0;
    while (http.connected() && read < contentLen) {
        size_t avail = stream->available();
        if (avail == 0) { delay(5); continue; }
        int n = stream->read(pngBuf + read, avail);
        if (n <= 0) break;
        read += n;
    }
    http.end();

    if (read != contentLen) {
        Serial.printf("[http] read %d, expected %d\n", read, contentLen);
        free(pngBuf); pngBuf = nullptr;
        return false;
    }

    pngLen = contentLen;
    Serial.printf("[http] fetched %d bytes\n", (int)pngLen);
    return true;
}

// ─── Render ─────────────────────────────────────────────────
static bool renderImage() {
    if (!pngBuf || pngLen == 0) return false;

    int rc = png.openRAM(pngBuf, pngLen, pngDrawCallback);
    if (rc != PNG_SUCCESS) {
        Serial.printf("[png] open failed: %d\n", rc);
        return false;
    }
    Serial.printf("[png] %d x %d, %d bpp, type %d\n",
                  png.getWidth(), png.getHeight(),
                  png.getBpp(), png.getPixelType());

    display.setFullWindow();
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);
        png.decode(nullptr, 0);
    } while (display.nextPage());

    png.close();
    free(pngBuf);
    pngBuf = nullptr;
    pngLen = 0;
    return true;
}

// ─── Run one fetch+render cycle ────────────────────────────
static bool runCycle() {
    bool ok = false;
    for (int attempt = 0; attempt < 3 && !ok; attempt++) {
        if (attempt > 0) Serial.printf("[retry] attempt %d\n", attempt + 1);
        if (!connectWiFi()) continue;
        if (!fetchImage())  { WiFi.disconnect(true); continue; }
        if (!renderImage()) { WiFi.disconnect(true); continue; }
        ok = true;
    }
    if (!ok) {
        Serial.println("[err] fetch+render failed after retries; display unchanged");
    } else {
        Serial.println("[ok] cycle complete");
    }
    WiFi.disconnect(true);
    return ok;
}

// ─── Factory-reset gesture ─────────────────────────────────
// If BOOT (GPIO9) is held LOW for >BTN_HOLD_MS during early boot,
// wipe NVS so the next boot opens the portal.
static bool checkFactoryResetGesture() {
    pinMode(BTN_BOOT, INPUT_PULLUP);
    if (digitalRead(BTN_BOOT) != LOW) return false;

    Serial.printf("[boot] BOOT held — keep holding %d ms to factory reset\n", BTN_HOLD_MS);
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

// ─── setup() / loop() ──────────────────────────────────────
//
// DEV MODE: no deep sleep. The chip stays awake, USB stays up so we
// can monitor serial output and re-flash freely. Production should
// switch to deep_sleep once the full pipeline is verified end-to-end.

void setup() {
    Serial.begin(115200);
    delay(1500);  // USB CDC + serial monitor settle
    Serial.println();
    Serial.println("=== Hexworth Operator Board boot (phase 4) ===");
    Serial.println("[dev] no-sleep mode — USB stays up for monitoring");

    bool wasReset = checkFactoryResetGesture();

    Serial.println("[disp] init ...");
    display.init(115200, true, 50, false);
    Serial.println("[disp] init done");

    bool haveCreds = loadCreds();

    if (!haveCreds || wasReset) {
        Serial.println("[boot] entering captive portal");
        runPortal();  // never returns — reboots after save or timeout
    }

    Serial.printf("[boot] board=%s URL=%s\n",
                  g_boardId.c_str(), buildBoardUrl().c_str());

    Serial.println("[cycle] running initial cycle");
    runCycle();
}

void loop() {
    for (uint32_t s = 0; s < (uint32_t)REFRESH_MINUTES * 60; s += 10) {
        Serial.printf("[idle] %lu / %lu seconds (USB up, awake)\n",
                      (unsigned long)s, (unsigned long)REFRESH_MINUTES * 60);
        delay(10000);
    }
    Serial.println("[cycle] interval elapsed — running again");
    runCycle();
}
