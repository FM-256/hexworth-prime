// ============================================================
//  Operator Board — XIAO ESP32S3 + Waveshare 7.5" V2 ePaper
//  Phase 1: WiFi → HTTPS GET → render PNG → deep sleep
// ============================================================
//
//  Boot sequence on each wake:
//    1. Connect to WiFi from secrets.h credentials
//    2. HTTPS GET the BOARD_URL (Cloud Function)
//    3. Decode PNG, render to 7.5" e-paper
//    4. Deep sleep REFRESH_MINUTES, then repeat
//
//  Deep sleep current on XIAO ESP32S3 is ~10 µA — a 2000 mAh
//  battery would last ~6 months at a 15-minute refresh cadence,
//  most of the budget spent on the wake/WiFi/render bursts.
//
//  Failure modes:
//    - WiFi fail: retry 3x, then deep sleep and try again next cycle
//    - HTTP fail: log + deep sleep (display keeps the previous frame)
//    - PNG decode fail: log + deep sleep
//
//  The e-paper retains its last image when unpowered, so a transient
//  failure does not blank the screen — it just shows yesterday's data.
// ============================================================

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#include <GxEPD2_BW.h>
#include <PNGdec.h>

#include "secrets.h"

// ─── Display setup ──────────────────────────────────────────
//
// Driver class: GxEPD2_750_T7 = Waveshare 7.5" V2 (800x480 monochrome).
// If the panel turns out to be a different variant, swap this constant.
// Common alternates:
//   GxEPD2_750     — V1 (640x384, original)
//   GxEPD2_750_T7  — V2 (800x480 mono, MOST COMMON Seeed XIAO combo)
//   GxEPD2_750_GDEY075T7 — Good Display equivalent (also 800x480 mono)
//
// XIAO ESP32-C3 pin mapping for the Seeed ePaper Driver Board.
// Verified against Seeed_GFX/User_Setups/EPaper_Board_Pins_Setups.h
// (USE_XIAO_EPAPER_DRIVER_BOARD block):
//   D0 / GPIO2  = RST   (TFT_RST)
//   D1 / GPIO3  = CS    (TFT_CS)
//   D2 / GPIO4  = BUSY  (TFT_BUSY)
//   D3 / GPIO5  = DC    (TFT_DC)
//   D8 / GPIO8  = SCK   (default SPI)
//   D10 / GPIO10 = MOSI (default SPI)

#define EPD_RST   2   // D0
#define EPD_CS    3   // D1
#define EPD_BUSY  4   // D2
#define EPD_DC    5   // D3

GxEPD2_BW<GxEPD2_750_T7, GxEPD2_750_T7::HEIGHT> display(
    GxEPD2_750_T7(/*CS=*/EPD_CS, /*DC=*/EPD_DC, /*RST=*/EPD_RST, /*BUSY=*/EPD_BUSY));

// ─── PNG decoder state ──────────────────────────────────────
PNG png;
static uint8_t* pngBuf = nullptr;
static size_t pngLen = 0;

// PNGdec callback: render one decoded line to e-paper buffer.
// Signature: must return int (1 = continue decoding, 0 = stop).
// For our monochrome PNG, R==G==B and we threshold at 128.
static int pngDrawCallback(PNGDRAW* pDraw) {
    uint16_t lineRGB[800];
    png.getLineAsRGB565(pDraw, lineRGB, PNG_RGB565_BIG_ENDIAN, 0xFFFFFFFF);

    int y = pDraw->y;
    int w = pDraw->iWidth;
    if (w > 800) w = 800;

    for (int x = 0; x < w; x++) {
        // Convert RGB565 → luminance approximation, threshold at 128.
        uint16_t px = lineRGB[x];
        uint8_t r = (px >> 11) & 0x1F;
        uint8_t g = (px >> 5) & 0x3F;
        uint8_t b = px & 0x1F;
        uint8_t lum = (r << 3) | (g << 2) | (b << 3);  // coarse luminance
        display.drawPixel(x, y, lum < 128 ? GxEPD_BLACK : GxEPD_WHITE);
    }
    return 1;  // continue decoding next line
}

// ─── WiFi ───────────────────────────────────────────────────
static bool connectWiFi(uint32_t timeoutMs = 20000) {
    Serial.printf("[wifi] connecting to %s ... ", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

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

// ─── HTTPS fetch ────────────────────────────────────────────
static bool fetchImage() {
    WiFiClientSecure client;
    client.setInsecure();  // Phase 1: skip cert verification.
                           // Phase 2 polish: pin Google's root CA.

    HTTPClient http;
    Serial.printf("[http] GET %s\n", BOARD_URL);

    if (!http.begin(client, BOARD_URL)) {
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

    // Allocate from PSRAM if available (XIAO ESP32S3 has 8 MB).
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

// ─── Run one full cycle ────────────────────────────────────
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

// ─── setup() / loop() ──────────────────────────────────────
//
// DEV MODE: no deep sleep. The chip stays awake, USB stays up so we can
// monitor serial output and re-flash freely. Production should switch to
// deep_sleep once the full pipeline is verified end-to-end.
// TODO(prod): re-enable deep sleep behind a -D PRODUCTION_DEEP_SLEEP flag.

void setup() {
    Serial.begin(115200);
    delay(1500);  // wait for USB CDC + serial monitor to attach
    Serial.println();
    Serial.println("=== Hexworth Operator Board boot ===");
    Serial.println("[dev] no-sleep mode — USB stays up for monitoring");

    Serial.println("[disp] init ...");
    display.init(115200, true, 50, false);
    Serial.println("[disp] init done");

    Serial.println("[cycle] running initial cycle");
    runCycle();
}

void loop() {
    // Stay awake. Every REFRESH_MINUTES, run another cycle.
    // chunk the delay so we can print a heartbeat
    for (uint32_t s = 0; s < (uint32_t)REFRESH_MINUTES * 60; s += 10) {
        Serial.printf("[idle] %lu / %lu seconds (USB up, awake)\n",
                      (unsigned long)s, (unsigned long)REFRESH_MINUTES * 60);
        delay(10000);
    }
    Serial.println("[cycle] interval elapsed — running again");
    runCycle();
}
