/**
 * Security Tools — Build Guides
 * Provides full step-by-step guides for sg-11 through sg-15.
 * Loaded by project HTML pages before SignalEngine.renderProject().
 * SignalEngine reads window.SignalGuides[projectId].
 */

window.SignalGuides = window.SignalGuides || {};

// =========================================================================
// SG-11: RFID Access Controller (Arduino Mega + MFRC522)
// =========================================================================

window.SignalGuides['sg-11'] = {

    intro: `<p>In this project you will build a working RFID-based access control system using an Arduino Mega and the MFRC522 RFID reader module. When an authorized card is scanned, a servo motor actuates a lock mechanism, a green LED lights up, and access is logged over serial. Unauthorized cards trigger a red LED and buzzer alarm.</p>
<p>This is the same fundamental technology behind office badge readers, hotel key cards, and transit passes. The MFRC522 operates at 13.56 MHz (ISO 14443A) and can read the unique identifier (UID) burned into every MIFARE card or tag. You will learn to read these UIDs, store a whitelist in SRAM, and make access decisions in real time.</p>
<p>By the end you will have a prototype access controller with visual and audible feedback, serial logging, and a master-card enrollment feature that lets you add or remove cards without re-flashing firmware.</p>`,

    wiring: `
    MFRC522 RFID Reader          Arduino Mega 2560
    ┌──────────────┐             ┌──────────────────┐
    │  SDA (SS)  ──┼─────────────┤ Pin 53 (SS)      │
    │  SCK       ──┼─────────────┤ Pin 52 (SCK)     │
    │  MOSI      ──┼─────────────┤ Pin 51 (MOSI)    │
    │  MISO      ──┼─────────────┤ Pin 50 (MISO)    │
    │  IRQ         │  (unused)   │                   │
    │  GND       ──┼─────────────┤ GND              │
    │  RST       ──┼─────────────┤ Pin 5            │
    │  3.3V      ──┼─────────────┤ 3.3V             │
    └──────────────┘             │                   │
                                 │                   │
    Servo Motor                  │                   │
    ┌──────────┐                 │                   │
    │ Signal ──┼─────────────────┤ Pin 3 (PWM)      │
    │ VCC    ──┼─────────────────┤ 5V               │
    │ GND    ──┼─────────────────┤ GND              │
    └──────────┘                 │                   │
                                 │                   │
    Green LED ── 220 ohm ───────┤ Pin 7             │
    Red LED   ── 220 ohm ───────┤ Pin 6             │
    Buzzer (+) ──────────────────┤ Pin 4             │
    Buzzer (-) ──────────────────┤ GND              │
                                 └──────────────────┘`,

    wiringNotes: `<p><strong>Important:</strong> The MFRC522 runs on <strong>3.3V only</strong>. Connecting VCC to 5V will damage the module. The Arduino Mega's SPI pins are 50-53 (not 11-13 like the Uno). The IRQ pin is not needed for polled reads.</p>`,

    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

        '<defs>' +
        '<pattern id="sg11-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '</defs>' +
        '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="680" height="380" fill="url(#sg11-grid)" rx="4"/>' +

        '<!-- Title -->' +
        '<text x="350" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-11 RFID ACCESS CONTROLLER WIRING</text>' +

        '<!-- Arduino Mega -->' +
        '<rect x="300" y="50" width="160" height="310" rx="8" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<rect x="300" y="50" width="160" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
        '<rect x="300" y="64" width="160" height="8" fill="rgba(59,130,246,0.12)"/>' +
        '<text x="380" y="66" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ARDUINO MEGA 2560</text>' +
        '<!-- Arduino pins -->' +
        '<text x="315" y="95" fill="#8b949e" font-size="7">3.3V</text>' +
        '<text x="315" y="115" fill="#8b949e" font-size="7">5V</text>' +
        '<text x="315" y="135" fill="#8b949e" font-size="7">GND</text>' +
        '<text x="315" y="165" fill="#8b949e" font-size="7">Pin 50 (MISO)</text>' +
        '<text x="315" y="185" fill="#8b949e" font-size="7">Pin 51 (MOSI)</text>' +
        '<text x="315" y="205" fill="#8b949e" font-size="7">Pin 52 (SCK)</text>' +
        '<text x="315" y="225" fill="#8b949e" font-size="7">Pin 53 (SS)</text>' +
        '<text x="315" y="250" fill="#8b949e" font-size="7">Pin 5 (RST)</text>' +
        '<text x="315" y="275" fill="#8b949e" font-size="7">Pin 3 (PWM)</text>' +
        '<text x="315" y="300" fill="#8b949e" font-size="7">Pin 7</text>' +
        '<text x="315" y="320" fill="#8b949e" font-size="7">Pin 6</text>' +
        '<text x="315" y="340" fill="#8b949e" font-size="7">Pin 4</text>' +
        '<!-- Pin dots -->' +
        '<circle cx="308" cy="92" r="3" fill="#f97316"/>' +
        '<circle cx="308" cy="112" r="3" fill="#ef4444"/>' +
        '<circle cx="308" cy="132" r="3" fill="#333"/>' +
        '<circle cx="308" cy="162" r="3" fill="#a855f7"/>' +
        '<circle cx="308" cy="182" r="3" fill="#a855f7"/>' +
        '<circle cx="308" cy="202" r="3" fill="#a855f7"/>' +
        '<circle cx="308" cy="222" r="3" fill="#a855f7"/>' +
        '<circle cx="308" cy="247" r="3" fill="#eab308"/>' +
        '<circle cx="308" cy="272" r="3" fill="#22c55e"/>' +
        '<circle cx="308" cy="297" r="3" fill="#22c55e"/>' +
        '<circle cx="308" cy="317" r="3" fill="#ef4444"/>' +
        '<circle cx="308" cy="337" r="3" fill="#60a5fa"/>' +

        '<!-- MFRC522 RFID Reader -->' +
        '<rect x="50" y="60" width="150" height="200" rx="8" fill="#1a1f2b" stroke="#a855f7" stroke-width="1.5"/>' +
        '<rect x="50" y="60" width="150" height="22" rx="8" fill="rgba(168,85,247,0.12)"/>' +
        '<rect x="50" y="74" width="150" height="8" fill="rgba(168,85,247,0.12)"/>' +
        '<text x="125" y="76" text-anchor="middle" fill="#c084fc" font-size="10" font-weight="600">MFRC522 RFID</text>' +
        '<!-- RFID coil icon -->' +
        '<rect x="80" y="95" width="90" height="60" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
        '<rect x="90" y="105" width="70" height="40" rx="4" fill="none" stroke="rgba(168,85,247,0.15)" stroke-width="0.5"/>' +
        '<text x="125" y="130" text-anchor="middle" fill="#c084fc" font-size="7" opacity="0.6">13.56 MHz</text>' +
        '<!-- RFID pins -->' +
        '<text x="65" y="175" fill="#8b949e" font-size="7">SDA (SS)</text>' +
        '<text x="65" y="190" fill="#8b949e" font-size="7">SCK</text>' +
        '<text x="65" y="205" fill="#8b949e" font-size="7">MOSI</text>' +
        '<text x="65" y="220" fill="#8b949e" font-size="7">MISO</text>' +
        '<text x="65" y="235" fill="#8b949e" font-size="7">RST</text>' +
        '<text x="65" y="250" fill="#8b949e" font-size="7">3.3V</text>' +
        '<!-- 3.3V warning -->' +
        '<rect x="96" y="243" width="42" height="12" rx="3" fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.4)" stroke-width="0.5"/>' +
        '<text x="117" y="252" text-anchor="middle" fill="#f97316" font-size="6" font-weight="600">3.3V!</text>' +
        '<text x="65" y="265" fill="#8b949e" font-size="7">GND</text>' +

        '<!-- SPI wires RFID to Arduino -->' +
        '<line x1="200" y1="172" x2="305" y2="222" stroke="#a855f7" stroke-width="1.2"/>' +
        '<line x1="200" y1="187" x2="305" y2="202" stroke="#a855f7" stroke-width="1.2"/>' +
        '<line x1="200" y1="202" x2="305" y2="182" stroke="#a855f7" stroke-width="1.2"/>' +
        '<line x1="200" y1="217" x2="305" y2="162" stroke="#a855f7" stroke-width="1.2"/>' +
        '<line x1="200" y1="232" x2="305" y2="247" stroke="#eab308" stroke-width="1.2"/>' +
        '<line x1="200" y1="247" x2="305" y2="92" stroke="#f97316" stroke-width="1.2"/>' +
        '<line x1="200" y1="262" x2="305" y2="132" stroke="#555" stroke-width="1.2"/>' +

        '<!-- Servo Motor -->' +
        '<rect x="515" y="60" width="140" height="80" rx="8" fill="#1a1f2b" stroke="#22c55e" stroke-width="1.5"/>' +
        '<rect x="515" y="60" width="140" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
        '<rect x="515" y="74" width="140" height="8" fill="rgba(34,197,94,0.12)"/>' +
        '<text x="585" y="76" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="600">SERVO MOTOR</text>' +
        '<text x="530" y="100" fill="#8b949e" font-size="7">Signal (Orange)</text>' +
        '<text x="530" y="115" fill="#8b949e" font-size="7">VCC (Red)</text>' +
        '<text x="530" y="130" fill="#8b949e" font-size="7">GND (Brown)</text>' +
        '<!-- Servo wires -->' +
        '<line x1="460" y1="272" x2="512" y2="97" stroke="#22c55e" stroke-width="1.2"/>' +
        '<line x1="460" y1="112" x2="512" y2="112" stroke="#ef4444" stroke-width="1.2"/>' +
        '<line x1="460" y1="132" x2="512" y2="127" stroke="#555" stroke-width="1.2"/>' +

        '<!-- Green LED -->' +
        '<rect x="515" y="165" width="140" height="50" rx="8" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
        '<circle cx="545" cy="190" r="10" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1"/>' +
        '<circle cx="545" cy="190" r="5" fill="#22c55e" opacity="0.6"/>' +
        '<text x="565" y="186" fill="#4ade80" font-size="8" font-weight="600">GREEN LED</text>' +
        '<text x="565" y="200" fill="#8b949e" font-size="7">220 ohm</text>' +
        '<line x1="460" y1="297" x2="512" y2="190" stroke="#22c55e" stroke-width="1.2"/>' +

        '<!-- Red LED -->' +
        '<rect x="515" y="225" width="140" height="50" rx="8" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
        '<circle cx="545" cy="250" r="10" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1"/>' +
        '<circle cx="545" cy="250" r="5" fill="#ef4444" opacity="0.6"/>' +
        '<text x="565" y="246" fill="#f87171" font-size="8" font-weight="600">RED LED</text>' +
        '<text x="565" y="260" fill="#8b949e" font-size="7">220 ohm</text>' +
        '<line x1="460" y1="317" x2="512" y2="250" stroke="#ef4444" stroke-width="1.2"/>' +

        '<!-- Buzzer -->' +
        '<rect x="515" y="285" width="140" height="50" rx="8" fill="#1a1f2b" stroke="#60a5fa" stroke-width="1"/>' +
        '<circle cx="545" cy="310" r="10" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="1"/>' +
        '<text x="542" y="314" text-anchor="middle" fill="#60a5fa" font-size="8">~</text>' +
        '<text x="565" y="306" fill="#60a5fa" font-size="8" font-weight="600">BUZZER</text>' +
        '<text x="565" y="320" fill="#8b949e" font-size="7">Pin 4 + GND</text>' +
        '<line x1="460" y1="337" x2="512" y2="310" stroke="#60a5fa" stroke-width="1.2"/>' +

        '<!-- Legend -->' +
        '<rect x="50" y="310" width="195" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="65" y="326" fill="#555" font-size="8" font-weight="600" letter-spacing="0.1em">WIRE COLORS</text>' +
        '<line x1="65" y1="336" x2="80" y2="336" stroke="#ef4444" stroke-width="2"/><text x="85" y="339" fill="#8b949e" font-size="7">5V Power</text>' +
        '<line x1="65" y1="350" x2="80" y2="350" stroke="#f97316" stroke-width="2"/><text x="85" y="353" fill="#8b949e" font-size="7">3.3V Power</text>' +
        '<line x1="65" y1="364" x2="80" y2="364" stroke="#555" stroke-width="2"/><text x="85" y="367" fill="#8b949e" font-size="7">Ground</text>' +
        '<line x1="155" y1="336" x2="170" y2="336" stroke="#a855f7" stroke-width="2"/><text x="175" y="339" fill="#8b949e" font-size="7">SPI Bus</text>' +
        '<line x1="155" y1="350" x2="170" y2="350" stroke="#22c55e" stroke-width="2"/><text x="175" y="353" fill="#8b949e" font-size="7">Signal</text>' +
        '<line x1="155" y1="364" x2="170" y2="364" stroke="#eab308" stroke-width="2"/><text x="175" y="367" fill="#8b949e" font-size="7">Reset</text>' +

        '</svg>' +
        '</div>',

    steps: [
        {
            title: 'Install the MFRC522 Library',
            content: `<p>Open the Arduino IDE, go to <strong>Sketch &rarr; Include Library &rarr; Manage Libraries</strong>. Search for <code>MFRC522</code> by GithubCommunity and install it. This gives you the SPI-based driver for the reader module.</p>
<p>After installing, verify it appears under <strong>File &rarr; Examples &rarr; MFRC522</strong>. The <code>DumpInfo</code> example is useful for testing your wiring before writing custom code.</p>`,
            code: `// Quick test — upload this to verify the reader is wired correctly.
// Open Serial Monitor at 9600 baud, then scan a card.

#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  53
#define RST_PIN  5

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
    Serial.begin(9600);
    SPI.begin();
    mfrc522.PCD_Init();
    Serial.println(F("MFRC522 initialized. Scan a card..."));
}

void loop() {
    if (!mfrc522.PICC_IsNewCardPresent()) return;
    if (!mfrc522.PICC_ReadCardSerial()) return;

    Serial.print(F("Card UID: "));
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
        Serial.print(mfrc522.uid.uidByte[i], HEX);
    }
    Serial.println();
    mfrc522.PICC_HaltA();
}`,
            language: 'Arduino',
            tip: 'If the serial monitor prints nothing when you scan, double-check that SDA is on pin 53 and RST is on pin 5. A loose SDA jumper is the most common cause of no reads.'
        },
        {
            title: 'Read and Record Tag UIDs',
            content: `<p>Every MIFARE card has a factory-burned UID (usually 4 bytes). Upload the test sketch from Step 1 and scan each card or tag you own. Write down the UIDs — you will hard-code them as your initial whitelist.</p>
<p>UIDs look like <code>A3 B7 02 1F</code>. Each card's UID is globally unique, so this serves as the identity credential for your access system.</p>`,
            code: `// Helper function: convert a UID to a String for easy comparison
String getUID() {
    String uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        uid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
        uid += String(mfrc522.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    return uid;
}`,
            language: 'Arduino'
        },
        {
            title: 'Build the Whitelist',
            content: `<p>Store authorized UIDs in a String array. The access check is a simple linear search — fast enough for dozens of cards. Later in Step 7 you will add dynamic enrollment via a master card.</p>`,
            code: `// Maximum cards we can store
#define MAX_CARDS 20

String authorizedUIDs[MAX_CARDS] = {
    "A3B7021F",   // Card 1 — replace with your real UIDs
    "7C0A33E2"    // Card 2
};
int cardCount = 2;  // current number of enrolled cards

bool isAuthorized(String uid) {
    for (int i = 0; i < cardCount; i++) {
        if (authorizedUIDs[i] == uid) return true;
    }
    return false;
}`,
            language: 'Arduino',
            tip: 'String comparison in Arduino is case-sensitive. The <code>getUID()</code> helper calls <code>toUpperCase()</code>, so store your whitelist entries in uppercase too.'
        },
        {
            title: 'Wire LEDs and Buzzer',
            content: `<p>Connect the green LED (anode) through a 220-ohm resistor to pin 7, and the red LED through a 220-ohm resistor to pin 6. Both LED cathodes go to GND. The piezo buzzer positive lead goes to pin 4, negative to GND.</p>
<p>Define the pins and write helper functions for the two access states: granted and denied.</p>`,
            code: `#define GREEN_LED  7
#define RED_LED    6
#define BUZZER     4

void setupPins() {
    pinMode(GREEN_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(BUZZER, OUTPUT);
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, LOW);
    digitalWrite(BUZZER, LOW);
}

void accessGranted() {
    digitalWrite(GREEN_LED, HIGH);
    tone(BUZZER, 1500, 150);
    delay(150);
    noTone(BUZZER);
    delay(1500);
    digitalWrite(GREEN_LED, LOW);
}

void accessDenied() {
    for (int i = 0; i < 3; i++) {
        digitalWrite(RED_LED, HIGH);
        tone(BUZZER, 400, 200);
        delay(200);
        digitalWrite(RED_LED, LOW);
        noTone(BUZZER);
        delay(100);
    }
}`,
            language: 'Arduino'
        },
        {
            title: 'Add the Servo Lock',
            content: `<p>The servo simulates a door lock. On a valid scan it rotates to 90 degrees (unlocked), pauses, then returns to 0 degrees (locked). Connect the servo signal wire to pin 3 (a PWM pin on the Mega).</p>`,
            code: `#include <Servo.h>

#define SERVO_PIN 3

Servo lockServo;

void setupServo() {
    lockServo.attach(SERVO_PIN);
    lockServo.write(0);  // start locked
}

void unlockDoor() {
    lockServo.write(90);   // rotate to unlocked position
    delay(3000);           // hold open for 3 seconds
    lockServo.write(0);    // return to locked
}`,
            language: 'Arduino',
            tip: 'If the servo jitters at rest, call <code>lockServo.detach()</code> after moving it to position, then <code>lockServo.attach(SERVO_PIN)</code> before the next move. This stops the PWM signal that causes jitter.'
        },
        {
            title: 'Add Serial Logging',
            content: `<p>Every access attempt — granted or denied — should be logged to the serial monitor with a timestamp. Since the Arduino Mega has no real-time clock, we use <code>millis()</code> as a relative timestamp. For a production build you would add an RTC module.</p>`,
            code: `void logAccess(String uid, bool granted) {
    unsigned long seconds = millis() / 1000;
    unsigned long minutes = seconds / 60;
    unsigned long hours = minutes / 60;

    Serial.print(F("["));
    if (hours < 10) Serial.print(F("0"));
    Serial.print(hours);
    Serial.print(F(":"));
    if (minutes % 60 < 10) Serial.print(F("0"));
    Serial.print(minutes % 60);
    Serial.print(F(":"));
    if (seconds % 60 < 10) Serial.print(F("0"));
    Serial.print(seconds % 60);
    Serial.print(F("] UID="));
    Serial.print(uid);

    if (granted) {
        Serial.println(F(" => ACCESS GRANTED"));
    } else {
        Serial.println(F(" => ACCESS DENIED"));
    }
}`,
            language: 'Arduino'
        },
        {
            title: 'Master Card Enrollment',
            content: `<p>Designate one card as the <strong>master card</strong>. When scanned, the system enters enrollment mode: the next card scanned is either added to or removed from the whitelist (toggled). This lets you manage access without reprogramming.</p>
<p>The master UID is hard-coded and cannot be removed. Enrollment mode is indicated by both LEDs blinking.</p>`,
            code: `#define MASTER_UID "D4E5F601"  // Replace with your master card UID

bool enrollMode = false;

void handleMasterCard() {
    enrollMode = true;
    Serial.println(F("[SYSTEM] Enrollment mode active. Scan a card to add/remove."));

    // Blink both LEDs to indicate enrollment mode
    for (int i = 0; i < 5; i++) {
        digitalWrite(GREEN_LED, HIGH);
        digitalWrite(RED_LED, HIGH);
        delay(200);
        digitalWrite(GREEN_LED, LOW);
        digitalWrite(RED_LED, LOW);
        delay(200);
    }
}

void enrollCard(String uid) {
    // Check if card already exists — if so, remove it
    for (int i = 0; i < cardCount; i++) {
        if (authorizedUIDs[i] == uid) {
            // Remove: shift remaining cards down
            for (int j = i; j < cardCount - 1; j++) {
                authorizedUIDs[j] = authorizedUIDs[j + 1];
            }
            authorizedUIDs[cardCount - 1] = "";
            cardCount--;
            Serial.print(F("[ENROLL] Removed card: "));
            Serial.println(uid);
            accessDenied();  // red flash = removed
            enrollMode = false;
            return;
        }
    }

    // Card not found — add it
    if (cardCount < MAX_CARDS) {
        authorizedUIDs[cardCount] = uid;
        cardCount++;
        Serial.print(F("[ENROLL] Added card: "));
        Serial.println(uid);
        accessGranted();  // green flash = added
    } else {
        Serial.println(F("[ENROLL] ERROR: Whitelist full."));
    }
    enrollMode = false;
}`,
            language: 'Arduino'
        },
        {
            title: 'Complete Sketch: Full Access Controller',
            content: `<p>This is the complete integrated sketch. It combines every component: RFID reading, whitelist check, servo lock, LED/buzzer feedback, serial logging, and master-card enrollment. Upload this as your final firmware.</p>`,
            code: `#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

// --- Pin definitions ---
#define SS_PIN     53
#define RST_PIN     5
#define SERVO_PIN   3
#define GREEN_LED   7
#define RED_LED     6
#define BUZZER      4

// --- RFID & Servo objects ---
MFRC522 mfrc522(SS_PIN, RST_PIN);
Servo lockServo;

// --- Whitelist ---
#define MAX_CARDS  20
#define MASTER_UID "D4E5F601"  // Replace with YOUR master card UID

String authorizedUIDs[MAX_CARDS] = {
    "A3B7021F",  // Replace with your card UIDs
    "7C0A33E2"
};
int cardCount = 2;
bool enrollMode = false;

// --- UID helper ---
String getUID() {
    String uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        uid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
        uid += String(mfrc522.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    return uid;
}

bool isAuthorized(String uid) {
    for (int i = 0; i < cardCount; i++) {
        if (authorizedUIDs[i] == uid) return true;
    }
    return false;
}

// --- Feedback ---
void accessGranted() {
    digitalWrite(GREEN_LED, HIGH);
    tone(BUZZER, 1500, 150);
    delay(150);
    noTone(BUZZER);
    unlockDoor();
    digitalWrite(GREEN_LED, LOW);
}

void accessDenied() {
    for (int i = 0; i < 3; i++) {
        digitalWrite(RED_LED, HIGH);
        tone(BUZZER, 400, 200);
        delay(200);
        digitalWrite(RED_LED, LOW);
        noTone(BUZZER);
        delay(100);
    }
}

// --- Servo ---
void unlockDoor() {
    lockServo.write(90);
    delay(3000);
    lockServo.write(0);
}

// --- Logging ---
void logAccess(String uid, bool granted) {
    unsigned long s = millis() / 1000;
    unsigned long m = s / 60;
    unsigned long h = m / 60;
    char ts[10];
    sprintf(ts, "%02lu:%02lu:%02lu", h, m % 60, s % 60);
    Serial.print(F("["));
    Serial.print(ts);
    Serial.print(F("] UID="));
    Serial.print(uid);
    Serial.println(granted ? F(" => ACCESS GRANTED") : F(" => ACCESS DENIED"));
}

// --- Enrollment ---
void handleEnrollment(String uid) {
    for (int i = 0; i < cardCount; i++) {
        if (authorizedUIDs[i] == uid) {
            for (int j = i; j < cardCount - 1; j++)
                authorizedUIDs[j] = authorizedUIDs[j + 1];
            authorizedUIDs[cardCount - 1] = "";
            cardCount--;
            Serial.print(F("[ENROLL] Removed: ")); Serial.println(uid);
            accessDenied();
            enrollMode = false;
            return;
        }
    }
    if (cardCount < MAX_CARDS) {
        authorizedUIDs[cardCount++] = uid;
        Serial.print(F("[ENROLL] Added: ")); Serial.println(uid);
        accessGranted();
    } else {
        Serial.println(F("[ENROLL] Whitelist full!"));
    }
    enrollMode = false;
}

// --- Setup ---
void setup() {
    Serial.begin(9600);
    SPI.begin();
    mfrc522.PCD_Init();
    lockServo.attach(SERVO_PIN);
    lockServo.write(0);
    pinMode(GREEN_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(BUZZER, OUTPUT);
    Serial.println(F("=== RFID Access Controller Ready ==="));
}

// --- Main loop ---
void loop() {
    if (!mfrc522.PICC_IsNewCardPresent()) return;
    if (!mfrc522.PICC_ReadCardSerial()) return;

    String uid = getUID();

    if (enrollMode) {
        if (uid == MASTER_UID) {
            Serial.println(F("[SYSTEM] Enrollment cancelled."));
            enrollMode = false;
        } else {
            handleEnrollment(uid);
        }
    } else if (uid == MASTER_UID) {
        enrollMode = true;
        Serial.println(F("[SYSTEM] Enrollment mode. Scan card to add/remove."));
        for (int i = 0; i < 5; i++) {
            digitalWrite(GREEN_LED, HIGH); digitalWrite(RED_LED, HIGH);
            delay(200);
            digitalWrite(GREEN_LED, LOW); digitalWrite(RED_LED, LOW);
            delay(200);
        }
    } else if (isAuthorized(uid)) {
        logAccess(uid, true);
        accessGranted();
    } else {
        logAccess(uid, false);
        accessDenied();
    }

    mfrc522.PICC_HaltA();
    delay(500);  // debounce
}`,
            language: 'Arduino'
        }
    ],

    testing: `<p>Follow this checklist to verify each subsystem:</p>
<ol>
    <li><strong>Serial output:</strong> Open the Serial Monitor at 9600 baud. You should see <code>=== RFID Access Controller Ready ===</code> on boot.</li>
    <li><strong>Card reading:</strong> Scan a card. The UID should print. If nothing prints, re-check the SDA (pin 53) and RST (pin 5) connections.</li>
    <li><strong>Authorized card:</strong> Scan a card whose UID is in the whitelist. The green LED should light, the buzzer should chirp once, and the servo should rotate to 90 degrees for 3 seconds.</li>
    <li><strong>Unauthorized card:</strong> Scan an unknown card. The red LED should flash 3 times with a low-pitched buzzer tone.</li>
    <li><strong>Master enrollment:</strong> Scan the master card. Both LEDs should blink 5 times. Then scan a new card — it should be added (green flash). Scan it again as a normal access attempt — it should now be authorized.</li>
    <li><strong>Master removal:</strong> Scan master, then scan the card you just added. It should be removed (red flash). Scan it normally — it should now be denied.</li>
    <li><strong>Log format:</strong> Verify that every access attempt produces a timestamped log line like <code>[00:01:23] UID=A3B7021F => ACCESS GRANTED</code>.</li>
</ol>`,

    troubleshooting: `<ul>
    <li><strong>No serial output at all:</strong> Confirm the baud rate is 9600 in both the sketch and Serial Monitor. Check that you selected "Arduino Mega 2560" as the board in Tools.</li>
    <li><strong>MFRC522 not detected / no card reads:</strong> The most common issue is VCC on 5V instead of 3.3V — this can damage the module. Also verify SDA is on pin 53 (not pin 10, which is the Uno's SS pin).</li>
    <li><strong>Servo jitters or twitches:</strong> Power the servo from the Arduino's 5V pin for testing, but if it draws too much current (causing resets), use an external 5V supply with a shared GND.</li>
    <li><strong>LEDs don't light:</strong> Verify polarity — the longer leg (anode) goes to the resistor/pin side. Try swapping the LED direction. Confirm pins 6 and 7 with a simple <code>digitalWrite(7, HIGH)</code> test.</li>
    <li><strong>Buzzer is silent:</strong> Passive buzzers need <code>tone()</code>. Active buzzers just need <code>digitalWrite(HIGH)</code>. The ELEGOO kit usually includes a passive buzzer.</li>
    <li><strong>Cards read inconsistently:</strong> Hold the card flat against the reader coil, within 2-3 cm. The MFRC522 antenna is on the PCB face opposite the chip.</li>
    <li><strong>Enrollment doesn't stick after power cycle:</strong> This is expected — the whitelist lives in SRAM and resets on reboot. To persist cards, store UIDs in EEPROM (see Stretch Challenges).</li>
</ul>`,

    challenges: `<p><strong>1. EEPROM Persistence:</strong> Store the whitelist in the Arduino's EEPROM so enrolled cards survive power cycles. Write a <code>saveWhitelist()</code> function that serializes UIDs to EEPROM, and load them in <code>setup()</code>.</p>
<p><strong>2. LCD Status Display:</strong> Connect a 16x2 LCD (included in the ELEGOO kit) and display "ACCESS GRANTED" / "DENIED" along with the last 4 digits of the scanned UID. Use the I2C backpack if available to save pins.</p>
<p><strong>3. Lockout Mode:</strong> After 5 consecutive denied scans, enter a 30-second lockout where all scans are ignored and the red LED stays solid. Log the lockout event. This mimics real-world brute-force protection.</p>`
};


// =========================================================================
// SG-12: Hardware Keylogger Detector (Raspberry Pi)
// =========================================================================

window.SignalGuides['sg-12'] = {

    intro: `<p>Hardware keyloggers are small inline devices that sit between a keyboard and a computer, silently recording every keystroke. They are nearly invisible to software-based security tools because they operate at the physical USB layer. In this project you will build a Python-based detection system on a Raspberry Pi that monitors the USB device tree in real time and flags suspicious insertions.</p>
<p>The detector works by maintaining a baseline inventory of known USB devices, then using the Linux <code>udev</code> subsystem to watch for hotplug events. When a new device appears, it is checked against a database of known keylogger vendor/product IDs, and its descriptor characteristics are analyzed for anomalies (such as a device that claims to be a keyboard but has suspicious interface counts or unusual string descriptors).</p>
<p>By the end of this build you will have a persistent monitoring daemon that logs all USB events, alerts on suspicious devices, and generates audit reports — skills directly applicable to physical security assessments and endpoint hardening.</p>`,

    wiring: null,
    wiringNotes: null,

    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

        '<defs>' +
        '<pattern id="sg12-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '</defs>' +
        '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="680" height="380" fill="url(#sg12-grid)" rx="4"/>' +

        '<!-- Title -->' +
        '<text x="350" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-12 HARDWARE KEYLOGGER DETECTOR SETUP</text>' +

        '<!-- Raspberry Pi -->' +
        '<rect x="250" y="55" width="200" height="170" rx="8" fill="#1a1f2b" stroke="#22c55e" stroke-width="1.5"/>' +
        '<rect x="250" y="55" width="200" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
        '<rect x="250" y="69" width="200" height="8" fill="rgba(34,197,94,0.12)"/>' +
        '<text x="350" y="71" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="600">RASPBERRY PI 4/5</text>' +
        '<!-- Pi board elements -->' +
        '<rect x="265" y="90" width="170" height="50" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
        '<text x="350" y="110" text-anchor="middle" fill="#4ade80" font-size="7" opacity="0.5">SoC / RAM</text>' +
        '<text x="350" y="122" text-anchor="middle" fill="#4ade80" font-size="6" opacity="0.4">Raspberry Pi OS Lite (64-bit)</text>' +
        '<!-- USB ports on Pi -->' +
        '<rect x="432" y="145" width="18" height="20" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>' +
        '<rect x="432" y="170" width="18" height="20" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>' +
        '<text x="425" y="158" text-anchor="end" fill="#60a5fa" font-size="6">USB 3.0</text>' +
        '<text x="425" y="183" text-anchor="end" fill="#60a5fa" font-size="6">USB 3.0</text>' +
        '<rect x="432" y="195" width="18" height="15" rx="2" fill="#1e293b" stroke="#8b949e" stroke-width="1"/>' +
        '<text x="425" y="206" text-anchor="end" fill="#8b949e" font-size="6">USB 2.0</text>' +
        '<!-- Ethernet -->' +
        '<rect x="250" y="190" width="18" height="20" rx="2" fill="#1e293b" stroke="#eab308" stroke-width="1"/>' +
        '<text x="273" y="203" fill="#eab308" font-size="6">ETH</text>' +
        '<!-- GPIO header -->' +
        '<rect x="270" y="145" width="80" height="12" rx="2" fill="#333" stroke="#555" stroke-width="0.5"/>' +
        '<text x="310" y="153" text-anchor="middle" fill="#8b949e" font-size="5">GPIO 40-pin</text>' +

        '<!-- Keyboard (normal device) -->' +
        '<rect x="520" y="50" width="140" height="70" rx="8" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<rect x="520" y="50" width="140" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
        '<rect x="520" y="64" width="140" height="8" fill="rgba(59,130,246,0.12)"/>' +
        '<text x="590" y="66" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">USB KEYBOARD</text>' +
        '<!-- Keyboard icon -->' +
        '<rect x="545" y="82" width="90" height="28" rx="3" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
        '<text x="590" y="100" text-anchor="middle" fill="#60a5fa" font-size="6" opacity="0.5">Normal HID Device</text>' +
        '<!-- USB cable to Pi -->' +
        '<line x1="520" y1="85" x2="452" y2="155" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<circle cx="452" cy="155" r="2" fill="#3b82f6"/>' +

        '<!-- Keylogger device (suspicious) -->' +
        '<rect x="520" y="140" width="140" height="80" rx="8" fill="#1a1f2b" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3"/>' +
        '<rect x="520" y="140" width="140" height="22" rx="8" fill="rgba(239,68,68,0.12)"/>' +
        '<rect x="520" y="154" width="140" height="8" fill="rgba(239,68,68,0.12)"/>' +
        '<text x="590" y="156" text-anchor="middle" fill="#f87171" font-size="9" font-weight="600">KEYLOGGER?</text>' +
        '<text x="590" y="178" text-anchor="middle" fill="#f87171" font-size="7" opacity="0.7">Inline USB device</text>' +
        '<text x="590" y="192" text-anchor="middle" fill="#f87171" font-size="7" opacity="0.7">Unknown VID:PID</text>' +
        '<text x="590" y="206" text-anchor="middle" fill="#f87171" font-size="7" opacity="0.7">No serial number</text>' +
        '<!-- Suspicious USB cable to Pi -->' +
        '<line x1="520" y1="180" x2="452" y2="180" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3"/>' +
        '<circle cx="452" cy="180" r="2" fill="#ef4444"/>' +
        '<!-- Alert badge -->' +
        '<rect x="555" y="125" width="70" height="14" rx="4" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.5)" stroke-width="0.5"/>' +
        '<text x="590" y="135" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">SUSPICIOUS</text>' +

        '<!-- Network / SSH -->' +
        '<rect x="40" y="80" width="150" height="80" rx="8" fill="#1a1f2b" stroke="#eab308" stroke-width="1.5"/>' +
        '<rect x="40" y="80" width="150" height="22" rx="8" fill="rgba(234,179,8,0.12)"/>' +
        '<rect x="40" y="94" width="150" height="8" fill="rgba(234,179,8,0.12)"/>' +
        '<text x="115" y="96" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">SSH / NETWORK</text>' +
        '<text x="115" y="118" text-anchor="middle" fill="#fde68a" font-size="7" opacity="0.7">Remote management</text>' +
        '<text x="115" y="132" text-anchor="middle" fill="#fde68a" font-size="7" opacity="0.7">Alert delivery</text>' +
        '<text x="115" y="146" text-anchor="middle" fill="#fde68a" font-size="7" opacity="0.7">Report export</text>' +
        '<line x1="190" y1="120" x2="248" y2="200" stroke="#eab308" stroke-width="1.2"/>' +
        '<circle cx="248" cy="200" r="2" fill="#eab308"/>' +

        '<!-- Detection Pipeline -->' +
        '<text x="350" y="250" text-anchor="middle" fill="#444" font-size="10" letter-spacing="0.15em">DETECTION PIPELINE</text>' +

        '<!-- Pipeline stages -->' +
        '<rect x="40" y="265" width="120" height="55" rx="6" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
        '<text x="100" y="284" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">1. BASELINE</text>' +
        '<text x="100" y="298" text-anchor="middle" fill="#8b949e" font-size="7">Snapshot known</text>' +
        '<text x="100" y="310" text-anchor="middle" fill="#8b949e" font-size="7">USB devices</text>' +

        '<line x1="162" y1="292" x2="178" y2="292" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3,2"/>' +
        '<polygon points="178,289 184,292 178,295" fill="#3b82f6"/>' +

        '<rect x="185" y="265" width="120" height="55" rx="6" fill="#1a1f2b" stroke="#a855f7" stroke-width="1"/>' +
        '<text x="245" y="284" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="600">2. MONITOR</text>' +
        '<text x="245" y="298" text-anchor="middle" fill="#8b949e" font-size="7">udev hotplug</text>' +
        '<text x="245" y="310" text-anchor="middle" fill="#8b949e" font-size="7">event watcher</text>' +

        '<line x1="307" y1="292" x2="323" y2="292" stroke="#a855f7" stroke-width="1" stroke-dasharray="3,2"/>' +
        '<polygon points="323,289 329,292 323,295" fill="#a855f7"/>' +

        '<rect x="330" y="265" width="120" height="55" rx="6" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
        '<text x="390" y="284" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">3. SIGNATURES</text>' +
        '<text x="390" y="298" text-anchor="middle" fill="#8b949e" font-size="7">Known keylogger</text>' +
        '<text x="390" y="310" text-anchor="middle" fill="#8b949e" font-size="7">VID:PID database</text>' +

        '<line x1="452" y1="292" x2="468" y2="292" stroke="#eab308" stroke-width="1" stroke-dasharray="3,2"/>' +
        '<polygon points="468,289 474,292 468,295" fill="#eab308"/>' +

        '<rect x="475" y="265" width="120" height="55" rx="6" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
        '<text x="535" y="284" text-anchor="middle" fill="#f87171" font-size="8" font-weight="600">4. ALERT</text>' +
        '<text x="535" y="298" text-anchor="middle" fill="#8b949e" font-size="7">Log + notify</text>' +
        '<text x="535" y="310" text-anchor="middle" fill="#8b949e" font-size="7">on suspicious</text>' +

        '<!-- Requirements -->' +
        '<rect x="40" y="340" width="620" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="55" y="356" fill="#555" font-size="8" font-weight="600" letter-spacing="0.1em">SOFTWARE</text>' +
        '<rect x="120" y="347" width="70" height="16" rx="3" fill="rgba(34,197,94,0.08)"/><text x="155" y="358" text-anchor="middle" fill="#4ade80" font-size="7">Python 3</text>' +
        '<rect x="198" y="347" width="60" height="16" rx="3" fill="rgba(168,85,247,0.08)"/><text x="228" y="358" text-anchor="middle" fill="#c084fc" font-size="7">pyudev</text>' +
        '<rect x="266" y="347" width="60" height="16" rx="3" fill="rgba(59,130,246,0.08)"/><text x="296" y="358" text-anchor="middle" fill="#60a5fa" font-size="7">lsusb</text>' +
        '<rect x="334" y="347" width="80" height="16" rx="3" fill="rgba(234,179,8,0.08)"/><text x="374" y="358" text-anchor="middle" fill="#eab308" font-size="7">Pi OS Lite</text>' +
        '<text x="55" y="376" fill="#555" font-size="8" font-weight="600" letter-spacing="0.1em">NO WIRING</text>' +
        '<text x="130" y="376" fill="#8b949e" font-size="7">Software-only build. Connect USB devices to the Pi and run detection scripts.</text>' +

        '</svg>' +
        '</div>',

    steps: [
        {
            title: 'Set Up the Raspberry Pi',
            content: `<p>Flash Raspberry Pi OS Lite (64-bit) to your microSD card using the Raspberry Pi Imager. Enable SSH during setup so you can work headless. Boot the Pi, connect via SSH, and update packages.</p>`,
            code: `# Update the system
sudo apt update && sudo apt upgrade -y

# Install Python dependencies
sudo apt install -y python3-pip python3-pyudev

# Verify pyudev is available
python3 -c "import pyudev; print('pyudev version:', pyudev.__version__)"`,
            language: 'Python / Bash',
            tip: 'If you prefer to work with a monitor and keyboard attached to the Pi, that works fine too. Just be aware that your own keyboard will appear in the USB device list — you will baseline it in Step 3.'
        },
        {
            title: 'Understand USB Device Descriptors',
            content: `<p>Every USB device announces itself with a set of descriptors: Vendor ID (VID), Product ID (PID), device class, string descriptors (manufacturer, product name), and interface descriptors. Keyloggers often impersonate keyboards (class 0x03 = HID) but may have telltale signs in their descriptors.</p>
<p>Use <code>lsusb</code> to enumerate current devices and <code>lsusb -v</code> for full descriptor dumps.</p>`,
            code: `#!/usr/bin/env python3
"""usb_enumerate.py - List all connected USB devices with descriptor details."""

import subprocess
import re

def enumerate_usb():
    """Parse lsusb output into structured device list."""
    result = subprocess.run(['lsusb'], capture_output=True, text=True)
    devices = []

    for line in result.stdout.strip().split('\\n'):
        match = re.match(
            r'Bus (\\d+) Device (\\d+): ID ([0-9a-f]{4}):([0-9a-f]{4}) (.+)',
            line
        )
        if match:
            devices.append({
                'bus': match.group(1),
                'device': match.group(2),
                'vid': match.group(3),
                'pid': match.group(4),
                'name': match.group(5).strip()
            })

    return devices

if __name__ == '__main__':
    print(f"{'VID:PID':<12} {'Bus':<5} {'Dev':<5} {'Name'}")
    print('-' * 60)
    for dev in enumerate_usb():
        print(f"{dev['vid']}:{dev['pid']:<7} {dev['bus']:<5} {dev['device']:<5} {dev['name']}")`,
            language: 'Python'
        },
        {
            title: 'Build the Baseline Inventory',
            content: `<p>The detector needs to know what "normal" looks like. On first run, it snapshots every USB device currently connected and saves it to a JSON baseline file. All future comparisons use this baseline to identify new or changed devices.</p>`,
            code: `#!/usr/bin/env python3
"""baseline.py - Create or load a USB device baseline."""

import json
import os
import subprocess
import re
from datetime import datetime

BASELINE_FILE = os.path.expanduser('~/.usb_baseline.json')

def get_current_devices():
    """Return a dict of VID:PID -> device info for all connected USB devices."""
    result = subprocess.run(['lsusb'], capture_output=True, text=True)
    devices = {}

    for line in result.stdout.strip().split('\\n'):
        match = re.match(
            r'Bus (\\d+) Device (\\d+): ID ([0-9a-f]{4}):([0-9a-f]{4}) (.+)',
            line
        )
        if match:
            key = f"{match.group(3)}:{match.group(4)}"
            devices[key] = {
                'vid': match.group(3),
                'pid': match.group(4),
                'name': match.group(5).strip(),
                'bus': match.group(1),
                'device': match.group(2)
            }

    return devices

def create_baseline():
    """Snapshot current USB devices as the trusted baseline."""
    devices = get_current_devices()
    baseline = {
        'created': datetime.now().isoformat(),
        'device_count': len(devices),
        'devices': devices
    }

    with open(BASELINE_FILE, 'w') as f:
        json.dump(baseline, f, indent=2)

    print(f"Baseline created: {len(devices)} devices saved to {BASELINE_FILE}")
    for key, dev in devices.items():
        print(f"  [{key}] {dev['name']}")

    return baseline

def load_baseline():
    """Load existing baseline or create a new one."""
    if os.path.exists(BASELINE_FILE):
        with open(BASELINE_FILE) as f:
            return json.load(f)
    return create_baseline()

if __name__ == '__main__':
    create_baseline()`,
            language: 'Python'
        },
        {
            title: 'Monitor USB Hotplug Events',
            content: `<p>The <code>pyudev</code> library provides a clean interface to the Linux <code>udev</code> subsystem. We create a monitor that fires a callback whenever a USB device is added or removed. This is the core detection loop.</p>`,
            code: `#!/usr/bin/env python3
"""usb_monitor.py - Real-time USB hotplug monitor."""

import pyudev
from datetime import datetime

def format_time():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def on_usb_event(action, device):
    """Callback for USB device events."""
    if device.subsystem != 'usb' or device.device_type != 'usb_device':
        return

    vid = device.get('ID_VENDOR_ID', '????')
    pid = device.get('ID_MODEL_ID', '????')
    vendor = device.get('ID_VENDOR', 'Unknown')
    model = device.get('ID_MODEL', 'Unknown')
    serial = device.get('ID_SERIAL_SHORT', 'N/A')

    if action == 'add':
        print(f"[{format_time()}] USB DEVICE ADDED")
    elif action == 'remove':
        print(f"[{format_time()}] USB DEVICE REMOVED")
    else:
        return

    print(f"  VID:PID  = {vid}:{pid}")
    print(f"  Vendor   = {vendor}")
    print(f"  Model    = {model}")
    print(f"  Serial   = {serial}")
    print(f"  SysPath  = {device.sys_path}")
    print()

if __name__ == '__main__':
    context = pyudev.Context()
    monitor = pyudev.Monitor.from_netlink(context)
    monitor.filter_by(subsystem='usb', device_type='usb_device')

    print(f"[{format_time()}] USB Monitor started. Watching for hotplug events...")
    print("Press Ctrl+C to stop.\\n")

    observer = pyudev.MonitorObserver(monitor, on_usb_event)
    observer.start()

    try:
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\\nMonitor stopped.")`,
            language: 'Python'
        },
        {
            title: 'Known Keylogger Signature Database',
            content: `<p>Known hardware keyloggers use identifiable VID/PID combinations. We maintain a signature database that flags known malicious devices. This list includes documented keylogger products as well as heuristic rules for suspicious device characteristics.</p>
<p>In practice you would update this database regularly, similar to antivirus signatures. The heuristics catch devices that claim to be keyboards but have unusual descriptor patterns.</p>`,
            code: `#!/usr/bin/env python3
"""signatures.py - Known keylogger VID:PID database and heuristics."""

# Known hardware keylogger vendor/product IDs
# Sources: public security research, device teardowns
KNOWN_KEYLOGGERS = {
    # KeyGrabber family
    '1c4f:0002': {'name': 'KeyGrabber USB', 'risk': 'HIGH'},
    '1c4f:0026': {'name': 'KeyGrabber Nano', 'risk': 'HIGH'},
    # AirDrive / KeyGhost
    '04d8:0080': {'name': 'AirDrive Forensic Keylogger', 'risk': 'HIGH'},
    '04d8:f2f7': {'name': 'KeyGhost', 'risk': 'HIGH'},
    # Keelog
    '16c0:047d': {'name': 'Keelog Generic HID', 'risk': 'MEDIUM'},
}

# Suspicious characteristics (heuristic detection)
SUSPICIOUS_VENDORS = [
    'wch.cn',       # Common in cheap clone keyloggers
    'holtek',       # Used in some keylogger hardware
]

def check_signatures(vid, pid):
    """Check a VID:PID against the known keylogger database."""
    key = f"{vid}:{pid}".lower()
    if key in KNOWN_KEYLOGGERS:
        return KNOWN_KEYLOGGERS[key]
    return None

def check_heuristics(device_info):
    """Apply heuristic rules to detect suspicious devices."""
    alerts = []
    vendor = device_info.get('vendor', '').lower()
    model = device_info.get('model', '').lower()

    # Check vendor name against suspicious list
    for susp in SUSPICIOUS_VENDORS:
        if susp in vendor:
            alerts.append(f"Suspicious vendor string: {vendor}")

    # Device claims to be HID but has mass storage interface
    # (keyloggers with onboard memory)
    if 'keyboard' in model and 'storage' in str(device_info.get('interfaces', '')):
        alerts.append("HID device with mass storage interface (possible keylogger with memory)")

    # Keyboard device with no manufacturer string
    if device_info.get('is_hid') and not device_info.get('vendor'):
        alerts.append("HID device with empty manufacturer string")

    return alerts

if __name__ == '__main__':
    print("Known keylogger signatures loaded:")
    for vid_pid, info in KNOWN_KEYLOGGERS.items():
        print(f"  [{info['risk']}] {vid_pid} - {info['name']}")`,
            language: 'Python'
        },
        {
            title: 'Integrated Alert System',
            content: `<p>Combine the monitor, baseline, and signature database into a single alert system. When a new device appears, it is checked against the baseline (is it new?), the signature database (is it a known keylogger?), and the heuristic rules (does it look suspicious?).</p>`,
            code: `#!/usr/bin/env python3
"""alert_system.py - Integrated USB keylogger detection with alerts."""

import json
import os
from datetime import datetime

# Import our modules
from baseline import load_baseline, BASELINE_FILE
from signatures import check_signatures, check_heuristics

ALERT_LOG = os.path.expanduser('~/.usb_alerts.log')

def log_alert(level, message, device_info):
    """Write an alert to the log file and stdout."""
    timestamp = datetime.now().isoformat()
    entry = {
        'timestamp': timestamp,
        'level': level,
        'message': message,
        'device': device_info
    }

    # Console output
    color = '\\033[91m' if level == 'CRITICAL' else '\\033[93m' if level == 'WARNING' else '\\033[92m'
    reset = '\\033[0m'
    print(f"{color}[{level}]{reset} {message}")
    print(f"  Device: {device_info.get('vid', '?')}:{device_info.get('pid', '?')}")
    print(f"  Name:   {device_info.get('name', 'Unknown')}")
    print()

    # File log (append JSON lines)
    with open(ALERT_LOG, 'a') as f:
        f.write(json.dumps(entry) + '\\n')

def analyze_device(vid, pid, vendor, model, serial):
    """Run all checks against a newly detected device."""
    device_info = {
        'vid': vid, 'pid': pid,
        'vendor': vendor, 'model': model,
        'serial': serial, 'name': f"{vendor} {model}"
    }

    # 1. Check known keylogger signatures
    sig_match = check_signatures(vid, pid)
    if sig_match:
        log_alert('CRITICAL',
                  f"KNOWN KEYLOGGER DETECTED: {sig_match['name']}",
                  device_info)
        return

    # 2. Check against baseline
    baseline = load_baseline()
    key = f"{vid}:{pid}"
    if key not in baseline.get('devices', {}):
        log_alert('WARNING',
                  f"New USB device not in baseline: {key}",
                  device_info)

    # 3. Heuristic analysis
    heuristic_alerts = check_heuristics(device_info)
    for alert_msg in heuristic_alerts:
        log_alert('WARNING', alert_msg, device_info)

    if not sig_match and not heuristic_alerts and key in baseline.get('devices', {}):
        log_alert('INFO', f"Known device reconnected: {key}", device_info)`,
            language: 'Python'
        },
        {
            title: 'Build the Audit Report Generator',
            content: `<p>Generate a formatted HTML or text report summarizing the current USB device inventory, baseline comparison, and any historical alerts. This is the deliverable you would hand to a client after a physical security assessment.</p>`,
            code: `#!/usr/bin/env python3
"""audit_report.py - Generate a USB security audit report."""

import json
import os
from datetime import datetime
from baseline import load_baseline, get_current_devices
from signatures import check_signatures, KNOWN_KEYLOGGERS

ALERT_LOG = os.path.expanduser('~/.usb_alerts.log')

def generate_report():
    """Generate a full USB security audit report."""
    baseline = load_baseline()
    current = get_current_devices()

    # Load alert history
    alerts = []
    if os.path.exists(ALERT_LOG):
        with open(ALERT_LOG) as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        alerts.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass

    report_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    print("=" * 60)
    print("  USB SECURITY AUDIT REPORT")
    print(f"  Generated: {report_time}")
    print("=" * 60)

    # Current inventory
    print(f"\\n--- CURRENT USB DEVICES ({len(current)} found) ---\\n")
    for key, dev in current.items():
        in_baseline = key in baseline.get('devices', {})
        sig = check_signatures(dev['vid'], dev['pid'])
        status = "KNOWN KEYLOGGER" if sig else ("BASELINED" if in_baseline else "NEW")
        flag = " *** ALERT ***" if sig or not in_baseline else ""
        print(f"  [{status:>16}] {key}  {dev['name']}{flag}")

    # Baseline comparison
    baseline_devices = baseline.get('devices', {})
    missing = set(baseline_devices.keys()) - set(current.keys())
    added = set(current.keys()) - set(baseline_devices.keys())

    if missing:
        print(f"\\n--- MISSING FROM BASELINE ({len(missing)}) ---\\n")
        for key in missing:
            dev = baseline_devices[key]
            print(f"  {key}  {dev['name']}")

    if added:
        print(f"\\n--- NEW DEVICES (not baselined) ({len(added)}) ---\\n")
        for key in added:
            dev = current[key]
            print(f"  {key}  {dev['name']}")

    # Alert summary
    critical = [a for a in alerts if a.get('level') == 'CRITICAL']
    warnings = [a for a in alerts if a.get('level') == 'WARNING']

    print(f"\\n--- ALERT HISTORY ---\\n")
    print(f"  Critical alerts: {len(critical)}")
    print(f"  Warnings:        {len(warnings)}")
    print(f"  Total events:    {len(alerts)}")

    if critical:
        print(f"\\n  Recent critical alerts:")
        for a in critical[-5:]:
            print(f"    [{a['timestamp']}] {a['message']}")

    # Recommendations
    print(f"\\n--- RECOMMENDATIONS ---\\n")
    if added:
        print("  - Investigate new devices not present in the baseline.")
        print("  - If legitimate, re-run baseline to include them.")
    if critical:
        print("  - CRITICAL: Known keylogger hardware detected. Remove immediately.")
        print("  - Inspect the physical USB chain between keyboard and host.")
    if not critical and not added:
        print("  - No anomalies detected. USB inventory matches baseline.")
        print("  - Schedule periodic re-audits (weekly recommended).")

    print("\\n" + "=" * 60)
    print("  END OF REPORT")
    print("=" * 60)

if __name__ == '__main__':
    generate_report()`,
            language: 'Python'
        },
        {
            title: 'Run as a Persistent Service',
            content: `<p>Create a systemd service so the detector starts on boot and runs continuously. This turns your Pi into a dedicated USB monitoring station.</p>`,
            code: `# Create the main detector script that ties everything together.
# Save as ~/usb_detector/detector.py

#!/usr/bin/env python3
"""detector.py - Main keylogger detection daemon."""

import pyudev
import time
from datetime import datetime
from baseline import load_baseline
from signatures import check_signatures, check_heuristics

LOG_FILE = '/var/log/usb_detector.log'

def log(msg):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(line + '\\n')
    except PermissionError:
        pass  # running without root, skip file log

def on_event(action, device):
    if device.subsystem != 'usb' or device.device_type != 'usb_device':
        return

    vid = device.get('ID_VENDOR_ID', '0000')
    pid = device.get('ID_MODEL_ID', '0000')
    vendor = device.get('ID_VENDOR', 'Unknown')
    model = device.get('ID_MODEL', 'Unknown')

    if action == 'add':
        log(f"DEVICE ADD: {vid}:{pid} - {vendor} {model}")

        sig = check_signatures(vid, pid)
        if sig:
            log(f"*** CRITICAL: KNOWN KEYLOGGER: {sig['name']} ***")

        baseline = load_baseline()
        key = f"{vid}:{pid}"
        if key not in baseline.get('devices', {}):
            log(f"WARNING: Device {key} not in baseline")

    elif action == 'remove':
        log(f"DEVICE REMOVE: {vid}:{pid} - {vendor} {model}")

def main():
    log("USB Keylogger Detector started")
    baseline = load_baseline()
    log(f"Baseline loaded: {baseline.get('device_count', 0)} devices")

    context = pyudev.Context()
    monitor = pyudev.Monitor.from_netlink(context)
    monitor.filter_by(subsystem='usb', device_type='usb_device')

    observer = pyudev.MonitorObserver(monitor, on_event)
    observer.start()

    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        observer.stop()
        log("Detector stopped")

if __name__ == '__main__':
    main()`,
            language: 'Python',
            tip: 'To install as a systemd service, create <code>/etc/systemd/system/usb-detector.service</code> with <code>ExecStart=/usr/bin/python3 /home/pi/usb_detector/detector.py</code>, then run <code>sudo systemctl enable --now usb-detector</code>.'
        }
    ],

    testing: `<p>Test each component in order:</p>
<ol>
    <li><strong>Enumeration:</strong> Run <code>python3 usb_enumerate.py</code>. You should see all connected USB devices with VID:PID codes.</li>
    <li><strong>Baseline:</strong> Run <code>python3 baseline.py</code>. Check that <code>~/.usb_baseline.json</code> exists and contains your devices.</li>
    <li><strong>Monitor:</strong> Run <code>python3 usb_monitor.py</code>, then plug in a USB flash drive. You should see the ADD event printed immediately. Unplug it and verify the REMOVE event.</li>
    <li><strong>Signature check:</strong> Run <code>python3 signatures.py</code> to confirm the database loads. Temporarily add your test keyboard's VID:PID to the KNOWN_KEYLOGGERS dict and verify it triggers a CRITICAL alert.</li>
    <li><strong>New device alert:</strong> Plug in a USB device that was not connected during baseline creation. The alert system should flag it as "not in baseline".</li>
    <li><strong>Audit report:</strong> Run <code>python3 audit_report.py</code> after generating some test alerts. Verify the report shows current devices, baseline comparison, and alert history.</li>
</ol>`,

    troubleshooting: `<ul>
    <li><strong>pyudev import error:</strong> Run <code>sudo apt install python3-pyudev</code>. If using a venv, install with <code>pip3 install pyudev</code>.</li>
    <li><strong>Monitor shows no events:</strong> Ensure you are filtering for <code>device_type='usb_device'</code> not just <code>subsystem='usb'</code>. Without the device_type filter you will get hundreds of interface and endpoint events.</li>
    <li><strong>Permission denied on udev:</strong> The monitor needs read access to <code>/sys</code> and the udev netlink socket. Run with <code>sudo</code> or add your user to the <code>plugdev</code> group.</li>
    <li><strong>lsusb not found:</strong> Install it with <code>sudo apt install usbutils</code>.</li>
    <li><strong>Baseline too large:</strong> If you have many USB hubs and internal devices, that is normal. Linux exposes internal chipset USB controllers as devices. The baseline captures everything.</li>
    <li><strong>False positives on internal devices:</strong> Some laptops re-enumerate internal webcams and Bluetooth controllers on resume. Add these to a known-safe list.</li>
</ul>`,

    challenges: `<p><strong>1. Desktop Notifications:</strong> Use <code>notify-send</code> (on a Pi with desktop) or send alerts to a Slack/Discord webhook when a suspicious device is detected. This turns passive logging into active alerting.</p>
<p><strong>2. USB Traffic Analysis:</strong> Use <code>usbmon</code> (the kernel's USB packet monitor) to capture actual USB traffic from a suspicious device and analyze the HID reports. This is how you would confirm a device is actually keylogging.</p>
<p><strong>3. Network Reporting:</strong> Have the Pi send its audit report to a central server via HTTPS POST. In an enterprise environment, you would deploy these detectors across the organization and aggregate results.</p>`
};


// =========================================================================
// SG-13: Bad USB Analysis Lab (Arduino Pro Micro)
// =========================================================================

window.SignalGuides['sg-13'] = {

    intro: `<p>A "Bad USB" or "Rubber Ducky" attack exploits the trust that operating systems place in USB Human Interface Devices (HID). When you plug in a keyboard, the OS trusts it immediately — no driver installation, no user prompt. An attacker can exploit this by building a device that <em>looks</em> like a keyboard to the OS but actually types pre-programmed keystrokes at superhuman speed, executing commands, exfiltrating data, or installing backdoors.</p>
<p>In this lab you will build a controlled Bad USB device using an Arduino Pro Micro (ATmega32U4), analyze how HID payloads work, and then build the defenses: a Python-based USB HID monitor, and OS-level policies that mitigate these attacks. This is offensive knowledge applied to defensive mastery.</p>
<p><strong>Ethical Use Only:</strong> Everything in this lab must be performed on hardware you own, in an isolated test environment. The payloads demonstrated here are intentionally benign (they open Notepad and type a message). The purpose is to understand the attack vector so you can detect and defend against it. Never deploy HID payloads against systems you do not own or have explicit written authorization to test.</p>`,

    wiring: `
    Arduino Pro Micro (ATmega32U4)
    ┌───────────────────────┐
    │  USB Micro-B port     │──── USB cable ──── Target PC / Test VM
    │                       │
    │  (No external wiring  │
    │   needed. The Pro     │
    │   Micro IS the USB    │
    │   device.)            │
    │                       │
    │  Onboard LED: pin 17  │
    │  (TX LED for status)  │
    └───────────────────────┘

    NOTE: Use a test VM or isolated machine as the target.
    NEVER plug a programmed Bad USB into a production system.`,

    wiringNotes: `<p>The Arduino Pro Micro has a native USB controller (ATmega32U4) which means it can present itself as a keyboard, mouse, or other HID device directly — no additional hardware needed. The only connection is the USB cable between the Pro Micro and your test machine.</p>
<p><strong>Safety:</strong> Always program the Pro Micro while it is connected to your <em>development</em> machine. Only plug it into the isolated test target when you are ready to test a payload. Include a startup delay in every payload so you have time to unplug if needed.</p>`,

    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

        '<defs>' +
        '<pattern id="sg13-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '</defs>' +
        '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="680" height="380" fill="url(#sg13-grid)" rx="4"/>' +

        '<!-- Title -->' +
        '<text x="350" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-13 BAD USB ANALYSIS LAB SETUP</text>' +

        '<!-- Arduino Pro Micro -->' +
        '<rect x="40" y="55" width="180" height="160" rx="8" fill="#1a1f2b" stroke="#ef4444" stroke-width="1.5"/>' +
        '<rect x="40" y="55" width="180" height="22" rx="8" fill="rgba(239,68,68,0.12)"/>' +
        '<rect x="40" y="69" width="180" height="8" fill="rgba(239,68,68,0.12)"/>' +
        '<text x="130" y="71" text-anchor="middle" fill="#f87171" font-size="10" font-weight="600">ARDUINO PRO MICRO</text>' +
        '<text x="130" y="90" text-anchor="middle" fill="#f87171" font-size="7" opacity="0.6">ATmega32U4 - Native USB</text>' +
        '<!-- Chip icon -->' +
        '<rect x="80" y="100" width="100" height="50" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
        '<text x="130" y="120" text-anchor="middle" fill="#f87171" font-size="7" opacity="0.5">ATmega32U4</text>' +
        '<text x="130" y="135" text-anchor="middle" fill="#f87171" font-size="6" opacity="0.4">HID Keyboard Emulation</text>' +
        '<!-- USB port on Pro Micro -->' +
        '<rect x="115" y="155" width="30" height="18" rx="3" fill="#1e293b" stroke="#f87171" stroke-width="1"/>' +
        '<text x="130" y="167" text-anchor="middle" fill="#f87171" font-size="5">USB</text>' +
        '<!-- TX LED -->' +
        '<circle cx="75" y="170" r="4" fill="rgba(239,68,68,0.4)" stroke="#ef4444" stroke-width="0.5"/>' +
        '<text x="85" y="173" fill="#8b949e" font-size="6">TX LED (pin 17)</text>' +
        '<!-- Safety badge -->' +
        '<rect x="60" y="185" width="140" height="20" rx="4" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
        '<text x="130" y="198" text-anchor="middle" fill="#f97316" font-size="7" font-weight="600">5s STARTUP DELAY</text>' +

        '<!-- USB Cable -->' +
        '<line x1="220" y1="165" x2="290" y2="165" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="250" y1="165" x2="250" y2="162" stroke="#ef4444" stroke-width="1" opacity="0.4"/>' +
        '<line x1="260" y1="165" x2="260" y2="162" stroke="#ef4444" stroke-width="1" opacity="0.4"/>' +
        '<text x="255" y="155" text-anchor="middle" fill="#f87171" font-size="7">USB Cable</text>' +

        '<!-- Target Machine (Isolated VM) -->' +
        '<rect x="290" y="55" width="200" height="160" rx="8" fill="#1a1f2b" stroke="#f97316" stroke-width="1.5"/>' +
        '<rect x="290" y="55" width="200" height="22" rx="8" fill="rgba(249,115,22,0.12)"/>' +
        '<rect x="290" y="69" width="200" height="8" fill="rgba(249,115,22,0.12)"/>' +
        '<text x="390" y="71" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="600">TARGET (ISOLATED VM)</text>' +
        '<!-- Monitor icon -->' +
        '<rect x="330" y="90" width="120" height="75" rx="4" fill="rgba(249,115,22,0.06)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
        '<rect x="340" y="98" width="100" height="50" rx="2" fill="#0d1117"/>' +
        '<text x="390" y="118" text-anchor="middle" fill="#fb923c" font-size="7" opacity="0.7">Windows VM</text>' +
        '<text x="390" y="132" text-anchor="middle" fill="#fb923c" font-size="6" opacity="0.5">Notepad opens...</text>' +
        '<text x="390" y="142" text-anchor="middle" fill="#fb923c" font-size="6" opacity="0.5">Text appears...</text>' +
        '<!-- USB port -->' +
        '<rect x="290" y="158" width="18" height="16" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>' +
        '<circle cx="299" cy="166" r="2" fill="#3b82f6"/>' +
        '<!-- Warning -->' +
        '<rect x="310" y="180" width="160" height="22" rx="4" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
        '<text x="390" y="194" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">NEVER USE ON PRODUCTION</text>' +

        '<!-- Dev Machine -->' +
        '<rect x="520" y="55" width="140" height="100" rx="8" fill="#1a1f2b" stroke="#22c55e" stroke-width="1.5"/>' +
        '<rect x="520" y="55" width="140" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
        '<rect x="520" y="69" width="140" height="8" fill="rgba(34,197,94,0.12)"/>' +
        '<text x="590" y="71" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="600">DEV MACHINE</text>' +
        '<text x="590" y="95" text-anchor="middle" fill="#8b949e" font-size="7">Arduino IDE</text>' +
        '<text x="590" y="110" text-anchor="middle" fill="#8b949e" font-size="7">Program Pro Micro</text>' +
        '<text x="590" y="125" text-anchor="middle" fill="#8b949e" font-size="7">Upload payloads</text>' +
        '<text x="590" y="140" text-anchor="middle" fill="#22c55e" font-size="6" opacity="0.6">Safe environment</text>' +
        '<!-- USB cable to Pro Micro (programming) -->' +
        '<path d="M520,105 L220,105 L220,155" stroke="#22c55e" stroke-width="1.2" fill="none" stroke-dasharray="4,3"/>' +
        '<polygon points="217,155 220,163 223,155" fill="#22c55e" opacity="0.6"/>' +
        '<text x="370" y="100" text-anchor="middle" fill="#22c55e" font-size="6" opacity="0.6">Programming connection</text>' +

        '<!-- Attack Flow -->' +
        '<text x="350" y="240" text-anchor="middle" fill="#444" font-size="10" letter-spacing="0.15em">HID ATTACK SEQUENCE</text>' +

        '<!-- Flow steps -->' +
        '<rect x="40" y="255" width="100" height="50" rx="6" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
        '<text x="90" y="274" text-anchor="middle" fill="#f87171" font-size="8" font-weight="600">1. PLUG IN</text>' +
        '<text x="90" y="290" text-anchor="middle" fill="#8b949e" font-size="6">OS trusts HID</text>' +
        '<text x="90" y="300" text-anchor="middle" fill="#8b949e" font-size="6">immediately</text>' +

        '<line x1="142" y1="280" x2="158" y2="280" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/>' +
        '<polygon points="158,277 164,280 158,283" fill="#ef4444"/>' +

        '<rect x="165" y="255" width="100" height="50" rx="6" fill="#1a1f2b" stroke="#f97316" stroke-width="1"/>' +
        '<text x="215" y="274" text-anchor="middle" fill="#fb923c" font-size="8" font-weight="600">2. DELAY</text>' +
        '<text x="215" y="290" text-anchor="middle" fill="#8b949e" font-size="6">5 second safety</text>' +
        '<text x="215" y="300" text-anchor="middle" fill="#8b949e" font-size="6">window</text>' +

        '<line x1="267" y1="280" x2="283" y2="280" stroke="#f97316" stroke-width="1" stroke-dasharray="3,2"/>' +
        '<polygon points="283,277 289,280 283,283" fill="#f97316"/>' +

        '<rect x="290" y="255" width="100" height="50" rx="6" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
        '<text x="340" y="274" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">3. INJECT</text>' +
        '<text x="340" y="290" text-anchor="middle" fill="#8b949e" font-size="6">GUI+R, type</text>' +
        '<text x="340" y="300" text-anchor="middle" fill="#8b949e" font-size="6">commands</text>' +

        '<line x1="392" y1="280" x2="408" y2="280" stroke="#eab308" stroke-width="1" stroke-dasharray="3,2"/>' +
        '<polygon points="408,277 414,280 408,283" fill="#eab308"/>' +

        '<rect x="415" y="255" width="100" height="50" rx="6" fill="#1a1f2b" stroke="#a855f7" stroke-width="1"/>' +
        '<text x="465" y="274" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="600">4. EXECUTE</text>' +
        '<text x="465" y="290" text-anchor="middle" fill="#8b949e" font-size="6">Payload runs</text>' +
        '<text x="465" y="300" text-anchor="middle" fill="#8b949e" font-size="6">in &lt; 3 seconds</text>' +

        '<line x1="517" y1="280" x2="533" y2="280" stroke="#a855f7" stroke-width="1" stroke-dasharray="3,2"/>' +
        '<polygon points="533,277 539,280 533,283" fill="#a855f7"/>' +

        '<rect x="540" y="255" width="120" height="50" rx="6" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
        '<text x="600" y="274" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">5. DEFEND</text>' +
        '<text x="600" y="290" text-anchor="middle" fill="#8b949e" font-size="6">HID monitor +</text>' +
        '<text x="600" y="300" text-anchor="middle" fill="#8b949e" font-size="6">udev whitelist</text>' +

        '<!-- Legend / Notes -->' +
        '<rect x="40" y="325" width="620" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="55" y="342" fill="#555" font-size="8" font-weight="600" letter-spacing="0.1em">REQUIREMENTS</text>' +
        '<rect x="140" y="333" width="110" height="16" rx="3" fill="rgba(239,68,68,0.08)"/><text x="195" y="344" text-anchor="middle" fill="#f87171" font-size="7">Arduino Pro Micro</text>' +
        '<rect x="258" y="333" width="80" height="16" rx="3" fill="rgba(249,115,22,0.08)"/><text x="298" y="344" text-anchor="middle" fill="#fb923c" font-size="7">USB Cable</text>' +
        '<rect x="346" y="333" width="80" height="16" rx="3" fill="rgba(34,197,94,0.08)"/><text x="386" y="344" text-anchor="middle" fill="#4ade80" font-size="7">Test VM</text>' +
        '<rect x="434" y="333" width="90" height="16" rx="3" fill="rgba(168,85,247,0.08)"/><text x="479" y="344" text-anchor="middle" fill="#c084fc" font-size="7">Arduino IDE</text>' +
        '<text x="55" y="370" fill="#f97316" font-size="8" font-weight="600">NO EXTERNAL WIRING.</text>' +
        '<text x="235" y="370" fill="#8b949e" font-size="7">The Pro Micro IS the USB device. Only connection is a USB cable to the target.</text>' +

        '</svg>' +
        '</div>',

    steps: [
        {
            title: 'Understand the HID Attack Vector',
            content: `<p>When a USB device identifies itself as a HID keyboard (USB class 0x03, subclass 0x01, protocol 0x01), the operating system loads its built-in keyboard driver and starts accepting keystrokes immediately. There is no confirmation dialog and no security check. This is by design — you wouldn't want to "approve" your keyboard every time you plug it in.</p>
<p>The attack surface:</p>
<ul>
    <li><strong>Speed:</strong> A programmed device can type thousands of characters per second — far faster than any human.</li>
    <li><strong>Trust:</strong> The OS cannot distinguish between a "real" keyboard and a malicious one.</li>
    <li><strong>Stealth:</strong> The payload executes in seconds, then the device can disconnect or go silent.</li>
    <li><strong>Cross-platform:</strong> HID is a universal standard. The same attack concept works on Windows, macOS, and Linux.</li>
</ul>
<p>Commercial tools like the USB Rubber Ducky and Bash Bunny use this exact mechanism. We will replicate it with a $10 Arduino Pro Micro for educational purposes.</p>`,
            code: `// This is NOT code to upload yet — it's a conceptual overview.
// The Arduino Keyboard library provides these key functions:
//
//   Keyboard.begin()       — Initialize as HID keyboard
//   Keyboard.print("text") — Type a string
//   Keyboard.press(KEY)    — Hold a key down
//   Keyboard.release(KEY)  — Release a held key
//   Keyboard.releaseAll()  — Release all keys
//
// Modifier keys: KEY_LEFT_CTRL, KEY_LEFT_ALT, KEY_LEFT_GUI (Win key)
// Special keys: KEY_RETURN, KEY_TAB, KEY_ESC, KEY_DELETE
//
// A payload is just a sequence of these calls with delays between them
// to account for OS response time (windows opening, menus loading, etc).`,
            language: 'Arduino (Reference)'
        },
        {
            title: 'Set Up the Arduino Pro Micro',
            content: `<p>Install support for the Pro Micro in the Arduino IDE. Go to <strong>Tools &rarr; Board &rarr; Board Manager</strong>, search for "SparkFun AVR Boards" and install it. Select <strong>SparkFun Pro Micro</strong> as your board and <strong>ATmega32U4 (5V, 16MHz)</strong> as the processor.</p>
<p>The Pro Micro can be tricky to program because it uses a bootloader that only listens for a few seconds after reset. If you have trouble uploading, quickly double-tap the reset button (or short RST to GND twice) — this forces the bootloader to stay active for 8 seconds.</p>`,
            code: `// Upload this test sketch first to verify your Pro Micro works.
// It blinks the TX LED and confirms Keyboard library is available.

#include <Keyboard.h>

void setup() {
    pinMode(17, OUTPUT);  // TX LED on Pro Micro

    // Blink 3 times to confirm firmware is running
    for (int i = 0; i < 3; i++) {
        digitalWrite(17, LOW);   // LOW = LED on (active low)
        delay(200);
        digitalWrite(17, HIGH);  // HIGH = LED off
        delay(200);
    }

    // Initialize keyboard but do NOT send any keystrokes yet
    Keyboard.begin();
    delay(1000);
    Keyboard.end();
}

void loop() {
    // Do nothing — just proves the board works
}`,
            language: 'Arduino',
            tip: 'If uploads fail with "port not found", double-tap the RST button and immediately click Upload. The bootloader COM port only appears for about 8 seconds. On Linux, the port is typically <code>/dev/ttyACM0</code>.'
        },
        {
            title: 'Write a Benign Demo Payload',
            content: `<p>This payload demonstrates the attack concept by opening Notepad on Windows and typing a harmless message. It includes a 5-second startup delay — this is your safety window to unplug the device if something goes wrong.</p>
<p><strong>Always include a startup delay.</strong> Without it, the device starts typing the instant it's plugged in, and you have no way to stop it.</p>`,
            code: `#include <Keyboard.h>

void setup() {
    pinMode(17, OUTPUT);
    digitalWrite(17, LOW);  // TX LED on = armed

    // SAFETY DELAY: 5 seconds to unplug if needed
    delay(5000);

    Keyboard.begin();

    // Open Windows Run dialog
    Keyboard.press(KEY_LEFT_GUI);
    Keyboard.press('r');
    delay(100);
    Keyboard.releaseAll();
    delay(500);

    // Type "notepad" and press Enter
    Keyboard.print("notepad");
    delay(200);
    Keyboard.press(KEY_RETURN);
    Keyboard.releaseAll();
    delay(1000);  // Wait for Notepad to open

    // Type the message
    Keyboard.println("====================================");
    Keyboard.println("  BAD USB DEMO - EDUCATIONAL ONLY");
    Keyboard.println("====================================");
    Keyboard.println();
    Keyboard.println("If you can read this, a USB device");
    Keyboard.println("just opened Notepad and typed this");
    Keyboard.println("message automatically.");
    Keyboard.println();
    Keyboard.println("A real attacker could have run any");
    Keyboard.println("command with your user privileges.");
    Keyboard.println();
    Keyboard.println("Defend: USB device whitelisting,");
    Keyboard.println("Group Policy, endpoint monitoring.");

    Keyboard.end();
    digitalWrite(17, HIGH);  // TX LED off = done
}

void loop() {
    // Payload runs once in setup(), then stops
}`,
            language: 'Arduino',
            tip: 'Test this in a Windows VM, not your main machine. If you are on Linux, replace the GUI+R / notepad sequence with: <code>Keyboard.press(KEY_LEFT_CTRL); Keyboard.press(KEY_LEFT_ALT); Keyboard.press("t"); Keyboard.releaseAll(); delay(1000); Keyboard.println("echo BAD USB DEMO");</code>'
        },
        {
            title: 'Analyze Payload Structure',
            content: `<p>Every Bad USB payload follows the same pattern: <strong>delay &rarr; open a command interface &rarr; type commands &rarr; clean up</strong>. Understanding this structure lets you recognize and defend against it. Let's break down common payload techniques and their OS-specific entry points.</p>`,
            code: `// Common payload entry points by OS:
//
// WINDOWS:
//   GUI+R            -> Run dialog (type command and Enter)
//   GUI+X, then A    -> Admin PowerShell (Win10)
//   GUI, type "cmd"  -> Search for Command Prompt
//
// MACOS:
//   GUI+SPACE        -> Spotlight search (type "terminal")
//   CTRL+F2          -> Menu bar focus
//
// LINUX:
//   CTRL+ALT+T       -> Terminal (most distros)
//   ALT+F2           -> Run dialog (some DEs)
//
// PAYLOAD ANATOMY:
//   1. Startup delay (5-10s) - safety window
//   2. Open command interface
//   3. Wait for interface to load
//   4. Execute commands
//   5. Close/minimize evidence (optional)
//   6. Keyboard.end() - stop HID

// Example: PowerShell download cradle (EDUCATIONAL REFERENCE ONLY)
// This is what a real attack might look like:
//
//   Keyboard.press(KEY_LEFT_GUI);
//   Keyboard.press('r');
//   Keyboard.releaseAll();
//   delay(500);
//   Keyboard.print("powershell -w hidden -c \"IEX(command)\"");
//   Keyboard.press(KEY_RETURN);
//   Keyboard.releaseAll();
//
// The -w hidden flag makes the window invisible.
// IEX (Invoke-Expression) executes downloaded code.
// This entire sequence takes under 2 seconds.
//
// DO NOT BUILD THIS. This reference exists so you understand
// what your defenses need to catch.`,
            language: 'Arduino (Reference)'
        },
        {
            title: 'Build a Python USB HID Monitor',
            content: `<p>Now switch to the defensive side. This Python script monitors for USB HID devices and analyzes their behavior. It detects rapid keystroke injection — the telltale signature of a Bad USB device — by measuring the typing speed of newly connected keyboards.</p>`,
            code: `#!/usr/bin/env python3
"""hid_monitor.py - Detect suspicious HID keyboard behavior."""

import subprocess
import re
import time
import os
from datetime import datetime

def get_hid_devices():
    """Find all USB HID keyboard devices."""
    devices = []
    try:
        result = subprocess.run(
            ['find', '/sys/bus/usb/devices', '-name', 'bInterfaceClass'],
            capture_output=True, text=True
        )
        for path in result.stdout.strip().split('\\n'):
            if not path:
                continue
            try:
                with open(path) as f:
                    if f.read().strip() == '03':  # HID class
                        dev_path = os.path.dirname(os.path.dirname(path))
                        devices.append(parse_usb_device(dev_path))
            except (IOError, OSError):
                pass
    except Exception:
        pass
    return [d for d in devices if d]

def parse_usb_device(sys_path):
    """Extract device info from sysfs."""
    info = {'sys_path': sys_path}
    fields = {
        'idVendor': 'vid',
        'idProduct': 'pid',
        'manufacturer': 'manufacturer',
        'product': 'product',
        'serial': 'serial'
    }
    for filename, key in fields.items():
        filepath = os.path.join(sys_path, filename)
        try:
            with open(filepath) as f:
                info[key] = f.read().strip()
        except (IOError, OSError):
            info[key] = 'Unknown'
    return info

def check_keyboard_count():
    """Count HID keyboard interfaces — multiple may indicate injection device."""
    devices = get_hid_devices()
    keyboards = [d for d in devices if 'keyboard' in d.get('product', '').lower()
                 or 'hid' in d.get('product', '').lower()]
    return keyboards

def monitor_loop():
    """Continuously monitor for new HID devices."""
    known_devices = set()
    ts = lambda: datetime.now().strftime('%H:%M:%S')

    # Initial scan
    for dev in get_hid_devices():
        key = f"{dev['vid']}:{dev['pid']}"
        known_devices.add(key)
        print(f"[{ts()}] BASELINE: {key} - {dev.get('product', 'Unknown')}")

    print(f"\\n[{ts()}] Monitoring for new HID devices... (Ctrl+C to stop)\\n")

    while True:
        current = get_hid_devices()
        for dev in current:
            key = f"{dev['vid']}:{dev['pid']}"
            if key not in known_devices:
                known_devices.add(key)
                print(f"[{ts()}] NEW HID DEVICE: {key}")
                print(f"  Manufacturer: {dev.get('manufacturer', '?')}")
                print(f"  Product:      {dev.get('product', '?')}")
                print(f"  Serial:       {dev.get('serial', '?')}")

                # Flag: no serial number is suspicious for keyboards
                if dev.get('serial', 'Unknown') == 'Unknown':
                    print(f"  *** WARNING: No serial number (common in attack devices)")

                # Flag: known attack platform VIDs
                attack_vids = ['2341', '1b4f', '239a', '2e8a']  # Arduino, SparkFun, Adafruit, RPi
                if dev['vid'].lower() in attack_vids:
                    print(f"  *** ALERT: VID matches known dev board manufacturer")
                print()
        time.sleep(2)

if __name__ == '__main__':
    monitor_loop()`,
            language: 'Python'
        },
        {
            title: 'Write OS-Level Mitigations',
            content: `<p>Detection is good, but prevention is better. Here are concrete OS-level policies that block or limit HID attacks. In a corporate environment, these would be deployed via Group Policy (Windows) or configuration management (Linux).</p>`,
            code: `# ============================================================
# LINUX: udev rules to block unknown HID devices
# Save as: /etc/udev/rules.d/99-usb-hid-whitelist.rules
# ============================================================

# Allow known keyboard VID:PIDs (add your real keyboard here)
# ACTION=="add", ATTR{idVendor}=="04f2", ATTR{idProduct}=="0116", GOTO="hid_ok"

# Block all other new HID keyboard devices by default
# (Uncomment the line below to enforce — test first!)
# ACTION=="add", SUBSYSTEM=="usb", ATTR{bInterfaceClass}=="03", \
#   ATTR{bInterfaceSubClass}=="01", ATTR{bInterfaceProtocol}=="01", \
#   RUN+="/usr/local/bin/usb_hid_alert.sh %k"

# LABEL="hid_ok"

# ============================================================
# Alert script: /usr/local/bin/usb_hid_alert.sh
# ============================================================
# #!/bin/bash
# echo "[$(date)] BLOCKED HID DEVICE: $1" >> /var/log/usb_hid_blocks.log
# # Optional: send notification
# # notify-send "USB HID BLOCKED" "Unknown keyboard device detected"`,
            language: 'Bash',
            tip: 'Test udev rules carefully. A misconfigured rule can block your actual keyboard. Always keep a second login method available (SSH, serial console) when testing HID blocking rules.'
        },
        {
            title: 'Document Your Findings',
            content: `<p>The final step is to produce a lab report documenting what you built, what you learned, and what defenses you recommend. This is the same deliverable format used in professional penetration testing reports.</p>
<p>Your report should cover:</p>
<ul>
    <li><strong>Attack description:</strong> What is a Bad USB / HID attack? How does it work?</li>
    <li><strong>Proof of concept:</strong> What payload did you build? What did it do? How long did it take to execute?</li>
    <li><strong>Detection:</strong> How can these attacks be detected? What signatures and heuristics did you implement?</li>
    <li><strong>Mitigation:</strong> What OS-level controls can prevent or limit HID attacks?</li>
    <li><strong>Recommendations:</strong> What should an organization do to protect against this vector?</li>
</ul>`,
            code: `#!/usr/bin/env python3
"""generate_lab_report.py - Create a structured lab findings report."""

from datetime import datetime

def generate_report():
    report = f"""
USB HID ATTACK ANALYSIS LAB REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'=' * 50}

1. ATTACK VECTOR SUMMARY
   - Vector: USB Human Interface Device (HID) injection
   - Platform: Arduino Pro Micro (ATmega32U4)
   - Execution time: < 5 seconds for full payload
   - User interaction required: None (plug-and-execute)
   - Detection by antivirus: NONE (no malware signatures)

2. RISK ASSESSMENT
   - Likelihood: HIGH (devices cost < $10, anyone can build)
   - Impact: HIGH (runs with current user privileges)
   - Overall Risk: CRITICAL

3. DETECTION METHODS TESTED
   a. USB device monitoring (pyudev / device tree)
   b. VID/PID fingerprinting (known dev board IDs)
   c. Keystroke velocity analysis (inhuman typing speed)
   d. Missing descriptor fields (no serial, no manufacturer)

4. RECOMMENDED MITIGATIONS
   a. USB device whitelisting (udev rules / Group Policy)
   b. Disable USB ports in BIOS for kiosk machines
   c. Endpoint detection: alert on rapid keystroke input
   d. Physical: USB port locks / epoxy for sensitive systems
   e. User training: never plug in unknown USB devices

5. DEFENSE EFFECTIVENESS MATRIX
   +---------------------------+--------+----------+
   | Mitigation                | Cost   | Coverage |
   +---------------------------+--------+----------+
   | USB Whitelisting (GP/udev)| Low    | High     |
   | Port Locks (physical)     | Low    | Medium   |
   | EDR keystroke monitoring  | Medium | High     |
   | BIOS USB disable          | Free   | Complete |
   | User awareness training   | Low    | Variable |
   +---------------------------+--------+----------+
"""
    print(report)

if __name__ == '__main__':
    generate_report()`,
            language: 'Python'
        }
    ],

    testing: `<p>Verify each phase of the lab:</p>
<ol>
    <li><strong>Pro Micro test:</strong> Upload the blink sketch from Step 2. The TX LED should blink 3 times on power-up.</li>
    <li><strong>Benign payload (Step 3):</strong> Plug the programmed Pro Micro into your test VM. After the 5-second delay, Notepad should open and the message should appear. Time the entire execution — it should complete in under 3 seconds of active typing.</li>
    <li><strong>HID monitor (Step 5):</strong> Run the Python monitor on the test machine, then plug in the Pro Micro. The monitor should detect it as a new HID device and flag the VID as a known dev board.</li>
    <li><strong>udev rules (Step 6):</strong> On a Linux test machine, install the udev rules. Plug in the Pro Micro — it should trigger the alert script. Verify the log entry in <code>/var/log/usb_hid_blocks.log</code>.</li>
    <li><strong>Cleanup:</strong> After testing, upload a blank sketch to the Pro Micro so it no longer acts as a keyboard when plugged in. This prevents accidental payload execution.</li>
</ol>`,

    troubleshooting: `<ul>
    <li><strong>Pro Micro not recognized:</strong> The ATmega32U4 bootloader only activates for 8 seconds after a double-reset. Quickly double-tap the RST pin to GND, then immediately upload. Watch the IDE console for the port to appear.</li>
    <li><strong>Keyboard.h not found:</strong> Make sure you selected "SparkFun Pro Micro" as the board, not "Arduino Mega." The Keyboard library is only available on boards with native USB (32U4 or SAMD).</li>
    <li><strong>Payload types wrong characters:</strong> The Keyboard library uses US keyboard layout by default. If your test machine uses a different layout, special characters may be wrong. Stick to alphanumeric characters for reliability.</li>
    <li><strong>Payload fires immediately:</strong> You forgot the startup delay. Upload a corrected sketch with <code>delay(5000)</code> at the start of <code>setup()</code>. To reprogram without the payload firing on your dev machine, hold down Notepad or a text editor window to absorb the keystrokes.</li>
    <li><strong>Python monitor misses the device:</strong> The polling interval is 2 seconds. If the Pro Micro executes its payload and calls <code>Keyboard.end()</code> within that window, it may disappear before detection. Reduce the sleep interval or use pyudev event monitoring instead.</li>
    <li><strong>VM doesn't see USB device:</strong> In VirtualBox, go to Devices &rarr; USB and manually attach the Pro Micro. In VMware, ensure "Automatically connect new USB devices" is checked.</li>
</ul>`,

    challenges: `<p><strong>1. Keystroke Timing Analysis:</strong> Write a Python script that monitors <code>/dev/input/event*</code> devices and measures the inter-keystroke timing of all keyboard input. Human typing averages 50-100ms between keystrokes; a Bad USB device will show near-zero delays. Alert when typing speed exceeds 500 characters per second.</p>
<p><strong>2. USB Firewall:</strong> Build a "USB firewall" using a Raspberry Pi as a USB proxy. The Pi sits between the keyboard and the target computer, forwarding legitimate keystrokes but rate-limiting or blocking injected input that exceeds human typing speed.</p>
<p><strong>3. Payload Obfuscation vs Detection:</strong> Modify the demo payload to add random delays between keystrokes (mimicking human typing speed). Then update your detection script to catch this evasion technique by looking for other signals: no serial number, known dev board VID, or device that connects and disconnects rapidly.</p>`
};


// =========================================================================
// SG-14: Motion Surveillance Rig (Arduino Mega)
// =========================================================================

window.SignalGuides['sg-14'] = {

    intro: `<p>Passive Infrared (PIR) sensors detect changes in infrared radiation caused by moving warm bodies — humans, animals, anything that emits heat. They are the same sensors used in commercial alarm systems, automatic lights, and security cameras. In this project you will build a motion surveillance rig with alert feedback and event logging.</p>
<p>You will start with a single PIR sensor and build up to a multi-zone system with configurable cooldown timers, graduated alert levels, and a timestamped event log over serial. Every component in this build is included in the ELEGOO Mega starter kit, so the cost is zero beyond the kit itself.</p>
<p>By the end, you will understand how PIR sensors work at the hardware level (dual pyroelectric elements, Fresnel lens, comparator threshold), how to debounce and filter their output, and how to build a practical intrusion detection system.</p>`,

    wiring: `
    PIR Motion Sensor             Arduino Mega 2560
    ┌──────────────┐             ┌──────────────────┐
    │  VCC       ──┼─────────────┤ 5V               │
    │  GND       ──┼─────────────┤ GND              │
    │  OUT       ──┼─────────────┤ Pin 2            │
    └──────────────┘             │                   │
                                 │                   │
    Alert LED ── 220 ohm ───────┤ Pin 8             │
                                 │                   │
    Buzzer (+) ──────────────────┤ Pin 9 (PWM)      │
    Buzzer (-) ──────────────────┤ GND              │
                                 │                   │
    (Optional 2nd PIR)           │                   │
    PIR2 OUT ────────────────────┤ Pin 3            │
    PIR2 VCC ────────────────────┤ 5V               │
    PIR2 GND ────────────────────┤ GND              │
                                 │                   │
    (Optional 3rd PIR)           │                   │
    PIR3 OUT ────────────────────┤ Pin 4            │
    PIR3 VCC ────────────────────┤ 5V               │
    PIR3 GND ────────────────────┤ GND              │
                                 └──────────────────┘`,

    wiringNotes: `<p>The PIR sensor has 3 pins: VCC (5V), GND, and OUT (digital HIGH when motion detected). The OUT pin goes HIGH for a configurable duration set by the onboard potentiometer (marked "Tx" — turn clockwise for longer hold time).</p>
<p>There is a second potentiometer on the PIR module (marked "Sx") that controls sensitivity (detection range). Start with both pots at the middle position.</p>
<p><strong>Warm-up period:</strong> PIR sensors need 30-60 seconds to stabilize after power-on. Your sketch should wait during this period before arming.</p>`,

    steps: [
        {
            title: 'Understand PIR Sensor Operation',
            content: `<p>A PIR sensor contains two pyroelectric elements behind a Fresnel lens. When a warm body moves across the sensor's field of view, it produces a differential signal between the two elements. An onboard comparator converts this into a digital HIGH/LOW output.</p>
<p>Key characteristics:</p>
<ul>
    <li><strong>Detection range:</strong> 3-7 meters (adjustable via sensitivity pot)</li>
    <li><strong>Field of view:</strong> ~110 degrees horizontal, ~70 degrees vertical</li>
    <li><strong>Output hold time:</strong> 2-200 seconds (adjustable via time pot)</li>
    <li><strong>Warm-up time:</strong> 30-60 seconds after power-on</li>
</ul>`,
            code: `// Minimal PIR test — verify sensor wiring
// Open Serial Monitor at 9600 baud, walk in front of the sensor

#define PIR_PIN 2

void setup() {
    Serial.begin(9600);
    pinMode(PIR_PIN, INPUT);
    Serial.println("PIR Sensor Test");
    Serial.println("Warming up (30 seconds)...");
    delay(30000);  // PIR warm-up period
    Serial.println("Sensor ready. Walk in front of it.");
}

void loop() {
    int motion = digitalRead(PIR_PIN);
    if (motion == HIGH) {
        Serial.println("MOTION DETECTED");
    }
    delay(200);
}`,
            language: 'Arduino',
            tip: 'If the sensor triggers constantly, it may be detecting heat from nearby electronics or air vents. Point it away from heat sources and reduce sensitivity (turn Sx counter-clockwise).'
        },
        {
            title: 'Add Buzzer and LED Alerts',
            content: `<p>When motion is detected, the LED lights up and the buzzer sounds. We use <code>tone()</code> for the buzzer so we can control the frequency, giving different alert sounds for different events.</p>`,
            code: `#define PIR_PIN   2
#define LED_PIN   8
#define BUZZER    9

void setup() {
    Serial.begin(9600);
    pinMode(PIR_PIN, INPUT);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER, OUTPUT);

    Serial.println("Motion Surveillance Rig v1.0");
    Serial.println("Warming up...");
    delay(30000);
    Serial.println("ARMED - Monitoring for motion.");
}

void loop() {
    if (digitalRead(PIR_PIN) == HIGH) {
        // Alert: LED on + two-tone buzzer
        digitalWrite(LED_PIN, HIGH);
        tone(BUZZER, 2000, 150);
        delay(200);
        tone(BUZZER, 2500, 150);
        delay(200);
        noTone(BUZZER);
    } else {
        digitalWrite(LED_PIN, LOW);
    }
    delay(100);
}`,
            language: 'Arduino'
        },
        {
            title: 'Implement Cooldown Timer',
            content: `<p>Without a cooldown, the sensor triggers continuously while someone is in the room. A cooldown timer ensures you get one alert per event, then suppresses further alerts for a configurable period. This also prevents the buzzer from driving everyone crazy.</p>`,
            code: `#define PIR_PIN      2
#define LED_PIN      8
#define BUZZER       9
#define COOLDOWN_MS  10000  // 10-second cooldown between alerts

unsigned long lastTrigger = 0;
bool inCooldown = false;

void setup() {
    Serial.begin(9600);
    pinMode(PIR_PIN, INPUT);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER, OUTPUT);

    Serial.println("Motion Rig - Cooldown Enabled");
    Serial.println("Warming up (30s)...");
    delay(30000);
    Serial.println("ARMED");
}

void triggerAlert() {
    Serial.println("[ALERT] Motion detected!");
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER, 2000, 150);
    delay(200);
    tone(BUZZER, 2500, 150);
    delay(200);
    noTone(BUZZER);
    delay(500);
    digitalWrite(LED_PIN, LOW);

    lastTrigger = millis();
    inCooldown = true;
}

void loop() {
    // Check if cooldown has expired
    if (inCooldown && (millis() - lastTrigger >= COOLDOWN_MS)) {
        inCooldown = false;
        Serial.println("[SYSTEM] Cooldown expired. Monitoring resumed.");
    }

    if (digitalRead(PIR_PIN) == HIGH && !inCooldown) {
        triggerAlert();
    }

    delay(100);
}`,
            language: 'Arduino',
            tip: 'Adjust <code>COOLDOWN_MS</code> based on your use case. For a doorway, 10 seconds is reasonable. For a room where someone might be working, try 60 seconds to avoid repeated alerts.'
        },
        {
            title: 'Serial Event Logging with Timestamps',
            content: `<p>Every motion event is logged with a relative timestamp (hours:minutes:seconds since power-on). This creates an audit trail you can review later. In a production system, you would store this on an SD card or send it over a network.</p>`,
            code: `#define PIR_PIN      2
#define LED_PIN      8
#define BUZZER       9
#define COOLDOWN_MS  10000

unsigned long lastTrigger = 0;
bool inCooldown = false;
unsigned long eventCount = 0;

void timestamp() {
    unsigned long s = millis() / 1000;
    unsigned long m = s / 60;
    unsigned long h = m / 60;
    char ts[12];
    sprintf(ts, "[%02lu:%02lu:%02lu]", h, m % 60, s % 60);
    Serial.print(ts);
}

void logEvent(const char* zone, const char* message) {
    eventCount++;
    timestamp();
    Serial.print(F(" EVT#"));
    Serial.print(eventCount);
    Serial.print(F(" ZONE="));
    Serial.print(zone);
    Serial.print(F(" "));
    Serial.println(message);
}

void setup() {
    Serial.begin(9600);
    pinMode(PIR_PIN, INPUT);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER, OUTPUT);

    Serial.println(F("=== MOTION SURVEILLANCE RIG v2.0 ==="));
    Serial.println(F("Warming up (30s)..."));
    delay(30000);
    logEvent("SYS", "SYSTEM ARMED");
}

void triggerAlert(const char* zone) {
    logEvent(zone, "MOTION DETECTED");
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER, 2000, 150);
    delay(200);
    tone(BUZZER, 2500, 150);
    delay(200);
    noTone(BUZZER);
    delay(500);
    digitalWrite(LED_PIN, LOW);

    lastTrigger = millis();
    inCooldown = true;
}

void loop() {
    if (inCooldown && (millis() - lastTrigger >= COOLDOWN_MS)) {
        inCooldown = false;
        logEvent("SYS", "Cooldown expired - monitoring resumed");
    }

    if (digitalRead(PIR_PIN) == HIGH && !inCooldown) {
        triggerAlert("ZONE-A");
    }

    delay(100);
}`,
            language: 'Arduino'
        },
        {
            title: 'Add Multiple PIR Zones',
            content: `<p>Expand to a multi-zone system by adding additional PIR sensors. Each sensor covers a different area (doorway, window, hallway) and is independently monitored with its own cooldown timer.</p>`,
            code: `#define NUM_ZONES    3
#define COOLDOWN_MS  10000
#define LED_PIN      8
#define BUZZER       9

struct Zone {
    const char* name;
    int pin;
    unsigned long lastTrigger;
    bool inCooldown;
};

Zone zones[NUM_ZONES] = {
    {"DOOR",    2, 0, false},
    {"WINDOW",  3, 0, false},
    {"HALLWAY", 4, 0, false}
};

unsigned long eventCount = 0;

void timestamp() {
    unsigned long s = millis() / 1000;
    unsigned long m = s / 60;
    unsigned long h = m / 60;
    char ts[12];
    sprintf(ts, "[%02lu:%02lu:%02lu]", h, m % 60, s % 60);
    Serial.print(ts);
}

void logEvent(const char* zone, const char* msg) {
    eventCount++;
    timestamp();
    Serial.print(F(" #"));
    Serial.print(eventCount);
    Serial.print(F(" "));
    Serial.print(zone);
    Serial.print(F(": "));
    Serial.println(msg);
}

void alert(const char* zoneName) {
    logEvent(zoneName, "MOTION DETECTED");
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER, 2000, 100);
    delay(150);
    tone(BUZZER, 2500, 100);
    delay(150);
    noTone(BUZZER);
    delay(300);
    digitalWrite(LED_PIN, LOW);
}

void setup() {
    Serial.begin(9600);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER, OUTPUT);

    for (int i = 0; i < NUM_ZONES; i++) {
        pinMode(zones[i].pin, INPUT);
    }

    Serial.println(F("=== MULTI-ZONE SURVEILLANCE RIG ==="));
    Serial.print(F("Zones: "));
    Serial.println(NUM_ZONES);
    Serial.println(F("Warming up (30s)..."));
    delay(30000);
    logEvent("SYS", "ALL ZONES ARMED");
}

void loop() {
    unsigned long now = millis();

    for (int i = 0; i < NUM_ZONES; i++) {
        // Check cooldown
        if (zones[i].inCooldown && (now - zones[i].lastTrigger >= COOLDOWN_MS)) {
            zones[i].inCooldown = false;
        }

        // Check sensor
        if (digitalRead(zones[i].pin) == HIGH && !zones[i].inCooldown) {
            alert(zones[i].name);
            zones[i].lastTrigger = now;
            zones[i].inCooldown = true;
        }
    }

    delay(50);
}`,
            language: 'Arduino'
        },
        {
            title: 'Sensitivity Tuning and Calibration',
            content: `<p>PIR sensors have two onboard potentiometers for tuning. Getting these right is the difference between a useful sensor and a false-alarm generator. This step also adds a serial command interface for runtime adjustments.</p>`,
            code: `// Add serial command interface for runtime configuration.
// Type these commands in the Serial Monitor (9600 baud):
//
//   STATUS    - Show current config and event count
//   COOLDOWN xxxx  - Set cooldown time in ms
//   ARM      - Re-arm all zones
//   LOG      - Dump recent event summary
//   HELP     - Show commands

#define MAX_CMD 32
char cmdBuffer[MAX_CMD];
int cmdIndex = 0;

unsigned long cooldownMs = 10000;

void processCommand(const char* cmd) {
    if (strncmp(cmd, "STATUS", 6) == 0) {
        Serial.println(F("--- STATUS ---"));
        Serial.print(F("Cooldown: "));
        Serial.print(cooldownMs);
        Serial.println(F("ms"));
        Serial.print(F("Events: "));
        Serial.println(eventCount);
        Serial.print(F("Uptime: "));
        Serial.print(millis() / 1000);
        Serial.println(F("s"));
        for (int i = 0; i < NUM_ZONES; i++) {
            Serial.print(F("  "));
            Serial.print(zones[i].name);
            Serial.print(F(": "));
            Serial.println(zones[i].inCooldown ? "COOLDOWN" : "ACTIVE");
        }
    }
    else if (strncmp(cmd, "COOLDOWN ", 9) == 0) {
        long val = atol(cmd + 9);
        if (val >= 1000 && val <= 300000) {
            cooldownMs = val;
            Serial.print(F("Cooldown set to "));
            Serial.print(cooldownMs);
            Serial.println(F("ms"));
        } else {
            Serial.println(F("Invalid. Range: 1000-300000"));
        }
    }
    else if (strncmp(cmd, "ARM", 3) == 0) {
        for (int i = 0; i < NUM_ZONES; i++) {
            zones[i].inCooldown = false;
        }
        logEvent("SYS", "ALL ZONES RE-ARMED");
    }
    else if (strncmp(cmd, "HELP", 4) == 0) {
        Serial.println(F("Commands: STATUS, COOLDOWN <ms>, ARM, HELP"));
    }
    else {
        Serial.print(F("Unknown command: "));
        Serial.println(cmd);
    }
}

// Add this to loop() to read serial commands:
void checkSerial() {
    while (Serial.available()) {
        char c = Serial.read();
        if (c == '\\n' || c == '\\r') {
            if (cmdIndex > 0) {
                cmdBuffer[cmdIndex] = '\\0';
                processCommand(cmdBuffer);
                cmdIndex = 0;
            }
        } else if (cmdIndex < MAX_CMD - 1) {
            cmdBuffer[cmdIndex++] = c;
        }
    }
}`,
            language: 'Arduino',
            tip: '<strong>Physical tuning:</strong> Start with the sensitivity pot (Sx) at halfway. If you get false triggers, reduce it. The time pot (Tx) controls how long the output stays HIGH after motion — set it to minimum (fully counter-clockwise) since your code handles timing in software.'
        }
    ],

    testing: `<p>Test each capability in sequence:</p>
<ol>
    <li><strong>Single-zone detection:</strong> Upload the Step 1 minimal sketch. Open Serial Monitor. Walk in front of the sensor after the 30-second warm-up. You should see "MOTION DETECTED" messages.</li>
    <li><strong>LED and buzzer:</strong> Upload the Step 2 sketch. Walk past the sensor — the LED should light and the buzzer should sound a two-tone alert.</li>
    <li><strong>Cooldown:</strong> With the Step 3 sketch, trigger motion and then walk past again within 10 seconds. The second trigger should be suppressed. Wait 10 seconds and try again — it should fire.</li>
    <li><strong>Event logging:</strong> Let the Step 4 sketch run for a few minutes while triggering motion periodically. The serial output should show timestamped, numbered events.</li>
    <li><strong>Multi-zone:</strong> If you have multiple PIR sensors, upload Step 5 and verify that each zone triggers independently with its own cooldown.</li>
    <li><strong>Serial commands:</strong> Type <code>STATUS</code> in the Serial Monitor and press Enter. You should see the current configuration and zone states.</li>
</ol>`,

    troubleshooting: `<ul>
    <li><strong>Sensor triggers immediately and continuously:</strong> This usually means the warm-up period was skipped. PIR sensors need 30-60 seconds to stabilize. Also check that the sensor is not pointed at a heat source (lamp, radiator, computer).</li>
    <li><strong>Sensor never triggers:</strong> Check the OUT pin connection. Try a different digital pin. Use a multimeter to verify the OUT pin goes to 3.3V when you wave your hand in front of the sensor.</li>
    <li><strong>False triggers in empty room:</strong> PIR sensors can detect air currents from HVAC systems, pets, and even sunlight changes through windows. Reduce sensitivity (Sx pot counter-clockwise) and aim the sensor away from windows.</li>
    <li><strong>Buzzer sounds weak:</strong> Passive buzzers need PWM (<code>tone()</code>). If you have an active buzzer (it beeps when you apply DC voltage), use <code>digitalWrite()</code> instead of <code>tone()</code>.</li>
    <li><strong>Multi-zone: all zones fire at once:</strong> The PIR sensors may be too close together and detecting the same motion. Space them at least 1 meter apart, pointing in different directions.</li>
    <li><strong>Serial commands not recognized:</strong> Make sure the Serial Monitor is set to "Newline" or "Both NL & CR" in the line ending dropdown. Without a newline character, the command buffer never processes.</li>
</ul>`,

    challenges: `<p><strong>1. SD Card Logging:</strong> Connect the SD card module (included in the ELEGOO kit) and write events to a CSV file on the card. This gives you persistent storage that survives power cycles, and the CSV can be opened in Excel for analysis.</p>
<p><strong>2. LCD Status Display:</strong> Add the 16x2 LCD to show the current zone status, last event time, and total event count. Display "ALERT" in large text when motion is detected.</p>
<p><strong>3. Variable Alert Levels:</strong> Track how many times each zone triggers within a time window. If a zone triggers more than 5 times in 60 seconds, escalate to a "high alert" mode with continuous buzzer and rapid LED blink until manually reset via serial command.</p>`
};


// =========================================================================
// SG-15: Perimeter Alarm System (Arduino Mega + HC-SR04)
// =========================================================================

window.SignalGuides['sg-15'] = {

    intro: `<p>The HC-SR04 ultrasonic distance sensor measures how far away an object is by sending a 40kHz sound pulse and measuring how long the echo takes to return. In this project you will build a perimeter alarm system that defines proximity zones and triggers graduated alerts as an object gets closer.</p>
<p>Think of it as a digital tripwire: green means all-clear (nothing within 100cm), yellow means something is approaching (50-100cm), and red means perimeter breach (under 50cm). Each zone has its own LED and buzzer frequency, creating an intuitive graduated alert system.</p>
<p>This is the same distance-sensing principle used in car parking sensors, industrial safety barriers, and robotic obstacle avoidance. Every component is included in the ELEGOO Mega starter kit.</p>`,

    wiring: `
    HC-SR04 Ultrasonic             Arduino Mega 2560
    ┌──────────────┐              ┌──────────────────┐
    │  VCC       ──┼──────────────┤ 5V               │
    │  TRIG      ──┼──────────────┤ Pin 7            │
    │  ECHO      ──┼──────────────┤ Pin 6            │
    │  GND       ──┼──────────────┤ GND              │
    └──────────────┘              │                   │
                                  │                   │
    Green LED  ── 220 ohm ───────┤ Pin 10            │
    Yellow LED ── 220 ohm ───────┤ Pin 11            │
    Red LED    ── 220 ohm ───────┤ Pin 12            │
                                  │                   │
    Buzzer (+) ───────────────────┤ Pin 9 (PWM)      │
    Buzzer (-) ───────────────────┤ GND              │
                                  │                   │
    Arm Button ───────────────────┤ Pin 2             │
    (other leg to GND)            │                   │
                                  └──────────────────┘`,

    wiringNotes: `<p>The HC-SR04 has 4 pins: VCC (5V), TRIG (trigger pulse output), ECHO (echo pulse input), and GND. The TRIG pin receives a 10-microsecond pulse from the Arduino, and the ECHO pin returns a pulse whose width corresponds to the round-trip time of the ultrasonic burst.</p>
<p>LEDs: Use 220-ohm resistors in series with each LED. The ELEGOO kit includes resistors and LEDs of various colors. If you don't have a yellow LED, use a second green or red one.</p>
<p>The arm/disarm button uses the Arduino's internal pull-up resistor (<code>INPUT_PULLUP</code>), so it connects between the pin and GND with no external resistor needed.</p>`,

    steps: [
        {
            title: 'Read Distance from HC-SR04',
            content: `<p>The HC-SR04 works by sending a 10-microsecond trigger pulse, then measuring the duration of the echo pulse. Distance in centimeters is calculated as: <code>duration / 2 / 29.1</code> (speed of sound is ~29.1 microseconds per centimeter, divided by 2 for round trip).</p>`,
            code: `#define TRIG_PIN 7
#define ECHO_PIN 6

void setup() {
    Serial.begin(9600);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    Serial.println("HC-SR04 Distance Test");
}

long readDistance() {
    // Send 10us trigger pulse
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Measure echo pulse duration
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 30ms timeout

    if (duration == 0) return -1;  // no echo (out of range)

    // Convert to centimeters
    long distance = duration / 2 / 29;
    return distance;
}

void loop() {
    long dist = readDistance();
    if (dist < 0) {
        Serial.println("Out of range");
    } else {
        Serial.print("Distance: ");
        Serial.print(dist);
        Serial.println(" cm");
    }
    delay(250);
}`,
            language: 'Arduino',
            tip: 'The HC-SR04 has a maximum range of about 400cm and a minimum of about 2cm. If <code>pulseIn</code> returns 0, the echo timed out — the object is either too far or the sensor is aimed at an angled surface that deflects the sound away.'
        },
        {
            title: 'Define Proximity Zones',
            content: `<p>Create three zones based on distance thresholds. These thresholds are configurable constants — you will tune them for your specific setup (room size, sensor placement, desired sensitivity).</p>`,
            code: `// Proximity zone thresholds (in centimeters)
#define ZONE_GREEN   100   // > 100cm = all clear
#define ZONE_YELLOW   50   // 50-100cm = approaching
                           // < 50cm = perimeter breach (red)

enum AlertLevel {
    ALERT_NONE,    // No reading / out of range
    ALERT_GREEN,   // All clear
    ALERT_YELLOW,  // Approaching
    ALERT_RED      // Breach
};

AlertLevel getAlertLevel(long distance) {
    if (distance < 0)            return ALERT_NONE;
    if (distance < ZONE_YELLOW)  return ALERT_RED;
    if (distance < ZONE_GREEN)   return ALERT_YELLOW;
    return ALERT_GREEN;
}

const char* alertName(AlertLevel level) {
    switch (level) {
        case ALERT_GREEN:  return "GREEN  - Clear";
        case ALERT_YELLOW: return "YELLOW - Approaching";
        case ALERT_RED:    return "RED    - BREACH";
        default:           return "NONE   - No reading";
    }
}`,
            language: 'Arduino'
        },
        {
            title: 'Wire and Control the LED Array',
            content: `<p>Three LEDs correspond to the three zones. Only the LED matching the current alert level is lit. This gives an instant visual indicator of the perimeter status.</p>`,
            code: `#define GREEN_LED   10
#define YELLOW_LED  11
#define RED_LED     12

void setupLEDs() {
    pinMode(GREEN_LED, OUTPUT);
    pinMode(YELLOW_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    clearLEDs();
}

void clearLEDs() {
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, LOW);
}

void setLED(AlertLevel level) {
    clearLEDs();
    switch (level) {
        case ALERT_GREEN:
            digitalWrite(GREEN_LED, HIGH);
            break;
        case ALERT_YELLOW:
            digitalWrite(YELLOW_LED, HIGH);
            break;
        case ALERT_RED:
            digitalWrite(RED_LED, HIGH);
            break;
        default:
            break;  // all off
    }
}`,
            language: 'Arduino'
        },
        {
            title: 'Graduated Buzzer Alerts',
            content: `<p>The buzzer frequency and pattern change based on the alert level. Green is silent, yellow is a slow beep, and red is a rapid high-pitched alarm. This mimics the behavior of car parking sensors.</p>`,
            code: `#define BUZZER 9

void setupBuzzer() {
    pinMode(BUZZER, OUTPUT);
    noTone(BUZZER);
}

void soundAlert(AlertLevel level) {
    switch (level) {
        case ALERT_GREEN:
            noTone(BUZZER);
            break;

        case ALERT_YELLOW:
            // Slow beep: 1kHz, 50ms on, 200ms off
            tone(BUZZER, 1000, 50);
            break;

        case ALERT_RED:
            // Rapid alarm: 2.5kHz, 100ms on, 50ms off
            tone(BUZZER, 2500, 100);
            break;

        default:
            noTone(BUZZER);
            break;
    }
}`,
            language: 'Arduino'
        },
        {
            title: 'Arm/Disarm Button',
            content: `<p>A push button toggles the alarm between armed and disarmed states. When disarmed, the sensor still reads distance (shown on serial) but alerts are suppressed. This uses a simple debounced button check with the internal pull-up resistor.</p>`,
            code: `#define ARM_BUTTON   2
#define DEBOUNCE_MS  250

bool armed = false;
unsigned long lastButtonPress = 0;

void setupButton() {
    pinMode(ARM_BUTTON, INPUT_PULLUP);  // internal pull-up, button connects to GND
}

bool checkButton() {
    if (digitalRead(ARM_BUTTON) == LOW) {  // button pressed (pulled to GND)
        if (millis() - lastButtonPress > DEBOUNCE_MS) {
            lastButtonPress = millis();
            return true;
        }
    }
    return false;
}

void toggleArm() {
    armed = !armed;
    if (armed) {
        Serial.println(F("[SYSTEM] ALARM ARMED"));
        // Confirmation: green LED blink
        for (int i = 0; i < 3; i++) {
            digitalWrite(GREEN_LED, HIGH);
            delay(100);
            digitalWrite(GREEN_LED, LOW);
            delay(100);
        }
    } else {
        Serial.println(F("[SYSTEM] ALARM DISARMED"));
        clearLEDs();
        noTone(BUZZER);
        // Confirmation: red LED blink
        for (int i = 0; i < 2; i++) {
            digitalWrite(RED_LED, HIGH);
            delay(200);
            digitalWrite(RED_LED, LOW);
            delay(200);
        }
    }
}`,
            language: 'Arduino'
        },
        {
            title: 'Serial Distance Logging',
            content: `<p>Log every reading with a timestamp, distance, and alert level. This creates a continuous record of activity around the sensor. The log format is designed to be easily parsed by external tools.</p>`,
            code: `unsigned long eventCount = 0;
AlertLevel lastLevel = ALERT_NONE;

void timestamp() {
    unsigned long s = millis() / 1000;
    unsigned long m = s / 60;
    unsigned long h = m / 60;
    char ts[12];
    sprintf(ts, "[%02lu:%02lu:%02lu]", h, m % 60, s % 60);
    Serial.print(ts);
}

void logReading(long distance, AlertLevel level) {
    timestamp();
    Serial.print(F(" dist="));
    if (distance < 0) {
        Serial.print(F("---"));
    } else {
        if (distance < 100) Serial.print(F(" "));
        if (distance < 10) Serial.print(F(" "));
        Serial.print(distance);
    }
    Serial.print(F("cm  level="));
    Serial.print(alertName(level));

    // Mark level transitions
    if (level != lastLevel) {
        eventCount++;
        Serial.print(F("  ** TRANSITION #"));
        Serial.print(eventCount);
    }
    Serial.println();

    lastLevel = level;
}`,
            language: 'Arduino'
        },
        {
            title: 'Complete Perimeter Alarm System',
            content: `<p>This is the full integrated sketch. It combines distance sensing, three-zone alert levels, graduated LED and buzzer feedback, arm/disarm button, and serial logging into a complete perimeter alarm system.</p>`,
            code: `#include <Arduino.h>

// --- Pin definitions ---
#define TRIG_PIN     7
#define ECHO_PIN     6
#define GREEN_LED   10
#define YELLOW_LED  11
#define RED_LED     12
#define BUZZER       9
#define ARM_BUTTON   2

// --- Zone thresholds (cm) ---
#define ZONE_GREEN  100
#define ZONE_YELLOW  50

// --- Timing ---
#define DEBOUNCE_MS  250
#define READ_INTERVAL 200  // ms between distance reads

// --- Alert levels ---
enum AlertLevel { ALERT_NONE, ALERT_GREEN, ALERT_YELLOW, ALERT_RED };

// --- State ---
bool armed = false;
unsigned long lastButtonPress = 0;
unsigned long lastRead = 0;
unsigned long eventCount = 0;
AlertLevel lastLevel = ALERT_NONE;

// --- Distance reading ---
long readDistance() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH, 30000);
    if (duration == 0) return -1;
    return duration / 2 / 29;
}

AlertLevel getAlertLevel(long distance) {
    if (distance < 0)            return ALERT_NONE;
    if (distance < ZONE_YELLOW)  return ALERT_RED;
    if (distance < ZONE_GREEN)   return ALERT_YELLOW;
    return ALERT_GREEN;
}

const char* alertName(AlertLevel level) {
    switch (level) {
        case ALERT_GREEN:  return "GREEN ";
        case ALERT_YELLOW: return "YELLOW";
        case ALERT_RED:    return "RED   ";
        default:           return "NONE  ";
    }
}

// --- LED control ---
void clearLEDs() {
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, LOW);
}

void setLED(AlertLevel level) {
    clearLEDs();
    switch (level) {
        case ALERT_GREEN:  digitalWrite(GREEN_LED, HIGH); break;
        case ALERT_YELLOW: digitalWrite(YELLOW_LED, HIGH); break;
        case ALERT_RED:    digitalWrite(RED_LED, HIGH); break;
        default: break;
    }
}

// --- Buzzer ---
void soundAlert(AlertLevel level) {
    switch (level) {
        case ALERT_GREEN:  noTone(BUZZER); break;
        case ALERT_YELLOW: tone(BUZZER, 1000, 50); break;
        case ALERT_RED:    tone(BUZZER, 2500, 100); break;
        default:           noTone(BUZZER); break;
    }
}

// --- Logging ---
void timestamp() {
    unsigned long s = millis() / 1000;
    unsigned long m = s / 60;
    unsigned long h = m / 60;
    char ts[12];
    sprintf(ts, "[%02lu:%02lu:%02lu]", h, m % 60, s % 60);
    Serial.print(ts);
}

void logReading(long distance, AlertLevel level) {
    timestamp();
    Serial.print(armed ? F(" ARMED   ") : F(" DISARMED "));
    Serial.print(F("dist="));
    if (distance < 0) {
        Serial.print(F("---"));
    } else {
        if (distance < 100) Serial.print(F(" "));
        if (distance < 10)  Serial.print(F(" "));
        Serial.print(distance);
    }
    Serial.print(F("cm  "));
    Serial.print(alertName(level));
    if (level != lastLevel && armed) {
        eventCount++;
        Serial.print(F(" *TRANSITION #"));
        Serial.print(eventCount);
    }
    Serial.println();
    lastLevel = level;
}

// --- Button ---
void checkButton() {
    if (digitalRead(ARM_BUTTON) == LOW) {
        if (millis() - lastButtonPress > DEBOUNCE_MS) {
            lastButtonPress = millis();
            armed = !armed;
            clearLEDs();
            noTone(BUZZER);
            timestamp();
            Serial.println(armed ? F(" >> ALARM ARMED") : F(" >> ALARM DISARMED"));

            // Visual confirmation
            int confirmPin = armed ? GREEN_LED : RED_LED;
            for (int i = 0; i < 3; i++) {
                digitalWrite(confirmPin, HIGH);
                delay(100);
                digitalWrite(confirmPin, LOW);
                delay(100);
            }
        }
    }
}

// --- Setup ---
void setup() {
    Serial.begin(9600);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(GREEN_LED, OUTPUT);
    pinMode(YELLOW_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(BUZZER, OUTPUT);
    pinMode(ARM_BUTTON, INPUT_PULLUP);

    clearLEDs();
    noTone(BUZZER);

    Serial.println(F("=== PERIMETER ALARM SYSTEM v1.0 ==="));
    Serial.println(F("Zones: GREEN >100cm | YELLOW 50-100cm | RED <50cm"));
    Serial.println(F("Press button to arm/disarm."));
    Serial.println(F("Status: DISARMED"));
}

// --- Main loop ---
void loop() {
    checkButton();

    if (millis() - lastRead >= READ_INTERVAL) {
        lastRead = millis();
        long distance = readDistance();
        AlertLevel level = getAlertLevel(distance);

        logReading(distance, level);

        if (armed) {
            setLED(level);
            soundAlert(level);
        }
    }
}`,
            language: 'Arduino'
        }
    ],

    testing: `<p>Verify the system step by step:</p>
<ol>
    <li><strong>Distance reading:</strong> Upload the Step 1 sketch. Open Serial Monitor at 9600 baud. Place your hand at various distances from the sensor. Readings should be accurate within 1-2cm. Verify the sensor reads correctly from about 3cm to 300cm.</li>
    <li><strong>Zone detection:</strong> Move your hand slowly toward the sensor. Watch the serial output change from GREEN to YELLOW (at ~100cm) to RED (at ~50cm).</li>
    <li><strong>LED indicators:</strong> With the full sketch uploaded, arm the system and move your hand through the zones. Green, yellow, and red LEDs should light one at a time matching the current zone.</li>
    <li><strong>Buzzer graduation:</strong> In the yellow zone you should hear a slow beep. In the red zone, a rapid high-pitched alarm. Green zone should be silent.</li>
    <li><strong>Arm/disarm button:</strong> Press the button. Green LEDs should blink 3 times (armed). Press again — red LEDs blink twice (disarmed). While disarmed, distance is still logged but LEDs and buzzer are off.</li>
    <li><strong>Transition logging:</strong> Watch the serial output for "TRANSITION" markers when you move between zones. Each transition should be numbered sequentially.</li>
</ol>`,

    troubleshooting: `<ul>
    <li><strong>Distance always reads 0 or -1:</strong> Check that TRIG is on pin 7 and ECHO is on pin 6. They are easily swapped. Also ensure the sensor gets a clean 5V supply — if running many components, the USB power may be insufficient.</li>
    <li><strong>Readings are erratic or jump wildly:</strong> The ultrasonic pulse can bounce off irregular surfaces. Point the sensor at a flat, solid surface for testing. Soft or angled surfaces absorb or deflect the sound. Add averaging: read 3 times and take the median.</li>
    <li><strong>Buzzer does not change pitch:</strong> Make sure you are using <code>tone()</code> with different frequencies. If the buzzer only makes one sound regardless of frequency, you have an active buzzer (replace with a passive one, or remove the frequency control and use on/off only).</li>
    <li><strong>Button doesn't toggle:</strong> Verify the button connects the pin to GND when pressed and that you set <code>INPUT_PULLUP</code>. Without the pull-up, the pin floats and reads random values.</li>
    <li><strong>LEDs are dim:</strong> Check resistor values. 220 ohms is correct for standard LEDs at 5V. If using high-brightness LEDs, 330 ohms is fine. If LEDs are extremely dim, the resistor value may be too high (check the color bands).</li>
    <li><strong>Yellow LED missing:</strong> If your kit does not have a yellow LED, use a second red or green one. Or mix a red and green LED in parallel (they will both light, giving an amber appearance).</li>
</ul>`,

    challenges: `<p><strong>1. Multi-Sensor Coverage:</strong> Add a second HC-SR04 sensor covering a different direction (e.g., one for the door, one for the window). Track each sensor's zone independently and display the highest alert level.</p>
<p><strong>2. Distance Graphing:</strong> Send distance readings to the Serial Plotter (Tools &rarr; Serial Plotter in the Arduino IDE) to see a real-time graph. Format the output as: <code>distance,threshold_yellow,threshold_red</code> on each line to see the zones overlaid on the distance graph.</p>
<p><strong>3. Timed Arming Delay:</strong> When the button is pressed to arm, add a 30-second countdown (with a beep each second) before the alarm activates. This gives you time to leave the room. Display the countdown on the serial monitor and blink the green LED once per second during countdown.</p>`
};
