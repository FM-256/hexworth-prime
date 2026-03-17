// ============================================================================
// Signal Arcade Ops — Build Guides (sg-26 through sg-30)
// Retro gaming and arcade cabinet projects
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-26: ESP32 Pong: Your First Game Console
    // ========================================================================
    'sg-26': {
        intro: '<p>This is the project that turns a $12 microcontroller into a real game console. The ESP32 CYD (Cheap Yellow Display) packs a 2.8-inch TFT touchscreen, WiFi, Bluetooth, and a buzzer onto a single board &mdash; everything you need to build Pong from scratch.</p>' +
               '<p>You will write a complete game from the ground up: a game loop with frame timing, sprite rendering, collision detection, input handling, score tracking, and sound effects. These are the same fundamental concepts behind every video game ever made, from Pong in 1972 to modern engines today.</p>' +
               '<p>No soldering required. The CYD has everything onboard. Plug in USB-C, flash the code, and play. Optional tactile buttons give you physical controls if you prefer them over touch.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid-26" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="680" height="380" fill="url(#bg-grid-26)" rx="4"/>' +
            '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-26 WIRING &mdash; ESP32 CYD + OPTIONAL BUTTONS</text>' +

            '<!-- CYD Board -->' +
            '<g>' +
            '<rect x="60" y="55" width="240" height="210" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="60" y="55" width="240" height="26" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="60" y="73" width="240" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="180" y="73" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="600">ESP32 CYD Board</text>' +

            '<!-- Built-in components -->' +
            '<rect x="75" y="95" width="95" height="55" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
            '<text x="122" y="112" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">ILI9341 TFT</text>' +
            '<text x="122" y="125" text-anchor="middle" fill="#22c55e" font-size="6" opacity="0.7">2.8" 320x240</text>' +
            '<text x="122" y="137" text-anchor="middle" fill="#22c55e" font-size="6" opacity="0.7">+ Touch (XPT2046)</text>' +

            '<rect x="180" y="95" width="105" height="55" rx="4" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.25)" stroke-width="0.5"/>' +
            '<text x="232" y="112" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">Onboard</text>' +
            '<text x="232" y="125" text-anchor="middle" fill="#a855f7" font-size="6" opacity="0.7">Buzzer (GPIO 26)</text>' +
            '<text x="232" y="137" text-anchor="middle" fill="#a855f7" font-size="6" opacity="0.7">WiFi + BT</text>' +

            '<!-- USB-C -->' +
            '<rect x="145" y="242" width="70" height="18" rx="4" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="180" y="254" text-anchor="middle" fill="#666" font-size="7">USB-C</text>' +

            '<!-- GPIO Header -->' +
            '<rect x="75" y="160" width="210" height="72" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
            '<text x="180" y="176" text-anchor="middle" fill="#8b949e" font-size="8">GPIO Header</text>' +

            '<!-- GPIO pins -->' +
            '<circle cx="110" cy="196" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="126" y="199" fill="#8b949e" font-size="7">GND</text>' +
            '<circle cx="110" cy="214" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="126" y="217" fill="#8b949e" font-size="7">IO22</text>' +
            '<circle cx="200" cy="196" r="4" fill="#3b82f6" stroke="#93c5fd" stroke-width="0.5"/><text x="216" y="199" fill="#8b949e" font-size="7">IO27</text>' +
            '<circle cx="200" cy="214" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/><text x="216" y="217" fill="#8b949e" font-size="7">IO17</text>' +
            '<circle cx="200" cy="232" r="4" fill="#e6edf3" stroke="#ccc" stroke-width="0.5"/><text x="216" y="235" fill="#8b949e" font-size="7">IO16</text>' +
            '</g>' +

            '<!-- Breadboard with buttons -->' +
            '<g>' +
            '<rect x="380" y="55" width="280" height="210" rx="6" fill="#1a1f2b" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>' +
            '<text x="520" y="73" text-anchor="middle" fill="#555" font-size="9" letter-spacing="0.1em">BREADBOARD (OPTIONAL)</text>' +

            '<!-- GND rail -->' +
            '<rect x="395" y="85" width="250" height="14" rx="2" fill="rgba(0,0,0,0.3)" stroke="rgba(136,136,136,0.3)" stroke-width="0.5"/>' +
            '<text x="520" y="95" text-anchor="middle" fill="#888" font-size="6">GND RAIL</text>' +

            '<!-- P1 Buttons -->' +
            '<text x="440" y="120" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">Player 1</text>' +
            '<rect x="400" y="128" width="80" height="28" rx="4" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="440" y="140" text-anchor="middle" fill="#22c55e" font-size="7">BTN UP</text>' +
            '<text x="440" y="152" text-anchor="middle" fill="#555" font-size="5">IO22</text>' +
            '<rect x="400" y="162" width="80" height="28" rx="4" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>' +
            '<text x="440" y="174" text-anchor="middle" fill="#3b82f6" font-size="7">BTN DOWN</text>' +
            '<text x="440" y="186" text-anchor="middle" fill="#555" font-size="5">IO27</text>' +

            '<!-- P2 Buttons -->' +
            '<text x="580" y="120" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="600">Player 2</text>' +
            '<rect x="540" y="128" width="80" height="28" rx="4" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
            '<text x="580" y="140" text-anchor="middle" fill="#eab308" font-size="7">BTN UP</text>' +
            '<text x="580" y="152" text-anchor="middle" fill="#555" font-size="5">IO17</text>' +
            '<rect x="540" y="162" width="80" height="28" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>' +
            '<text x="580" y="174" text-anchor="middle" fill="#e6edf3" font-size="7">BTN DOWN</text>' +
            '<text x="580" y="186" text-anchor="middle" fill="#555" font-size="5">IO16</text>' +

            '<!-- Pull-up note -->' +
            '<text x="520" y="215" text-anchor="middle" fill="#555" font-size="7">INPUT_PULLUP — no resistors needed</text>' +
            '<text x="520" y="228" text-anchor="middle" fill="#555" font-size="7">Each button: one leg to GPIO, other to GND</text>' +
            '</g>' +

            '<!-- Wires from CYD to breadboard -->' +
            '<line x1="114" y1="196" x2="395" y2="92" stroke="#666" stroke-width="2" stroke-dasharray="4,3" opacity="0.6"/>' +
            '<line x1="114" y1="214" x2="440" y2="128" stroke="#22c55e" stroke-width="2" opacity="0.6"/>' +
            '<line x1="204" y1="196" x2="440" y2="162" stroke="#3b82f6" stroke-width="2" opacity="0.6"/>' +
            '<line x1="204" y1="214" x2="580" y2="128" stroke="#eab308" stroke-width="2" opacity="0.6"/>' +
            '<line x1="204" y1="232" x2="580" y2="162" stroke="#e6edf3" stroke-width="2" opacity="0.4"/>' +

            '<!-- SPI Bus Legend -->' +
            '<rect x="60" y="290" width="600" height="90" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
            '<text x="80" y="310" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">BUILT-IN CONNECTIONS (NO WIRING NEEDED)</text>' +
            '<g>' +
            '<rect x="75" y="320" width="130" height="44" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="140" y="337" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">TFT Display</text>' +
            '<text x="140" y="353" text-anchor="middle" fill="#555" font-size="6">SPI: MOSI=13, SCK=14</text>' +
            '</g>' +
            '<g>' +
            '<rect x="215" y="320" width="130" height="44" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="280" y="337" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">Touch Panel</text>' +
            '<text x="280" y="353" text-anchor="middle" fill="#555" font-size="6">XPT2046, CS=33</text>' +
            '</g>' +
            '<g>' +
            '<rect x="355" y="320" width="130" height="44" rx="5" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
            '<text x="420" y="337" text-anchor="middle" fill="#fb923c" font-size="8" font-weight="600">Buzzer</text>' +
            '<text x="420" y="353" text-anchor="middle" fill="#555" font-size="6">GPIO 26 (LEDC)</text>' +
            '</g>' +
            '<g>' +
            '<rect x="495" y="320" width="150" height="44" rx="5" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="570" y="337" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">Backlight</text>' +
            '<text x="570" y="353" text-anchor="middle" fill="#555" font-size="6">GPIO 21, active HIGH</text>' +
            '</g>' +

            '</svg>' +
            '</div>',

        wiring: '    ESP32 CYD Board (built-in TFT + Touch)\n' +
                '    +------------------------------------------+\n' +
                '    |  CYD has TFT, touch, and buzzer onboard  |\n' +
                '    |  No display wiring needed!                |\n' +
                '    |                                           |\n' +
                '    |  Optional button wiring:                  |\n' +
                '    +------------------------------------------+\n' +
                '\n' +
                '    CYD GPIO Header          Breadboard\n' +
                '    +--------------+         +---------------------------+\n' +
                '    |         GND  |--black--|-[GND rail]               |\n' +
                '    |              |         |                           |\n' +
                '    |  Player 1:   |         |                           |\n' +
                '    |        IO22  |--green--|-[BTN UP]----[GND rail]   |\n' +
                '    |        IO27  |--blue---|-[BTN DOWN]--[GND rail]   |\n' +
                '    |              |         |                           |\n' +
                '    |  Player 2:   |         |                           |\n' +
                '    |        IO17  |--yellow-|-[BTN UP]----[GND rail]   |\n' +
                '    |        IO16  |--white--|-[BTN DOWN]--[GND rail]   |\n' +
                '    +--------------+         +---------------------------+\n' +
                '\n' +
                '    Buttons: One leg to GPIO, other leg to GND.\n' +
                '    Internal pull-ups enabled in code (INPUT_PULLUP).\n' +
                '    No external resistors needed.',

        wiringNotes: '<p><strong>CYD Display:</strong> The ILI9341 TFT is hardwired to the ESP32 on the CYD board. SPI pins are fixed: MOSI=13, SCK=14, CS=15, DC=2, RST=12, BL=21. The TFT_eSPI library handles this with the correct User_Setup.</p>' +
                     '<p><strong>Touch:</strong> The XPT2046 touch controller shares the SPI bus. Touch CS is on GPIO 33. Touch works out of the box with TFT_eSPI.</p>' +
                     '<p><strong>Buzzer:</strong> The onboard buzzer is on GPIO 26. Use <code>ledcWriteTone()</code> to generate sound.</p>' +
                     '<p><strong>Buttons are optional:</strong> The game works with touchscreen alone. Buttons just feel better for an arcade experience.</p>',

        steps: [
            {
                title: 'Set Up Arduino IDE for ESP32 CYD',
                content: '<p>Open the Arduino IDE. Go to <strong>File &gt; Preferences</strong> and add this URL to the Additional Boards Manager URLs field:</p>' +
                         '<p><code>https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json</code></p>' +
                         '<p>Then go to <strong>Tools &gt; Board &gt; Boards Manager</strong>, search for <strong>esp32</strong> by Espressif, and install it. Select <strong>ESP32 Dev Module</strong> as your board.</p>' +
                         '<p>Next, install the TFT_eSPI library: <strong>Sketch &gt; Include Library &gt; Manage Libraries</strong>, search for <strong>TFT_eSPI</strong> by Bodmer, and install it.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> After installing TFT_eSPI, you must configure it for the CYD. Navigate to the library folder (usually <code>~/Arduino/libraries/TFT_eSPI/</code>) and edit <code>User_Setup_Select.h</code>. Comment out the default setup and uncomment the line for <code>Setup24_ST7789.h</code>, or better yet, create a custom <code>User_Setup.h</code> with the CYD pin definitions shown in Step 2.'
            },
            {
                title: 'Configure TFT_eSPI for the CYD',
                content: '<p>The CYD has specific pin assignments for the ILI9341 display. Replace the contents of your <code>User_Setup.h</code> file inside the TFT_eSPI library folder with this configuration. This tells the library exactly which pins the CYD uses.</p>',
                code: '// User_Setup.h for ESP32-2432S028R (CYD)\n#define ILI9341_DRIVER\n\n#define TFT_WIDTH  240\n#define TFT_HEIGHT 320\n\n// CYD pin assignments\n#define TFT_MOSI 13\n#define TFT_SCLK 14\n#define TFT_CS   15\n#define TFT_DC    2\n#define TFT_RST  12\n#define TFT_BL   21   // Backlight\n\n// Touch (XPT2046)\n#define TOUCH_CS 33\n\n#define SPI_FREQUENCY       40000000\n#define SPI_TOUCH_FREQUENCY  2500000\n\n#define LOAD_GLCD\n#define LOAD_FONT2\n#define LOAD_FONT4\n#define LOAD_FONT6\n#define LOAD_FONT7\n#define LOAD_FONT8\n#define LOAD_GFXFF',
                language: 'C++',
                tip: '<strong>Tip:</strong> After saving this file, restart the Arduino IDE completely. The library caches settings and will not pick up changes until restart.'
            },
            {
                title: 'Understand the Game Loop',
                content: '<p>Every game runs on a loop: read input, update game state, draw the frame. The key is <strong>frame timing</strong> &mdash; you want a consistent frame rate so the ball moves at the same speed regardless of how fast the processor runs.</p>' +
                         '<p>This skeleton sets up TFT_eSPI, clears the screen, and runs a 60 FPS game loop. Upload it and verify you see a black screen with no errors in Serial Monitor.</p>',
                code: '#include <TFT_eSPI.h>\n#include <SPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\n// Frame timing\nconst unsigned long FRAME_MS = 16;  // ~60 FPS\nunsigned long lastFrame = 0;\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.println("SG-26: ESP32 Pong initializing...");\n\n  tft.init();\n  tft.setRotation(1);  // Landscape: 320x240\n  tft.fillScreen(TFT_BLACK);\n\n  // Turn on backlight\n  pinMode(TFT_BL, OUTPUT);\n  digitalWrite(TFT_BL, HIGH);\n\n  Serial.println("Display ready. 320x240 landscape.");\n}\n\nvoid loop() {\n  unsigned long now = millis();\n  if (now - lastFrame < FRAME_MS) return;\n  lastFrame = now;\n\n  // 1. Read input\n  // 2. Update state\n  // 3. Draw frame\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> The <code>tft.setRotation(1)</code> call flips the display to landscape (320 wide x 240 tall). Rotation 0 is portrait. For Pong, landscape gives you the classic wide court.'
            },
            {
                title: 'Draw the Court, Paddles, and Ball',
                content: '<p>Pong has three visual elements: two paddles (vertical rectangles on each side), a ball (small square), and a center line. The trick to smooth animation is <strong>erasing the old position before drawing the new one</strong> &mdash; draw a black rectangle over the old spot, then draw the white sprite at the new spot. This avoids redrawing the entire screen every frame.</p>',
                code: '#include <TFT_eSPI.h>\n#include <SPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\n// Screen dimensions (landscape)\nconst int SCREEN_W = 320;\nconst int SCREEN_H = 240;\n\n// Paddle dimensions\nconst int PAD_W = 6;\nconst int PAD_H = 40;\nconst int PAD_MARGIN = 10;  // Distance from edge\nconst int PAD_SPEED = 4;\n\n// Ball dimensions\nconst int BALL_SIZE = 6;\n\n// Game state\nfloat ballX, ballY;\nfloat ballDX, ballDY;\nint p1Y, p2Y;           // Paddle Y positions (top edge)\nint score1 = 0, score2 = 0;\n\n// Previous positions (for erase)\nfloat prevBallX, prevBallY;\nint prevP1Y, prevP2Y;\n\n// Frame timing\nconst unsigned long FRAME_MS = 16;\nunsigned long lastFrame = 0;\n\nvoid resetBall() {\n  ballX = SCREEN_W / 2;\n  ballY = SCREEN_H / 2;\n  ballDX = (random(2) == 0) ? 3.0 : -3.0;\n  ballDY = (random(2) == 0) ? 2.0 : -2.0;\n}\n\nvoid drawCourt() {\n  // Center dashed line\n  for (int y = 0; y < SCREEN_H; y += 8) {\n    tft.fillRect(SCREEN_W / 2 - 1, y, 2, 4, TFT_DARKGREY);\n  }\n}\n\nvoid drawScores() {\n  tft.setTextColor(TFT_WHITE, TFT_BLACK);\n  tft.setTextDatum(TC_DATUM);\n  tft.setTextFont(4);\n  tft.drawNumber(score1, SCREEN_W / 2 - 30, 10);\n  tft.drawNumber(score2, SCREEN_W / 2 + 30, 10);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  randomSeed(analogRead(0));\n\n  tft.init();\n  tft.setRotation(1);\n  tft.fillScreen(TFT_BLACK);\n  pinMode(TFT_BL, OUTPUT);\n  digitalWrite(TFT_BL, HIGH);\n\n  // Initial positions\n  p1Y = SCREEN_H / 2 - PAD_H / 2;\n  p2Y = SCREEN_H / 2 - PAD_H / 2;\n  prevP1Y = p1Y;\n  prevP2Y = p2Y;\n\n  resetBall();\n  prevBallX = ballX;\n  prevBallY = ballY;\n\n  drawCourt();\n  drawScores();\n\n  Serial.println("SG-26: Pong ready!");\n}\n\nvoid loop() {\n  unsigned long now = millis();\n  if (now - lastFrame < FRAME_MS) return;\n  lastFrame = now;\n\n  // --- Save previous positions ---\n  prevBallX = ballX;\n  prevBallY = ballY;\n  prevP1Y = p1Y;\n  prevP2Y = p2Y;\n\n  // --- Input (touchscreen — left half = P1, right half = P2) ---\n  uint16_t tx, ty;\n  if (tft.getTouch(&tx, &ty)) {\n    if (tx < SCREEN_W / 2) {\n      // Player 1 touch\n      int target = ty - PAD_H / 2;\n      if (target < p1Y) p1Y -= PAD_SPEED;\n      if (target > p1Y) p1Y += PAD_SPEED;\n    } else {\n      // Player 2 touch\n      int target = ty - PAD_H / 2;\n      if (target < p2Y) p2Y -= PAD_SPEED;\n      if (target > p2Y) p2Y += PAD_SPEED;\n    }\n  }\n\n  // Clamp paddles to screen\n  p1Y = constrain(p1Y, 0, SCREEN_H - PAD_H);\n  p2Y = constrain(p2Y, 0, SCREEN_H - PAD_H);\n\n  // --- Update ball ---\n  ballX += ballDX;\n  ballY += ballDY;\n\n  // Top/bottom wall bounce\n  if (ballY <= 0 || ballY >= SCREEN_H - BALL_SIZE) {\n    ballDY = -ballDY;\n    ballY = constrain(ballY, 0, SCREEN_H - BALL_SIZE);\n  }\n\n  // Paddle collision — P1 (left)\n  if (ballX <= PAD_MARGIN + PAD_W &&\n      ballY + BALL_SIZE >= p1Y && ballY <= p1Y + PAD_H &&\n      ballDX < 0) {\n    ballDX = -ballDX;\n    ballX = PAD_MARGIN + PAD_W;\n    // Angle based on where ball hits paddle\n    float hitPos = (ballY + BALL_SIZE / 2 - p1Y) / (float)PAD_H;\n    ballDY = (hitPos - 0.5) * 6.0;\n  }\n\n  // Paddle collision — P2 (right)\n  if (ballX + BALL_SIZE >= SCREEN_W - PAD_MARGIN - PAD_W &&\n      ballY + BALL_SIZE >= p2Y && ballY <= p2Y + PAD_H &&\n      ballDX > 0) {\n    ballDX = -ballDX;\n    ballX = SCREEN_W - PAD_MARGIN - PAD_W - BALL_SIZE;\n    float hitPos = (ballY + BALL_SIZE / 2 - p2Y) / (float)PAD_H;\n    ballDY = (hitPos - 0.5) * 6.0;\n  }\n\n  // Scoring — ball past left/right edge\n  if (ballX < 0) {\n    score2++;\n    drawScores();\n    resetBall();\n    delay(500);\n    return;\n  }\n  if (ballX > SCREEN_W) {\n    score1++;\n    drawScores();\n    resetBall();\n    delay(500);\n    return;\n  }\n\n  // --- Draw (erase old, draw new) ---\n\n  // Erase old paddles\n  tft.fillRect(PAD_MARGIN, prevP1Y, PAD_W, PAD_H, TFT_BLACK);\n  tft.fillRect(SCREEN_W - PAD_MARGIN - PAD_W, prevP2Y, PAD_W, PAD_H, TFT_BLACK);\n\n  // Erase old ball\n  tft.fillRect((int)prevBallX, (int)prevBallY, BALL_SIZE, BALL_SIZE, TFT_BLACK);\n\n  // Draw new paddles\n  tft.fillRect(PAD_MARGIN, p1Y, PAD_W, PAD_H, TFT_CYAN);\n  tft.fillRect(SCREEN_W - PAD_MARGIN - PAD_W, p2Y, PAD_W, PAD_H, TFT_MAGENTA);\n\n  // Draw new ball\n  tft.fillRect((int)ballX, (int)ballY, BALL_SIZE, BALL_SIZE, TFT_WHITE);\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> The erase-then-draw approach is much faster than clearing the whole screen each frame. <code>tft.fillScreen(TFT_BLACK)</code> every frame would cause visible flickering.'
            },
            {
                title: 'Add Button Input (Optional Physical Controls)',
                content: '<p>Touchscreen works, but physical buttons feel better for Pong. Wire four tactile buttons to the CYD GPIO header and add this input handler. The buttons use <code>INPUT_PULLUP</code> so they read LOW when pressed &mdash; no external resistors needed.</p>' +
                         '<p>Add this code to the input section of the game loop, replacing or supplementing the touch input.</p>',
                code: '// Button pin definitions (add at top of file)\nconst int P1_UP   = 22;\nconst int P1_DOWN = 27;\nconst int P2_UP   = 17;\nconst int P2_DOWN = 16;\n\n// Add to setup():\npinMode(P1_UP,   INPUT_PULLUP);\npinMode(P1_DOWN, INPUT_PULLUP);\npinMode(P2_UP,   INPUT_PULLUP);\npinMode(P2_DOWN, INPUT_PULLUP);\n\n// Replace/supplement the input section in loop():\n\n// Button input (LOW = pressed with INPUT_PULLUP)\nif (digitalRead(P1_UP)   == LOW) p1Y -= PAD_SPEED;\nif (digitalRead(P1_DOWN) == LOW) p1Y += PAD_SPEED;\nif (digitalRead(P2_UP)   == LOW) p2Y -= PAD_SPEED;\nif (digitalRead(P2_DOWN) == LOW) p2Y += PAD_SPEED;\n\n// Touch input (in addition to buttons)\nuint16_t tx, ty;\nif (tft.getTouch(&tx, &ty)) {\n  if (tx < SCREEN_W / 2) {\n    int target = ty - PAD_H / 2;\n    if (target < p1Y) p1Y -= PAD_SPEED;\n    if (target > p1Y) p1Y += PAD_SPEED;\n  } else {\n    int target = ty - PAD_H / 2;\n    if (target < p2Y) p2Y -= PAD_SPEED;\n    if (target > p2Y) p2Y += PAD_SPEED;\n  }\n}\n\n// Clamp paddles\np1Y = constrain(p1Y, 0, SCREEN_H - PAD_H);\np2Y = constrain(p2Y, 0, SCREEN_H - PAD_H);',
                language: 'C++',
                tip: '<strong>Tip:</strong> If you only have one player, you can make P2 an AI: <code>if (ballY > p2Y + PAD_H/2) p2Y += PAD_SPEED - 1; else p2Y -= PAD_SPEED - 1;</code>. The minus-one makes the AI beatable.'
            },
            {
                title: 'Add Buzzer Sound Effects',
                content: '<p>The CYD has a buzzer on GPIO 26. Use the ESP32 LEDC (LED Control) peripheral to generate tones. Different frequencies for different events: wall bounce, paddle hit, and scoring.</p>' +
                         '<p>Add these functions and call them at the appropriate points in your game loop.</p>',
                code: '// Buzzer pin (CYD onboard)\nconst int BUZZER_PIN = 26;\nconst int BUZZER_CHANNEL = 0;\n\n// Add to setup():\nledcSetup(BUZZER_CHANNEL, 2000, 8);  // Channel 0, 2kHz, 8-bit\nledcAttachPin(BUZZER_PIN, BUZZER_CHANNEL);\n\n// Sound effect functions:\nvoid soundWallBounce() {\n  ledcWriteTone(BUZZER_CHANNEL, 400);\n  delay(30);\n  ledcWriteTone(BUZZER_CHANNEL, 0);\n}\n\nvoid soundPaddleHit() {\n  ledcWriteTone(BUZZER_CHANNEL, 800);\n  delay(30);\n  ledcWriteTone(BUZZER_CHANNEL, 0);\n}\n\nvoid soundScore() {\n  ledcWriteTone(BUZZER_CHANNEL, 200);\n  delay(100);\n  ledcWriteTone(BUZZER_CHANNEL, 300);\n  delay(100);\n  ledcWriteTone(BUZZER_CHANNEL, 0);\n}\n\n// Call in the game loop:\n// After wall bounce:    soundWallBounce();\n// After paddle hit:     soundPaddleHit();\n// After scoring:        soundScore();',
                language: 'C++',
                tip: null
            },
            {
                title: 'Add Game Over Screen',
                content: '<p>First to 10 points wins. When a player reaches the score limit, show a game-over screen with the winner and a "touch to restart" prompt. This is the final piece &mdash; after this step you have a complete, playable Pong console.</p>',
                code: 'const int WIN_SCORE = 10;\n\n// Game state flag (add at top of file with other globals)\nbool gameOver = false;\n\n// Add this function:\nvoid showGameOver(int winner) {\n  gameOver = true;\n  tft.fillScreen(TFT_BLACK);\n\n  tft.setTextColor(winner == 1 ? TFT_CYAN : TFT_MAGENTA);\n  tft.setTextDatum(MC_DATUM);\n  tft.setTextFont(4);\n  tft.drawString(winner == 1 ? "PLAYER 1 WINS" : "PLAYER 2 WINS",\n                 SCREEN_W / 2, SCREEN_H / 2 - 30);\n\n  tft.setTextColor(TFT_WHITE);\n  tft.setTextFont(2);\n  char buf[32];\n  sprintf(buf, "Score: %d - %d", score1, score2);\n  tft.drawString(buf, SCREEN_W / 2, SCREEN_H / 2 + 10);\n\n  tft.setTextColor(TFT_DARKGREY);\n  tft.drawString("Touch to play again", SCREEN_W / 2, SCREEN_H / 2 + 50);\n\n  // Play victory jingle\n  int melody[] = {523, 659, 784, 1047};\n  for (int i = 0; i < 4; i++) {\n    ledcWriteTone(BUZZER_CHANNEL, melody[i]);\n    delay(150);\n  }\n  ledcWriteTone(BUZZER_CHANNEL, 0);\n}\n\nvoid restartGame() {\n  score1 = 0;\n  score2 = 0;\n  p1Y = SCREEN_H / 2 - PAD_H / 2;\n  p2Y = SCREEN_H / 2 - PAD_H / 2;\n  gameOver = false;\n  tft.fillScreen(TFT_BLACK);\n  drawCourt();\n  drawScores();\n  resetBall();\n}\n\n// Modify the scoring section in loop():\nif (ballX < 0) {\n  score2++;\n  soundScore();\n  if (score2 >= WIN_SCORE) { showGameOver(2); return; }\n  drawScores();\n  resetBall();\n  delay(500);\n  return;\n}\nif (ballX > SCREEN_W) {\n  score1++;\n  soundScore();\n  if (score1 >= WIN_SCORE) { showGameOver(1); return; }\n  drawScores();\n  resetBall();\n  delay(500);\n  return;\n}\n\n// Add at the very top of loop():\nif (gameOver) {\n  uint16_t tx, ty;\n  if (tft.getTouch(&tx, &ty)) {\n    delay(300);  // Debounce\n    restartGame();\n  }\n  return;\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> Want a title screen? Add another state flag and draw a splash screen with "PONG" in big text and "Touch to Start" below it. State machines like this (TITLE &rarr; PLAYING &rarr; GAME_OVER) are how every game handles flow.'
            }
        ],

        testing: '<p>Test each feature as you add it:</p>' +
                 '<ul>' +
                 '<li><strong>Display test:</strong> After Step 2, the screen should light up solid black with the backlight on. If the screen is white or garbled, your User_Setup.h pin definitions are wrong.</li>' +
                 '<li><strong>Game loop:</strong> After Step 3, open Serial Monitor at 115200 baud. You should see the initialization messages with no errors.</li>' +
                 '<li><strong>Visual test:</strong> After Step 4, you should see two colored paddles (cyan left, magenta right), a white ball bouncing, and the center dashed line. Scores should display at the top.</li>' +
                 '<li><strong>Touch input:</strong> Touch the left half of the screen and the left paddle should follow your finger vertically. Same for the right half and right paddle.</li>' +
                 '<li><strong>Button input:</strong> If wired, each button should move its paddle up or down. Buttons and touch should work simultaneously.</li>' +
                 '<li><strong>Sound:</strong> You should hear distinct tones for wall bounces (low), paddle hits (medium), and scoring (descending). If no sound, verify GPIO 26 is the buzzer pin on your specific CYD revision.</li>' +
                 '<li><strong>Game over:</strong> Play until one side reaches 10. The game-over screen should show the winner, score, and restart on touch.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Screen stays white after upload:</strong> Wrong pin definitions in User_Setup.h. Double-check MOSI=13, SCK=14, CS=15, DC=2, RST=12. Restart the IDE after changes.</li>' +
                         '<li><strong>Touch does not respond:</strong> Make sure <code>TOUCH_CS 33</code> is defined in User_Setup.h. Some CYD revisions use a different touch CS pin &mdash; check your board silkscreen.</li>' +
                         '<li><strong>Ball moves but paddles do not:</strong> Touch coordinates may be inverted. Try swapping <code>tx</code> and <code>ty</code> in the touch handler, or change <code>tft.setRotation()</code> to a different value (0&ndash;3).</li>' +
                         '<li><strong>Flickering or tearing:</strong> Make sure you are erasing old positions (black rect) before drawing new ones, not calling <code>fillScreen()</code> every frame. Also verify your SPI frequency is 40MHz.</li>' +
                         '<li><strong>Upload fails &mdash; "A fatal error occurred: Failed to connect":</strong> Hold the BOOT button on the CYD while clicking Upload. Release after you see "Connecting..." in the console.</li>' +
                         '<li><strong>No sound from buzzer:</strong> Some CYD board revisions have the buzzer on a different pin. Try GPIO 25 if GPIO 26 does not work. Check with a simple <code>ledcWriteTone()</code> test sketch.</li>' +
                         '<li><strong>Ball phases through paddle:</strong> At high speeds the ball can skip past the paddle in one frame. Increase <code>PAD_W</code> or decrease ball speed to fix. For a proper fix, use swept collision detection.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: AI Opponent</strong> &mdash; Add a single-player mode where Player 2 is controlled by the CPU. Track the ball\'s Y position and move the paddle toward it, but add a slight delay or speed limit so the AI is beatable. Add difficulty levels (Easy/Medium/Hard) that control AI reaction speed.</p>' +
                    '<p><strong>Challenge 2: Power-Ups</strong> &mdash; Spawn a random power-up on the court every 15 seconds. When the ball hits it, trigger an effect: speed boost, paddle size change, or multi-ball. Display the active power-up with a small icon and a countdown timer.</p>' +
                    '<p><strong>Challenge 3: Breakout Mode</strong> &mdash; Add a single-player Breakout mode: one paddle at the bottom, rows of colored bricks at the top. Each brick takes one hit to destroy. Track the number of bricks remaining and display a "You Win" screen when all are cleared.</p>'
    },

    // ========================================================================
    // SG-27: Handheld Game Boy: ESP32 Emulator
    // ========================================================================
    'sg-27': {
        intro: '<p>Emulation is one of the most impressive things a microcontroller can do &mdash; pretending to be a completely different CPU. In this project you will turn an ESP32 into a handheld Game Boy using Peanut-GB, an open-source Game Boy emulator small enough to run on embedded hardware.</p>' +
               '<p>You will wire an ILI9341 TFT display, six buttons (D-pad, A, B), an SD card reader for ROM storage, and a speaker for audio. Add a LiPo battery and you have a portable, self-contained retro gaming handheld that fits in your pocket.</p>' +
               '<p>This project teaches you about emulation architecture (fetch-decode-execute), SPI bus sharing (display and SD on the same bus), and real firmware development with PlatformIO. It is a significant step up from the Pong project &mdash; you are working with someone else\'s codebase and adapting it to your hardware.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid-27" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="680" height="380" fill="url(#bg-grid-27)" rx="4"/>' +
            '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-27 WIRING &mdash; ESP32 HANDHELD GAME BOY</text>' +

            '<!-- ESP32 DevKit -->' +
            '<g>' +
            '<rect x="40" y="55" width="150" height="280" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="55" width="150" height="26" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="73" width="150" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="115" y="73" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ESP32 DevKit</text>' +

            '<!-- USB port -->' +
            '<rect x="85" y="42" width="60" height="16" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="115" y="53" text-anchor="middle" fill="#666" font-size="7">USB</text>' +

            '<!-- Pin labels left side -->' +
            '<text x="55" y="100" fill="#ef4444" font-size="7">3V3</text><circle cx="170" cy="97" r="3" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/>' +
            '<text x="55" y="116" fill="#666" font-size="7">GND</text><circle cx="170" cy="113" r="3" fill="#333" stroke="#888" stroke-width="0.5"/>' +
            '<text x="55" y="132" fill="#fb923c" font-size="7">GP23</text><circle cx="170" cy="129" r="3" fill="#fb923c" stroke="#fdba74" stroke-width="0.5"/>' +
            '<text x="55" y="148" fill="#eab308" font-size="7">GP18</text><circle cx="170" cy="145" r="3" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/>' +
            '<text x="55" y="164" fill="#22c55e" font-size="7">GP5</text><circle cx="170" cy="161" r="3" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/>' +
            '<text x="55" y="180" fill="#3b82f6" font-size="7">GP2</text><circle cx="170" cy="177" r="3" fill="#3b82f6" stroke="#93c5fd" stroke-width="0.5"/>' +
            '<text x="55" y="196" fill="#a855f7" font-size="7">GP4</text><circle cx="170" cy="193" r="3" fill="#a855f7" stroke="#c084fc" stroke-width="0.5"/>' +
            '<text x="55" y="212" fill="#e6edf3" font-size="7">GP19</text><circle cx="170" cy="209" r="3" fill="#e6edf3" stroke="#ccc" stroke-width="0.5"/>' +
            '<text x="55" y="228" fill="#888" font-size="7">GP15</text><circle cx="170" cy="225" r="3" fill="#888" stroke="#aaa" stroke-width="0.5"/>' +

            '<!-- Button pins -->' +
            '<text x="55" y="252" fill="#4ade80" font-size="7">GP32</text><circle cx="170" cy="249" r="3" fill="#4ade80" stroke="#86efac" stroke-width="0.5"/>' +
            '<text x="55" y="266" fill="#4ade80" font-size="7">GP33</text><circle cx="170" cy="263" r="3" fill="#4ade80" stroke="#86efac" stroke-width="0.5"/>' +
            '<text x="55" y="280" fill="#4ade80" font-size="7">GP25</text><circle cx="170" cy="277" r="3" fill="#4ade80" stroke="#86efac" stroke-width="0.5"/>' +
            '<text x="55" y="294" fill="#4ade80" font-size="7">GP26</text><circle cx="170" cy="291" r="3" fill="#4ade80" stroke="#86efac" stroke-width="0.5"/>' +
            '<text x="55" y="308" fill="#c084fc" font-size="7">GP27</text><circle cx="170" cy="305" r="3" fill="#c084fc" stroke="#d8b4fe" stroke-width="0.5"/>' +
            '<text x="55" y="322" fill="#c084fc" font-size="7">GP14</text><circle cx="170" cy="319" r="3" fill="#c084fc" stroke="#d8b4fe" stroke-width="0.5"/>' +
            '</g>' +

            '<!-- TFT Display -->' +
            '<g>' +
            '<rect x="240" y="55" width="140" height="140" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="240" y="55" width="140" height="24" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<rect x="240" y="72" width="140" height="7" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="310" y="72" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="600">ILI9341 TFT</text>' +
            '<rect x="260" y="90" width="100" height="65" rx="3" fill="rgba(249,115,22,0.06)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
            '<text x="310" y="120" text-anchor="middle" fill="#fb923c" font-size="8" opacity="0.6">2.4" Display</text>' +
            '<text x="310" y="133" text-anchor="middle" fill="#555" font-size="6">240 x 320</text>' +
            '<!-- TFT pins -->' +
            '<text x="255" y="172" fill="#8b949e" font-size="6">VCC SDA SCL CS DC RST</text>' +
            '</g>' +

            '<!-- SD Card Module -->' +
            '<g>' +
            '<rect x="240" y="210" width="140" height="80" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<rect x="240" y="210" width="140" height="22" rx="8" fill="rgba(234,179,8,0.1)"/>' +
            '<rect x="240" y="226" width="140" height="6" fill="rgba(234,179,8,0.1)"/>' +
            '<text x="310" y="226" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">SD Card Module</text>' +
            '<rect x="270" y="245" width="60" height="28" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="300" y="262" text-anchor="middle" fill="#666" font-size="7">SD CARD</text>' +
            '<text x="310" y="283" text-anchor="middle" fill="#555" font-size="6">Shared SPI bus</text>' +
            '</g>' +

            '<!-- Wires to TFT -->' +
            '<line x1="173" y1="97" x2="240" y2="90" stroke="#ef4444" stroke-width="2" opacity="0.7"/>' +
            '<line x1="173" y1="113" x2="240" y2="100" stroke="#666" stroke-width="2" opacity="0.7"/>' +
            '<line x1="173" y1="129" x2="240" y2="110" stroke="#fb923c" stroke-width="2" opacity="0.7"/>' +
            '<line x1="173" y1="145" x2="240" y2="120" stroke="#eab308" stroke-width="2" opacity="0.7"/>' +
            '<line x1="173" y1="161" x2="240" y2="130" stroke="#22c55e" stroke-width="2" opacity="0.7"/>' +
            '<line x1="173" y1="177" x2="240" y2="140" stroke="#3b82f6" stroke-width="2" opacity="0.7"/>' +
            '<line x1="173" y1="193" x2="240" y2="150" stroke="#a855f7" stroke-width="2" opacity="0.7"/>' +

            '<!-- Wires to SD -->' +
            '<line x1="173" y1="209" x2="240" y2="240" stroke="#e6edf3" stroke-width="2" opacity="0.5"/>' +
            '<line x1="173" y1="225" x2="240" y2="255" stroke="#888" stroke-width="2" opacity="0.5"/>' +

            '<!-- Buttons section -->' +
            '<g>' +
            '<rect x="430" y="55" width="230" height="175" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
            '<text x="545" y="73" text-anchor="middle" fill="#555" font-size="9" letter-spacing="0.1em">6 BUTTONS + COMBOS</text>' +

            '<!-- D-pad buttons -->' +
            '<rect x="445" y="85" width="55" height="24" rx="4" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>' +
            '<text x="472" y="100" text-anchor="middle" fill="#4ade80" font-size="7">UP</text>' +
            '<rect x="445" y="113" width="55" height="24" rx="4" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>' +
            '<text x="472" y="128" text-anchor="middle" fill="#4ade80" font-size="7">DOWN</text>' +
            '<rect x="445" y="141" width="55" height="24" rx="4" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>' +
            '<text x="472" y="156" text-anchor="middle" fill="#4ade80" font-size="7">LEFT</text>' +
            '<rect x="445" y="169" width="55" height="24" rx="4" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>' +
            '<text x="472" y="184" text-anchor="middle" fill="#4ade80" font-size="7">RIGHT</text>' +

            '<!-- A/B buttons -->' +
            '<rect x="560" y="85" width="55" height="24" rx="4" fill="rgba(192,132,252,0.1)" stroke="rgba(192,132,252,0.3)" stroke-width="1"/>' +
            '<text x="587" y="100" text-anchor="middle" fill="#c084fc" font-size="7">A</text>' +
            '<rect x="560" y="113" width="55" height="24" rx="4" fill="rgba(192,132,252,0.1)" stroke="rgba(192,132,252,0.3)" stroke-width="1"/>' +
            '<text x="587" y="128" text-anchor="middle" fill="#c084fc" font-size="7">B</text>' +

            '<!-- Combo labels -->' +
            '<text x="545" y="210" text-anchor="middle" fill="#555" font-size="6">A+B+UP = Start</text>' +
            '<text x="545" y="222" text-anchor="middle" fill="#555" font-size="6">A+B+DOWN = Select</text>' +
            '</g>' +

            '<!-- Wires to buttons -->' +
            '<line x1="173" y1="249" x2="445" y2="97" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<line x1="173" y1="263" x2="445" y2="125" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<line x1="173" y1="277" x2="445" y2="153" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<line x1="173" y1="291" x2="445" y2="181" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<line x1="173" y1="305" x2="560" y2="97" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<line x1="173" y1="319" x2="560" y2="125" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +

            '<!-- Battery + Speaker -->' +
            '<g>' +
            '<rect x="430" y="250" width="110" height="60" rx="6" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="485" y="268" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">LiPo + TP4056</text>' +
            '<text x="485" y="283" text-anchor="middle" fill="#555" font-size="6">3.7V &rarr; VIN</text>' +
            '<text x="485" y="295" text-anchor="middle" fill="#555" font-size="6">USB charging</text>' +
            '</g>' +
            '<g>' +
            '<rect x="550" y="250" width="110" height="60" rx="6" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="605" y="268" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">Speaker</text>' +
            '<text x="605" y="283" text-anchor="middle" fill="#555" font-size="6">DAC on GP25</text>' +
            '<text x="605" y="295" text-anchor="middle" fill="#555" font-size="6">8 ohm, 0.5W</text>' +
            '</g>' +

            '<!-- Legend -->' +
            '<rect x="40" y="340" width="620" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
            '<text x="60" y="358" fill="#555" font-size="8" font-weight="600">WIRE COLORS:</text>' +
            '<line x1="150" y1="355" x2="170" y2="355" stroke="#ef4444" stroke-width="2.5"/><text x="175" y="359" fill="#8b949e" font-size="7">3V3 Power</text>' +
            '<line x1="235" y1="355" x2="255" y2="355" stroke="#666" stroke-width="2.5"/><text x="260" y="359" fill="#8b949e" font-size="7">Ground</text>' +
            '<line x1="310" y1="355" x2="330" y2="355" stroke="#fb923c" stroke-width="2.5"/><text x="335" y="359" fill="#8b949e" font-size="7">MOSI</text>' +
            '<line x1="375" y1="355" x2="395" y2="355" stroke="#eab308" stroke-width="2.5"/><text x="400" y="359" fill="#8b949e" font-size="7">SCK</text>' +
            '<line x1="435" y1="355" x2="455" y2="355" stroke="#4ade80" stroke-width="2.5"/><text x="460" y="359" fill="#8b949e" font-size="7">D-pad</text>' +
            '<line x1="505" y1="355" x2="525" y2="355" stroke="#c084fc" stroke-width="2.5"/><text x="530" y="359" fill="#8b949e" font-size="7">A/B Btns</text>' +

            '</svg>' +
            '</div>',

        wiring: '    ESP32 DevKit V1                  Components\n' +
                '    +------------------+\n' +
                '    |             3V3  |---red-------[TFT VCC] [SD VCC]\n' +
                '    |             GND  |---black-----[TFT GND] [SD GND] [BTN common]\n' +
                '    |                  |\n' +
                '    |  TFT (ILI9341): |\n' +
                '    |           GPIO23 |---orange----[TFT MOSI / SDA]\n' +
                '    |           GPIO18 |---yellow----[TFT SCK / SCL]\n' +
                '    |            GPIO5 |---green-----[TFT CS]\n' +
                '    |            GPIO2 |---blue------[TFT DC / RS]\n' +
                '    |            GPIO4 |---purple----[TFT RST]\n' +
                '    |                  |\n' +
                '    |  SD Card Module: |\n' +
                '    |           GPIO23 |----(shared)--[SD MOSI]\n' +
                '    |           GPIO18 |----(shared)--[SD SCK]\n' +
                '    |           GPIO19 |---white-----[SD MISO]\n' +
                '    |           GPIO15 |---gray------[SD CS]\n' +
                '    |                  |\n' +
                '    |  Buttons (10K pull-up each to 3V3):\n' +
                '    |           GPIO32 |---[BTN UP]----GND\n' +
                '    |           GPIO33 |---[BTN DOWN]--GND\n' +
                '    |           GPIO25 |---[BTN LEFT]--GND\n' +
                '    |           GPIO26 |---[BTN RIGHT]-GND\n' +
                '    |           GPIO27 |---[BTN A]-----GND\n' +
                '    |           GPIO14 |---[BTN B]-----GND\n' +
                '    |                  |\n' +
                '    |  Speaker:        |\n' +
                '    |           GPIO25 |---[Speaker +]  (DAC output)\n' +
                '    |             GND  |---[Speaker -]\n' +
                '    |                  |\n' +
                '    |  Battery:        |\n' +
                '    |  [LiPo]--[TP4056 OUT+]---[5V or VIN]\n' +
                '    |  [LiPo]--[TP4056 OUT-]---[GND]\n' +
                '    +------------------+',

        wiringNotes: '<p><strong>SPI bus sharing:</strong> The TFT and SD card share MOSI (GPIO23) and SCK (GPIO18) but have separate CS pins. The SPI bus only talks to one device at a time based on which CS pin is pulled LOW. SD also needs MISO (GPIO19) for reading data back.</p>' +
                     '<p><strong>Button pull-ups:</strong> Each button has one leg to GPIO, the other to GND. Add 10K&Omega; resistors from each GPIO pin to 3V3 as pull-ups. Alternatively, use <code>INPUT_PULLUP</code> in code if your ESP32 module has reliable internal pull-ups.</p>' +
                     '<p><strong>Speaker:</strong> GPIO25 is a DAC output on the ESP32. Connect directly to a small 8&Omega; speaker. For more volume, add a PAM8403 amplifier module between the DAC and speaker.</p>' +
                     '<p><strong>Battery:</strong> The TP4056 module charges the LiPo via USB and provides regulated output. Connect OUT+ to the ESP32 5V/VIN pin. The TP4056 handles charge management and over-discharge protection.</p>',

        steps: [
            {
                title: 'Set Up PlatformIO',
                content: '<p>This project uses PlatformIO instead of the Arduino IDE for better dependency management and build configuration. Install VS Code, then install the PlatformIO extension from the Extensions marketplace.</p>' +
                         '<p>Create a new PlatformIO project: open the PlatformIO home tab, click <strong>New Project</strong>, select <strong>Espressif ESP32 Dev Module</strong> as the board, and <strong>Arduino</strong> as the framework.</p>' +
                         '<p>Your <code>platformio.ini</code> should look like this:</p>',
                code: '[env:esp32dev]\nplatform = espressif32\nboard = esp32dev\nframework = arduino\nmonitor_speed = 115200\nboard_build.f_cpu = 240000000L\nboard_build.f_flash = 80000000L\nboard_build.flash_mode = qio\n\nlib_deps =\n    bodmer/TFT_eSPI@^2.5.0\n\nbuild_flags =\n    -DUSER_SETUP_LOADED=1\n    -DILI9341_DRIVER=1\n    -DTFT_MOSI=23\n    -DTFT_SCLK=18\n    -DTFT_CS=5\n    -DTFT_DC=2\n    -DTFT_RST=4\n    -DSPI_FREQUENCY=40000000\n    -DLOAD_GLCD=1',
                language: 'C++',
                tip: '<strong>Tip:</strong> PlatformIO lets you define TFT_eSPI settings as build flags instead of editing library header files. This is cleaner and version-control friendly.'
            },
            {
                title: 'Download and Integrate Peanut-GB',
                content: '<p>Peanut-GB is a single-header Game Boy emulator by deltabeard. It is designed to be embedded in other projects &mdash; you provide the hardware interface functions and it handles the CPU, PPU, and memory emulation.</p>' +
                         '<p>Download <code>peanut_gb.h</code> from the GitHub repository: <code>github.com/deltabeard/Peanut-GB</code>. Place it in your project\'s <code>src/</code> directory.</p>' +
                         '<p>Peanut-GB requires you to implement several callback functions that it calls during emulation. Here is the minimal integration skeleton:</p>',
                code: '#include <Arduino.h>\n#include <TFT_eSPI.h>\n#include <SD.h>\n#include <SPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\n// ROM and RAM buffers\nuint8_t *rom = nullptr;\nuint8_t ram[32768];  // 32KB cart RAM\nuint8_t wram[8192];  // 8KB work RAM\nuint8_t vram[8192];  // 8KB video RAM\nuint8_t hram[128];   // High RAM\nuint8_t oam[160];    // OAM (sprite attributes)\n\n// Frame buffer: 160x144 pixels, RGB565\nuint16_t framebuf[160 * 144];\n\n// GB palette (4 shades of green, classic DMG look)\nconst uint16_t palette[4] = {\n  tft.color565(155, 188, 15),  // Lightest\n  tft.color565(139, 172, 15),\n  tft.color565(48, 98, 48),\n  tft.color565(15, 56, 15)     // Darkest\n};\n\n// Peanut-GB callbacks — these are called by the emulator\nuint8_t gb_rom_read(uint_fast32_t addr) {\n  return rom[addr];\n}\n\nuint8_t gb_cart_ram_read(uint_fast32_t addr) {\n  return ram[addr & 0x7FFF];\n}\n\nvoid gb_cart_ram_write(uint_fast32_t addr, uint8_t val) {\n  ram[addr & 0x7FFF] = val;\n}\n\nvoid gb_error(const enum gb_error_e err, const uint16_t addr) {\n  Serial.printf("GB Error %d at 0x%04X\\n", err, addr);\n}\n\n// LCD line callback — called for each scanline\nvoid lcd_draw_line(const uint_fast8_t line,\n                   const uint8_t *pixels) {\n  for (int x = 0; x < 160; x++) {\n    framebuf[line * 160 + x] = palette[pixels[x] & 3];\n  }\n}\n\n// Include Peanut-GB AFTER defining callbacks\n#define ENABLE_SOUND 0\n#define PEANUT_GB_HEADER_ONLY\n#include "peanut_gb.h"',
                language: 'C++',
                tip: '<strong>Tip:</strong> Peanut-GB is a header-only library. The callback functions must be defined <em>before</em> you <code>#include "peanut_gb.h"</code>. This is intentional &mdash; the header references your functions directly.'
            },
            {
                title: 'Load ROMs from SD Card',
                content: '<p>ROMs are loaded from the SD card into a dynamically allocated buffer. The ESP32 has limited RAM (about 300KB usable), so Game Boy ROMs (up to 2MB for MBC5 games, but typically 32KB-256KB for classic titles) fit comfortably.</p>' +
                         '<p>This function initializes the SD card, lists <code>.gb</code> files, and loads the first one found. Later you will add a file browser menu.</p>',
                code: 'const int SD_CS = 15;\n\nbool loadRom(const char *filename) {\n  Serial.printf("Loading ROM: %s\\n", filename);\n\n  File romFile = SD.open(filename, FILE_READ);\n  if (!romFile) {\n    Serial.println("ERROR: Cannot open ROM file");\n    return false;\n  }\n\n  size_t romSize = romFile.size();\n  Serial.printf("ROM size: %u bytes\\n", romSize);\n\n  // Allocate ROM buffer in PSRAM if available, else heap\n  rom = (uint8_t *)ps_malloc(romSize);\n  if (!rom) {\n    rom = (uint8_t *)malloc(romSize);\n  }\n  if (!rom) {\n    Serial.println("ERROR: Cannot allocate ROM buffer");\n    romFile.close();\n    return false;\n  }\n\n  size_t bytesRead = romFile.read(rom, romSize);\n  romFile.close();\n\n  Serial.printf("Read %u bytes\\n", bytesRead);\n  return bytesRead == romSize;\n}\n\nvoid listRoms() {\n  File root = SD.open("/");\n  Serial.println("=== ROMs on SD card ===");\n  while (File entry = root.openNextFile()) {\n    String name = entry.name();\n    if (name.endsWith(".gb") || name.endsWith(".GB")) {\n      Serial.printf("  %s (%u bytes)\\n", entry.name(),\n                     entry.size());\n    }\n    entry.close();\n  }\n  root.close();\n}\n\nvoid setup() {\n  Serial.begin(115200);\n\n  // Init SPI for TFT\n  tft.init();\n  tft.setRotation(1);\n  tft.fillScreen(TFT_BLACK);\n\n  // Init SD card on separate CS\n  if (!SD.begin(SD_CS)) {\n    Serial.println("ERROR: SD card init failed");\n    tft.drawString("No SD card!", 10, 10, 4);\n    while (1) delay(1000);\n  }\n  Serial.println("SD card initialized");\n\n  listRoms();\n\n  // Load first .gb file found\n  File root = SD.open("/");\n  while (File entry = root.openNextFile()) {\n    String name = entry.name();\n    if (name.endsWith(".gb") || name.endsWith(".GB")) {\n      char path[64];\n      snprintf(path, sizeof(path), "/%s", entry.name());\n      entry.close();\n      root.close();\n      if (loadRom(path)) {\n        Serial.println("ROM loaded successfully");\n        return;\n      }\n      break;\n    }\n    entry.close();\n  }\n  root.close();\n  Serial.println("ERROR: No .gb files found on SD");\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> Use legal homebrew ROMs for testing. Search for "Game Boy homebrew" &mdash; there are dozens of free, open-source games specifically made for the original Game Boy hardware. Tobu Tobu Girl and UCity are great test ROMs.'
            },
            {
                title: 'Wire and Read Buttons',
                content: '<p>The Game Boy has 8 inputs: D-pad (Up/Down/Left/Right), A, B, Start, Select. We are wiring 6 physical buttons (D-pad + A + B) and mapping Start/Select to button combos. Each button pulls its GPIO pin to GND when pressed.</p>',
                code: '// Button pins\nconst int BTN_UP    = 32;\nconst int BTN_DOWN  = 33;\nconst int BTN_LEFT  = 25;\nconst int BTN_RIGHT = 26;\nconst int BTN_A     = 27;\nconst int BTN_B     = 14;\n\nstruct ButtonState {\n  bool up, down, left, right, a, b, start, select;\n};\n\nButtonState buttons;\n\nvoid initButtons() {\n  pinMode(BTN_UP,    INPUT_PULLUP);\n  pinMode(BTN_DOWN,  INPUT_PULLUP);\n  pinMode(BTN_LEFT,  INPUT_PULLUP);\n  pinMode(BTN_RIGHT, INPUT_PULLUP);\n  pinMode(BTN_A,     INPUT_PULLUP);\n  pinMode(BTN_B,     INPUT_PULLUP);\n}\n\nvoid readButtons() {\n  buttons.up    = (digitalRead(BTN_UP)    == LOW);\n  buttons.down  = (digitalRead(BTN_DOWN)  == LOW);\n  buttons.left  = (digitalRead(BTN_LEFT)  == LOW);\n  buttons.right = (digitalRead(BTN_RIGHT) == LOW);\n  buttons.a     = (digitalRead(BTN_A)     == LOW);\n  buttons.b     = (digitalRead(BTN_B)     == LOW);\n  // Combos: A+B+UP = Start, A+B+DOWN = Select\n  buttons.start  = buttons.a && buttons.b && buttons.up;\n  buttons.select = buttons.a && buttons.b && buttons.down;\n}\n\n// Feed button state to Peanut-GB joypad register\nvoid updateJoypad(struct gb_s *gb) {\n  gb->direct.joypad_bits.a      = !buttons.a;\n  gb->direct.joypad_bits.b      = !buttons.b;\n  gb->direct.joypad_bits.up     = !buttons.up;\n  gb->direct.joypad_bits.down   = !buttons.down;\n  gb->direct.joypad_bits.left   = !buttons.left;\n  gb->direct.joypad_bits.right  = !buttons.right;\n  gb->direct.joypad_bits.start  = !buttons.start;\n  gb->direct.joypad_bits.select = !buttons.select;\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> Peanut-GB joypad bits are inverted: 0 = pressed, 1 = released. That is why we negate the button states with <code>!</code>.'
            },
            {
                title: 'Run the Emulator Loop',
                content: '<p>The main emulation loop runs one frame of Game Boy CPU instructions, then pushes the framebuffer to the display. The Game Boy runs at ~59.7 FPS, which the ESP32 at 240MHz can handle if the display transfer is fast enough.</p>' +
                         '<p>This is the final main loop that ties everything together:</p>',
                code: 'struct gb_s gb;\n\nvoid setup() {\n  Serial.begin(115200);\n\n  tft.init();\n  tft.setRotation(1);  // Landscape\n  tft.fillScreen(TFT_BLACK);\n\n  initButtons();\n\n  // Init SD and load ROM (from Step 3)\n  if (!SD.begin(SD_CS)) {\n    Serial.println("SD init failed");\n    while (1) delay(1000);\n  }\n\n  // Load first ROM (simplified — use file browser in production)\n  File root = SD.open("/");\n  while (File entry = root.openNextFile()) {\n    String name = entry.name();\n    if (name.endsWith(".gb")) {\n      char path[64];\n      snprintf(path, sizeof(path), "/%s", entry.name());\n      entry.close();\n      root.close();\n      loadRom(path);\n      break;\n    }\n    entry.close();\n  }\n\n  // Init Peanut-GB\n  enum gb_init_error_e ret = gb_init(&gb, &gb_rom_read,\n    &gb_cart_ram_read, &gb_cart_ram_write, &gb_error, NULL);\n\n  if (ret != GB_INIT_NO_ERROR) {\n    Serial.printf("GB init failed: %d\\n", ret);\n    while (1) delay(1000);\n  }\n\n  // Set LCD callback\n  gb_init_lcd(&gb, &lcd_draw_line);\n\n  // Calculate centered position for 160x144 on 320x240\n  Serial.println("Emulator running!");\n}\n\nvoid loop() {\n  // Read physical buttons\n  readButtons();\n  updateJoypad(&gb);\n\n  // Run one frame of emulation\n  gb_run_frame(&gb);\n\n  // Push framebuffer to TFT (centered, scaled 1x)\n  // Offset: (320-160)/2=80, (240-144)/2=48\n  tft.pushImage(80, 48, 160, 144, framebuf);\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> For 2x scaling (fills more of the screen), you would need to scale the 160x144 framebuffer to 320x288, which overflows the 240-tall display. A compromise is 1.5x scaling to 240x216 &mdash; but this requires per-pixel scaling which is slower. Start with 1x and optimize later.'
            },
            {
                title: 'Build a ROM File Browser',
                content: '<p>Instead of auto-loading the first ROM, build a simple menu that lists all <code>.gb</code> files on the SD card and lets the user scroll through and select one with the D-pad and A button.</p>',
                code: 'const int MAX_ROMS = 32;\nchar romNames[MAX_ROMS][32];\nint romCount = 0;\nint selectedRom = 0;\nint scrollOffset = 0;\nconst int VISIBLE_ROWS = 8;\n\nvoid scanRoms() {\n  romCount = 0;\n  File root = SD.open("/");\n  while (File entry = root.openNextFile()) {\n    String name = entry.name();\n    if ((name.endsWith(".gb") || name.endsWith(".GB"))\n        && romCount < MAX_ROMS) {\n      strncpy(romNames[romCount], entry.name(), 31);\n      romNames[romCount][31] = 0;\n      romCount++;\n    }\n    entry.close();\n  }\n  root.close();\n  Serial.printf("Found %d ROMs\\n", romCount);\n}\n\nvoid drawBrowser() {\n  tft.fillScreen(TFT_BLACK);\n\n  // Header\n  tft.setTextColor(TFT_GREEN);\n  tft.setTextFont(4);\n  tft.drawString("SELECT ROM", 10, 10);\n  tft.drawFastHLine(0, 38, 320, TFT_DARKGREY);\n\n  // ROM list\n  tft.setTextFont(2);\n  for (int i = 0; i < VISIBLE_ROWS && (i + scrollOffset) < romCount; i++) {\n    int idx = i + scrollOffset;\n    int y = 48 + i * 22;\n\n    if (idx == selectedRom) {\n      tft.fillRect(0, y - 2, 320, 20, tft.color565(0, 40, 0));\n      tft.setTextColor(TFT_WHITE);\n      tft.drawString(">", 6, y);\n    } else {\n      tft.setTextColor(TFT_LIGHTGREY);\n    }\n    tft.drawString(romNames[idx], 22, y);\n  }\n\n  // Footer\n  tft.setTextColor(TFT_DARKGREY);\n  tft.setTextFont(1);\n  char buf[32];\n  sprintf(buf, "%d / %d", selectedRom + 1, romCount);\n  tft.drawString(buf, 10, 225);\n}\n\n// Call from setup() before emulator init:\n// scanRoms();\n// drawBrowser();\n// Then in a loop, wait for selection:\n// while (!romSelected) {\n//   readButtons();\n//   if (buttons.down) { selectedRom = min(selectedRom+1, romCount-1); }\n//   if (buttons.up)   { selectedRom = max(selectedRom-1, 0); }\n//   if (selectedRom >= scrollOffset + VISIBLE_ROWS) scrollOffset++;\n//   if (selectedRom < scrollOffset) scrollOffset--;\n//   if (buttons.a) { romSelected = true; }\n//   drawBrowser();\n//   delay(150); // debounce\n// }\n// loadRom(romNames[selectedRom]);',
                language: 'C++',
                tip: '<strong>Tip:</strong> Format your SD card as FAT32 and keep ROM filenames short (8.3 format works best). Some SD libraries have issues with long filenames or nested directories on the ESP32.'
            },
            {
                title: 'Add Battery Power',
                content: '<p>To make the handheld truly portable, add a LiPo battery with a TP4056 charge controller. The TP4056 handles charging via micro-USB and provides over-discharge protection. Wire the output to the ESP32 VIN pin.</p>' +
                         '<p>You can also add a battery voltage monitor to display remaining charge on screen:</p>',
                code: '// Battery monitoring via voltage divider on ADC pin\n// Connect: BATT+ -> 100K -> GPIO34 -> 100K -> GND\n// This divides the voltage by 2 (3.7V LiPo reads as ~1.85V)\n\nconst int BATT_PIN = 34;\n\nfloat readBatteryVoltage() {\n  int raw = analogRead(BATT_PIN);\n  // ESP32 ADC: 0-4095 for 0-3.3V, times 2 for voltage divider\n  float voltage = (raw / 4095.0) * 3.3 * 2.0;\n  return voltage;\n}\n\nint batteryPercent(float voltage) {\n  // LiPo: 4.2V = 100%, 3.0V = 0%\n  if (voltage >= 4.2) return 100;\n  if (voltage <= 3.0) return 0;\n  return (int)((voltage - 3.0) / 1.2 * 100);\n}\n\nvoid drawBatteryIcon(int x, int y) {\n  float v = readBatteryVoltage();\n  int pct = batteryPercent(v);\n\n  // Battery outline\n  tft.drawRect(x, y, 24, 12, TFT_WHITE);\n  tft.fillRect(x + 24, y + 3, 3, 6, TFT_WHITE);\n\n  // Fill based on percentage\n  uint16_t color = TFT_GREEN;\n  if (pct < 20) color = TFT_RED;\n  else if (pct < 50) color = TFT_YELLOW;\n\n  int fillW = (int)(20 * pct / 100.0);\n  tft.fillRect(x + 2, y + 2, fillW, 8, color);\n}\n\n// Call drawBatteryIcon(290, 2) in the emulator loop\n// every ~60 frames (once per second) to avoid slowdown',
                language: 'C++',
                tip: '<strong>Tip:</strong> Never connect a LiPo battery directly without a charge controller. The TP4056 module costs less than a dollar and prevents over-charge, over-discharge, and short circuits. Always use one.'
            }
        ],

        testing: '<p>Test in stages to isolate problems:</p>' +
                 '<ul>' +
                 '<li><strong>Display only:</strong> Flash a simple TFT_eSPI example sketch (File &gt; Examples &gt; TFT_eSPI &gt; graphicstest). Verify colors and orientation before adding emulator code.</li>' +
                 '<li><strong>SD card:</strong> Flash an SD card test sketch that lists files. Verify your <code>.gb</code> files appear in the serial output.</li>' +
                 '<li><strong>Buttons:</strong> Write a test sketch that prints button states to Serial. Press each button and verify the correct GPIO goes LOW.</li>' +
                 '<li><strong>Emulator boot:</strong> With a known-good ROM, you should see the Nintendo logo scroll down on the TFT within 2 seconds of power-on. If the logo is garbled, check your <code>lcd_draw_line</code> callback.</li>' +
                 '<li><strong>Input test:</strong> Load a ROM that responds to D-pad (like Tetris) and verify all directional and A/B inputs register correctly. If inputs feel swapped, check your button wiring against the pin definitions.</li>' +
                 '<li><strong>Battery:</strong> Disconnect USB, power from battery only. The ESP32 should boot and run the emulator. Check that the battery percentage reads reasonably (near 100% when fully charged).</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Compile error: "gb_rom_read" not declared:</strong> The callback functions must be defined <em>before</em> <code>#include "peanut_gb.h"</code>. Move the include to the very end of your function definitions.</li>' +
                         '<li><strong>Screen shows garbage pixels:</strong> SPI frequency too high, or wrong pin assignments. Drop <code>SPI_FREQUENCY</code> to 27000000 and verify each pin matches your wiring.</li>' +
                         '<li><strong>SD card not detected:</strong> Check CS pin (GPIO15). Try a different SD card &mdash; some high-capacity (64GB+) cards have compatibility issues. Format as FAT32, not exFAT.</li>' +
                         '<li><strong>ROM loads but screen stays black:</strong> The emulator is probably running but <code>lcd_draw_line</code> is not being called. Verify you called <code>gb_init_lcd()</code> after <code>gb_init()</code>.</li>' +
                         '<li><strong>Emulation is too slow (low FPS):</strong> Make sure your ESP32 is running at 240MHz (<code>board_build.f_cpu = 240000000L</code>). Disable serial debug prints in the main loop. Use <code>pushImage()</code> for bulk pixel transfer instead of individual pixel writes.</li>' +
                         '<li><strong>Buttons not responding:</strong> Check pull-up resistors. If using <code>INPUT_PULLUP</code>, some ESP32 GPIOs (34, 35, 36, 39) do not have internal pull-ups &mdash; avoid these for buttons or add external 10K resistors.</li>' +
                         '<li><strong>Crash on ROM load "guru meditation error":</strong> ROM too large for available heap. Use <code>ps_malloc()</code> for PSRAM on ESP32-WROVER modules, or stick to smaller ROMs (&lt; 256KB) on WROOM modules.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Save States</strong> &mdash; Implement save/load state functionality. Dump the entire GB struct and RAM to the SD card as a binary file. Map save to a button combo (A+B+SELECT) and load to another (A+B+START). Name save files to match the ROM filename.</p>' +
                    '<p><strong>Challenge 2: Custom Shell Theme</strong> &mdash; Redesign the ROM browser with a custom color scheme, scrollbar, ROM preview (read the title from the ROM header at offset 0x134), and an animated background. Make it feel like a real handheld OS.</p>' +
                    '<p><strong>Challenge 3: Game Boy Color Support</strong> &mdash; Peanut-GB supports GBC with <code>#define ENABLE_LCD_COLOUR</code>. Enable it, update your <code>lcd_draw_line</code> callback to handle 15-bit color values, and convert them to RGB565 for the TFT. GBC games look dramatically better in color.</p>'
    },

    // ========================================================================
    // SG-28: RetroPie Emulation Station
    // ========================================================================
    'sg-28': {
        intro: '<p>RetroPie turns a Raspberry Pi into a multi-system emulation powerhouse. Underneath the polished EmulationStation frontend sits RetroArch &mdash; a unified emulator framework that can run NES, SNES, Genesis, Game Boy, PlayStation, N64, and dozens more systems, all from a single SD card.</p>' +
               '<p>This is not just a "flash and play" project. You will learn how EmulationStation discovers systems and ROMs, how RetroArch cores work, how to configure per-system shaders and aspect ratios, and how to customize the frontend to your liking. These are real Linux administration skills: editing config files, managing services, and working with the file system over SSH.</p>' +
               '<p>No wiring, no soldering. Flash the image, plug in controllers, and configure. This is the foundation for the arcade cabinet build in SG-30.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid-28" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="680" height="380" fill="url(#bg-grid-28)" rx="4"/>' +
            '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-28 SETUP &mdash; RETROPIE EMULATION STATION</text>' +

            '<!-- Raspberry Pi -->' +
            '<g>' +
            '<rect x="220" y="55" width="260" height="160" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="220" y="55" width="260" height="26" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="220" y="73" width="260" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="350" y="73" text-anchor="middle" fill="#22c55e" font-size="11" font-weight="600">Raspberry Pi 4</text>' +

            '<!-- Pi ports -->' +
            '<rect x="235" y="95" width="70" height="30" rx="4" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="270" y="107" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">HDMI x2</text>' +
            '<text x="270" y="119" text-anchor="middle" fill="#555" font-size="5">micro-HDMI</text>' +

            '<rect x="315" y="95" width="70" height="30" rx="4" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="350" y="107" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">USB x4</text>' +
            '<text x="350" y="119" text-anchor="middle" fill="#555" font-size="5">2x USB3, 2x USB2</text>' +

            '<rect x="395" y="95" width="70" height="30" rx="4" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
            '<text x="430" y="107" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="600">Ethernet</text>' +
            '<text x="430" y="119" text-anchor="middle" fill="#555" font-size="5">Gigabit</text>' +

            '<!-- SD card slot -->' +
            '<rect x="235" y="135" width="70" height="28" rx="4" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="270" y="148" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">microSD</text>' +
            '<text x="270" y="158" text-anchor="middle" fill="#555" font-size="5">RetroPie OS</text>' +

            '<!-- Power -->' +
            '<rect x="315" y="135" width="70" height="28" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="350" y="148" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">USB-C PWR</text>' +
            '<text x="350" y="158" text-anchor="middle" fill="#555" font-size="5">5V 3A</text>' +

            '<!-- Audio + WiFi -->' +
            '<rect x="395" y="135" width="70" height="28" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="430" y="148" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">3.5mm + BT</text>' +
            '<text x="430" y="158" text-anchor="middle" fill="#555" font-size="5">Audio out</text>' +

            '<!-- GPIO header -->' +
            '<rect x="235" y="175" width="230" height="22" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
            '<text x="350" y="189" text-anchor="middle" fill="#555" font-size="7">40-pin GPIO header (unused in base build)</text>' +
            '</g>' +

            '<!-- Connected devices -->' +

            '<!-- TV/Monitor -->' +
            '<g>' +
            '<rect x="40" y="55" width="140" height="85" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="55" width="140" height="22" rx="8" fill="rgba(59,130,246,0.1)"/>' +
            '<rect x="40" y="70" width="140" height="7" fill="rgba(59,130,246,0.1)"/>' +
            '<text x="110" y="70" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">TV / Monitor</text>' +
            '<rect x="60" y="88" width="100" height="36" rx="3" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.1)" stroke-width="0.5"/>' +
            '<text x="110" y="104" text-anchor="middle" fill="#3b82f6" font-size="7">HDMI input</text>' +
            '<text x="110" y="117" text-anchor="middle" fill="#555" font-size="6">1080p recommended</text>' +
            '</g>' +
            '<line x1="180" y1="97" x2="220" y2="97" stroke="#3b82f6" stroke-width="2.5" opacity="0.7"/>' +
            '<polygon points="218,93 224,97 218,101" fill="#3b82f6" opacity="0.7"/>' +
            '<text x="200" y="90" text-anchor="middle" fill="#3b82f6" font-size="6">HDMI</text>' +

            '<!-- USB Controller 1 -->' +
            '<g>' +
            '<rect x="520" y="55" width="140" height="70" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="520" y="55" width="140" height="22" rx="8" fill="rgba(168,85,247,0.1)"/>' +
            '<rect x="520" y="70" width="140" height="7" fill="rgba(168,85,247,0.1)"/>' +
            '<text x="590" y="70" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">USB Controller</text>' +
            '<text x="590" y="93" text-anchor="middle" fill="#555" font-size="7">Xbox / PS / generic</text>' +
            '<text x="590" y="106" text-anchor="middle" fill="#555" font-size="6">Plug and play</text>' +
            '</g>' +
            '<line x1="480" y1="107" x2="520" y2="90" stroke="#a855f7" stroke-width="2" opacity="0.7"/>' +
            '<polygon points="518,86 524,90 518,94" fill="#a855f7" opacity="0.7"/>' +
            '<text x="500" y="93" text-anchor="middle" fill="#a855f7" font-size="6">USB</text>' +

            '<!-- USB Controller 2 -->' +
            '<g>' +
            '<rect x="520" y="135" width="140" height="50" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<text x="590" y="158" text-anchor="middle" fill="#c084fc" font-size="8" opacity="0.6">Controller 2</text>' +
            '<text x="590" y="172" text-anchor="middle" fill="#555" font-size="6">Optional P2</text>' +
            '</g>' +
            '<line x1="480" y1="120" x2="520" y2="155" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +

            '<!-- Architecture layers -->' +
            '<rect x="40" y="240" width="620" height="140" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
            '<text x="60" y="260" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">SOFTWARE ARCHITECTURE</text>' +

            '<!-- Layer 1: EmulationStation -->' +
            '<rect x="55" y="270" width="190" height="50" rx="6" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.25)" stroke-width="1"/>' +
            '<text x="150" y="290" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">EmulationStation</text>' +
            '<text x="150" y="306" text-anchor="middle" fill="#555" font-size="7">Frontend / UI / ROM browser</text>' +

            '<!-- Layer 2: RetroArch -->' +
            '<rect x="255" y="270" width="190" height="50" rx="6" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.25)" stroke-width="1"/>' +
            '<text x="350" y="290" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="600">RetroArch</text>' +
            '<text x="350" y="306" text-anchor="middle" fill="#555" font-size="7">Emulator framework</text>' +

            '<!-- Layer 3: Cores -->' +
            '<rect x="455" y="270" width="190" height="50" rx="6" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.25)" stroke-width="1"/>' +
            '<text x="550" y="290" text-anchor="middle" fill="#fb923c" font-size="9" font-weight="600">Cores</text>' +
            '<text x="550" y="306" text-anchor="middle" fill="#555" font-size="7">nestopia, snes9x, mupen64</text>' +

            '<!-- Flow arrows -->' +
            '<line x1="245" y1="295" x2="253" y2="295" stroke="#555" stroke-width="1.5"/><polygon points="251,291 257,295 251,299" fill="#555"/>' +
            '<line x1="445" y1="295" x2="453" y2="295" stroke="#555" stroke-width="1.5"/><polygon points="451,291 457,295 451,299" fill="#555"/>' +

            '<!-- System badges -->' +
            '<text x="150" y="345" text-anchor="middle" fill="#555" font-size="6">NES / SNES / Genesis / GB / GBA / PSX / N64</text>' +
            '<text x="350" y="345" text-anchor="middle" fill="#555" font-size="6">Shaders / Save States / Rewind</text>' +
            '<text x="550" y="345" text-anchor="middle" fill="#555" font-size="6">Kiosk Mode / Netplay</text>' +

            '<!-- No soldering badge -->' +
            '<rect x="255" y="360" width="190" height="20" rx="4" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="350" y="374" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">NO WIRING &mdash; SOFTWARE ONLY</text>' +

            '</svg>' +
            '</div>',

        wiring: null,

        steps: [
            {
                title: 'Download and Flash RetroPie',
                content: '<p>Download the RetroPie image for your Pi model from <code>retropie.org.uk/download/</code>. Use the Raspberry Pi Imager (or balenaEtcher) to flash it to a 32GB+ microSD card.</p>' +
                         '<p>Insert the SD card into the Pi, connect HDMI to a display, plug in a USB controller, and power on. RetroPie will resize the partition on first boot &mdash; this takes about a minute.</p>',
                code: '# Download RetroPie image (from your PC)\n# Visit retropie.org.uk/download/ and get the Pi 4/400 image\n\n# Flash with Raspberry Pi Imager:\n# 1. Select "Use custom" and choose the downloaded .img.gz\n# 2. Select your SD card\n# 3. Click Write\n\n# Or flash from CLI with dd:\ngunzip retropie-buster-rpi4.img.gz\nsudo dd if=retropie-buster-rpi4.img of=/dev/sdX bs=4M status=progress\nsync',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Use a quality SD card (SanDisk Extreme or Samsung EVO). Cheap cards cause I/O errors and corrupted saves. A 32GB card is plenty; 64GB gives room to grow.'
            },
            {
                title: 'First Boot and Controller Setup',
                content: '<p>On first boot, EmulationStation immediately prompts you to configure a controller. Hold any button on your USB gamepad to begin, then map each input as prompted: D-pad, A, B, X, Y, L, R, Start, Select, and analog sticks.</p>' +
                         '<p>If you mess up a mapping, hold any button for a few seconds to skip, then re-run the configuration later from the RetroPie menu.</p>',
                code: '# To reconfigure controllers later:\n# Go to RetroPie menu > Configure Input\n\n# To edit controller mappings manually:\nnano /opt/retropie/configs/all/retroarch/autoconfig/YourController.cfg\n\n# To set up a second controller:\n# In EmulationStation, press Start > Configure Input\n# Press a button on the second controller to begin mapping\n\n# View connected controllers:\nls /dev/input/js*\n# Should show /dev/input/js0 and /dev/input/js1',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Xbox and PlayStation controllers work out of the box over USB. For Bluetooth, pair them from the RetroPie Bluetooth menu &mdash; but USB is more reliable and has zero input lag.'
            },
            {
                title: 'Enable SSH and Connect Remotely',
                content: '<p>You will want SSH access for file transfers and config editing. SSH is disabled by default on RetroPie. Enable it, then connect from your laptop.</p>',
                code: '# Enable SSH from RetroPie:\n# RetroPie menu > raspi-config > Interface Options > SSH > Enable\n\n# Or from a keyboard attached to the Pi, press F4 to exit\n# EmulationStation to the command line, then:\nsudo raspi-config\n# Navigate: Interface Options > SSH > Yes\n\n# Default credentials:\n# Username: pi\n# Password: raspberry\n\n# CHANGE THE DEFAULT PASSWORD:\npasswd\n\n# Connect from your laptop:\nssh pi@retropie.local\n# Or use the IP address:\nssh pi@192.168.1.XXX\n\n# Find the Pi IP from its terminal:\nhostname -I',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Change the default password immediately. Every RetroPie on the planet ships with the same <code>pi:raspberry</code> credentials. Anyone on your network could SSH in.'
            },
            {
                title: 'Understand the Emulator Architecture',
                content: '<p>RetroPie has three layers you need to understand:</p>' +
                         '<p><strong>EmulationStation</strong> is the graphical frontend &mdash; the menu system you see on screen. It reads <code>es_systems.cfg</code> to know which systems exist and where their ROMs live.</p>' +
                         '<p><strong>RetroArch</strong> is the emulation backend. It loads "cores" (individual emulators compiled as shared libraries) and provides a unified settings interface for all of them.</p>' +
                         '<p><strong>Cores</strong> are the actual emulators: <code>nestopia</code> for NES, <code>snes9x</code> for SNES, <code>genesis_plus_gx</code> for Genesis, etc.</p>',
                code: '# Key config files:\n\n# EmulationStation system definitions:\ncat /etc/emulationstation/es_systems.cfg\n\n# RetroArch main config:\ncat /opt/retropie/configs/all/retroarch.cfg\n\n# Per-system RetroArch overrides:\nls /opt/retropie/configs/\n# Shows: all/ nes/ snes/ megadrive/ gb/ gba/ psx/ n64/ ...\n\n# Each system folder has its own retroarch.cfg override:\ncat /opt/retropie/configs/nes/retroarch.cfg\n\n# ROM directories:\nls ~/RetroPie/roms/\n# Shows: nes/ snes/ megadrive/ gb/ gba/ psx/ n64/ ...\n\n# Installed cores:\nls /opt/retropie/libretrocores/\n\n# EmulationStation themes:\nls /etc/emulationstation/themes/',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Think of it like a web stack: EmulationStation is the frontend (React), RetroArch is the API server (Express), and cores are the database drivers (postgres, mysql). Each layer has its own config.'
            },
            {
                title: 'Add ROMs and Configure Systems',
                content: '<p>Transfer ROMs to the Pi over the network. RetroPie creates a Samba share automatically, or you can use SCP/SFTP over SSH. Place ROMs in the correct system directory and restart EmulationStation.</p>' +
                         '<p>Only use legal ROMs: homebrew games, public domain titles, or ROMs you have personally dumped from cartridges you own.</p>',
                code: '# Transfer ROMs via SCP from your laptop:\nscp ~/roms/nes/*.nes pi@retropie.local:~/RetroPie/roms/nes/\nscp ~/roms/snes/*.sfc pi@retropie.local:~/RetroPie/roms/snes/\nscp ~/roms/gb/*.gb pi@retropie.local:~/RetroPie/roms/gb/\n\n# Or via Samba share (from Windows/Mac file browser):\n# Navigate to: \\\\retropie\\roms\\ and drag files in\n\n# After adding ROMs, restart EmulationStation:\n# Press Start > Quit > Restart EmulationStation\n# Or from SSH:\nsudo systemctl restart emulationstation\n\n# Scrape game metadata (box art, descriptions):\n# RetroPie menu > Scraper\n# Select systems, choose ScreenScraper source, start\n\n# ROM file extensions by system:\n# NES:     .nes, .zip\n# SNES:    .smc, .sfc, .zip\n# Genesis: .md, .gen, .zip\n# GB/GBC:  .gb, .gbc, .zip\n# GBA:     .gba, .zip\n# PSX:     .bin/.cue, .iso, .pbp',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Compressed ROMs (.zip) work for most systems and save disk space. PSX games should be converted to .pbp format using PSX2PSP for smaller file sizes.'
            },
            {
                title: 'Configure Shaders and Display Settings',
                content: '<p>Shaders add visual effects that simulate the look of original CRT displays &mdash; scanlines, phosphor glow, and curvature. RetroArch has dozens of shader presets built in. Configure per-system settings so each console looks authentic.</p>',
                code: '# Launch a game, then open RetroArch menu:\n# (Default hotkey: Select + X, or F1 on keyboard)\n\n# Navigate to: Settings > Video > Shader\n# Load a shader preset:\n#   shaders_glsl/crt/crt-pi.glslp     (lightweight CRT, good for Pi)\n#   shaders_glsl/crt/crt-geom.glslp   (heavier, more realistic)\n#   shaders_glsl/handheld/lcd-grid.glslp  (for GB/GBA, mimics LCD)\n\n# Save as per-system preset:\n# Quick Menu > Shaders > Save > Save Core Preset\n\n# Set per-system aspect ratio in config files:\n# /opt/retropie/configs/nes/retroarch.cfg\naspect_ratio_index = "22"   # 4:3\nvideo_smooth = "false"      # Nearest-neighbor (sharp pixels)\n\n# /opt/retropie/configs/snes/retroarch.cfg\naspect_ratio_index = "22"   # 4:3\nvideo_smooth = "false"\n\n# /opt/retropie/configs/gb/retroarch.cfg\naspect_ratio_index = "23"   # Custom (10:9 for Game Boy)\ncustom_viewport_width = "480"\ncustom_viewport_height = "432"\nvideo_smooth = "false"\n\n# Enable integer scaling (prevents shimmer on pixel art):\nvideo_scale_integer = "true"',
                language: 'Bash',
                tip: '<strong>Tip:</strong> <code>crt-pi</code> is specifically optimized for the Raspberry Pi GPU. It looks great and runs at full speed. Heavier shaders like <code>crt-geom</code> may cause frame drops on older Pi models.'
            },
            {
                title: 'Install and Customize Themes',
                content: '<p>EmulationStation themes control the entire look of the menu system &mdash; backgrounds, fonts, system logos, and layout. Install community themes for a professional look.</p>',
                code: '# Install themes from RetroPie Setup:\nsudo ~/RetroPie-Setup/retropie_setup.sh\n# Navigate: Configuration / tools > esthemes\n# Browse and install themes\n\n# Popular themes:\n# - art-book         (clean, minimalist, box art focused)\n# - carbon           (default, reliable)\n# - comic-book       (bold, colorful)\n# - nso-menu         (Nintendo Switch Online style)\n# - epic-noir        (dark, cinematic)\n\n# Set active theme:\n# EmulationStation > Start > UI Settings > Theme Set\n\n# Theme files live at:\nls /etc/emulationstation/themes/\n\n# Customize a theme (example: change background):\n# Copy the theme to edit:\ncp -r /etc/emulationstation/themes/carbon \\\n      /etc/emulationstation/themes/carbon-custom\n\n# Edit the XML:\nnano /etc/emulationstation/themes/carbon-custom/theme.xml',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Set Up Save States, Rewind, and Network Transfer',
                content: '<p>Configure quality-of-life features: auto-save on exit so you never lose progress, rewind to undo mistakes in real time, and network ROM transfer for easy management.</p>',
                code: '# Edit the global RetroArch config:\nnano /opt/retropie/configs/all/retroarch.cfg\n\n# Auto-save state on exit, auto-load on launch:\nsavestate_auto_save = "true"\nsavestate_auto_load = "true"\n\n# Enable rewind (press and hold a button to go backward):\nrewind_enable = "true"\nrewind_buffer_size = "20"     # MB of rewind buffer\nrewind_granularity = "2"      # Frames between snapshots\n# Map rewind to a button in:\n# Quick Menu > Controls > Rewind = (choose a button)\n\n# Note: Rewind uses CPU. Disable for PSX/N64 if performance drops.\n\n# Enable RetroAchievements (optional, needs free account):\n# retropie.org.uk/docs/RetroAchievements/\ncheevos_enable = "true"\ncheevos_username = "your_username"\ncheevos_password = "your_password"\n\n# Set up WiFi for network ROM transfer:\nsudo raspi-config\n# System Options > Wireless LAN\n# Enter your WiFi SSID and password\n\n# Verify network:\nping -c 3 google.com',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Rewind is a game-changer for difficult retro games. It does use extra CPU, so disable it for systems that already run near full speed (N64, PSX). For 8-bit and 16-bit systems, it runs flawlessly.'
            }
        ],

        testing: '<p>Verify each stage:</p>' +
                 '<ul>' +
                 '<li><strong>First boot:</strong> EmulationStation loads and you see the controller configuration prompt. If you see a command line instead, EmulationStation failed to start &mdash; check <code>~/.emulationstation/es_log.txt</code>.</li>' +
                 '<li><strong>Controller:</strong> After mapping, navigate the EmulationStation menu with D-pad and A/B. If buttons feel wrong, re-map via Start &gt; Configure Input.</li>' +
                 '<li><strong>SSH:</strong> From your laptop, <code>ssh pi@retropie.local</code> should connect. If <code>.local</code> does not resolve, use the IP address directly.</li>' +
                 '<li><strong>ROMs:</strong> After adding ROMs and restarting, system entries (NES, SNES, etc.) should appear in the EmulationStation menu. If a system does not appear, it has no ROMs in its directory &mdash; check file extensions.</li>' +
                 '<li><strong>Gameplay:</strong> Launch a game. It should boot in under 5 seconds. Audio should play through HDMI. No visual glitches or slowdown on NES/SNES/Genesis.</li>' +
                 '<li><strong>Shaders:</strong> Open the RetroArch menu mid-game (Select+X) and load a CRT shader. You should see scanline effects immediately. Save as core preset to persist.</li>' +
                 '<li><strong>Save states:</strong> Save state (Select+R1 by default), quit the game, re-launch. The save state should auto-load and resume exactly where you left off.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Black screen on boot:</strong> Bad SD flash. Re-flash the image, or try a different SD card. Verify the image checksum if available.</li>' +
                         '<li><strong>EmulationStation does not start:</strong> Check <code>~/.emulationstation/es_log.txt</code>. Common cause: corrupted theme. Reset with <code>rm -rf ~/.emulationstation/themes/</code> and reboot.</li>' +
                         '<li><strong>No audio:</strong> Force HDMI audio: <code>sudo raspi-config</code> &gt; System Options &gt; Audio &gt; HDMI. Or edit <code>/boot/config.txt</code> and add <code>hdmi_drive=2</code>.</li>' +
                         '<li><strong>Controller not detected:</strong> Check <code>ls /dev/input/js*</code>. If nothing appears, the controller is not recognized. Try a different USB port or controller. Generic controllers may need custom mappings.</li>' +
                         '<li><strong>N64 games run slow:</strong> N64 emulation is demanding. Use the <code>mupen64plus-gles2rice</code> core for best performance. Lower resolution in RetroArch if needed. Some games will never run full speed on a Pi 4.</li>' +
                         '<li><strong>PSX games do not boot:</strong> PSX requires BIOS files. Place <code>SCPH1001.BIN</code> in <code>~/RetroPie/BIOS/</code> (lowercase filename). You must dump this from your own PlayStation.</li>' +
                         '<li><strong>ROMs do not appear:</strong> Check file extensions match what <code>es_systems.cfg</code> expects. Filenames with special characters can cause issues. Rename to simple alphanumeric names.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Custom Splash Screen</strong> &mdash; Replace the default RetroPie splash video with your own. Create a 1080p MP4 or PNG and place it in <code>/home/pi/RetroPie/splashscreens/</code>. Configure in RetroPie Setup &gt; Splash Screens. Make it match your aesthetic.</p>' +
                    '<p><strong>Challenge 2: Kiosk Mode</strong> &mdash; Lock down the system for public use: hide the RetroPie menu, disable settings access, and auto-launch into a specific system. Set <code>UIMode</code> to "kiosk" in EmulationStation settings. This is essential for the arcade cabinet build (SG-30).</p>' +
                    '<p><strong>Challenge 3: Netplay</strong> &mdash; Set up RetroArch netplay for online multiplayer. Configure in Quick Menu &gt; Netplay. One Pi hosts, the other joins. Test with a two-player SNES game over your LAN. Requires both players to have identical ROMs and core versions.</p>'
    },

    // ========================================================================
    // SG-29: USB Arcade Controller Build
    // ========================================================================
    'sg-29': {
        intro: '<p>The Arduino Pro Micro is secretly one of the most powerful boards in the Arduino lineup &mdash; not because of its processor speed, but because the ATmega32U4 chip has native USB. It does not need a USB-to-serial converter like the Uno or Mega. It <em>is</em> the USB device. That means you can program it to appear as a keyboard, mouse, or &mdash; in our case &mdash; a game controller.</p>' +
               '<p>In this project you will build a custom USB arcade fight stick: a Sanwa-style joystick with 8 full-size arcade buttons, all connected to a Pro Micro that presents itself to any computer as a standard USB gamepad. No drivers, no configuration software. Plug it in and it works on Windows, Mac, Linux, and RetroPie.</p>' +
               '<p>This is the bridge between electronics and real hardware fabrication. You will wire microswitches, crimp spade connectors, drill a mounting panel, and produce a finished product you can use for competitive gaming.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid-29" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="680" height="380" fill="url(#bg-grid-29)" rx="4"/>' +
            '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-29 WIRING &mdash; USB ARCADE CONTROLLER</text>' +

            '<!-- Arduino Pro Micro -->' +
            '<g>' +
            '<rect x="40" y="55" width="160" height="300" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="55" width="160" height="26" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="73" width="160" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="120" y="73" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">Pro Micro</text>' +
            '<text x="120" y="90" text-anchor="middle" fill="#555" font-size="7">ATmega32U4 &mdash; Native USB</text>' +

            '<!-- USB port -->' +
            '<rect x="85" y="42" width="70" height="16" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="120" y="53" text-anchor="middle" fill="#666" font-size="7">micro-USB</text>' +

            '<!-- GND pin -->' +
            '<circle cx="180" cy="112" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="60" y="115" fill="#888" font-size="8">GND</text>' +

            '<!-- Direction pins -->' +
            '<text x="55" y="140" fill="#555" font-size="7" font-weight="600">Joystick:</text>' +
            '<circle cx="180" cy="152" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="60" y="155" fill="#22c55e" font-size="8">D2</text>' +
            '<circle cx="180" cy="170" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="60" y="173" fill="#22c55e" font-size="8">D3</text>' +
            '<circle cx="180" cy="188" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="60" y="191" fill="#22c55e" font-size="8">D4</text>' +
            '<circle cx="180" cy="206" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="60" y="209" fill="#22c55e" font-size="8">D5</text>' +

            '<!-- Button pins -->' +
            '<text x="55" y="232" fill="#555" font-size="7" font-weight="600">Buttons:</text>' +
            '<circle cx="180" cy="244" r="4" fill="#f97316" stroke="#fdba74" stroke-width="0.5"/><text x="60" y="247" fill="#f97316" font-size="8">D6</text>' +
            '<circle cx="180" cy="260" r="4" fill="#f97316" stroke="#fdba74" stroke-width="0.5"/><text x="60" y="263" fill="#f97316" font-size="8">D7</text>' +
            '<circle cx="180" cy="276" r="4" fill="#f97316" stroke="#fdba74" stroke-width="0.5"/><text x="60" y="279" fill="#f97316" font-size="8">D8</text>' +
            '<circle cx="180" cy="292" r="4" fill="#f97316" stroke="#fdba74" stroke-width="0.5"/><text x="60" y="295" fill="#f97316" font-size="8">D9</text>' +
            '<circle cx="180" cy="308" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/><text x="60" y="311" fill="#eab308" font-size="8">D10</text>' +
            '<circle cx="180" cy="324" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/><text x="60" y="327" fill="#eab308" font-size="8">D14</text>' +
            '<circle cx="180" cy="340" r="4" fill="#a855f7" stroke="#c084fc" stroke-width="0.5"/><text x="60" y="343" fill="#a855f7" font-size="8">D15</text>' +
            '<circle cx="180" cy="356" r="4" fill="#a855f7" stroke="#c084fc" stroke-width="0.5"/><text x="60" y="359" fill="#a855f7" font-size="8">D16</text>' +
            '</g>' +

            '<!-- GND Bus -->' +
            '<line x1="184" y1="112" x2="640" y2="112" stroke="#888" stroke-width="2.5" opacity="0.6"/>' +
            '<text x="640" y="108" text-anchor="end" fill="#888" font-size="7" font-weight="600">GND BUS (daisy-chain)</text>' +

            '<!-- Joystick -->' +
            '<g>' +
            '<rect x="280" y="130" width="160" height="120" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="280" y="130" width="160" height="22" rx="8" fill="rgba(34,197,94,0.1)"/>' +
            '<rect x="280" y="146" width="160" height="6" fill="rgba(34,197,94,0.1)"/>' +
            '<text x="360" y="146" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">Sanwa Joystick</text>' +

            '<!-- Joystick visual -->' +
            '<circle cx="360" cy="200" r="28" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="1"/>' +
            '<circle cx="360" cy="200" r="10" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +

            '<!-- Direction labels -->' +
            '<text x="360" y="170" text-anchor="middle" fill="#4ade80" font-size="6">UP</text>' +
            '<text x="360" y="238" text-anchor="middle" fill="#4ade80" font-size="6">DOWN</text>' +
            '<text x="318" y="203" text-anchor="middle" fill="#4ade80" font-size="6">L</text>' +
            '<text x="402" y="203" text-anchor="middle" fill="#4ade80" font-size="6">R</text>' +
            '</g>' +

            '<!-- Wires to joystick -->' +
            '<line x1="184" y1="152" x2="280" y2="165" stroke="#22c55e" stroke-width="2" opacity="0.6"/>' +
            '<line x1="184" y1="170" x2="280" y2="185" stroke="#22c55e" stroke-width="2" opacity="0.6"/>' +
            '<line x1="184" y1="188" x2="280" y2="205" stroke="#22c55e" stroke-width="2" opacity="0.6"/>' +
            '<line x1="184" y1="206" x2="280" y2="225" stroke="#22c55e" stroke-width="2" opacity="0.6"/>' +

            '<!-- GND drop to joystick -->' +
            '<line x1="360" y1="130" x2="360" y2="112" stroke="#888" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.5"/>' +

            '<!-- Arcade Buttons -->' +
            '<g>' +
            '<rect x="490" y="130" width="170" height="230" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="490" y="130" width="170" height="22" rx="8" fill="rgba(249,115,22,0.1)"/>' +
            '<rect x="490" y="146" width="170" height="6" fill="rgba(249,115,22,0.1)"/>' +
            '<text x="575" y="146" text-anchor="middle" fill="#fb923c" font-size="9" font-weight="600">8 Arcade Buttons</text>' +

            '<!-- Button grid -->' +
            '<circle cx="530" cy="178" r="14" fill="rgba(249,115,22,0.1)" stroke="#f97316" stroke-width="1"/><text x="530" y="181" text-anchor="middle" fill="#fb923c" font-size="7">X</text>' +
            '<circle cx="570" cy="178" r="14" fill="rgba(249,115,22,0.1)" stroke="#f97316" stroke-width="1"/><text x="570" y="181" text-anchor="middle" fill="#fb923c" font-size="7">A</text>' +
            '<circle cx="610" cy="178" r="14" fill="rgba(249,115,22,0.1)" stroke="#f97316" stroke-width="1"/><text x="610" y="181" text-anchor="middle" fill="#fb923c" font-size="7">B</text>' +
            '<circle cx="530" cy="218" r="14" fill="rgba(249,115,22,0.1)" stroke="#f97316" stroke-width="1"/><text x="530" y="221" text-anchor="middle" fill="#fb923c" font-size="7">Y</text>' +
            '<circle cx="570" cy="218" r="14" fill="rgba(234,179,8,0.1)" stroke="#eab308" stroke-width="1"/><text x="570" y="221" text-anchor="middle" fill="#eab308" font-size="7">LB</text>' +
            '<circle cx="610" cy="218" r="14" fill="rgba(234,179,8,0.1)" stroke="#eab308" stroke-width="1"/><text x="610" y="221" text-anchor="middle" fill="#eab308" font-size="7">RB</text>' +

            '<!-- Start/Select -->' +
            '<rect x="520" y="252" width="50" height="22" rx="4" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="545" y="266" text-anchor="middle" fill="#a855f7" font-size="7">Start</text>' +
            '<rect x="580" y="252" width="50" height="22" rx="4" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="605" y="266" text-anchor="middle" fill="#a855f7" font-size="7">Select</text>' +

            '<!-- Wiring note -->' +
            '<text x="575" y="300" text-anchor="middle" fill="#555" font-size="6">Each: NO &rarr; GPIO</text>' +
            '<text x="575" y="312" text-anchor="middle" fill="#555" font-size="6">COM &rarr; GND bus</text>' +
            '<text x="575" y="330" text-anchor="middle" fill="#555" font-size="6">0.110" spade connectors</text>' +
            '<text x="575" y="345" text-anchor="middle" fill="#555" font-size="6">or solder</text>' +
            '</g>' +

            '<!-- Wires to buttons -->' +
            '<line x1="184" y1="244" x2="516" y2="178" stroke="#f97316" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="184" y1="260" x2="556" y2="178" stroke="#f97316" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="184" y1="276" x2="596" y2="178" stroke="#f97316" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="184" y1="292" x2="516" y2="218" stroke="#f97316" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="184" y1="308" x2="556" y2="218" stroke="#eab308" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="184" y1="324" x2="596" y2="218" stroke="#eab308" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="184" y1="340" x2="545" y2="252" stroke="#a855f7" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="184" y1="356" x2="605" y2="252" stroke="#a855f7" stroke-width="1.5" opacity="0.5"/>' +

            '<!-- GND drops to buttons -->' +
            '<line x1="575" y1="130" x2="575" y2="112" stroke="#888" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.5"/>' +

            '<!-- USB output label -->' +
            '<rect x="240" y="280" width="200" height="50" rx="6" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="340" y="300" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">USB HID Gamepad</text>' +
            '<text x="340" y="316" text-anchor="middle" fill="#555" font-size="7">No drivers &mdash; plug and play on any OS</text>' +

            '<!-- Arrow from Pro Micro USB to label -->' +
            '<line x1="120" y1="48" x2="120" y2="38" stroke="#3b82f6" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="120" y1="38" x2="340" y2="38" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4,3" opacity="0.3"/>' +
            '<line x1="340" y1="38" x2="340" y2="280" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4,3" opacity="0.3"/>' +

            '<!-- INPUT_PULLUP badge -->' +
            '<rect x="240" y="345" width="200" height="24" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="340" y="361" text-anchor="middle" fill="#4ade80" font-size="8">INPUT_PULLUP &mdash; no resistors needed</text>' +

            '</svg>' +
            '</div>',

        wiring: '    Arduino Pro Micro (ATmega32U4)\n' +
                '    +-------------------+\n' +
                '    |              GND  |---[Common ground bus]--+\n' +
                '    |                   |                        |\n' +
                '    |  Joystick (5-pin harness):                 |\n' +
                '    |              D2   |---[UP microswitch]-----+\n' +
                '    |              D3   |---[DOWN microswitch]---+\n' +
                '    |              D4   |---[LEFT microswitch]---+\n' +
                '    |              D5   |---[RIGHT microswitch]--+\n' +
                '    |                   |                        |\n' +
                '    |  Arcade buttons:  |                        |\n' +
                '    |              D6   |---[Button 1 / X]-------+\n' +
                '    |              D7   |---[Button 2 / A]-------+\n' +
                '    |              D8   |---[Button 3 / B]-------+\n' +
                '    |              D9   |---[Button 4 / Y]-------+\n' +
                '    |              D10  |---[Button 5 / LB]------+\n' +
                '    |              D14  |---[Button 6 / RB]------+\n' +
                '    |              D15  |---[Button 7 / Start]---+\n' +
                '    |              D16  |---[Button 8 / Select]--+\n' +
                '    +-------------------+\n' +
                '\n' +
                '    All switches: One terminal to GPIO, other terminal to GND.\n' +
                '    Internal pull-ups enabled (INPUT_PULLUP) — no resistors.\n' +
                '\n' +
                '    Joystick microswitches have spade connectors (0.187").\n' +
                '    Arcade buttons have built-in microswitches with\n' +
                '    two spade terminals each (NO + COM).\n' +
                '    Connect COM to GND bus, NO to GPIO pin.',

        wiringNotes: '<p><strong>Joystick wiring:</strong> A Sanwa-style joystick has 4 microswitches (one per direction) plus a common ground. The 5-pin wiring harness connects all four signal wires and one ground. Each microswitch closes when the stick is pushed in that direction.</p>' +
                     '<p><strong>Arcade buttons:</strong> Each button has a built-in microswitch with two terminals: COM (common) and NO (normally open). Wire COM to the GND bus and NO to the Pro Micro GPIO pin. When pressed, the switch closes and pulls the pin LOW.</p>' +
                     '<p><strong>Spade connectors:</strong> Use 0.187" (4.8mm) spade connectors for joystick microswitches and 0.110" (2.8mm) for button microswitches. Crimp them onto 22AWG stranded wire. Soldering is also fine if you do not have a crimp tool.</p>' +
                     '<p><strong>Ground bus:</strong> Run a single ground wire with a daisy-chain of spade connectors to all switch COM terminals. This simplifies wiring significantly &mdash; you only need one GND wire from the Pro Micro instead of one per switch.</p>',

        steps: [
            {
                title: 'Install the Arduino Joystick Library',
                content: '<p>The Arduino Joystick Library by Matthew Heironimus makes the Pro Micro appear as a standard USB gamepad. Install it from the Arduino IDE Library Manager or download from GitHub.</p>' +
                         '<p>Go to <strong>Sketch &gt; Include Library &gt; Manage Libraries</strong>, search for <strong>"Joystick"</strong> by Matthew Heironimus, and install it.</p>' +
                         '<p>Select <strong>Arduino Leonardo</strong> as your board (the Pro Micro uses the same ATmega32U4 chip). Select the correct COM port.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> The Pro Micro shows up as "Arduino Leonardo" in the boards list. If the port disappears after upload, quickly double-press the reset button on the Pro Micro to enter bootloader mode &mdash; the port will reappear for about 8 seconds.'
            },
            {
                title: 'Configure the Joystick as a USB Gamepad',
                content: '<p>The Joystick library lets you define exactly what your controller reports to the host computer: number of buttons, axes, hat switch, etc. We configure it as a standard gamepad with 8 buttons and a digital hat switch for the joystick directions.</p>',
                code: '#include <Joystick.h>\n\n// Create joystick instance:\n// Type: Gamepad, Button count: 8, Hat switch: yes\n// No analog axes (all digital)\nJoystick_ Joystick(\n  JOYSTICK_DEFAULT_REPORT_ID,  // HID report ID\n  JOYSTICK_TYPE_GAMEPAD,       // Device type\n  8,                           // Button count\n  1,                           // Hat switch count\n  false, false, false,         // No X, Y, Z axes\n  false, false, false,         // No Rx, Ry, Rz\n  false, false,                // No rudder, throttle\n  false, false, false          // No accelerator, brake, steering\n);\n\nvoid setup() {\n  Joystick.begin(false);  // false = don\'t auto-send reports\n  Serial.begin(9600);\n  Serial.println("SG-29: USB Arcade Controller");\n}\n\nvoid loop() {\n  // Read inputs, update Joystick state\n  // ... (next steps)\n\n  Joystick.sendState();  // Send USB HID report\n  delay(1);              // 1ms poll rate (1000Hz)\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> Setting <code>begin(false)</code> disables auto-send. This lets you batch all your button updates and send one USB report per frame instead of one per button change &mdash; much more efficient.'
            },
            {
                title: 'Wire the Joystick Microswitches',
                content: '<p>The joystick has 4 internal microswitches. Each one closes when you push the stick in that direction. Connect each signal wire to a GPIO pin and the common wire to GND. Enable internal pull-ups so the pins read HIGH when idle and LOW when a direction is pressed.</p>',
                code: '// Joystick direction pins\nconst int PIN_UP    = 2;\nconst int PIN_DOWN  = 3;\nconst int PIN_LEFT  = 4;\nconst int PIN_RIGHT = 5;\n\nvoid setup() {\n  // Set direction pins as inputs with pull-ups\n  pinMode(PIN_UP,    INPUT_PULLUP);\n  pinMode(PIN_DOWN,  INPUT_PULLUP);\n  pinMode(PIN_LEFT,  INPUT_PULLUP);\n  pinMode(PIN_RIGHT, INPUT_PULLUP);\n\n  Joystick.begin(false);\n}\n\nvoid updateHatSwitch() {\n  bool up    = (digitalRead(PIN_UP)    == LOW);\n  bool down  = (digitalRead(PIN_DOWN)  == LOW);\n  bool left  = (digitalRead(PIN_LEFT)  == LOW);\n  bool right = (digitalRead(PIN_RIGHT) == LOW);\n\n  // Hat switch uses angles: 0=up, 90=right, 180=down, 270=left\n  // Diagonals: 45=up-right, 135=down-right, 225=down-left, 315=up-left\n  // -1 = centered (no direction)\n  int angle = -1;\n\n  if (up && right)       angle = 45;\n  else if (up && left)   angle = 315;\n  else if (down && right) angle = 135;\n  else if (down && left)  angle = 225;\n  else if (up)           angle = 0;\n  else if (right)        angle = 90;\n  else if (down)         angle = 180;\n  else if (left)         angle = 270;\n\n  Joystick.setHatSwitch(0, angle);\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> The hat switch approach is better than using axes for arcade sticks because it gives crisp digital directions. No dead zones, no analog drift &mdash; just 8 directions plus neutral.'
            },
            {
                title: 'Wire and Map 8 Arcade Buttons',
                content: '<p>Connect each of the 8 arcade buttons to a GPIO pin. The button microswitch COM terminal goes to the GND bus, and the NO terminal connects to the GPIO. When pressed, the pin goes LOW.</p>',
                code: '// Button pin mapping\nconst int BUTTON_PINS[] = {6, 7, 8, 9, 10, 14, 15, 16};\nconst int NUM_BUTTONS = 8;\n\n// Button names for reference:\n// Pin 6  = Button 0 (X)      Pin 10 = Button 4 (LB)\n// Pin 7  = Button 1 (A)      Pin 14 = Button 5 (RB)\n// Pin 8  = Button 2 (B)      Pin 15 = Button 6 (Start)\n// Pin 9  = Button 3 (Y)      Pin 16 = Button 7 (Select)\n\nvoid setupButtons() {\n  for (int i = 0; i < NUM_BUTTONS; i++) {\n    pinMode(BUTTON_PINS[i], INPUT_PULLUP);\n  }\n}\n\nvoid updateButtons() {\n  for (int i = 0; i < NUM_BUTTONS; i++) {\n    bool pressed = (digitalRead(BUTTON_PINS[i]) == LOW);\n    Joystick.setButton(i, pressed);\n  }\n}',
                language: 'C++',
                tip: null
            },
            {
                title: 'Complete Controller Code',
                content: '<p>Here is the complete, ready-to-upload sketch that combines joystick directions (hat switch) and 8 buttons into a single USB gamepad. Upload this and your controller is functional.</p>',
                code: '#include <Joystick.h>\n\n// === Pin Definitions ===\n// Joystick directions\nconst int PIN_UP    = 2;\nconst int PIN_DOWN  = 3;\nconst int PIN_LEFT  = 4;\nconst int PIN_RIGHT = 5;\n\n// Arcade buttons\nconst int BUTTON_PINS[] = {6, 7, 8, 9, 10, 14, 15, 16};\nconst int NUM_BUTTONS = 8;\n\n// === Joystick HID Configuration ===\nJoystick_ Joystick(\n  JOYSTICK_DEFAULT_REPORT_ID,\n  JOYSTICK_TYPE_GAMEPAD,\n  8,     // 8 buttons\n  1,     // 1 hat switch\n  false, false, false,\n  false, false, false,\n  false, false,\n  false, false, false\n);\n\nvoid setup() {\n  // Direction pins\n  pinMode(PIN_UP,    INPUT_PULLUP);\n  pinMode(PIN_DOWN,  INPUT_PULLUP);\n  pinMode(PIN_LEFT,  INPUT_PULLUP);\n  pinMode(PIN_RIGHT, INPUT_PULLUP);\n\n  // Button pins\n  for (int i = 0; i < NUM_BUTTONS; i++) {\n    pinMode(BUTTON_PINS[i], INPUT_PULLUP);\n  }\n\n  Joystick.begin(false);\n}\n\nvoid loop() {\n  // --- Read joystick directions ---\n  bool up    = (digitalRead(PIN_UP)    == LOW);\n  bool down  = (digitalRead(PIN_DOWN)  == LOW);\n  bool left  = (digitalRead(PIN_LEFT)  == LOW);\n  bool right = (digitalRead(PIN_RIGHT) == LOW);\n\n  // Convert to hat switch angle\n  int hat = -1;\n  if (up && right)       hat = 45;\n  else if (up && left)   hat = 315;\n  else if (down && right) hat = 135;\n  else if (down && left)  hat = 225;\n  else if (up)           hat = 0;\n  else if (right)        hat = 90;\n  else if (down)         hat = 180;\n  else if (left)         hat = 270;\n\n  Joystick.setHatSwitch(0, hat);\n\n  // --- Read buttons ---\n  for (int i = 0; i < NUM_BUTTONS; i++) {\n    Joystick.setButton(i, digitalRead(BUTTON_PINS[i]) == LOW);\n  }\n\n  // --- Send USB report ---\n  Joystick.sendState();\n  delay(1);  // 1000Hz polling\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> The 1ms delay gives a 1000Hz polling rate &mdash; faster than any commercial controller. Most games poll at 60-120Hz, so you have more than enough headroom. If you want to reduce USB traffic, increase the delay to 4ms (250Hz), which is still excellent.'
            },
            {
                title: 'Test with a Gamepad Tester',
                content: '<p>Before mounting everything in a panel, test the controller. Plug the Pro Micro into your computer via USB. The OS should detect it as a gamepad immediately &mdash; no drivers needed.</p>',
                code: '# === Testing on different platforms ===\n\n# Windows:\n# Open "Set up USB game controllers" (joy.cpl)\n# Your device should appear as "Arduino Leonardo"\n# Click Properties > Test tab to see button/axis inputs\n\n# Linux:\n# Install jstest-gtk or use CLI:\nsudo apt install joystick\njstest /dev/input/js0\n# Press each button and direction — you should see values change\n\n# Mac:\n# Use a web-based tester:\n# Open https://gamepad-tester.com in Chrome\n# Press buttons and move the stick — inputs show in real time\n\n# RetroPie:\n# Just plug it in and configure in EmulationStation\n# Start > Configure Input > hold a button on the arcade stick',
                language: 'Bash',
                tip: '<strong>Tip:</strong> If the controller is not detected at all, the Pro Micro may be in a bad state. Double-press the reset button quickly to enter bootloader mode, then re-upload the sketch within 8 seconds.'
            },
            {
                title: 'Add LED Button Lighting',
                content: '<p>Arcade buttons with built-in LEDs are common and inexpensive. Since we have used 12 of the Pro Micro\'s GPIO pins for inputs, we can use the remaining pins (A0, A1, A2, A3) to drive LED strips or individual LEDs inside the buttons.</p>' +
                         '<p>For simplicity, wire all button LEDs in parallel to a single pin so they all light up together. For individual control, use a shift register (74HC595) to expand your outputs.</p>',
                code: '// Simple: all LEDs on one pin\nconst int LED_PIN = A0;  // Pin 18 on Pro Micro\n\nvoid setup() {\n  // ... existing setup code ...\n  pinMode(LED_PIN, OUTPUT);\n  digitalWrite(LED_PIN, HIGH);  // LEDs on at startup\n}\n\n// Reactive lighting: flash on button press\nvoid updateLEDs() {\n  bool anyPressed = false;\n  for (int i = 0; i < NUM_BUTTONS; i++) {\n    if (digitalRead(BUTTON_PINS[i]) == LOW) {\n      anyPressed = true;\n      break;\n    }\n  }\n  // Pulse effect: dim when idle, bright on press\n  if (anyPressed) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    // Breathing effect when idle\n    int brightness = (millis() / 4) % 512;\n    if (brightness > 255) brightness = 511 - brightness;\n    analogWrite(LED_PIN, brightness);\n  }\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> LED arcade buttons come in two types: 5V (connect directly) and 12V (need a separate power supply). For the Pro Micro, use 5V LEDs. Check the current draw &mdash; the Pro Micro can source about 40mA per pin, 200mA total.'
            },
            {
                title: 'Add Rapid-Fire Mode',
                content: '<p>Rapid-fire (also called turbo or autofire) automatically presses a button at high speed while you hold it. This is a classic arcade controller feature. Hold Select + a button to toggle rapid-fire for that button.</p>',
                code: '// Rapid-fire state\nbool rapidFire[NUM_BUTTONS] = {false};\nunsigned long lastToggle = 0;\nconst int RAPID_FIRE_HZ = 15;  // Presses per second\n\nvoid updateButtonsWithRapidFire() {\n  bool selectHeld = (digitalRead(BUTTON_PINS[7]) == LOW);  // Button 7 = Select\n\n  for (int i = 0; i < NUM_BUTTONS; i++) {\n    bool pressed = (digitalRead(BUTTON_PINS[i]) == LOW);\n\n    // Toggle rapid-fire: hold Select + press button\n    if (selectHeld && pressed && i != 7) {\n      if (millis() - lastToggle > 300) {  // Debounce\n        rapidFire[i] = !rapidFire[i];\n        lastToggle = millis();\n      }\n    }\n\n    if (pressed && rapidFire[i]) {\n      // Oscillate at RAPID_FIRE_HZ\n      bool on = (millis() % (1000 / RAPID_FIRE_HZ))\n                < (500 / RAPID_FIRE_HZ);\n      Joystick.setButton(i, on);\n    } else {\n      Joystick.setButton(i, pressed);\n    }\n  }\n}\n\n// Replace updateButtons() call in loop() with:\n// updateButtonsWithRapidFire();',
                language: 'C++',
                tip: '<strong>Tip:</strong> 15Hz is a good starting point for rapid-fire. Some shmups (shoot-em-ups) benefit from faster rates up to 30Hz. Too fast and some games will only register every other press.'
            }
        ],

        testing: '<p>Test methodically:</p>' +
                 '<ul>' +
                 '<li><strong>USB detection:</strong> Plug in the Pro Micro. Your OS should detect a new game controller. On Windows, check Device Manager &gt; Human Interface Devices. On Linux, check <code>ls /dev/input/js*</code>.</li>' +
                 '<li><strong>Each direction:</strong> Push the joystick in all 8 directions (4 cardinal + 4 diagonal). Each should register correctly in a gamepad tester. If up and down are swapped, swap the wires on pins 2 and 3.</li>' +
                 '<li><strong>Each button:</strong> Press each of the 8 buttons individually. Each should light up as a different button number (0-7) in the tester. If two buttons register the same number, check for a wiring short between those GPIO pins.</li>' +
                 '<li><strong>No ghost inputs:</strong> With nothing pressed, all buttons and directions should read as released. If you see phantom presses, you have a floating pin &mdash; check that all switches connect to GND properly.</li>' +
                 '<li><strong>LED test:</strong> Buttons should light up. If LEDs are dim, check the current rating. If LEDs do not light at all, verify polarity (anode to pin, cathode to GND).</li>' +
                 '<li><strong>Rapid-fire test:</strong> Hold Select + Button 1 to toggle rapid-fire. Then hold Button 1 alone &mdash; it should pulse rapidly in the gamepad tester. Toggle off with Select + Button 1 again.</li>' +
                 '<li><strong>In-game test:</strong> Launch a fighting game or platformer on RetroPie and play. Inputs should feel responsive with no perceptible lag.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Controller not detected at all:</strong> Double-press the Pro Micro reset button to enter bootloader, then re-upload within 8 seconds. If it still fails, you may have a counterfeit ATmega32U4 &mdash; check the chip markings.</li>' +
                         '<li><strong>Detected but no inputs register:</strong> Check that <code>Joystick.begin(false)</code> is called in setup and <code>Joystick.sendState()</code> is called in loop. Without <code>sendState()</code>, no USB reports are sent.</li>' +
                         '<li><strong>Directions are wrong or swapped:</strong> Your joystick wiring does not match the pin definitions. Either swap wires or change the pin constants in code. The joystick orientation depends on which way you mount it.</li>' +
                         '<li><strong>Ghost inputs (buttons press themselves):</strong> Floating pins. Make sure every switch has one terminal to the GPIO pin and the other to GND. If a wire came loose from the GND bus, that pin will float and read randomly.</li>' +
                         '<li><strong>Buttons register but feel laggy:</strong> Remove any <code>delay()</code> calls longer than 1ms from the loop. Also remove <code>Serial.println()</code> calls &mdash; serial output in the main loop adds latency.</li>' +
                         '<li><strong>Pro Micro bricked (no port appears):</strong> This is usually recoverable. Short the RST pin to GND twice quickly to force bootloader mode. Upload a basic sketch (like Blink) to restore normal operation.</li>' +
                         '<li><strong>Windows sees it as "Arduino Leonardo" not "Arcade Controller":</strong> The device name is baked into the USB descriptor in the Arduino core. You can change it by editing <code>boards.txt</code> in the Arduino hardware folder, but it is purely cosmetic &mdash; the controller works regardless of the name.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Analog Stick Mode</strong> &mdash; Add a toggle (hold Start + Select for 3 seconds) that switches the joystick from hat switch mode to analog X/Y axis mode. Some games and emulators expect analog input. Report the joystick as X/Y axes with values of -127, 0, or 127 for digital directions.</p>' +
                    '<p><strong>Challenge 2: Button Remapping</strong> &mdash; Store button mappings in EEPROM so they persist across power cycles. Add a remap mode (hold Start + Select + A for 5 seconds) where pressing a physical button then pressing a virtual button number assigns the mapping. Read mappings from EEPROM on boot.</p>' +
                    '<p><strong>Challenge 3: Tournament Lock</strong> &mdash; Add a physical switch (toggle or key switch) that disables rapid-fire, macros, and button remapping. When the lock is engaged, the controller operates in pure stock mode &mdash; required for tournament play. Wire the switch to the remaining free GPIO pin.</p>'
    },

    // ========================================================================
    // SG-30: Mini Arcade Cabinet
    // ========================================================================
    'sg-30': {
        intro: '<p>This is the capstone of the Arcade Ops track &mdash; a complete tabletop arcade cabinet with a 7-inch display, full-size joystick and buttons, stereo speakers, LED marquee, and hundreds of games running on RetroPie. Everything you learned in SG-26 through SG-29 comes together here.</p>' +
               '<p>The cabinet uses a bartop form factor: compact enough for a desk or shelf, but with full-size arcade controls. The zero-delay USB encoder handles all button inputs (no coding needed for the controls), the Pi runs RetroPie, and the display connects via HDMI.</p>' +
               '<p>This is the most physically involved build in The Signal &mdash; you will cut panels, mount hardware, run wires, and assemble a finished product.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid-30" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="680" height="380" fill="url(#bg-grid-30)" rx="4"/>' +
            '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-30 WIRING &mdash; MINI ARCADE CABINET INTERNALS</text>' +

            '<!-- Cabinet outline -->' +
            '<rect x="160" y="45" width="380" height="300" rx="10" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            '<text x="350" y="58" text-anchor="middle" fill="#444" font-size="8" letter-spacing="0.1em">CABINET ENCLOSURE</text>' +

            '<!-- LED Marquee -->' +
            '<rect x="200" y="65" width="300" height="30" rx="5" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
            '<circle cx="220" cy="80" r="4" fill="#ef4444" opacity="0.4"/><circle cx="240" cy="80" r="4" fill="#f97316" opacity="0.4"/>' +
            '<circle cx="260" cy="80" r="4" fill="#eab308" opacity="0.4"/><circle cx="280" cy="80" r="4" fill="#22c55e" opacity="0.4"/>' +
            '<circle cx="300" cy="80" r="4" fill="#3b82f6" opacity="0.4"/><circle cx="320" cy="80" r="4" fill="#a855f7" opacity="0.4"/>' +
            '<circle cx="340" cy="80" r="4" fill="#ef4444" opacity="0.4"/><circle cx="360" cy="80" r="4" fill="#f97316" opacity="0.4"/>' +
            '<circle cx="380" cy="80" r="4" fill="#eab308" opacity="0.4"/><circle cx="400" cy="80" r="4" fill="#22c55e" opacity="0.4"/>' +
            '<circle cx="420" cy="80" r="4" fill="#3b82f6" opacity="0.4"/><circle cx="440" cy="80" r="4" fill="#a855f7" opacity="0.4"/>' +
            '<circle cx="460" cy="80" r="4" fill="#ef4444" opacity="0.4"/><circle cx="480" cy="80" r="4" fill="#f97316" opacity="0.4"/>' +
            '<text x="350" y="83" text-anchor="middle" fill="#e6edf3" font-size="7" font-weight="600">WS2812B LED MARQUEE</text>' +

            '<!-- 7" Display -->' +
            '<rect x="230" y="100" width="240" height="90" rx="6" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="230" y="100" width="240" height="20" rx="6" fill="rgba(59,130,246,0.1)"/>' +
            '<rect x="230" y="114" width="240" height="6" fill="rgba(59,130,246,0.1)"/>' +
            '<text x="350" y="114" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">7" IPS Display</text>' +
            '<rect x="250" y="128" width="200" height="50" rx="3" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.1)" stroke-width="0.5"/>' +
            '<text x="350" y="152" text-anchor="middle" fill="#3b82f6" font-size="8" opacity="0.6">1024 x 600</text>' +
            '<text x="350" y="165" text-anchor="middle" fill="#555" font-size="6">HDMI input + 5V barrel</text>' +

            '<!-- Control panel area -->' +
            '<rect x="185" y="200" width="330" height="65" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
            '<text x="350" y="215" text-anchor="middle" fill="#555" font-size="7" letter-spacing="0.08em">CONTROL PANEL</text>' +

            '<!-- Joystick -->' +
            '<circle cx="250" cy="240" r="18" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<circle cx="250" cy="240" r="7" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<text x="250" y="215" text-anchor="middle" fill="#22c55e" font-size="6">STICK</text>' +

            '<!-- Buttons -->' +
            '<circle cx="320" cy="232" r="10" fill="rgba(249,115,22,0.1)" stroke="#f97316" stroke-width="0.8"/>' +
            '<circle cx="345" cy="228" r="10" fill="rgba(249,115,22,0.1)" stroke="#f97316" stroke-width="0.8"/>' +
            '<circle cx="370" cy="228" r="10" fill="rgba(249,115,22,0.1)" stroke="#f97316" stroke-width="0.8"/>' +
            '<circle cx="320" cy="252" r="10" fill="rgba(234,179,8,0.1)" stroke="#eab308" stroke-width="0.8"/>' +
            '<circle cx="345" cy="248" r="10" fill="rgba(234,179,8,0.1)" stroke="#eab308" stroke-width="0.8"/>' +
            '<circle cx="370" cy="248" r="10" fill="rgba(234,179,8,0.1)" stroke="#eab308" stroke-width="0.8"/>' +

            '<!-- Start/Select -->' +
            '<circle cx="430" cy="235" r="6" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="430" y="237" text-anchor="middle" fill="#a855f7" font-size="4">ST</text>' +
            '<circle cx="450" cy="235" r="6" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="450" y="237" text-anchor="middle" fill="#a855f7" font-size="4">SE</text>' +

            '<!-- Internal components -->' +

            '<!-- Raspberry Pi -->' +
            '<g>' +
            '<rect x="40" y="90" width="100" height="70" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="40" y="90" width="100" height="18" rx="6" fill="rgba(34,197,94,0.1)"/>' +
            '<rect x="40" y="103" width="100" height="5" fill="rgba(34,197,94,0.1)"/>' +
            '<text x="90" y="103" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">RPi 4</text>' +
            '<text x="90" y="120" text-anchor="middle" fill="#555" font-size="6">RetroPie</text>' +
            '<text x="90" y="132" text-anchor="middle" fill="#555" font-size="6">HDMI + USB + GPIO</text>' +
            '<text x="90" y="147" text-anchor="middle" fill="#555" font-size="5">3.5mm audio out</text>' +
            '</g>' +

            '<!-- Zero-Delay Encoder -->' +
            '<g>' +
            '<rect x="40" y="195" width="100" height="55" rx="6" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="40" y="195" width="100" height="18" rx="6" fill="rgba(249,115,22,0.1)"/>' +
            '<rect x="40" y="208" width="100" height="5" fill="rgba(249,115,22,0.1)"/>' +
            '<text x="90" y="208" text-anchor="middle" fill="#fb923c" font-size="8" font-weight="600">Zero-Delay</text>' +
            '<text x="90" y="226" text-anchor="middle" fill="#555" font-size="6">USB Encoder</text>' +
            '<text x="90" y="238" text-anchor="middle" fill="#555" font-size="6">Screw terminals</text>' +
            '</g>' +

            '<!-- PAM8403 Amp -->' +
            '<g>' +
            '<rect x="40" y="280" width="100" height="55" rx="6" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="40" y="280" width="100" height="18" rx="6" fill="rgba(168,85,247,0.1)"/>' +
            '<rect x="40" y="293" width="100" height="5" fill="rgba(168,85,247,0.1)"/>' +
            '<text x="90" y="293" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="600">PAM8403</text>' +
            '<text x="90" y="312" text-anchor="middle" fill="#555" font-size="6">Stereo amplifier</text>' +
            '<text x="90" y="324" text-anchor="middle" fill="#555" font-size="6">3.5mm in, 2x spkr</text>' +
            '</g>' +

            '<!-- Speakers -->' +
            '<rect x="185" y="278" width="70" height="40" rx="4" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="220" y="295" text-anchor="middle" fill="#c084fc" font-size="7">SPK L</text>' +
            '<text x="220" y="310" text-anchor="middle" fill="#555" font-size="5">8 ohm</text>' +
            '<rect x="265" y="278" width="70" height="40" rx="4" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="300" y="295" text-anchor="middle" fill="#c084fc" font-size="7">SPK R</text>' +
            '<text x="300" y="310" text-anchor="middle" fill="#555" font-size="5">8 ohm</text>' +

            '<!-- Connection lines -->' +

            '<!-- Pi HDMI to display -->' +
            '<line x1="140" y1="110" x2="230" y2="135" stroke="#3b82f6" stroke-width="2" opacity="0.7"/>' +
            '<text x="185" y="118" text-anchor="middle" fill="#3b82f6" font-size="6">HDMI</text>' +

            '<!-- Pi USB to encoder -->' +
            '<line x1="90" y1="160" x2="90" y2="195" stroke="#f97316" stroke-width="2" opacity="0.7"/>' +
            '<text x="110" y="180" fill="#fb923c" font-size="6">USB</text>' +

            '<!-- Encoder to controls -->' +
            '<line x1="140" y1="222" x2="250" y2="222" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +

            '<!-- Pi audio to amp -->' +
            '<line x1="70" y1="160" x2="70" y2="280" stroke="#a855f7" stroke-width="1.5" opacity="0.5"/>' +
            '<text x="55" y="230" fill="#c084fc" font-size="5" transform="rotate(-90,55,230)">3.5mm</text>' +

            '<!-- Amp to speakers -->' +
            '<line x1="140" y1="300" x2="185" y2="298" stroke="#c084fc" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="140" y1="310" x2="265" y2="298" stroke="#c084fc" stroke-width="1.5" opacity="0.5"/>' +

            '<!-- Pi GPIO to LEDs -->' +
            '<line x1="140" y1="100" x2="160" y2="100" stroke="#ef4444" stroke-width="1" opacity="0.4"/>' +
            '<line x1="160" y1="80" x2="200" y2="80" stroke="#ef4444" stroke-width="1.5" opacity="0.5"/>' +
            '<line x1="160" y1="80" x2="160" y2="100" stroke="#ef4444" stroke-width="1" opacity="0.4"/>' +
            '<text x="170" y="70" fill="#ef4444" font-size="5">GPIO 18</text>' +

            '<!-- Power Supply -->' +
            '<g>' +
            '<rect x="555" y="80" width="120" height="265" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.2)" stroke-width="1"/>' +
            '<text x="615" y="100" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">5V 5A PSU</text>' +
            '<text x="615" y="115" text-anchor="middle" fill="#555" font-size="7">Single power source</text>' +

            '<!-- Power distribution -->' +
            '<rect x="570" y="130" width="90" height="26" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="615" y="140" text-anchor="middle" fill="#fca5a5" font-size="7">USB-C</text>' +
            '<text x="615" y="151" text-anchor="middle" fill="#555" font-size="5">Pi (3A)</text>' +

            '<rect x="570" y="162" width="90" height="26" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="615" y="172" text-anchor="middle" fill="#fca5a5" font-size="7">Barrel 5V</text>' +
            '<text x="615" y="183" text-anchor="middle" fill="#555" font-size="5">Display</text>' +

            '<rect x="570" y="194" width="90" height="26" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="615" y="204" text-anchor="middle" fill="#fca5a5" font-size="7">Screw 5V</text>' +
            '<text x="615" y="215" text-anchor="middle" fill="#555" font-size="5">Amp</text>' +

            '<rect x="570" y="226" width="90" height="26" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="615" y="236" text-anchor="middle" fill="#fca5a5" font-size="7">Screw 5V</text>' +
            '<text x="615" y="247" text-anchor="middle" fill="#555" font-size="5">LEDs</text>' +

            '<!-- Capacitor -->' +
            '<rect x="575" y="262" width="80" height="22" rx="3" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="615" y="276" text-anchor="middle" fill="#eab308" font-size="6">1000uF cap</text>' +

            '<!-- Power lines -->' +
            '<line x1="555" y1="143" x2="140" y2="120" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
            '<line x1="555" y1="175" x2="470" y2="155" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
            '<line x1="555" y1="207" x2="140" y2="300" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" opacity="0.3"/>' +
            '<line x1="555" y1="239" x2="500" y2="80" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" opacity="0.3"/>' +

            '<!-- Kiosk badge -->' +
            '<text x="615" y="310" text-anchor="middle" fill="#555" font-size="6">Kiosk mode</text>' +
            '<text x="615" y="325" text-anchor="middle" fill="#555" font-size="6">Attract screensaver</text>' +
            '<text x="615" y="340" text-anchor="middle" fill="#555" font-size="6">Auto-boot</text>' +
            '</g>' +

            '<!-- Vent note -->' +
            '<text x="350" y="360" text-anchor="middle" fill="#555" font-size="7">Back panel: ventilation holes + optional 40mm fan</text>' +
            '<text x="350" y="375" text-anchor="middle" fill="#555" font-size="7">Cabinet: 300mm W x 350mm D x 400mm H (MDF or acrylic)</text>' +

            '</svg>' +
            '</div>',

        wiring: '    Mini Arcade Cabinet — Internal Wiring\n' +
                '    +------------------------------------------+\n' +
                '    |  LED Marquee Strip (WS2812B)             |\n' +
                '    |  +---------+                             |\n' +
                '    |  | 7" HDMI |  <--HDMI cable-->  Pi HDMI  |\n' +
                '    |  | Display |                             |\n' +
                '    |  +---------+                             |\n' +
                '    |                                          |\n' +
                '    |  Joystick + 8 Buttons                    |\n' +
                '    |  \\--- all to Zero-Delay USB Encoder ---/ |\n' +
                '    |       \\--- USB cable --> Pi USB          |\n' +
                '    |                                          |\n' +
                '    |  Speakers (2x) --> PAM8403 Amp           |\n' +
                '    |       \\--- 3.5mm audio --> Pi headphone  |\n' +
                '    |                                          |\n' +
                '    |  WS2812B data --> Pi GPIO 18 (PWM)       |\n' +
                '    |                                          |\n' +
                '    |  5V PSU --> splitter:                     |\n' +
                '    |    --> Pi (USB-C)                         |\n' +
                '    |    --> Display (5V barrel)                |\n' +
                '    |    --> PAM8403 (5V)                       |\n' +
                '    |    --> WS2812B (5V)                       |\n' +
                '    +------------------------------------------+',

        wiringNotes: '<p><strong>Zero-delay encoder:</strong> Pre-made PCB that connects arcade buttons and joystick via screw terminals, outputs USB. No programming needed &mdash; appears as a standard USB gamepad.</p>' +
                     '<p><strong>Power distribution:</strong> Use a 5V 5A power supply. Split with a wiring harness: USB-C for Pi (3A), barrel for display, screw terminals for amp and LEDs. Add a 1000&micro;F capacitor across the WS2812B power input.</p>' +
                     '<p><strong>Display:</strong> The 7" HDMI IPS display has a driver board with HDMI input and 5V power. Mount the screen from behind the cabinet panel.</p>',

        steps: [
            {
                title: 'Design and Cut the Cabinet Panels',
                content: '<p>The bartop cabinet needs 6 panels: two sides, top, bottom, back (with ventilation holes), and a front control panel. Use 6mm MDF or 5mm acrylic. Approximate dimensions: 300mm wide x 350mm deep x 400mm tall.</p>' +
                         '<p>Cut a 170mm x 110mm display cutout, 30mm holes for action buttons, and 24mm holes for start/select. The control panel tilts 10-15 degrees for ergonomic play.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> Search for "bartop arcade plans" online for free printable templates. Scale to match your display size. The Instructables and RetroPie forums have well-tested designs with exact measurements.'
            },
            {
                title: 'Mount Display, Controls, and Encoder',
                content: '<p>Mount the 7" display behind the cutout. Install the joystick on the control panel underside (shaft through a 25mm hole). Snap buttons into their holes. Connect all buttons and joystick to the zero-delay encoder via its screw terminals.</p>',
                code: '# Configure display resolution on the Pi:\nsudo nano /boot/config.txt\n\n# Add:\nhdmi_force_hotplug=1\nhdmi_group=2\nhdmi_mode=87\nhdmi_cvt 1024 600 60 6 0 0 0\nhdmi_drive=2\n\n# Verify encoder is recognized:\nlsusb\n# Should show: "DragonRise Inc. Generic USB Joystick"\n\n# Test all inputs:\nsudo apt install joystick\njstest /dev/input/js0',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Test the display BEFORE mounting permanently. Connect HDMI and power, verify the image fills the screen with correct aspect ratio. Adjust <code>hdmi_cvt</code> if needed.'
            },
            {
                title: 'Wire Audio System',
                content: '<p>Connect the Pi 3.5mm audio output to the PAM8403 amplifier input. Wire two small speakers to the amp\'s left and right outputs. Power the amp from the 5V supply.</p>',
                code: '# Force audio to 3.5mm jack:\namixer cset numid=3 1  # 1=headphone, 2=HDMI\n\n# Set volume:\nalsamixer\n# Arrow keys to adjust (70-80% recommended)\n# Esc to exit\n\n# Test both channels:\nspeaker-test -c2 -t wav\n\n# Save volume setting:\nsudo alsactl store',
                language: 'Bash',
                tip: '<strong>Tip:</strong> If you hear buzzing/hum, it is ground loop noise from the shared power supply. Add a 3.5mm ground loop isolator ($5) between Pi and amp.'
            },
            {
                title: 'Add LED Marquee with WS2812B',
                content: '<p>Mount a WS2812B LED strip behind the marquee panel. Control it from GPIO 18 (hardware PWM). The script runs on boot for constant ambient lighting.</p>',
                code: '# Install NeoPixel library:\nsudo pip3 install rpi_ws281x adafruit-circuitpython-neopixel\n\n# Save as /home/pi/marquee.py:\nimport board\nimport neopixel\nimport time\nimport math\n\nNUM_LEDS = 20\nstrip = neopixel.NeoPixel(board.D18, NUM_LEDS, brightness=0.5, auto_write=False)\n\ndef wheel(pos):\n    if pos < 85:\n        return (pos * 3, 255 - pos * 3, 0)\n    elif pos < 170:\n        pos -= 85\n        return (255 - pos * 3, 0, pos * 3)\n    else:\n        pos -= 170\n        return (0, pos * 3, 255 - pos * 3)\n\ndef rainbow_cycle(wait=0.02):\n    for j in range(255):\n        for i in range(NUM_LEDS):\n            idx = (i * 256 // NUM_LEDS) + j\n            strip[i] = wheel(idx & 255)\n        strip.show()\n        time.sleep(wait)\n\ndef pulse_cyan(speed=0.05):\n    for i in range(100):\n        val = int(((math.sin(i * 0.1) + 1) / 2) * 255)\n        strip.fill((0, val, val))\n        strip.show()\n        time.sleep(speed)\n\nwhile True:\n    rainbow_cycle()\n    pulse_cyan()',
                language: 'Python',
                tip: '<strong>Tip:</strong> GPIO 18 uses hardware PWM &mdash; the only pin that reliably drives WS2812B without flicker. Run with <code>sudo</code> (NeoPixel needs root for DMA). Add a 330&Omega; resistor on the data line.'
            },
            {
                title: 'Configure RetroPie for Arcade Mode',
                content: '<p>Set up auto-boot, kiosk mode, attract screensaver, and the LED marquee autostart. This turns the Pi into a dedicated arcade appliance.</p>',
                code: '# Auto-start marquee LEDs on boot:\nsudo nano /etc/rc.local\n# Add before "exit 0":\nsudo python3 /home/pi/marquee.py &\n\n# Enable kiosk mode (hides settings menu):\nnano ~/.emulationstation/es_settings.cfg\n# Set: <string name="UIMode" value="kiosk" />\n# Escape: press up up down down left right left right\n\n# Configure attract mode screensaver:\n# RetroPie > EmulationStation settings\n# Screensaver: "Video" or "Slideshow"\n# Timeout: 120 seconds\n# Screensaver behavior: "random video"\n\n# Optional: coin sound on boot\n# Place coin.wav in /home/pi/\n# Add to /etc/rc.local:\naplay /home/pi/coin.wav &',
                language: 'Bash',
                tip: '<strong>Tip:</strong> The kiosk mode escape sequence (up up down down left right left right) is a Konami code. Memorize it &mdash; it is the only way back to settings once kiosk mode is active.'
            },
            {
                title: 'Final Assembly',
                content: '<p>Assemble all panels with wood glue and screws (for MDF) or acrylic cement (for acrylic). Route cables neatly with zip ties. Secure the Pi and display driver board with standoffs or Velcro. Cut ventilation holes in the back panel and optionally mount a small 40mm fan.</p>' +
                         '<p>For cabinet art: design side panels and a marquee header in your preferred style. Print on vinyl adhesive and apply. For a professional finish, apply clear coat over the MDF before mounting art.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> Use Velcro or standoffs (not hot glue) for the Pi and encoder board. You will need to remove them eventually for maintenance, SD card swaps, or upgrades. Leave the back panel removable (screws, not glue) for cable access.'
            }
        ],

        testing: '<p>Test each subsystem before final assembly:</p>' +
                 '<ul>' +
                 '<li><strong>Display:</strong> 1024x600 resolution, no overscan or black bars. Image is crisp.</li>' +
                 '<li><strong>Controls:</strong> All 8 buttons and 4 joystick directions register in <code>jstest</code>. No stuck or ghost inputs.</li>' +
                 '<li><strong>Audio:</strong> <code>speaker-test</code> plays from both speakers. In-game audio works at good volume.</li>' +
                 '<li><strong>LED marquee:</strong> Rainbow cycle runs on boot. No flickering or dead LEDs.</li>' +
                 '<li><strong>Games:</strong> Test one game per system (NES, SNES, Genesis). Controls, audio, and video all work.</li>' +
                 '<li><strong>Kiosk mode:</strong> Settings hidden. Konami code restores access.</li>' +
                 '<li><strong>Power:</strong> Single cable powers everything. No undervoltage warnings during gameplay.</li>' +
                 '<li><strong>Thermals:</strong> Run a demanding game for 30 minutes. Check <code>vcgencmd measure_temp</code> stays under 80C.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Display is blank:</strong> Check HDMI cable and display power. Verify <code>/boot/config.txt</code> settings. Try a different HDMI cable.</li>' +
                         '<li><strong>Buttons not responding:</strong> Check encoder USB connection (<code>lsusb</code>). Verify button wires are in correct screw terminals (signal + ground).</li>' +
                         '<li><strong>Audio hum/buzz:</strong> Ground loop. Add a ground loop isolator or use separate power supplies for Pi and amp.</li>' +
                         '<li><strong>LEDs flicker or wrong colors:</strong> Use GPIO 18 only. Add 330&Omega; data resistor and 1000&micro;F power capacitor. Must run with <code>sudo</code>.</li>' +
                         '<li><strong>Pi overheats in cabinet:</strong> Cut ventilation holes in back panel. Add a 40mm fan. Apply heatsink to SoC. Monitor with <code>vcgencmd measure_temp</code>.</li>' +
                         '<li><strong>Power supply insufficient:</strong> Pi (3A) + display (0.5A) + amp (0.5A) + LEDs (1A) = 5A minimum. Use a 5V 6A supply for headroom. Lightning bolt icon = undervoltage.</li>' +
                         '<li><strong>Cabinet panels do not align:</strong> Sand edges for tight fits. Use corner clamps during gluing. Test-fit all panels dry before applying glue. Small gaps can be filled with wood filler.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Custom Cabinet Art</strong> &mdash; Design side panels, marquee header, and a screen bezel in the Hexworth aesthetic &mdash; dark navy, neon cyan, circuit-board motifs. Print on vinyl adhesive and apply. Add clear coat for durability.</p>' +
                    '<p><strong>Challenge 2: Coin Mechanism</strong> &mdash; Add a coin acceptor ($10 from AliExpress). Wire its signal to a GPIO pin. Write a Python daemon that counts coin insertions and gates game launches &mdash; EmulationStation only starts games when credits are available.</p>' +
                    '<p><strong>Challenge 3: Play Stats Dashboard</strong> &mdash; Write a background script that monitors RetroArch save states and logs: total play time per game, most-played games, and session counts. Display on a small OLED mounted on the cabinet side, or serve as a web page accessible over WiFi.</p>'
    }

};
