// =====================================================================
//  Hexworth Blink — first sketch for the Arduino Mega 2560
//
//  This is the smallest possible "I have an Arduino and it works"
//  sketch. It blinks the on-board LED (pin 13) once per second so you
//  can confirm your board is connected, your toolchain is configured,
//  and you can upload code.
//
//  Hardware:    Arduino Mega 2560 R3 (or any Arduino board with a
//               built-in LED — LED_BUILTIN is mapped per board).
//  Upload via:  Arduino IDE (Tools > Board > Arduino Mega or Mega 2560)
//               OR Arduino Web Editor (open this file, select Mega 2560).
//  License:     MIT — adapt this however you like.
// =====================================================================

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.begin(115200);
    Serial.println("Hexworth Blink starting on Arduino Mega 2560.");
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.println("LED on");
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
    Serial.println("LED off");
    delay(1000);
}
