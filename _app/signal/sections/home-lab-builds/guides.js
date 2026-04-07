// ============================================================================
// Signal Home Lab Builds — Build Guides (sg-43 through sg-52)
// Raspberry Pi infrastructure projects for cybersecurity students
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-43: Raspberry Pi Headless Setup
    // ========================================================================
    'sg-43': {
        intro: '<p>Every home lab starts here. A Raspberry Pi running headless &mdash; no monitor, no keyboard, just SSH over the network &mdash; is the foundation for every server project that follows. This is how real servers operate: you never see a screen, you never touch a keyboard. You connect remotely and manage everything through the terminal.</p>' +
               '<p>In this project you will flash Raspberry Pi OS to a microSD card, pre-configure WiFi and SSH before the first boot, power on the Pi, find its IP address on your network, and connect via SSH. By the end, you will have a working Linux server on your desk that you can reach from any device in your home.</p>' +
               '<p>This is the same workflow used to provision cloud servers, deploy IoT devices, and set up network appliances. The only difference is the hardware is in your hands instead of a data center.</p>',

        wiring: '    Your Computer              Raspberry Pi 4/5\n' +
                '    +----------------+         +------------------+\n' +
                '    |                |         |                  |\n' +
                '    | SD Card Reader |         |  microSD slot    |\n' +
                '    |   [write OS]   |-------->|  [boot from SD]  |\n' +
                '    |                |         |                  |\n' +
                '    +----------------+         |  Ethernet port   |\n' +
                '                               |  [connect to     |\n' +
                '    Your Router/Switch          |   switch/router] |\n' +
                '    +----------------+         |                  |\n' +
                '    |  LAN port      |<------->|  USB-C power     |\n' +
                '    |                |  CAT6   |  [5V 3A supply]  |\n' +
                '    +----------------+         +------------------+\n' +
                '\n' +
                '    No monitor, no keyboard, no mouse.\n' +
                '    Everything happens over the network via SSH.',

        wiringNotes: '<p><strong>Power:</strong> Use the official Raspberry Pi USB-C power supply (5V 3A). Underpowered supplies cause random crashes and SD card corruption. A lightning bolt icon on-screen (if you ever connect a monitor) means insufficient power.</p>' +
                     '<p><strong>Ethernet vs WiFi:</strong> Ethernet is more reliable for a server. If you must use WiFi, the headless config file handles it &mdash; but servers should be wired whenever possible.</p>' +
                     '<p><strong>SD Card:</strong> Use a high-endurance card (Samsung EVO, SanDisk High Endurance). Cheap cards fail under constant read/write from a server workload.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg43-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<linearGradient id="sg43-glow" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#06b6d4" stop-opacity="0.6"/><stop offset="50%" stop-color="#06b6d4" stop-opacity="0.1"/><stop offset="100%" stop-color="#06b6d4" stop-opacity="0.6"/></linearGradient>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg43-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-43 RASPBERRY PI HEADLESS SETUP</text>' +

            '<!-- Your Computer -->' +
            '<g>' +
            '<rect x="40" y="70" width="170" height="120" rx="8" fill="#1e2736" stroke="#a78bfa" stroke-width="1.5"/>' +
            '<rect x="40" y="70" width="170" height="22" rx="8" fill="rgba(167,139,250,0.12)"/>' +
            '<rect x="40" y="84" width="170" height="8" fill="rgba(167,139,250,0.12)"/>' +
            '<text x="125" y="86" text-anchor="middle" fill="#c4b5fd" font-size="9" font-weight="600">YOUR COMPUTER</text>' +

            '<!-- Screen icon -->' +
            '<rect x="75" y="105" width="60" height="40" rx="4" fill="#0d1117" stroke="#555" stroke-width="1"/>' +
            '<rect x="80" y="110" width="50" height="30" rx="2" fill="rgba(167,139,250,0.08)"/>' +
            '<text x="105" y="128" text-anchor="middle" fill="#a78bfa" font-size="7">Terminal</text>' +
            '<rect x="95" y="147" width="20" height="4" rx="1" fill="#555"/>' +

            '<!-- SD card reader -->' +
            '<rect x="150" y="110" width="50" height="30" rx="3" fill="rgba(234,179,8,0.1)" stroke="#eab308" stroke-width="1"/>' +
            '<text x="175" y="120" text-anchor="middle" fill="#eab308" font-size="6">SD Card</text>' +
            '<text x="175" y="132" text-anchor="middle" fill="#eab308" font-size="6">Reader</text>' +
            '</g>' +

            '<!-- Router/Switch -->' +
            '<g>' +
            '<rect x="275" y="240" width="170" height="100" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="275" y="240" width="170" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="275" y="254" width="170" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="360" y="256" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600">ROUTER / SWITCH</text>' +

            '<!-- Port indicators -->' +
            '<g>' +
            '<rect x="290" y="275" width="16" height="12" rx="2" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<circle cx="298" cy="274" r="2" fill="#22c55e"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>' +
            '<rect x="312" y="275" width="16" height="12" rx="2" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<circle cx="320" cy="274" r="2" fill="#22c55e"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>' +
            '<rect x="334" y="275" width="16" height="12" rx="2" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<rect x="356" y="275" width="16" height="12" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<rect x="378" y="275" width="16" height="12" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<rect x="400" y="275" width="16" height="12" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<rect x="422" y="275" width="16" height="12" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '</g>' +
            '<text x="360" y="308" text-anchor="middle" fill="#8b949e" font-size="7">DHCP &bull; DNS &bull; Gateway</text>' +
            '<text x="360" y="320" text-anchor="middle" fill="#555" font-size="7">192.168.1.1</text>' +

            '<!-- Internet cloud -->' +
            '<text x="360" y="355" text-anchor="middle" fill="#555" font-size="8">&#8593; Internet</text>' +
            '</g>' +

            '<!-- Raspberry Pi -->' +
            '<g>' +
            '<rect x="500" y="70" width="180" height="170" rx="8" fill="#1e2736" stroke="#06b6d4" stroke-width="1.5"/>' +
            '<rect x="500" y="70" width="180" height="22" rx="8" fill="rgba(6,182,212,0.12)"/>' +
            '<rect x="500" y="84" width="180" height="8" fill="rgba(6,182,212,0.12)"/>' +
            '<text x="590" y="86" text-anchor="middle" fill="#22d3ee" font-size="9" font-weight="600">RASPBERRY PI 4/5</text>' +

            '<!-- Pi board details -->' +
            '<rect x="515" y="105" width="60" height="8" rx="2" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.3)" stroke-width="0.5"/>' +
            '<text x="545" y="112" text-anchor="middle" fill="#06b6d4" font-size="6">BCM2711</text>' +

            '<!-- GPIO pins -->' +
            '<g>' +
            '<rect x="585" y="100" width="80" height="14" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
            '<text x="625" y="110" text-anchor="middle" fill="#555" font-size="5">GPIO 40-PIN</text>' +
            '</g>' +

            '<!-- Ethernet port -->' +
            '<rect x="515" y="130" width="40" height="28" rx="3" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="535" y="142" text-anchor="middle" fill="#22c55e" font-size="6">ETH</text>' +
            '<text x="535" y="152" text-anchor="middle" fill="#22c55e" font-size="5">1 Gbps</text>' +
            '<circle cx="525" cy="128" r="2" fill="#22c55e"><animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/></circle>' +

            '<!-- USB ports -->' +
            '<rect x="570" y="130" width="22" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<text x="581" y="140" text-anchor="middle" fill="#3b82f6" font-size="4">USB3</text>' +
            '<rect x="596" y="130" width="22" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<text x="607" y="140" text-anchor="middle" fill="#3b82f6" font-size="4">USB3</text>' +
            '<rect x="570" y="148" width="22" height="14" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<text x="581" y="158" text-anchor="middle" fill="#555" font-size="4">USB2</text>' +
            '<rect x="596" y="148" width="22" height="14" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<text x="607" y="158" text-anchor="middle" fill="#555" font-size="4">USB2</text>' +

            '<!-- microSD slot -->' +
            '<rect x="640" y="130" width="30" height="20" rx="3" fill="rgba(234,179,8,0.15)" stroke="#eab308" stroke-width="1"/>' +
            '<text x="655" y="143" text-anchor="middle" fill="#eab308" font-size="5">microSD</text>' +

            '<!-- USB-C Power -->' +
            '<rect x="515" y="175" width="45" height="16" rx="3" fill="rgba(239,68,68,0.12)" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="537" y="186" text-anchor="middle" fill="#ef4444" font-size="6">USB-C</text>' +
            '<text x="537" y="198" text-anchor="middle" fill="#ef4444" font-size="5">5V 3A</text>' +

            '<!-- Status LEDs -->' +
            '<circle cx="580" y="188" r="3" fill="#22c55e"><animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" repeatCount="indefinite"/></circle>' +
            '<text x="590" y="191" fill="#8b949e" font-size="5">ACT</text>' +
            '<circle cx="610" y="188" r="3" fill="#ef4444"/>' +
            '<text x="620" y="191" fill="#8b949e" font-size="5">PWR</text>' +

            '<!-- IP address label -->' +
            '<rect x="520" y="215" width="145" height="18" rx="4" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.25)" stroke-width="0.5"/>' +
            '<text x="592" y="228" text-anchor="middle" fill="#22d3ee" font-size="8">192.168.1.100</text>' +
            '</g>' +

            '<!-- Connection: Computer to Pi (SSH) -->' +
            '<line x1="210" y1="130" x2="500" y2="130" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.6"/>' +
            '<text x="355" y="125" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="600">SSH (port 22)</text>' +
            '<polygon points="495,126 505,130 495,134" fill="#a78bfa" opacity="0.8"/>' +

            '<!-- Connection: SD card to Pi -->' +
            '<path d="M 200 130 Q 350 50 640 130" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5"/>' +
            '<text x="400" y="65" text-anchor="middle" fill="#eab308" font-size="7">Flash OS &#8594; Insert SD</text>' +

            '<!-- Connection: Pi to Router (Ethernet) -->' +
            '<line x1="535" y1="158" x2="535" y2="240" stroke="#22c55e" stroke-width="2"/>' +
            '<line x1="535" y1="240" x2="445" y2="275" stroke="#22c55e" stroke-width="2"/>' +
            '<text x="510" y="208" text-anchor="end" fill="#22c55e" font-size="7">CAT6</text>' +

            '<!-- Connection: Computer to Router -->' +
            '<line x1="125" y1="190" x2="125" y2="290" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.4"/>' +
            '<line x1="125" y1="290" x2="275" y2="290" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.4"/>' +

            '<!-- Boot sequence callout -->' +
            '<rect x="40" y="280" width="200" height="70" rx="6" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="296" fill="#22d3ee" font-size="7" font-weight="600">HEADLESS BOOT SEQUENCE</text>' +
            '<text x="50" y="310" fill="#8b949e" font-size="6">1. Flash SD &#8594; insert into Pi</text>' +
            '<text x="50" y="322" fill="#8b949e" font-size="6">2. Connect Ethernet &#8594; power on</text>' +
            '<text x="50" y="334" fill="#8b949e" font-size="6">3. Find IP &#8594; ssh pi@IP</text>' +
            '<text x="50" y="346" fill="#8b949e" font-size="6">4. Update &#8594; harden &#8594; deploy</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Download and Flash Raspberry Pi OS',
                content: '<p>Download the <strong>Raspberry Pi Imager</strong> from <a href="https://www.raspberrypi.com/software/" target="_blank" rel="noopener">raspberrypi.com/software</a>. Insert your microSD card into your computer. Open the Imager, select <strong>Raspberry Pi OS Lite (64-bit)</strong> &mdash; the Lite version has no desktop GUI, which is what you want for a server. Select your SD card as the target.</p>' +
                         '<p>OS Lite runs purely from the command line. It uses less RAM, less disk, and has less attack surface than the full desktop version. Every production Linux server in the world runs without a GUI &mdash; start learning that way from day one.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> The Imager also supports Ubuntu Server, DietPi, and other distributions. For this guide we use the official Raspberry Pi OS, but the headless setup process is nearly identical for any Linux distribution.'
            },
            {
                title: 'Pre-Configure SSH, WiFi, and User Account',
                content: '<p>Before flashing, click the <strong>gear icon</strong> (or press <code>Ctrl+Shift+X</code>) in the Imager to open Advanced Options. This is the critical step that makes headless setup work &mdash; you configure everything <em>before first boot</em> so the Pi comes up ready to connect:</p>' +
                         '<ul>' +
                         '<li><strong>Enable SSH</strong> &mdash; use password authentication for initial setup</li>' +
                         '<li><strong>Set username and password</strong> &mdash; e.g., <code>pi</code> / a strong password</li>' +
                         '<li><strong>Configure WiFi</strong> &mdash; enter your SSID and password, set country code (US, GB, etc.)</li>' +
                         '<li><strong>Set locale and timezone</strong> &mdash; match your location</li>' +
                         '</ul>' +
                         '<p>Click <strong>Save</strong>, then click <strong>Write</strong>. The Imager flashes the OS and bakes your configuration into the boot partition automatically. When the Pi boots, it will connect to your network and accept SSH connections immediately.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> If you are using Ethernet (recommended), you can skip the WiFi configuration entirely. The Pi will get an IP from your router via DHCP the moment you plug in the cable.'
            },
            {
                title: 'Boot the Pi and Find Its IP Address',
                content: '<p>Insert the SD card into the Pi, connect the Ethernet cable to your router/switch, and connect the USB-C power supply. The green ACT LED will flicker as it boots &mdash; this takes 60&ndash;90 seconds on first boot as it resizes the filesystem and applies your configuration.</p>' +
                         '<p>Now you need to find the Pi\'s IP address. You have several options, from easiest to most educational:</p>',
                code: '# Option 1: mDNS (simplest — works on most networks)\nping raspberrypi.local\n\n# Option 2: Check your router admin page\n# Usually at 192.168.1.1 or 192.168.0.1\n# Look for a new device named "raspberrypi"\n\n# Option 3: ARP scan (Linux/macOS)\nsudo arp-scan --localnet | grep -i raspberry\n# or\nsudo arp-scan --localnet | grep "dc:a6:32\\|e4:5f:01\\|28:cd:c1\\|2c:cf:67\\|d8:3a:dd"\n# (common Raspberry Pi MAC prefixes)\n\n# Option 4: nmap network scan\nnmap -sn 192.168.1.0/24\n# Look for "Raspberry Pi" in the results\n# Or filter: nmap -sn 192.168.1.0/24 | grep -B2 "Raspberry"',
                language: 'Bash',
                tip: '<strong>Tip:</strong> If <code>raspberrypi.local</code> does not resolve, your router may not support mDNS. Use the nmap approach &mdash; it works everywhere and teaches you network scanning, which you will use constantly in cybersecurity.'
            },
            {
                title: 'Connect via SSH',
                content: '<p>With the IP address in hand, open a terminal on your computer and connect. On the first connection, SSH will warn you about an unknown host key &mdash; type <code>yes</code> to accept it. Enter the password you set in the Imager.</p>' +
                         '<p>You are now controlling a Linux server remotely. This is the same workflow used to manage servers in AWS, Azure, and every data center on Earth.</p>',
                code: '# Connect to your Pi\nssh pi@192.168.1.100\n# (replace with your Pi\'s actual IP)\n\n# First thing after login: update everything\nsudo apt update && sudo apt full-upgrade -y\n\n# Check system info\nhostnamectl\ncat /proc/cpuinfo | grep "Model"\nfree -h\ndf -h\nip addr show\n\n# Set hostname to something meaningful\nsudo hostnamectl set-hostname hexlab-pi\n\n# Optional: set a static IP so it never changes\nsudo nmcli con mod "Wired connection 1" \\\n  ipv4.addresses 192.168.1.100/24 \\\n  ipv4.gateway 192.168.1.1 \\\n  ipv4.dns "1.1.1.1,8.8.8.8" \\\n  ipv4.method manual\n\nsudo nmcli con up "Wired connection 1"\n\n# Verify the static IP\nip addr show eth0 | grep "inet "',
                language: 'Bash',
                tip: '<strong>Tip:</strong> A static IP is critical for a server. If your Pi gets a different IP after a reboot, all your bookmarks, scripts, and port forwarding rules break. Set it once and never worry about it again.'
            },
            {
                title: 'Secure the Base System',
                content: '<p>Before you deploy any services on this Pi, lock down the basics. These are non-negotiable security steps for any server &mdash; the same checklist a sysadmin follows when provisioning a production machine:</p>' +
                         '<ol>' +
                         '<li><strong>SSH key authentication</strong> &mdash; replace passwords with cryptographic keys</li>' +
                         '<li><strong>Disable password login</strong> &mdash; keys only, no brute force possible</li>' +
                         '<li><strong>Enable firewall</strong> &mdash; deny everything, allow only what you need</li>' +
                         '<li><strong>Automatic security updates</strong> &mdash; patches apply without you remembering</li>' +
                         '</ol>',
                code: '# Step 1: Generate SSH key pair ON YOUR COMPUTER (not the Pi)\n# Run this on your laptop/desktop:\nssh-keygen -t ed25519 -C "hexlab-pi"\n# Press Enter for default location, set a passphrase\n\n# Step 2: Copy the public key to the Pi\nssh-copy-id pi@192.168.1.100\n# Enter your password one last time\n\n# Step 3: Test key-based login (should NOT ask for password)\nssh pi@192.168.1.100\n\n# Step 4: Disable password authentication on the Pi\nsudo sed -i \'s/#PasswordAuthentication yes/PasswordAuthentication no/\' /etc/ssh/sshd_config\nsudo sed -i \'s/PasswordAuthentication yes/PasswordAuthentication no/\' /etc/ssh/sshd_config\nsudo systemctl restart sshd\n\n# Step 5: Enable the firewall\nsudo apt install ufw -y\nsudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow ssh\nsudo ufw enable\nsudo ufw status verbose\n\n# Step 6: Enable automatic security updates\nsudo apt install unattended-upgrades -y\nsudo dpkg-reconfigure -plow unattended-upgrades\n# Select "Yes" to enable',
                language: 'Bash',
                tip: '<strong>Warning:</strong> Do NOT disable password authentication before confirming key-based login works. If you lock yourself out, you will need to pull the SD card and edit sshd_config manually on another computer.'
            },
            {
                title: 'Document and Verify',
                content: '<p>Your Raspberry Pi is now a headless server with key-based SSH, a firewall, and automatic security updates. Every project from this point forward builds on this foundation. Document your setup so you can rebuild it if the SD card fails:</p>',
                code: '# Generate a server info sheet\ncat << \'SERVEREOF\' > ~/server-info.txt\n=== HEXWORTH LAB — Raspberry Pi Server ===\nHostname:    $(hostname)\nIP Address:  $(hostname -I | awk \'{print $1}\')\nOS:          $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d \'\"\')\nKernel:      $(uname -r)\nArchitecture: $(uname -m)\nCPU:         $(cat /proc/cpuinfo | grep "Model" | head -1 | cut -d: -f2 | xargs)\nRAM:         $(free -h | grep Mem | awk \'{print $2}\')\nDisk:        $(df -h / | tail -1 | awk \'{print $2}\')\nSSH:         Key-based only, port 22\nFirewall:    UFW enabled (SSH allowed)\nAuto-update: unattended-upgrades enabled\nSetup Date:  $(date +%Y-%m-%d)\n==========================================\nSERVEREOF\n\ncat ~/server-info.txt\n\n# Final verification checklist\necho ""\necho "=== VERIFICATION ==="\necho "SSH key auth: $(ssh -o PasswordAuthentication=no -o BatchMode=yes localhost echo OK 2>/dev/null || echo FAIL)"\necho "Firewall:     $(sudo ufw status | head -1)"\necho "Internet:     $(ping -c1 -W2 8.8.8.8 > /dev/null 2>&1 && echo OK || echo FAIL)"\necho "DNS:          $(ping -c1 -W2 google.com > /dev/null 2>&1 && echo OK || echo FAIL)"\necho "Uptime:       $(uptime -p)"',
                language: 'Bash',
                tip: '<strong>Tip:</strong> Save this server-info.txt somewhere safe (not just on the Pi). If the SD card corrupts, you want to know the exact configuration to rebuild. Consider pushing it to a private GitHub gist.'
            }
        ],

        testing: '<p><strong>Verification checklist &mdash; confirm each before moving to the next project:</strong></p>' +
                 '<ul>' +
                 '<li>SSH connects <strong>without a password prompt</strong> (key-based auth is working)</li>' +
                 '<li><code>sudo ufw status</code> shows <strong>active</strong> with SSH allowed</li>' +
                 '<li><code>ping 8.8.8.8</code> succeeds (internet connectivity)</li>' +
                 '<li><code>ping google.com</code> succeeds (DNS resolution)</li>' +
                 '<li><code>hostnamectl</code> shows your configured hostname</li>' +
                 '<li>Rebooting (<code>sudo reboot</code>) and reconnecting via SSH works within 90 seconds</li>' +
                 '<li>Attempting password login after disabling it is <strong>rejected</strong></li>' +
                 '</ul>' +
                 '<p>If all checks pass, your Pi is production-ready. Every Signal project from SG-44 onward builds on this base.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Pi does not boot (no green ACT LED activity):</strong> The microSD card is not recognized. Re-flash with Raspberry Pi Imager. Ensure you selected the correct drive and the write completed without errors. Try a different SD card &mdash; cheap cards have high failure rates.</li>' +
                         '<li><strong>Cannot find the Pi on the network:</strong> (1) Confirm the Ethernet cable is connected and the link LED on the Pi\'s Ethernet port is lit. (2) Check your router\'s DHCP lease table for a new device. (3) If using WiFi, verify the SSID and password were entered correctly in the Imager &mdash; a single typo means the Pi cannot connect. (4) Try <code>arp-scan</code> or <code>nmap -sn</code> to scan the subnet.</li>' +
                         '<li><strong>SSH connection refused:</strong> SSH may not be enabled. If you did not enable SSH in the Imager, you can mount the SD card on another computer and create an empty file called <code>ssh</code> (no extension) in the boot partition.</li>' +
                         '<li><strong>SSH works but disconnects randomly:</strong> Power supply issue. The Pi is browning out under load. Use the official 5V 3A USB-C supply. Cheap phone chargers cannot sustain the Pi under network + disk I/O load.</li>' +
                         '<li><strong>Static IP not taking effect:</strong> The <code>nmcli</code> connection name may differ on your Pi. Run <code>nmcli con show</code> to see the actual connection name and substitute it in the command.</li>' +
                         '<li><strong>"WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED":</strong> You re-flashed the SD card and the SSH host key changed. Run <code>ssh-keygen -R PI_IP</code> on your computer to remove the old key, then reconnect.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Automated Health Report</strong> &mdash; Write a bash script that runs via cron every hour and logs CPU temperature (<code>vcgencmd measure_temp</code>), memory usage (<code>free -m</code>), disk usage (<code>df -h</code>), and uptime to <code>/var/log/pi-health.log</code>. Add a condition that sends a warning to a file if CPU temp exceeds 70 degrees C.</p>' +
                    '<p><strong>Challenge 2: Multi-Pi SSH Config</strong> &mdash; Set up an SSH config file (<code>~/.ssh/config</code>) on your computer with entries for multiple Pis (pihole, nas, vpn). You should be able to connect with just <code>ssh pihole</code> instead of typing the full <code>ssh pi@192.168.1.100</code> each time.</p>' +
                    '<p><strong>Challenge 3: Fail2Ban Installation</strong> &mdash; Install and configure fail2ban to automatically ban IP addresses that fail SSH login 3 times within 10 minutes. Check the ban log after 24 hours &mdash; even on a home network, you may be surprised by the noise.</p>',

        commonMistakes: [
            {
                title: 'Using a phone charger instead of the official Pi power supply',
                correct: 'Use a 5V 3A USB-C power supply rated for the Raspberry Pi. The official supply provides stable current under load.',
                incorrect: 'Using a leftover phone charger rated at 5V 1A or 5V 2A.',
                consequence: 'The Pi will boot but crash randomly under load (apt update, disk writes, network traffic). The lightning bolt icon appears on HDMI output. SD card corruption is likely within days.',
            },
            {
                title: 'Disabling password auth before verifying key-based SSH works',
                correct: 'First copy your public key with ssh-copy-id, then test key-based login in a NEW terminal session (keeping the old session open as backup), then disable password auth.',
                incorrect: 'Disabling PasswordAuthentication in sshd_config before confirming key-based login works, or testing in the same session that is already authenticated.',
                consequence: 'You are permanently locked out of the Pi. The only recovery is pulling the SD card, mounting it on another computer, and editing sshd_config manually to re-enable password auth.',
            },
            {
                title: 'Not setting a static IP for a server',
                correct: 'Assign a static IP via nmcli or your router\'s DHCP reservation so the Pi always gets the same address.',
                incorrect: 'Leaving the Pi on DHCP and hoping it keeps the same IP.',
                consequence: 'After a router reboot or DHCP lease expiry, the Pi gets a different IP. All your SSH commands, bookmarks, port forwarding rules, and DNS entries break silently.',
            }
        ]
    },

    // ========================================================================
    // SG-44: Pi-hole DNS Ad Blocker
    // ========================================================================
    'sg-44': {
        intro: '<p>Pi-hole turns your Raspberry Pi into a network-wide ad blocker that protects every device in your home &mdash; phones, laptops, smart TVs, game consoles &mdash; without installing anything on any of them. It works at the DNS level: when any device asks "where is <code>ads.doubleclick.net</code>?", Pi-hole answers "nowhere" and the ad never loads.</p>' +
               '<p>But Pi-hole is far more than an ad blocker. Its real-time dashboard shows <em>every single DNS query</em> on your network. You can see which smart TV is phoning home 4,000 times a day, which IoT thermostat is beaconing to a server in China, and which apps are tracking you even when you are not using them. For a cybersecurity student, this is your first network monitoring tool &mdash; and the data will change how you think about every device you own.</p>' +
               '<p>This project teaches DNS fundamentals, DHCP configuration, network architecture, log analysis, and the security implications of unencrypted DNS. You will also learn why DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) exist &mdash; and why they bypass Pi-hole entirely.</p>',

        wiring: '    Before Pi-hole:                  After Pi-hole:\n' +
                '    +--------+    +--------+        +--------+    +---------+    +--------+\n' +
                '    | Device |--->| Router |--->     | Device |--->| Pi-hole |--->| Router |--->\n' +
                '    +--------+    +--------+  ISP   +--------+    +---------+    +--------+  ISP\n' +
                '                  DNS: ISP                        DNS: Pi IP     DNS: Cloudflare\n' +
                '\n' +
                '    Pi-hole intercepts DNS queries only (port 53).\n' +
                '    All other traffic flows directly through the router.\n' +
                '    Ad domains resolve to 0.0.0.0 — the request dies silently.',

        wiringNotes: '<p><strong>How it works:</strong> Pi-hole is a DNS sinkhole. When a device resolves <code>ads.example.com</code>, Pi-hole checks its blocklist. If the domain is listed, Pi-hole returns <code>0.0.0.0</code> instead of the real IP. The browser tries to load the ad from <code>0.0.0.0</code>, which goes nowhere. The ad space stays empty. No tracking pixel fires. No data leaves your network.</p>' +
                     '<p><strong>What it cannot block:</strong> Ads served from the same domain as the content (e.g., YouTube ads come from <code>googlevideo.com</code>, the same domain as the video). DNS-level blocking is domain-wide &mdash; you cannot block the ad without blocking the video. For these, you still need a browser-level blocker like uBlock Origin.</p>' +
                     '<p><strong>DHCP consideration:</strong> Pi-hole can optionally serve as your DHCP server, which gives you per-device hostname tracking in the dashboard. If you enable this, <strong>disable DHCP on your router first</strong> &mdash; two DHCP servers on the same network causes IP conflicts.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg44-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg44-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-44 PI-HOLE DNS NETWORK TOPOLOGY</text>' +

            '<!-- Devices (left side) -->' +
            '<g>' +
            '<!-- Laptop -->' +
            '<rect x="30" y="60" width="80" height="55" rx="6" fill="#1e2736" stroke="#a78bfa" stroke-width="1"/>' +
            '<rect x="38" y="68" width="64" height="36" rx="3" fill="rgba(167,139,250,0.08)"/>' +
            '<text x="70" y="90" text-anchor="middle" fill="#a78bfa" font-size="7">Laptop</text>' +
            '<rect x="50" y="106" width="40" height="3" rx="1" fill="#555"/>' +

            '<!-- Phone -->' +
            '<rect x="30" y="130" width="80" height="55" rx="6" fill="#1e2736" stroke="#38bdf8" stroke-width="1"/>' +
            '<rect x="50" y="138" width="40" height="36" rx="8" fill="rgba(56,189,248,0.08)"/>' +
            '<text x="70" y="160" text-anchor="middle" fill="#38bdf8" font-size="7">Phone</text>' +

            '<!-- Smart TV -->' +
            '<rect x="30" y="200" width="80" height="55" rx="6" fill="#1e2736" stroke="#f97316" stroke-width="1"/>' +
            '<rect x="38" y="208" width="64" height="36" rx="2" fill="rgba(249,115,22,0.08)"/>' +
            '<text x="70" y="230" text-anchor="middle" fill="#f97316" font-size="7">Smart TV</text>' +

            '<!-- IoT -->' +
            '<rect x="30" y="270" width="80" height="55" rx="6" fill="#1e2736" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="70" y="295" text-anchor="middle" fill="#ef4444" font-size="7">IoT</text>' +
            '<text x="70" y="310" text-anchor="middle" fill="#ef4444" font-size="6">Devices</text>' +

            '<!-- DNS queries label -->' +
            '<text x="70" y="345" text-anchor="middle" fill="#555" font-size="7">All devices send</text>' +
            '<text x="70" y="357" text-anchor="middle" fill="#555" font-size="7">DNS queries</text>' +
            '</g>' +

            '<!-- DNS query arrows -->' +
            '<line x1="110" y1="87" x2="230" y2="175" stroke="#a78bfa" stroke-width="1" opacity="0.5"/>' +
            '<line x1="110" y1="157" x2="230" y2="175" stroke="#38bdf8" stroke-width="1" opacity="0.5"/>' +
            '<line x1="110" y1="227" x2="230" y2="195" stroke="#f97316" stroke-width="1" opacity="0.5"/>' +
            '<line x1="110" y1="297" x2="230" y2="195" stroke="#ef4444" stroke-width="1" opacity="0.5"/>' +

            '<!-- Pi-hole Server (center) -->' +
            '<g>' +
            '<rect x="230" y="100" width="180" height="220" rx="10" fill="#1e2736" stroke="#ef4444" stroke-width="2"/>' +
            '<rect x="230" y="100" width="180" height="26" rx="10" fill="rgba(239,68,68,0.15)"/>' +
            '<rect x="230" y="118" width="180" height="8" fill="rgba(239,68,68,0.15)"/>' +
            '<text x="320" y="118" text-anchor="middle" fill="#fca5a5" font-size="10" font-weight="700">PI-HOLE</text>' +
            '<text x="320" y="142" text-anchor="middle" fill="#8b949e" font-size="7">192.168.1.100:53</text>' +

            '<!-- Blocklist check visualization -->' +
            '<rect x="245" y="155" width="150" height="80" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="255" y="170" fill="#fca5a5" font-size="7" font-weight="600">BLOCKLIST CHECK</text>' +

            '<!-- Allowed domain -->' +
            '<rect x="252" y="178" width="135" height="16" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<circle cx="262" cy="186" r="3" fill="#22c55e"/>' +
            '<text x="270" y="189" fill="#4ade80" font-size="6">google.com &#8594; 142.250.x.x</text>' +

            '<!-- Blocked domain -->' +
            '<rect x="252" y="198" width="135" height="16" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<circle cx="262" cy="206" r="3" fill="#ef4444"/>' +
            '<text x="270" y="209" fill="#fca5a5" font-size="6">ads.tracker.com &#8594; 0.0.0.0</text>' +

            '<!-- Blocked domain 2 -->' +
            '<rect x="252" y="218" width="135" height="16" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<circle cx="262" cy="226" r="3" fill="#ef4444"/>' +
            '<text x="270" y="229" fill="#fca5a5" font-size="6">telemetry.fb.com &#8594; 0.0.0.0</text>' +

            '<!-- Stats panel -->' +
            '<rect x="245" y="245" width="70" height="35" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="280" y="260" text-anchor="middle" fill="#4ade80" font-size="14" font-weight="700">68%</text>' +
            '<text x="280" y="273" text-anchor="middle" fill="#4ade80" font-size="6">Blocked</text>' +

            '<rect x="325" y="245" width="70" height="35" rx="4" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.15)" stroke-width="0.5"/>' +
            '<text x="360" y="260" text-anchor="middle" fill="#22d3ee" font-size="14" font-weight="700">142K</text>' +
            '<text x="360" y="273" text-anchor="middle" fill="#22d3ee" font-size="6">Queries/day</text>' +

            '<!-- Dashboard indicator -->' +
            '<rect x="245" y="290" width="150" height="20" rx="4" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.15)" stroke-width="0.5"/>' +
            '<text x="320" y="303" text-anchor="middle" fill="#a78bfa" font-size="7">Dashboard: http://pi.hole/admin</text>' +
            '</g>' +

            '<!-- Upstream DNS arrow -->' +
            '<line x1="410" y1="185" x2="490" y2="185" stroke="#22c55e" stroke-width="2"/>' +
            '<polygon points="485,181 495,185 485,189" fill="#22c55e"/>' +
            '<text x="450" y="178" text-anchor="middle" fill="#22c55e" font-size="7">Allowed</text>' +
            '<text x="450" y="200" text-anchor="middle" fill="#22c55e" font-size="6">queries only</text>' +

            '<!-- Blocked arrow (down to nowhere) -->' +
            '<line x1="320" y1="320" x2="320" y2="370" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<text x="320" y="385" text-anchor="middle" fill="#ef4444" font-size="7">Blocked &#8594; 0.0.0.0</text>' +
            '<text x="320" y="397" text-anchor="middle" fill="#ef4444" font-size="6">(ads never load)</text>' +

            '<!-- Upstream DNS (Cloudflare) -->' +
            '<g>' +
            '<rect x="490" y="130" width="120" height="110" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="490" y="130" width="120" height="22" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<rect x="490" y="144" width="120" height="8" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="550" y="145" text-anchor="middle" fill="#fb923c" font-size="9" font-weight="600">CLOUDFLARE</text>' +
            '<text x="550" y="170" text-anchor="middle" fill="#8b949e" font-size="8">1.1.1.1</text>' +
            '<text x="550" y="185" text-anchor="middle" fill="#8b949e" font-size="8">1.0.0.1</text>' +
            '<text x="550" y="205" text-anchor="middle" fill="#555" font-size="7">Upstream DNS</text>' +
            '<text x="550" y="218" text-anchor="middle" fill="#555" font-size="7">Resolves allowed</text>' +
            '<text x="550" y="230" text-anchor="middle" fill="#555" font-size="7">domains to real IPs</text>' +
            '</g>' +

            '<!-- Internet -->' +
            '<line x1="610" y1="185" x2="680" y2="185" stroke="#555" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            '<text x="680" y="180" text-anchor="end" fill="#555" font-size="8">Internet</text>' +
            '<text x="680" y="195" text-anchor="end" fill="#555" font-size="6">&#8594; Web servers</text>' +

            '<!-- Legend -->' +
            '<rect x="490" y="280" width="190" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="500" y="296" fill="#8b949e" font-size="7" font-weight="600">LEGEND</text>' +
            '<circle cx="505" cy="310" r="3" fill="#22c55e"/><text x="515" y="313" fill="#8b949e" font-size="6">Allowed &mdash; resolved normally</text>' +
            '<circle cx="505" cy="326" r="3" fill="#ef4444"/><text x="515" y="329" fill="#8b949e" font-size="6">Blocked &mdash; returns 0.0.0.0</text>' +
            '<line x1="500" y1="342" x2="512" y2="342" stroke="#a78bfa" stroke-width="1"/><text x="515" y="345" fill="#8b949e" font-size="6">DNS query from device</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install Pi-hole',
                content: '<p>Pi-hole installs with a single command. The installer is interactive &mdash; it walks you through upstream DNS selection, blocklists, and web interface options. Accept the defaults for now; everything can be changed later from the admin dashboard.</p>' +
                         '<p>The installer takes about 3&ndash;5 minutes. It installs <code>lighttpd</code> (a lightweight web server for the dashboard), <code>php</code>, <code>sqlite3</code> (query database), and the FTL engine (the DNS resolver).</p>',
                code: '# Install Pi-hole — one command does everything\ncurl -sSL https://install.pi-hole.net | bash\n\n# The installer asks:\n# 1. Upstream DNS: Cloudflare (1.1.1.1) — fast, privacy-focused\n# 2. Blocklists: Accept default (StevenBlack unified hosts)\n# 3. Admin web interface: Yes (you want the dashboard)\n# 4. Web server (lighttpd): Yes\n# 5. Query logging: Yes (this powers the dashboard analytics)\n# 6. Privacy mode: 0 (Show Everything) — you want full visibility\n\n# IMPORTANT: The installer shows a randomly generated admin password\n# at the end. Write it down, or change it immediately:\npihole -a -p\n# (prompts for new password)\n\n# Verify Pi-hole is running\npihole status\npihole -v',
                language: 'Bash',
                tip: '<strong>Security note:</strong> The <code>curl | bash</code> pattern is convenient but risky in general &mdash; you are executing code you have not reviewed. Pi-hole is a well-known, audited project, so this is accepted practice. For unknown scripts, always download and inspect first: <code>curl -sSL url -o script.sh && less script.sh && bash script.sh</code>.'
            },
            {
                title: 'Configure Your Network to Use Pi-hole',
                content: '<p>Pi-hole only works if devices send their DNS queries to it instead of your router or ISP. There are three ways to set this up, from network-wide to per-device:</p>' +
                         '<ul>' +
                         '<li><strong>Option A (recommended):</strong> Change your router\'s DHCP settings to advertise the Pi\'s IP as the DNS server. Every device gets Pi-hole protection automatically when it renews its DHCP lease.</li>' +
                         '<li><strong>Option B:</strong> Let Pi-hole serve DHCP (Settings &gt; DHCP &gt; Enable). This gives you per-device hostname tracking but requires disabling DHCP on your router.</li>' +
                         '<li><strong>Option C:</strong> Set DNS manually on individual devices for testing before committing network-wide.</li>' +
                         '</ul>',
                code: '# After configuring DNS, verify it works:\n\n# Test that Pi-hole resolves normal domains\nnslookup google.com 192.168.1.100\n# Should return a real IP (e.g., 142.250.x.x)\n\n# Test that Pi-hole blocks ad domains\nnslookup ads.google.com 192.168.1.100\n# Should return 0.0.0.0\n\nnslookup tracking.analytics.yahoo.com 192.168.1.100\n# Should return 0.0.0.0\n\n# Test from another device on the network:\n# Open a browser and go to http://pi.hole/admin\n# You should see the Pi-hole dashboard\n\n# Force DHCP renewal on your devices to pick up new DNS:\n# Windows: ipconfig /release && ipconfig /renew\n# macOS: sudo dscacheutil -flushcache\n# Linux: sudo dhclient -r && sudo dhclient\n# Phone: Toggle WiFi off and on',
                language: 'Bash',
                tip: '<strong>Tip:</strong> After changing DNS, give devices 5&ndash;10 minutes to renew their DHCP lease. Or restart their WiFi connection to force immediate renewal. Check the Pi-hole dashboard &mdash; you should see queries appearing from client devices within seconds.'
            },
            {
                title: 'Explore the Dashboard',
                content: '<p>The Pi-hole dashboard is where the real education happens. Open <code>http://192.168.1.100/admin</code> (or <code>http://pi.hole/admin</code>) and log in with your admin password. Spend time exploring each section:</p>' +
                         '<ul>' +
                         '<li><strong>Dashboard:</strong> Total queries, percentage blocked, query timeline, top clients, top blocked domains</li>' +
                         '<li><strong>Query Log:</strong> Every single DNS query with timestamp, client, domain, status (allowed/blocked), and response time</li>' +
                         '<li><strong>Long Term Data:</strong> Historical graphs and top lists over days/weeks/months</li>' +
                         '<li><strong>Top Lists:</strong> Most queried domains, most blocked domains, most active clients</li>' +
                         '</ul>',
                code: '# CLI alternatives to the dashboard:\n\n# Live query log (like tail -f but for DNS)\npihole -t\n\n# Chronometer — real-time stats in terminal\npihole -c\n\n# Quick status\npihole status\n\n# Query the database directly for deep analysis\n# Top 20 blocked domains in the last 24 hours:\nsqlite3 /etc/pihole/pihole-FTL.db \\\n  "SELECT domain, COUNT(*) as hits \\\n   FROM queries \\\n   WHERE status IN (1,4,5,6,7,8,9,10,11) \\\n   AND timestamp > strftime(\'%s\',\'now\',\'-24 hours\') \\\n   GROUP BY domain \\\n   ORDER BY hits DESC \\\n   LIMIT 20;"\n\n# Which device makes the most queries?\nsqlite3 /etc/pihole/pihole-FTL.db \\\n  "SELECT client, COUNT(*) as queries \\\n   FROM queries \\\n   WHERE timestamp > strftime(\'%s\',\'now\',\'-24 hours\') \\\n   GROUP BY client \\\n   ORDER BY queries DESC \\\n   LIMIT 10;"',
                language: 'Bash',
                tip: '<strong>Eye-opener:</strong> Check your Smart TV\'s DNS queries. Many brands (Samsung, LG, Vizio) make thousands of tracking requests per day to analytics servers, ad networks, and ACR (Automatic Content Recognition) services that identify what you are watching. Pi-hole exposes all of it.'
            },
            {
                title: 'Add Blocklists and Whitelists',
                content: '<p>The default blocklist catches most advertising domains, but you can dramatically expand coverage by adding community-curated lists that target telemetry, malware, tracking, and phishing domains. You will also need to whitelist certain domains that break when blocked.</p>' +
                         '<p>Go to <strong>Admin &gt; Adlists</strong> to add new blocklist URLs, then update gravity to download and apply them.</p>',
                code: '# Recommended additional blocklists (paste URLs in Admin > Adlists):\n#\n# Malware & Phishing:\n# https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/fakenews-gambling-porn/hosts\n# https://raw.githubusercontent.com/DandelionSprout/adfilt/master/Alternate%20versions%20Anti-Malware%20List/AntiMalwareHosts.txt\n#\n# Telemetry & Tracking:\n# https://v.firebog.net/hosts/Easyprivacy.txt\n# https://raw.githubusercontent.com/crazy-max/WindowsSpyBlocker/master/data/hosts/spy.txt\n#\n# After adding lists, update gravity:\npihole -g\n# This downloads all lists and rebuilds the blocklist database\n\n# Whitelist domains that commonly break:\npihole -w s.youtube.com                    # YouTube history/watch later\npihole -w video-stats.l.google.com         # YouTube playback\npihole -w clients4.google.com              # Android apps\npihole -w clients2.google.com              # Android apps\npihole -w login.microsoftonline.com        # Microsoft 365 login\npihole -w graph.microsoft.com              # Microsoft Teams\npihole -w outlook.office365.com            # Outlook email\npihole -w cdn.optimizely.com               # Some e-commerce checkout\n\n# Block a specific domain manually:\npihole -b facebook.com\npihole -b instagram.com\n# (your call on these)\n\n# Check if a domain is blocked:\npihole -q doubleclick.net\npihole -q google.com',
                language: 'Bash',
                tip: '<strong>Tip:</strong> After adding new blocklists, check the dashboard for a sudden increase in blocked percentage. If something breaks (a website or app stops working), check the query log for recently blocked domains and whitelist the one causing issues. The <code>pihole -q</code> command is your best friend for debugging.'
            },
            {
                title: 'Security Analysis with Pi-hole',
                content: '<p>This is where Pi-hole transforms from a convenience tool into a cybersecurity instrument. Use the query data to analyze your network for suspicious behavior, IoT surveillance, and potential compromises.</p>' +
                         '<p>The queries you see tell a story about every device on your network. Patterns emerge: regular beaconing (C2 indicators), bulk domain lookups (data exfiltration), connections to known malicious TLDs, and IoT devices calling home to unexpected countries.</p>',
                code: '# === SECURITY ANALYSIS QUERIES ===\n\n# Look for suspicious TLDs (common in malware C2)\npihole -t 2>/dev/null | grep -E "\\.(ru|cn|tk|xyz|top|buzz|club|gq|ml)$"\n\n# Find beaconing patterns (regular interval queries = possible C2)\n# Export last hour and look for repeated queries from same client\nsqlite3 /etc/pihole/pihole-FTL.db \\\n  "SELECT client, domain, COUNT(*) as hits, \\\n   MIN(timestamp) as first, MAX(timestamp) as last \\\n   FROM queries \\\n   WHERE timestamp > strftime(\'%s\',\'now\',\'-1 hour\') \\\n   GROUP BY client, domain \\\n   HAVING hits > 20 \\\n   ORDER BY hits DESC \\\n   LIMIT 20;"\n\n# Find devices querying the most unique domains\n# (high unique count = possible data exfiltration via DNS tunneling)\nsqlite3 /etc/pihole/pihole-FTL.db \\\n  "SELECT client, COUNT(DISTINCT domain) as unique_domains \\\n   FROM queries \\\n   WHERE timestamp > strftime(\'%s\',\'now\',\'-24 hours\') \\\n   GROUP BY client \\\n   ORDER BY unique_domains DESC \\\n   LIMIT 10;"\n\n# Find queries with unusually long subdomains\n# (DNS tunneling encodes data in subdomain labels)\nsqlite3 /etc/pihole/pihole-FTL.db \\\n  "SELECT domain, client FROM queries \\\n   WHERE length(domain) > 60 \\\n   AND timestamp > strftime(\'%s\',\'now\',\'-24 hours\') \\\n   LIMIT 20;"\n\n# Export full query log for external analysis\nsqlite3 -header -csv /etc/pihole/pihole-FTL.db \\\n  "SELECT timestamp, client, domain, status, reply_type \\\n   FROM queries \\\n   WHERE timestamp > strftime(\'%s\',\'now\',\'-24 hours\');" \\\n   > ~/dns-analysis-24h.csv\n\necho "Exported $(wc -l < ~/dns-analysis-24h.csv) queries to ~/dns-analysis-24h.csv"',
                language: 'Bash',
                tip: '<strong>Real-world scenario:</strong> In a SOC environment, DNS query analysis is one of the first steps in threat hunting. APT groups frequently use DNS tunneling to exfiltrate data (encoding stolen files in subdomain strings) and C2 beaconing (regular DNS lookups to their command server). Pi-hole gives you hands-on experience with the exact data a SOC analyst reviews daily.'
            },
            {
                title: 'Maintain and Harden Pi-hole',
                content: '<p>Pi-hole is now a critical piece of your network infrastructure. If it goes down, DNS resolution fails for your entire network (unless you configured a fallback DNS on your router). Keep it updated, monitored, and backed up.</p>',
                code: '# Update Pi-hole (check for updates weekly)\npihole -up\n\n# Update the OS underneath\nsudo apt update && sudo apt full-upgrade -y\n\n# Update gravity (blocklists) — runs weekly via cron by default\npihole -g\n\n# Backup your configuration (Teleporter)\n# Admin > Settings > Teleporter > Backup\n# This exports: settings, adlists, whitelists, blacklists, DNS records\n# Or via CLI:\npihole -a -t\n\n# Monitor Pi-hole health\necho "=== Pi-hole Health Check ==="\npihole status\necho ""\necho "FTL Engine:"\npihole-FTL --version\necho ""\necho "Blocklist domains:"\npihole -g -l | tail -1\necho ""\necho "Memory:"\nfree -h | grep Mem\necho ""\necho "Disk:"\ndf -h / | tail -1\necho ""\necho "DNS test:"\ndig @127.0.0.1 google.com +short +time=2\necho ""\necho "Uptime:"\nuptime\n\n# === ADVANCED: DNS over HTTPS awareness ===\n# Pi-hole cannot block queries that bypass it.\n# Firefox, Chrome, and Android can use DNS-over-HTTPS (DoH)\n# which sends DNS queries directly to Cloudflare/Google over HTTPS.\n# To prevent DoH bypass:\n# 1. Block known DoH servers at the router level\n# 2. In Firefox: about:config > network.trr.mode = 5 (disable DoH)\n# 3. Block on Pi-hole: pihole -b dns.google doh.dns.apple.com\n# 4. For enterprise: use group policy to enforce DNS settings',
                language: 'Bash',
                tip: '<strong>Reliability:</strong> If Pi-hole goes down, set your router\'s <em>secondary</em> DNS to a public resolver (1.1.1.1 or 8.8.8.8) as a fallback. Devices will use the fallback if Pi-hole is unreachable &mdash; internet keeps working, just without ad blocking until Pi-hole comes back.'
            }
        ],

        testing: '<p><strong>Verification checklist &mdash; confirm each item:</strong></p>' +
                 '<ul>' +
                 '<li>Pi-hole dashboard loads at <code>http://PI_IP/admin</code> and shows query activity</li>' +
                 '<li><code>nslookup ads.google.com PI_IP</code> returns <code>0.0.0.0</code> (blocked)</li>' +
                 '<li><code>nslookup google.com PI_IP</code> returns a real IP (allowed)</li>' +
                 '<li>Queries from multiple devices appear in the Query Log with correct client names</li>' +
                 '<li>Visiting an ad-heavy news site shows significantly fewer ads</li>' +
                 '<li>The blocked percentage is between 15&ndash;40% (normal range for residential networks)</li>' +
                 '<li>Custom blocklists appear in Admin &gt; Adlists with green check marks</li>' +
                 '<li>Whitelisted domains resolve normally</li>' +
                 '</ul>' +
                 '<p>If all checks pass, your network-wide DNS monitoring and ad blocking system is operational. Browse normally for 24 hours, then come back and analyze the Long Term Data &mdash; the patterns will surprise you.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Pi-hole dashboard loads but shows zero queries:</strong> Your devices are not using Pi-hole as their DNS server. Check your router\'s DHCP settings &mdash; the DNS field must point to the Pi\'s IP. Force a DHCP renewal on clients (<code>ipconfig /release && ipconfig /renew</code> on Windows, toggle WiFi on phone).</li>' +
                         '<li><strong>Websites break after enabling Pi-hole:</strong> A domain your site depends on is being blocked. Check the Query Log for recently blocked domains (red entries). Whitelist the needed domain with <code>pihole -w domain.com</code>. Common breakage: Microsoft login, Captchas, and e-commerce checkout flows.</li>' +
                         '<li><strong>FTL engine not running:</strong> Check <code>sudo systemctl status pihole-FTL</code>. If it crashed, check logs: <code>cat /var/log/pihole/FTL.log</code>. Most common cause is port 53 conflict &mdash; another DNS resolver (systemd-resolved) is already using port 53. Disable it: <code>sudo systemctl disable systemd-resolved</code>.</li>' +
                         '<li><strong>Blocked percentage is 0% or extremely low:</strong> Your blocklists may not have downloaded. Run <code>pihole -g</code> to update gravity. Check <code>pihole -g -l</code> to see how many domains are in the blocklist. A fresh install with defaults should show 100,000+ domains.</li>' +
                         '<li><strong>DNS resolution is slow after Pi-hole:</strong> Pi-hole is waiting for upstream DNS responses. Check your upstream DNS in Settings &gt; DNS. Cloudflare (1.1.1.1) and Google (8.8.8.8) are fastest for most locations. Test with <code>dig @1.1.1.1 google.com +time=1</code>.</li>' +
                         '<li><strong>Smart TV or IoT device bypasses Pi-hole:</strong> Some devices (Google Home, Chromecast) hardcode 8.8.8.8 as DNS and ignore your DHCP settings. Block outbound DNS at the router: create a firewall rule that drops all traffic to port 53 except from the Pi-hole itself.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: DNS Tunneling Detection</strong> &mdash; Query the Pi-hole database for domains with unusually long subdomain labels (over 60 characters). DNS tunneling tools like <code>dnscat2</code> and <code>iodine</code> encode data in subdomain strings. Write a SQL query against <code>/etc/pihole/pihole-FTL.db</code> that flags suspicious queries.</p>' +
                    '<p><strong>Challenge 2: Scheduled Blocking</strong> &mdash; Create a cron job that disables Pi-hole from 3:00 PM to 5:00 PM on weekdays (homework time &mdash; no distracting sites). Use <code>pihole disable</code> and <code>pihole enable</code> commands. Add a second schedule that blocks social media domains only during study hours.</p>' +
                    '<p><strong>Challenge 3: Client Identification</strong> &mdash; Enable Pi-hole\'s DHCP server (disabling your router\'s DHCP) and configure hostnames for every device. After 24 hours, analyze the Query Log to identify which device makes the most tracking requests. Document the top 10 tracking domains per device category (phone, smart TV, laptop).</p>',

        commonMistakes: [
            {
                title: 'Setting Pi-hole as the only DNS with no fallback',
                correct: 'Set Pi-hole as the primary DNS and a public resolver (1.1.1.1 or 8.8.8.8) as the secondary DNS on your router. This way, if the Pi goes down, internet still works.',
                incorrect: 'Setting only the Pi\'s IP as DNS in the router with no secondary. If the Pi reboots, loses power, or the SD card corrupts, every device on the network loses DNS resolution and effectively loses internet.',
                consequence: 'Complete network outage for all devices any time the Pi is offline for updates, reboots, or failures. Family members will not be pleased.',
            },
            {
                title: 'Whitelisting too aggressively after breakage',
                correct: 'When a site breaks, check the Query Log to identify the specific blocked domain causing the issue. Whitelist only that one domain.',
                incorrect: 'Whitelisting entire top-level domains like google.com or facebook.com when a single subdomain causes breakage.',
                consequence: 'Over-whitelisting defeats the purpose of Pi-hole. Ads and trackers from whitelisted parent domains will slip through. Always whitelist the most specific domain possible.',
            },
            {
                title: 'Running pihole -up without checking for breaking changes',
                correct: 'Read the Pi-hole release notes before updating. Back up your config with Teleporter first. Then run <code>pihole -up</code>.',
                incorrect: 'Blindly running <code>pihole -up</code> on a production DNS server without reading changelogs or backing up config.',
                consequence: 'Major version upgrades occasionally change config file formats, database schemas, or default behavior. An update that breaks FTL means no DNS resolution for your entire network until you fix it.',
            }
        ]
    },

    // ========================================================================
    // SG-45: PXE Boot Server
    // ========================================================================
    'sg-45': {
        intro: '<p>PXE (Preboot Execution Environment) lets you install operating systems on computers over the network &mdash; no USB drives, no CDs, no physical media. The client powers on, its network card broadcasts a DHCP request, receives a boot file location, downloads a tiny bootloader over TFTP, and chainloads into a full OS installer served over HTTP. The entire process happens without touching the target machine.</p>' +
               '<p>This is how enterprise IT departments image hundreds of workstations simultaneously. It is how data centers provision bare-metal servers. It is how cybersecurity ranges spin up fresh target machines for exercises. We built one on neon-server to deploy Ubuntu to bc4 &mdash; now you will build your own and understand every packet in the process.</p>' +
               '<p>This project teaches the full network boot sequence: DHCP option 66/67, TFTP file transfer, iPXE chainloading, and HTTP-based OS serving. You will understand firmware-level networking, which is foundational for boot security (Secure Boot, UEFI attacks), infrastructure automation, and enterprise deployment.</p>',

        wiring: '    PXE Server (Pi/Linux)       Network Switch         Target Machine\n' +
                '    +--------------------+      +----------+          +----------------+\n' +
                '    | dnsmasq            |<---->|          |<-------->| NIC with PXE   |\n' +
                '    |  DHCP (port 67)    | ETH  | Switch   |   ETH   | BIOS: Network  |\n' +
                '    |  TFTP (port 69)    |      |          |         | Boot = First   |\n' +
                '    |                    |      +----------+         +----------------+\n' +
                '    | nginx              |\n' +
                '    |  HTTP (port 8080)  |       Boot Sequence:\n' +
                '    |  /srv/tftp/ (boot) |       1. NIC → DHCP Discover (broadcast)\n' +
                '    |  /srv/http/ (ISOs) |       2. dnsmasq → DHCP Offer + boot file\n' +
                '    +--------------------+       3. NIC → TFTP download (ipxe.efi)\n' +
                '                                 4. iPXE → HTTP menu (boot.ipxe)\n' +
                '                                 5. User selects OS\n' +
                '                                 6. iPXE → HTTP kernel + initrd\n' +
                '                                 7. Linux installer boots from network',

        wiringNotes: '<p><strong>Network isolation:</strong> Run your PXE server on an isolated network segment or VLAN. A PXE DHCP response on your main network will confuse every device trying to get an IP address. If you have only one network, use dnsmasq in <strong>proxy DHCP mode</strong> (<code>dhcp-range=...,proxy</code>) so it adds PXE boot info without replacing your router\'s DHCP.</p>' +
                     '<p><strong>BIOS vs UEFI:</strong> Modern machines boot in UEFI mode. The PXE server must detect the client\'s architecture and serve the correct bootloader: <code>undionly.kpxe</code> for legacy BIOS, <code>ipxe.efi</code> for UEFI. The dnsmasq config below handles both automatically using DHCP option 93 (client system architecture).</p>' +
                     '<p><strong>Firewall:</strong> PXE uses three ports: UDP 67 (DHCP), UDP 69 (TFTP), and TCP 8080 (HTTP file serving). All three must be open between the server and the target machine.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg45-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="440" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="420" fill="url(#sg45-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-45 PXE BOOT — NETWORK BOOT SEQUENCE</text>' +

            '<!-- PXE Server -->' +
            '<g>' +
            '<rect x="30" y="55" width="200" height="200" rx="10" fill="#1e2736" stroke="#06b6d4" stroke-width="2"/>' +
            '<rect x="30" y="55" width="200" height="24" rx="10" fill="rgba(6,182,212,0.15)"/>' +
            '<rect x="30" y="71" width="200" height="8" fill="rgba(6,182,212,0.15)"/>' +
            '<text x="130" y="73" text-anchor="middle" fill="#22d3ee" font-size="10" font-weight="700">PXE SERVER</text>' +
            '<text x="130" y="95" text-anchor="middle" fill="#8b949e" font-size="7">192.168.1.100</text>' +

            '<!-- Services -->' +
            '<rect x="42" y="108" width="85" height="28" rx="4" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.25)" stroke-width="0.5"/>' +
            '<text x="84" y="120" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">dnsmasq</text>' +
            '<text x="84" y="131" text-anchor="middle" fill="#eab308" font-size="5">DHCP + TFTP</text>' +

            '<rect x="140" y="108" width="78" height="28" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
            '<text x="179" y="120" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">nginx</text>' +
            '<text x="179" y="131" text-anchor="middle" fill="#22c55e" font-size="5">HTTP :8080</text>' +

            '<!-- File tree -->' +
            '<rect x="42" y="145" width="176" height="100" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="50" y="160" fill="#06b6d4" font-size="6">/srv/tftp/</text>' +
            '<text x="62" y="172" fill="#8b949e" font-size="6">undionly.kpxe  <tspan fill="#555">(BIOS)</tspan></text>' +
            '<text x="62" y="183" fill="#8b949e" font-size="6">ipxe.efi       <tspan fill="#555">(UEFI)</tspan></text>' +
            '<text x="50" y="198" fill="#22c55e" font-size="6">/srv/http/</text>' +
            '<text x="62" y="210" fill="#8b949e" font-size="6">menus/boot.ipxe</text>' +
            '<text x="62" y="221" fill="#8b949e" font-size="6">boot/ubuntu/vmlinuz</text>' +
            '<text x="62" y="232" fill="#8b949e" font-size="6">iso/ubuntu-24.04.iso</text>' +
            '</g>' +

            '<!-- Network Switch -->' +
            '<g>' +
            '<rect x="290" y="120" width="140" height="70" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="290" y="120" width="140" height="20" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="360" y="135" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600">NETWORK SWITCH</text>' +

            '<!-- Port indicators with animation -->' +
            '<rect x="305" y="150" width="12" height="8" rx="1.5" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<circle cx="311" cy="148" r="2" fill="#22c55e"><animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite"/></circle>' +
            '<rect x="322" y="150" width="12" height="8" rx="1.5" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<circle cx="328" cy="148" r="2" fill="#22c55e"><animate attributeName="opacity" values="0.2;1;0.2" dur="0.5s" repeatCount="indefinite"/></circle>' +
            '<rect x="339" y="150" width="12" height="8" rx="1.5" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<rect x="356" y="150" width="12" height="8" rx="1.5" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<rect x="373" y="150" width="12" height="8" rx="1.5" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<rect x="390" y="150" width="12" height="8" rx="1.5" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<rect x="407" y="150" width="12" height="8" rx="1.5" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +

            '<text x="360" y="175" text-anchor="middle" fill="#555" font-size="6">Isolated Lab Network</text>' +
            '</g>' +

            '<!-- Cables -->' +
            '<line x1="230" y1="155" x2="290" y2="155" stroke="#06b6d4" stroke-width="2"/>' +
            '<line x1="430" y1="155" x2="490" y2="155" stroke="#22c55e" stroke-width="2"/>' +

            '<!-- Target Machine -->' +
            '<g>' +
            '<rect x="490" y="55" width="200" height="200" rx="10" fill="#1e2736" stroke="#f97316" stroke-width="2"/>' +
            '<rect x="490" y="55" width="200" height="24" rx="10" fill="rgba(249,115,22,0.15)"/>' +
            '<rect x="490" y="71" width="200" height="8" fill="rgba(249,115,22,0.15)"/>' +
            '<text x="590" y="73" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="700">TARGET MACHINE</text>' +
            '<text x="590" y="93" text-anchor="middle" fill="#8b949e" font-size="7">BIOS: Network Boot = First</text>' +

            '<!-- Screen showing boot process -->' +
            '<rect x="510" y="105" width="160" height="95" rx="4" fill="#0d1117" stroke="#555" stroke-width="1"/>' +
            '<text x="520" y="120" fill="#22d3ee" font-size="6">iPXE initializing...</text>' +
            '<text x="520" y="132" fill="#4ade80" font-size="6">DHCP........ ok</text>' +
            '<text x="520" y="144" fill="#4ade80" font-size="6">TFTP boot... ok</text>' +
            '<text x="520" y="158" fill="#eab308" font-size="7" font-weight="600">Hexworth Cyber Range</text>' +
            '<text x="520" y="170" fill="#8b949e" font-size="6">[1] Ubuntu Server 24.04</text>' +
            '<text x="520" y="181" fill="#8b949e" font-size="6">[2] Kali Linux 2024</text>' +
            '<text x="520" y="192" fill="#8b949e" font-size="6">[3] Boot from local disk</text>' +

            '<!-- NIC indicator -->' +
            '<rect x="510" y="210" width="70" height="20" rx="3" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<text x="545" y="223" text-anchor="middle" fill="#22c55e" font-size="6">NIC: PXE</text>' +
            '<circle cx="520" cy="208" r="2" fill="#22c55e"><animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/></circle>' +

            '<!-- MAC address -->' +
            '<text x="590" y="245" text-anchor="middle" fill="#555" font-size="6">MAC: 44:a8:42:0c:31:fd</text>' +
            '</g>' +

            '<!-- Boot Sequence Timeline (bottom) -->' +
            '<g>' +
            '<rect x="30" y="280" width="660" height="140" rx="8" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
            '<text x="360" y="300" text-anchor="middle" fill="#8b949e" font-size="8" font-weight="600">PXE BOOT SEQUENCE</text>' +

            '<!-- Timeline line -->' +
            '<line x1="60" y1="320" x2="660" y2="320" stroke="#333" stroke-width="1"/>' +

            '<!-- Step 1: DHCP -->' +
            '<circle cx="80" cy="320" r="6" fill="rgba(234,179,8,0.2)" stroke="#eab308" stroke-width="1"/>' +
            '<text x="80" y="323" text-anchor="middle" fill="#eab308" font-size="7" font-weight="700">1</text>' +
            '<text x="80" y="338" text-anchor="middle" fill="#eab308" font-size="6">DHCP</text>' +
            '<text x="80" y="349" text-anchor="middle" fill="#555" font-size="5">Discover</text>' +
            '<text x="80" y="360" text-anchor="middle" fill="#555" font-size="5">→ Offer + boot</text>' +

            '<!-- Step 2: TFTP -->' +
            '<circle cx="180" cy="320" r="6" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" stroke-width="1"/>' +
            '<text x="180" y="323" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="700">2</text>' +
            '<text x="180" y="338" text-anchor="middle" fill="#a78bfa" font-size="6">TFTP</text>' +
            '<text x="180" y="349" text-anchor="middle" fill="#555" font-size="5">Download</text>' +
            '<text x="180" y="360" text-anchor="middle" fill="#555" font-size="5">ipxe.efi</text>' +

            '<!-- Step 3: iPXE DHCP -->' +
            '<circle cx="280" cy="320" r="6" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" stroke-width="1"/>' +
            '<text x="280" y="323" text-anchor="middle" fill="#06b6d4" font-size="7" font-weight="700">3</text>' +
            '<text x="280" y="338" text-anchor="middle" fill="#06b6d4" font-size="6">iPXE</text>' +
            '<text x="280" y="349" text-anchor="middle" fill="#555" font-size="5">2nd DHCP</text>' +
            '<text x="280" y="360" text-anchor="middle" fill="#555" font-size="5">→ HTTP URL</text>' +

            '<!-- Step 4: Menu -->' +
            '<circle cx="380" cy="320" r="6" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="380" y="323" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">4</text>' +
            '<text x="380" y="338" text-anchor="middle" fill="#22c55e" font-size="6">HTTP</text>' +
            '<text x="380" y="349" text-anchor="middle" fill="#555" font-size="5">Load menu</text>' +
            '<text x="380" y="360" text-anchor="middle" fill="#555" font-size="5">boot.ipxe</text>' +

            '<!-- Step 5: Select -->' +
            '<circle cx="480" cy="320" r="6" fill="rgba(249,115,22,0.2)" stroke="#f97316" stroke-width="1"/>' +
            '<text x="480" y="323" text-anchor="middle" fill="#f97316" font-size="7" font-weight="700">5</text>' +
            '<text x="480" y="338" text-anchor="middle" fill="#f97316" font-size="6">Select</text>' +
            '<text x="480" y="349" text-anchor="middle" fill="#555" font-size="5">User picks</text>' +
            '<text x="480" y="360" text-anchor="middle" fill="#555" font-size="5">Ubuntu</text>' +

            '<!-- Step 6: Kernel -->' +
            '<circle cx="560" cy="320" r="6" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="560" y="323" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">6</text>' +
            '<text x="560" y="338" text-anchor="middle" fill="#ef4444" font-size="6">HTTP</text>' +
            '<text x="560" y="349" text-anchor="middle" fill="#555" font-size="5">vmlinuz +</text>' +
            '<text x="560" y="360" text-anchor="middle" fill="#555" font-size="5">initrd</text>' +

            '<!-- Step 7: Boot -->' +
            '<circle cx="640" cy="320" r="6" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="640" y="323" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">7</text>' +
            '<text x="640" y="338" text-anchor="middle" fill="#22c55e" font-size="6">BOOT</text>' +
            '<text x="640" y="349" text-anchor="middle" fill="#22c55e" font-size="5">Linux</text>' +
            '<text x="640" y="360" text-anchor="middle" fill="#22c55e" font-size="5">installer!</text>' +

            '<!-- Animated progress indicator -->' +
            '<rect x="80" y="316" width="0" height="2" rx="1" fill="#22c55e" opacity="0.5">' +
            '<animate attributeName="width" values="0;560;560;0" dur="4s" repeatCount="indefinite"/>' +
            '</rect>' +

            '<!-- Protocol labels on timeline arrows -->' +
            '<text x="130" y="312" text-anchor="middle" fill="#333" font-size="4">UDP 67</text>' +
            '<text x="230" y="312" text-anchor="middle" fill="#333" font-size="4">UDP 69</text>' +
            '<text x="330" y="312" text-anchor="middle" fill="#333" font-size="4">UDP 67</text>' +
            '<text x="430" y="312" text-anchor="middle" fill="#333" font-size="4">TCP 8080</text>' +
            '<text x="520" y="312" text-anchor="middle" fill="#333" font-size="4">TCP 8080</text>' +
            '<text x="600" y="312" text-anchor="middle" fill="#333" font-size="4">TCP 8080</text>' +

            '<!-- Time estimate -->' +
            '<text x="360" y="395" text-anchor="middle" fill="#555" font-size="7">Steps 1-4: ~5 seconds &bull; Step 5: User input &bull; Steps 6-7: 30-60 seconds</text>' +
            '<text x="360" y="410" text-anchor="middle" fill="#555" font-size="6">Total: Power on to OS installer in under 2 minutes</text>' +

            '</g>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install Required Services',
                content: '<p>You need three services working together: <strong>dnsmasq</strong> handles DHCP (assigning IP addresses) and TFTP (serving the initial bootloader), <strong>nginx</strong> serves larger files (kernels, ISOs) over HTTP, and <strong>iPXE</strong> provides the chainloading bootloader that presents the boot menu.</p>' +
                         '<p>Create the directory structure first &mdash; clean organization prevents debugging nightmares later:</p>',
                code: '# Install services\nsudo apt update\nsudo apt install dnsmasq nginx -y\n\n# Stop dnsmasq from starting until configured\nsudo systemctl stop dnsmasq\n\n# Create directory structure\nsudo mkdir -p /srv/tftp           # TFTP root — bootloader files\nsudo mkdir -p /srv/http/iso       # Full ISO images\nsudo mkdir -p /srv/http/boot      # Extracted kernels and initrd\nsudo mkdir -p /srv/http/menus     # iPXE menu scripts\n\n# Download iPXE bootloader binaries\ncd /srv/tftp\nsudo wget -q http://boot.ipxe.org/undionly.kpxe    # Legacy BIOS\nsudo wget -q http://boot.ipxe.org/ipxe.efi         # UEFI 64-bit\n\n# Verify downloads\nls -lh /srv/tftp/\n# undionly.kpxe should be ~65 KB\n# ipxe.efi should be ~1 MB',
                language: 'Bash',
                tip: '<strong>Why iPXE?</strong> The PXE ROM built into network cards is limited &mdash; it only supports TFTP, which is slow and unreliable for large files. iPXE is a replacement bootloader that adds HTTP, DNS, VLAN tagging, scripting, and menu support. The PXE ROM loads iPXE via TFTP (small file, fast), then iPXE takes over and loads everything else via HTTP (fast, reliable).'
            },
            {
                title: 'Configure dnsmasq for PXE Boot',
                content: '<p>dnsmasq is the heart of the PXE server. It serves two roles simultaneously: <strong>DHCP</strong> (telling the client machine "here is your IP address, and by the way, boot from this file") and <strong>TFTP</strong> (serving that boot file when the client asks for it).</p>' +
                         '<p>The configuration below handles both BIOS and UEFI clients automatically by checking DHCP option 93 (client system architecture):</p>',
                code: '# Backup the original config\nsudo cp /etc/dnsmasq.conf /etc/dnsmasq.conf.bak\n\n# Write PXE boot configuration\nsudo tee /etc/dnsmasq.conf << \'DNSMASQEOF\'\n# ═══ Hexworth PXE Boot Server ═══\n\n# Listen on this interface only (change to match yours)\ninterface=eth0\nbind-interfaces\n\n# DHCP range — adjust for your lab network\n# Format: start-IP, end-IP, netmask, lease-time\ndhcp-range=192.168.1.200,192.168.1.250,255.255.255.0,12h\n\n# Default gateway and DNS for clients\ndhcp-option=3,192.168.1.1     # Router/gateway\ndhcp-option=6,192.168.1.1     # DNS server\n\n# Enable built-in TFTP server\nenable-tftp\ntftp-root=/srv/tftp\n\n# ─── PXE Boot Chain ───\n# Detect client architecture and serve correct bootloader\n\n# Legacy BIOS clients (architecture type 0)\ndhcp-match=set:bios,option:client-arch,0\ndhcp-boot=tag:bios,undionly.kpxe\n\n# UEFI 64-bit clients (architecture type 7 or 9)\ndhcp-match=set:efi64,option:client-arch,7\ndhcp-match=set:efi64,option:client-arch,9\ndhcp-boot=tag:efi64,ipxe.efi\n\n# iPXE clients (already chainloaded — send HTTP menu URL)\n# iPXE identifies itself with DHCP option 175\ndhcp-match=set:ipxe,175\ndhcp-boot=tag:ipxe,http://192.168.1.100:8080/menus/boot.ipxe\n\n# Verbose logging for debugging\nlog-dhcp\nlog-queries\nDNSMASQEOF\n\n# Test the config for syntax errors\ndnsmasq --test\n# Should say: dnsmasq: syntax check OK\n\n# Start dnsmasq\nsudo systemctl restart dnsmasq\nsudo systemctl status dnsmasq',
                language: 'Bash',
                tip: '<strong>The two-stage boot explained:</strong> When a bare machine PXE boots, dnsmasq sees it has no iPXE tag (option 175) and serves the TFTP bootloader (undionly.kpxe or ipxe.efi). The machine loads iPXE, which does a <em>second</em> DHCP request. This time dnsmasq sees the iPXE tag and responds with the HTTP menu URL instead. This two-stage chain is why you see two DHCP transactions in the logs.'
            },
            {
                title: 'Configure nginx for HTTP File Serving',
                content: '<p>nginx serves the large files &mdash; kernels (~15 MB), initrds (~100 MB), and full ISO images (~2 GB). TFTP is too slow and unreliable for files this size. HTTP is fast, supports resumable downloads, and can serve multiple clients simultaneously.</p>',
                code: '# Create nginx config for PXE serving\nsudo tee /etc/nginx/sites-available/pxe << \'NGINXEOF\'\nserver {\n    listen 8080;\n    server_name _;\n    root /srv/http;\n\n    # Directory listing — useful for debugging\n    autoindex on;\n    autoindex_exact_size off;\n    autoindex_localtime on;\n\n    # Allow large file transfers (ISOs can be 4+ GB)\n    client_max_body_size 0;\n\n    # Optimize for large file serving\n    sendfile on;\n    tcp_nopush on;\n    tcp_nodelay on;\n\n    location / {\n        try_files $uri $uri/ =404;\n    }\n}\nNGINXEOF\n\n# Enable the site, disable default\nsudo ln -sf /etc/nginx/sites-available/pxe /etc/nginx/sites-enabled/pxe\nsudo rm -f /etc/nginx/sites-enabled/default\n\n# Test and restart\nsudo nginx -t\nsudo systemctl restart nginx\n\n# Verify — should show empty directory listing\ncurl http://localhost:8080/\n\n# Open firewall\nsudo ufw allow 67/udp    # DHCP\nsudo ufw allow 69/udp    # TFTP\nsudo ufw allow 8080/tcp  # HTTP',
                language: 'Bash',
                tip: '<strong>Why port 8080?</strong> Using a non-standard port avoids conflicts with any other web server on the machine. Port 80 is the default for nginx and might already be in use (e.g., by Pi-hole\'s lighttpd). Port 8080 is a common alternative that does not require root privileges.'
            },
            {
                title: 'Create the iPXE Boot Menu',
                content: '<p>The boot menu is what appears on the target machine\'s screen after PXE boot completes. It is written in iPXE\'s scripting language &mdash; a simple, readable format that supports variables, timeouts, menus, and conditional logic.</p>' +
                         '<p>This menu will show available operating systems, auto-select "boot from local disk" after 30 seconds (so machines do not get stuck in PXE boot loops), and chain-load the correct kernel for each OS:</p>',
                code: '# Create the boot menu script\nsudo tee /srv/http/menus/boot.ipxe << \'IPXEEOF\'\n#!ipxe\n\n# ═══════════════════════════════════════════\n#  HEXWORTH CYBER RANGE — NETWORK BOOT MENU\n# ═══════════════════════════════════════════\n\nset menu-timeout 30000\nset menu-default exit\n\n:start\nmenu Hexworth Cyber Range - Network Boot\nitem --gap --  =============================================\nitem --gap --    Select an operating system to install:\nitem --gap --  =============================================\nitem ubuntu      Ubuntu Server 24.04 LTS\nitem kali        Kali Linux 2024.4\nitem --gap --  =============================================\nitem shell       Drop to iPXE shell (debug)\nitem exit        Exit PXE - boot from local disk\nchoose --timeout ${menu-timeout} --default ${menu-default} selected\ngoto ${selected}\n\n:ubuntu\necho Booting Ubuntu Server 24.04...\nkernel http://192.168.1.100:8080/boot/ubuntu/vmlinuz initrd=initrd ip=dhcp url=http://192.168.1.100:8080/iso/ubuntu-24.04-live-server-amd64.iso autoinstall\ninitrd http://192.168.1.100:8080/boot/ubuntu/initrd\nboot\n\n:kali\necho Booting Kali Linux installer...\nkernel http://192.168.1.100:8080/boot/kali/vmlinuz initrd=initrd.gz\ninitrd http://192.168.1.100:8080/boot/kali/initrd.gz\nboot\n\n:shell\necho Type \"exit\" to return to menu\nshell\ngoto start\n\n:exit\nexit\nIPXEEOF\n\n# Verify the menu is accessible\ncurl http://localhost:8080/menus/boot.ipxe',
                language: 'iPXE Script',
                tip: '<strong>Customization:</strong> You can add as many OS entries as you want. Each entry needs a <code>kernel</code> line (the Linux kernel), an <code>initrd</code> line (the initial ramdisk), and a <code>boot</code> command. You can also add Windows PE entries, diagnostic tools (Memtest86), or live rescue environments.'
            },
            {
                title: 'Download and Prepare Ubuntu Boot Files',
                content: '<p>Download the Ubuntu Server ISO and extract the kernel (<code>vmlinuz</code>) and initial ramdisk (<code>initrd</code>) that iPXE needs to start the installer. The full ISO is also served over HTTP &mdash; the Ubuntu installer downloads packages from it during installation.</p>',
                code: '# Download Ubuntu Server ISO (~2.5 GB)\ncd /srv/http/iso\nsudo wget -q --show-progress \\\n  https://releases.ubuntu.com/24.04/ubuntu-24.04-live-server-amd64.iso\n\n# Extract kernel and initrd from the ISO\nsudo mkdir -p /srv/http/boot/ubuntu\nsudo mkdir -p /tmp/ubuntu-mount\n\n# Mount the ISO (read-only loop mount)\nsudo mount -o loop,ro /srv/http/iso/ubuntu-24.04-live-server-amd64.iso \\\n  /tmp/ubuntu-mount\n\n# Copy boot files\nsudo cp /tmp/ubuntu-mount/casper/vmlinuz /srv/http/boot/ubuntu/\nsudo cp /tmp/ubuntu-mount/casper/initrd  /srv/http/boot/ubuntu/\n\n# Unmount\nsudo umount /tmp/ubuntu-mount\nsudo rmdir /tmp/ubuntu-mount\n\n# Verify file sizes\nls -lh /srv/http/boot/ubuntu/\n# vmlinuz: ~14 MB\n# initrd:  ~100-180 MB\n\nls -lh /srv/http/iso/\n# ubuntu-24.04-live-server-amd64.iso: ~2.5 GB\n\n# Verify HTTP serving\ncurl -sI http://localhost:8080/boot/ubuntu/vmlinuz | head -5\n# Should show HTTP/1.1 200 OK',
                language: 'Bash',
                tip: '<strong>Storage planning:</strong> Each OS ISO is 2&ndash;5 GB. If you plan to serve multiple distributions, ensure your Pi or server has enough storage. A 64 GB SD card holds ~10 ISOs comfortably. For a serious PXE lab, use a USB SSD for storage performance and capacity.'
            },
            {
                title: 'PXE Boot a Client Machine',
                content: '<p>Connect your target machine to the same network as the PXE server via Ethernet. Enter the BIOS/UEFI firmware settings (usually <code>F2</code>, <code>F12</code>, or <code>Del</code> at power-on) and set <strong>Network Boot</strong> (also called PXE Boot or LAN Boot) as the first boot device. Save and restart.</p>' +
                         '<p>Monitor the boot process from both sides simultaneously &mdash; the server logs and the client screen:</p>',
                code: '# === ON THE PXE SERVER ===\n# Watch the boot process in real time:\nsudo journalctl -u dnsmasq -f\n\n# You will see this sequence:\n# 1. DHCPDISCOVER(eth0) xx:xx:xx:xx:xx:xx    ← NIC broadcasts\n# 2. DHCPOFFER(eth0) 192.168.1.200 ... boot  ← Server responds\n#    file name: ipxe.efi                      ← UEFI bootloader\n# 3. sent /srv/tftp/ipxe.efi to 192.168.1.200 ← TFTP transfer\n# 4. DHCPDISCOVER(eth0) xx:xx:xx:xx:xx:xx    ← iPXE re-DHCPs\n#    (option 175 present — iPXE identified)\n# 5. DHCPOFFER with boot URL                 ← HTTP menu URL sent\n\n# Check nginx access logs for the HTTP phase:\nsudo tail -f /var/log/nginx/access.log\n# You will see:\n# GET /menus/boot.ipxe               ← Menu loaded\n# GET /boot/ubuntu/vmlinuz           ← Kernel downloaded\n# GET /boot/ubuntu/initrd            ← Initrd downloaded\n\n# === ON THE CLIENT SCREEN ===\n# 1. "PXE Boot" or "Network Boot" appears in BIOS\n# 2. "iPXE initializing..." banner appears\n# 3. DHCP negotiation messages scroll by\n# 4. "Hexworth Cyber Range" menu appears\n# 5. Select Ubuntu — kernel and initrd download\n# 6. Ubuntu installer starts!\n\n# === TROUBLESHOOTING ===\n# No DHCP offer? → Check interface name in dnsmasq.conf\n# TFTP timeout?  → sudo ufw allow 69/udp\n# Menu loads but kernel fails? → Check IP in boot.ipxe matches server\n# Kernel panic?  → initrd path may be wrong, check casper/ directory',
                language: 'Bash',
                tip: '<strong>From our bc4 build:</strong> If the client NIC has Broadcom firmware, it may not support proxy DHCP mode &mdash; use full DHCP mode instead. Also watch for VLAN tagging issues on managed switches &mdash; if the NIC is tagging all frames with VLAN 1, the switch may drop them. Set the switch port to access mode (untagged) on the PXE VLAN.'
            }
        ],

        testing: '<p><strong>Verification checklist &mdash; confirm each item before declaring the PXE server operational:</strong></p>' +
                 '<ul>' +
                 '<li>dnsmasq is running: <code>sudo systemctl status dnsmasq</code> shows active</li>' +
                 '<li>nginx serves files: <code>curl http://localhost:8080/</code> shows directory listing</li>' +
                 '<li>iPXE files exist: <code>ls -la /srv/tftp/undionly.kpxe /srv/tftp/ipxe.efi</code></li>' +
                 '<li>Menu is accessible: <code>curl http://localhost:8080/menus/boot.ipxe</code> shows the script</li>' +
                 '<li>Kernel is accessible: <code>curl -sI http://localhost:8080/boot/ubuntu/vmlinuz</code> returns 200</li>' +
                 '<li>Client PXE boots and displays the Hexworth Cyber Range menu</li>' +
                 '<li>Selecting Ubuntu starts the installer &mdash; kernel loads, installer UI appears</li>' +
                 '<li>dnsmasq logs show the complete two-stage DHCP sequence</li>' +
                 '<li>nginx access logs show GET requests for menu, kernel, and initrd</li>' +
                 '</ul>' +
                 '<p>If all checks pass, you have a working PXE boot server. Add more OS entries to the menu as you download ISOs for Kali, Windows PE, Memtest86, and other tools. This server becomes the foundation for your cyber range &mdash; you can deploy fresh target machines in under 2 minutes, every time.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Client NIC says "No boot device found" or skips PXE entirely:</strong> Network boot is disabled in the client\'s BIOS/UEFI. Enter firmware settings (F2, F12, or Del at power-on) and enable Network Boot / PXE Boot / LAN Boot. Set it as the first boot device priority.</li>' +
                         '<li><strong>Client gets "PXE-E32: TFTP open timeout":</strong> The client received a DHCP offer but cannot reach the TFTP server. Check: (1) <code>sudo ufw status</code> &mdash; UDP port 69 must be open. (2) Verify dnsmasq is running: <code>sudo systemctl status dnsmasq</code>. (3) Confirm the TFTP root path is correct: <code>ls /srv/tftp/ipxe.efi</code>.</li>' +
                         '<li><strong>iPXE loads but menu fails to download (HTTP error):</strong> The boot.ipxe URL in dnsmasq.conf has the wrong IP address or port. Verify with <code>curl http://PI_IP:8080/menus/boot.ipxe</code> from another machine. Also check that nginx is running and listening on port 8080.</li>' +
                         '<li><strong>Menu appears but kernel download fails or hangs:</strong> The vmlinuz or initrd path in boot.ipxe does not match the actual file location. Check <code>ls -la /srv/http/boot/ubuntu/</code> and ensure the filenames in the iPXE script match exactly (case-sensitive).</li>' +
                         '<li><strong>dnsmasq conflicts with existing DHCP server:</strong> If your router is also serving DHCP, you will have two DHCP servers on the same network. Either configure dnsmasq as a proxy DHCP server (add <code>dhcp-range=192.168.1.0,proxy</code>) or disable DHCP on your router and let dnsmasq handle it entirely.</li>' +
                         '<li><strong>UEFI client boots but Legacy BIOS client does not (or vice versa):</strong> dnsmasq needs both bootloader files present. Verify <code>/srv/tftp/undionly.kpxe</code> exists (for Legacy BIOS) and <code>/srv/tftp/ipxe.efi</code> exists (for UEFI). Check that the <code>dhcp-match</code> tags in dnsmasq.conf are correct for both architectures.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Multi-OS Menu</strong> &mdash; Add Kali Linux and a diagnostic tool (Memtest86+) to your iPXE boot menu. Download each ISO, extract the kernel and initrd, and create new menu entries in boot.ipxe. Test that each option boots the correct installer.</p>' +
                    '<p><strong>Challenge 2: Unattended Installation</strong> &mdash; Create an autoinstall (cloud-init) configuration for Ubuntu Server that automatically sets hostname, creates a user, installs packages, and configures networking without any human interaction. Serve it via HTTP alongside the kernel.</p>' +
                    '<p><strong>Challenge 3: MAC-Based Auto-Selection</strong> &mdash; Modify the iPXE script to detect the client\'s MAC address and automatically boot a specific OS without showing the menu. For example, bc4 always boots Ubuntu, while another machine always boots Kali. Use iPXE\'s <code>iseq</code> and <code>goto</code> commands.</p>',

        commonMistakes: [
            {
                title: 'Using the same DHCP range as the router',
                correct: 'Use a DHCP range that does not overlap with your router\'s range. If your router hands out .2-.199, set dnsmasq to .200-.250.',
                incorrect: 'Configuring dnsmasq with the same IP range as your router\'s DHCP server.',
                consequence: 'Two DHCP servers handing out overlapping addresses causes IP conflicts, dropped connections, and random network failures for every device on the network &mdash; not just PXE clients.',
            },
            {
                title: 'Forgetting to update IP addresses in boot.ipxe after changing the server IP',
                correct: 'Whenever the PXE server\'s IP changes, update every <code>http://</code> URL in <code>/srv/http/menus/boot.ipxe</code> and the DHCP boot URL in <code>/etc/dnsmasq.conf</code>.',
                incorrect: 'Changing the server IP address (or moving to a different network) without updating the hardcoded IPs in the menu script and dnsmasq config.',
                consequence: 'The iPXE menu loads (cached from TFTP) but all kernel downloads fail because the HTTP URLs point to the old IP address. The client hangs at "Downloading kernel..." indefinitely.',
            },
            {
                title: 'Serving large files over TFTP instead of HTTP',
                correct: 'Use TFTP only for the initial iPXE bootloader (~1 MB). Serve kernels, initrds, and ISOs over HTTP via nginx.',
                incorrect: 'Pointing the boot menu at TFTP paths for kernel and initrd downloads.',
                consequence: 'TFTP has no error recovery, no flow control, and transfers in 512-byte blocks. A 100 MB initrd over TFTP takes minutes and frequently fails partway through. HTTP transfers the same file in seconds with automatic retry.',
            }
        ]
    },

    // ========================================================================
    // SG-46: NAS File Server with Samba
    // ========================================================================
    'sg-46': {
        intro: '<p>A NAS (Network-Attached Storage) server turns your Raspberry Pi into a shared file server that every device on your network can access &mdash; Windows, macOS, Linux, phones, tablets. Plug in a USB drive, configure Samba, and suddenly you have centralized storage that the whole house can use.</p>' +
               '<p>In cybersecurity, shared storage is everywhere &mdash; evidence collection drives, forensic image repositories, malware sample libraries, tool distributions, and lab ISO storage. Understanding how SMB/CIFS file sharing works, how permissions are enforced, and how to secure it against unauthorized access is essential knowledge for both defense and offense.</p>' +
               '<p>This project teaches Linux filesystem management (mounting, formatting, fstab), Samba configuration, user-level access control, and cross-platform file sharing. You will also learn why open SMB shares are one of the most commonly exploited misconfigurations in enterprise networks.</p>',

        wiring: '    Raspberry Pi NAS               Network\n' +
                '    +--------------------+         +----------+\n' +
                '    |  Pi 4/5            |<------->|  Switch  |<----> Devices\n' +
                '    |                    |  ETH    +----------+\n' +
                '    |  USB 3.0 port      |\n' +
                '    |   |                |\n' +
                '    |   v                |\n' +
                '    | [USB External      |\n' +
                '    |  Drive / SSD]      |\n' +
                '    |  mounted at        |\n' +
                '    |  /mnt/nas          |\n' +
                '    |                    |     Access paths:\n' +
                '    |  Samba (port 445)  |     Windows: \\\\192.168.1.100\\shared\n' +
                '    |  shares:           |     macOS:   smb://192.168.1.100/shared\n' +
                '    |   /shared (rw)     |     Linux:   mount -t cifs //IP/shared\n' +
                '    |   /public (ro)     |\n' +
                '    +--------------------+',

        wiringNotes: '<p><strong>USB 3.0 matters:</strong> Use the blue USB 3.0 ports on the Pi 4/5, not the black USB 2.0 ports. USB 3.0 gives you ~300 MB/s throughput; USB 2.0 caps at ~35 MB/s. For a NAS serving multiple clients, this difference is massive.</p>' +
                     '<p><strong>Drive format:</strong> Format the external drive as <strong>ext4</strong> (native Linux filesystem). NTFS works but has overhead from the ntfs-3g FUSE driver. exFAT lacks permission support. ext4 is the fastest and most reliable option for a Linux NAS.</p>' +
                     '<p><strong>Power:</strong> Large USB drives may draw more power than the Pi can supply. If the drive disconnects randomly, use a powered USB hub between the Pi and the drive.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg46-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg46-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-46 SAMBA NAS FILE SERVER</text>' +

            '<!-- Pi NAS Server -->' +
            '<g>' +
            '<rect x="30" y="50" width="220" height="220" rx="10" fill="#1e2736" stroke="#f97316" stroke-width="2"/>' +
            '<rect x="30" y="50" width="220" height="24" rx="10" fill="rgba(249,115,22,0.15)"/>' +
            '<rect x="30" y="66" width="220" height="8" fill="rgba(249,115,22,0.15)"/>' +
            '<text x="140" y="68" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="700">NAS SERVER</text>' +
            '<text x="140" y="88" text-anchor="middle" fill="#8b949e" font-size="7">Raspberry Pi 4 &bull; Samba</text>' +
            '<text x="140" y="100" text-anchor="middle" fill="#555" font-size="7">192.168.1.100</text>' +

            '<!-- USB Drive -->' +
            '<rect x="45" y="115" width="90" height="60" rx="6" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="50" y="120" width="20" height="10" rx="2" fill="#3b82f6" opacity="0.4"/>' +
            '<text x="90" y="140" text-anchor="middle" fill="#3b82f6" font-size="8" font-weight="600">USB SSD</text>' +
            '<text x="90" y="153" text-anchor="middle" fill="#60a5fa" font-size="6">1 TB ext4</text>' +
            '<text x="90" y="165" text-anchor="middle" fill="#555" font-size="5">/mnt/nas</text>' +

            '<!-- Capacity bar -->' +
            '<rect x="45" y="170" width="90" height="4" rx="2" fill="rgba(255,255,255,0.06)"/>' +
            '<rect x="45" y="170" width="35" height="4" rx="2" fill="#3b82f6" opacity="0.6"/>' +
            '<text x="90" y="180" text-anchor="middle" fill="#555" font-size="5">350 GB / 1 TB used</text>' +

            '<!-- Samba shares -->' +
            '<rect x="145" y="115" width="95" height="60" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="192" y="130" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">SHARES</text>' +

            '<rect x="152" y="137" width="80" height="14" rx="3" fill="rgba(34,197,94,0.08)"/>' +
            '<text x="160" y="147" fill="#4ade80" font-size="6">/shared</text>' +
            '<text x="225" y="147" text-anchor="end" fill="#22c55e" font-size="5">rw</text>' +

            '<rect x="152" y="155" width="80" height="14" rx="3" fill="rgba(234,179,8,0.08)"/>' +
            '<text x="160" y="165" fill="#eab308" font-size="6">/public</text>' +
            '<text x="225" y="165" text-anchor="end" fill="#eab308" font-size="5">ro</text>' +

            '<!-- Samba port -->' +
            '<rect x="70" y="195" width="120" height="22" rx="4" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
            '<text x="130" y="210" text-anchor="middle" fill="#fb923c" font-size="7">SMB/CIFS &bull; port 445</text>' +

            '<!-- Security badge -->' +
            '<rect x="70" y="225" width="120" height="30" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="130" y="238" text-anchor="middle" fill="#fca5a5" font-size="6" font-weight="600">ACCESS CONTROL</text>' +
            '<text x="130" y="250" text-anchor="middle" fill="#ef4444" font-size="5">User auth &bull; No guest &bull; Encrypted</text>' +
            '</g>' +

            '<!-- Network connection -->' +
            '<line x1="250" y1="190" x2="330" y2="190" stroke="#f97316" stroke-width="2"/>' +

            '<!-- Network Switch -->' +
            '<g>' +
            '<rect x="330" y="160" width="100" height="60" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="380" y="185" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">SWITCH</text>' +
            '<text x="380" y="200" text-anchor="middle" fill="#555" font-size="6">1 Gbps</text>' +
            '<!-- Port LEDs -->' +
            '<circle cx="345" cy="210" r="2" fill="#22c55e"><animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/></circle>' +
            '<circle cx="355" cy="210" r="2" fill="#22c55e"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.6s" repeatCount="indefinite"/></circle>' +
            '<circle cx="365" cy="210" r="2" fill="#22c55e"><animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/></circle>' +
            '<circle cx="375" cy="210" r="2" fill="#555"/>' +
            '</g>' +

            '<!-- Client Devices -->' +
            '<line x1="430" y1="170" x2="510" y2="80" stroke="#a78bfa" stroke-width="1.5"/>' +
            '<line x1="430" y1="185" x2="510" y2="185" stroke="#38bdf8" stroke-width="1.5"/>' +
            '<line x1="430" y1="200" x2="510" y2="280" stroke="#22c55e" stroke-width="1.5"/>' +

            '<!-- Windows PC -->' +
            '<rect x="510" y="55" width="170" height="55" rx="6" fill="#1e2736" stroke="#a78bfa" stroke-width="1"/>' +
            '<text x="595" y="78" text-anchor="middle" fill="#a78bfa" font-size="8" font-weight="600">Windows PC</text>' +
            '<text x="595" y="93" text-anchor="middle" fill="#555" font-size="6">\\\\192.168.1.100\\shared</text>' +
            '<text x="595" y="104" text-anchor="middle" fill="#555" font-size="5">Maps as network drive (Z:)</text>' +

            '<!-- macOS -->' +
            '<rect x="510" y="160" width="170" height="55" rx="6" fill="#1e2736" stroke="#38bdf8" stroke-width="1"/>' +
            '<text x="595" y="183" text-anchor="middle" fill="#38bdf8" font-size="8" font-weight="600">macOS</text>' +
            '<text x="595" y="198" text-anchor="middle" fill="#555" font-size="6">smb://192.168.1.100/shared</text>' +
            '<text x="595" y="209" text-anchor="middle" fill="#555" font-size="5">Finder &gt; Go &gt; Connect to Server</text>' +

            '<!-- Linux -->' +
            '<rect x="510" y="255" width="170" height="55" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="595" y="278" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">Linux</text>' +
            '<text x="595" y="293" text-anchor="middle" fill="#555" font-size="6">mount -t cifs //IP/shared /mnt</text>' +
            '<text x="595" y="304" text-anchor="middle" fill="#555" font-size="5">Or: Files app &gt; Other Locations</text>' +

            '<!-- Transfer speed indicator -->' +
            '<rect x="330" y="285" width="100" height="50" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="380" y="302" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">THROUGHPUT</text>' +
            '<text x="380" y="316" text-anchor="middle" fill="#4ade80" font-size="12" font-weight="700">~110</text>' +
            '<text x="380" y="328" text-anchor="middle" fill="#4ade80" font-size="6">MB/s (USB 3.0 + Gbps ETH)</text>' +

            '<!-- Security warning -->' +
            '<rect x="30" y="290" width="220" height="60" rx="6" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="140" y="306" text-anchor="middle" fill="#fca5a5" font-size="7" font-weight="600">SECURITY NOTE</text>' +
            '<text x="140" y="320" text-anchor="middle" fill="#8b949e" font-size="6">Open SMB shares are the #1</text>' +
            '<text x="140" y="332" text-anchor="middle" fill="#8b949e" font-size="6">lateral movement vector in</text>' +
            '<text x="140" y="344" text-anchor="middle" fill="#8b949e" font-size="6">enterprise compromises (EternalBlue)</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Prepare the USB Drive',
                content: '<p>Connect your USB drive to one of the <strong>blue USB 3.0 ports</strong> on the Pi. Identify the drive, create a new ext4 filesystem, and set up a permanent mount point. <strong>Warning:</strong> formatting erases all data on the drive.</p>',
                code: '# Identify the USB drive\nlsblk\n# Look for your drive — usually /dev/sda or /dev/sdb\n# The Pi\'s SD card is /dev/mmcblk0 — do NOT format that\n\n# Check current partitions\nsudo fdisk -l /dev/sda\n\n# Create ext4 filesystem (ERASES ALL DATA)\nsudo mkfs.ext4 -L nas-storage /dev/sda1\n# If the drive has no partition table:\n# sudo parted /dev/sda mklabel gpt\n# sudo parted /dev/sda mkpart primary ext4 0% 100%\n# sudo mkfs.ext4 -L nas-storage /dev/sda1\n\n# Create mount point\nsudo mkdir -p /mnt/nas\n\n# Mount the drive\nsudo mount /dev/sda1 /mnt/nas\n\n# Verify\ndf -h /mnt/nas\n\n# Make it mount automatically on boot\n# Get the drive UUID (persistent identifier)\nsudo blkid /dev/sda1\n# Copy the UUID value\n\n# Add to fstab\necho "UUID=YOUR-UUID-HERE /mnt/nas ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab\n\n# Test fstab (unmount and remount)\nsudo umount /mnt/nas\nsudo mount -a\ndf -h /mnt/nas\n# If this works, the drive will mount automatically on every boot',
                language: 'Bash',
                tip: '<strong>Why <code>nofail</code>?</strong> The <code>nofail</code> option in fstab means the Pi will still boot if the USB drive is disconnected. Without it, a missing drive causes the Pi to drop into emergency mode on boot &mdash; and since it is headless, you cannot fix it without pulling the SD card.'
            },
            {
                title: 'Create Share Directories and Set Permissions',
                content: '<p>Create the directories that Samba will share, then set up Linux users and permissions. Samba respects Linux filesystem permissions &mdash; if a user cannot read a file on Linux, they cannot read it through the SMB share either.</p>',
                code: '# Create share directories\nsudo mkdir -p /mnt/nas/shared     # Read-write for authenticated users\nsudo mkdir -p /mnt/nas/public     # Read-only for everyone\nsudo mkdir -p /mnt/nas/backups    # Private — one user only\n\n# Create a dedicated Samba group\nsudo groupadd nasusers\n\n# Create Samba users (these are separate from SSH users)\n# Add a user for yourself\nsudo useradd -M -s /usr/sbin/nologin nasuser1\nsudo smbpasswd -a nasuser1\n# Enter a password (used for SMB login)\nsudo smbpasswd -e nasuser1\n\n# Add user to the group\nsudo usermod -aG nasusers nasuser1\n\n# Set directory ownership and permissions\nsudo chown -R root:nasusers /mnt/nas/shared\nsudo chmod -R 2775 /mnt/nas/shared\n# 2775: setgid bit ensures new files inherit the group\n# Owner: rwx, Group: rwx, Others: r-x\n\nsudo chown -R root:nasusers /mnt/nas/public\nsudo chmod -R 2755 /mnt/nas/public\n# 2755: group can read, others can read, only owner can write\n\nsudo chown -R nasuser1:nasuser1 /mnt/nas/backups\nsudo chmod -R 700 /mnt/nas/backups\n# 700: only the owner can access',
                language: 'Bash',
                tip: '<strong>The setgid bit (2xxx):</strong> The <code>2</code> in <code>2775</code> is the setgid bit. It means new files and directories created inside this directory automatically inherit the parent\'s group ownership. Without it, files created by nasuser1 would be owned by nasuser1\'s primary group, and nasuser2 might not be able to access them. Setgid solves the shared directory permissions problem.'
            },
            {
                title: 'Install and Configure Samba',
                content: '<p>Install Samba, then write the configuration file that defines your shares. Each <code>[share]</code> block defines a network share with its path, permissions, and access rules.</p>',
                code: '# Install Samba\nsudo apt install samba samba-common-bin -y\n\n# Backup original config\nsudo cp /etc/samba/smb.conf /etc/samba/smb.conf.bak\n\n# Write Samba configuration\nsudo tee /etc/samba/smb.conf << \'SMBEOF\'\n[global]\n   # Server identity\n   server string = Hexworth NAS\n   workgroup = WORKGROUP\n   server role = standalone server\n\n   # Security settings\n   security = user\n   map to guest = never\n   guest ok = no\n\n   # SMB protocol versions (disable SMBv1 — it is vulnerable)\n   server min protocol = SMB2\n   server max protocol = SMB3\n\n   # Performance tuning\n   socket options = TCP_NODELAY IPTOS_LOWDELAY\n   read raw = yes\n   write raw = yes\n   use sendfile = yes\n   aio read size = 16384\n   aio write size = 16384\n\n   # Logging\n   log file = /var/log/samba/log.%m\n   max log size = 1000\n   log level = 1\n\n[shared]\n   comment = Shared Files (read-write)\n   path = /mnt/nas/shared\n   browseable = yes\n   read only = no\n   valid users = @nasusers\n   create mask = 0664\n   directory mask = 0775\n   force group = nasusers\n\n[public]\n   comment = Public Files (read-only)\n   path = /mnt/nas/public\n   browseable = yes\n   read only = yes\n   valid users = @nasusers\n   guest ok = no\n\n[backups]\n   comment = Private Backups\n   path = /mnt/nas/backups\n   browseable = no\n   read only = no\n   valid users = nasuser1\n   create mask = 0600\n   directory mask = 0700\nSMBEOF\n\n# Test the configuration for errors\ntestparm -s\n\n# Restart Samba\nsudo systemctl restart smbd nmbd\nsudo systemctl enable smbd nmbd\n\n# Open firewall\nsudo ufw allow samba\nsudo ufw status',
                language: 'Bash',
                tip: '<strong>Security hardening:</strong> Setting <code>server min protocol = SMB2</code> disables SMBv1, which is vulnerable to EternalBlue (the exploit behind WannaCry and NotPetya). Never enable SMBv1 unless you have legacy devices that absolutely require it &mdash; and even then, isolate them on a separate VLAN.'
            },
            {
                title: 'Connect from Client Devices',
                content: '<p>Now test access from every platform. Each OS has a slightly different method for connecting to SMB shares:</p>',
                code: '# === WINDOWS ===\n# File Explorer address bar: \\\\192.168.1.100\\shared\n# Or: Map Network Drive > folder: \\\\192.168.1.100\\shared\n# Enter nasuser1 credentials when prompted\n# Check "Reconnect at sign-in" for persistence\n\n# === macOS ===\n# Finder > Go > Connect to Server (Cmd+K)\n# Enter: smb://192.168.1.100/shared\n# Authenticate with nasuser1 credentials\n\n# === Linux ===\n# GUI: Files app > Other Locations > Connect to Server\n#   smb://192.168.1.100/shared\n\n# CLI mount (temporary):\nsudo mount -t cifs //192.168.1.100/shared /mnt/nas-mount \\\n  -o username=nasuser1,uid=$(id -u),gid=$(id -g)\n\n# Persistent mount (add to /etc/fstab):\n# First, store credentials securely:\necho "username=nasuser1" | sudo tee /root/.smbcreds\necho "password=YourPassword" | sudo tee -a /root/.smbcreds\nsudo chmod 600 /root/.smbcreds\n\n# Add to fstab:\necho "//192.168.1.100/shared /mnt/nas-mount cifs credentials=/root/.smbcreds,uid=$(id -u),gid=$(id -g),nofail 0 0" \\\n  | sudo tee -a /etc/fstab\n\n# === TEST FROM THE PI ===\n# Verify shares are advertised:\nsmbclient -L localhost -U nasuser1\n\n# Connect to your own share:\nsmbclient //localhost/shared -U nasuser1\n# smb: \\> ls\n# smb: \\> put testfile.txt\n# smb: \\> get testfile.txt\n# smb: \\> quit',
                language: 'Bash',
                tip: '<strong>Credentials file:</strong> Never put SMB passwords directly in <code>/etc/fstab</code> &mdash; they would be readable by any user with <code>cat /etc/fstab</code>. The <code>.smbcreds</code> file with <code>chmod 600</code> restricts access to root only. This is the standard pattern for automated SMB mounts.'
            },
            {
                title: 'Monitor and Secure the NAS',
                content: '<p>Your NAS is live. Now set up monitoring to track who is connecting, what files are being accessed, and how much storage is being used. Also implement the security measures that separate a home NAS from an enterprise liability.</p>',
                code: '# === MONITORING ===\n\n# Who is currently connected?\nsmbstatus\n# Shows: PID, username, group, machine, protocol, signing\n\n# What files are open?\nsmbstatus --shares\n\n# Watch connections in real time\nwatch -n 5 smbstatus\n\n# Check Samba logs\nsudo tail -f /var/log/samba/log.*\n\n# Storage usage by directory\ndu -sh /mnt/nas/shared/* 2>/dev/null | sort -rh | head -20\n\n# Overall disk usage\ndf -h /mnt/nas\n\n# === SECURITY AUDIT ===\n\n# List all Samba users\nsudo pdbedit -L -v\n\n# Verify SMBv1 is disabled (should show SMB2+)\nsmbclient -L localhost -U nasuser1 --option="client min protocol=NT1" 2>&1 | head -5\n# Should fail or show protocol negotiation error\n\n# Check for anonymous access (should fail)\nsmbclient -L localhost -N 2>&1 | head -5\n# "NT_STATUS_ACCESS_DENIED" = good — no anonymous access\n\n# Verify file permissions are correct\nls -la /mnt/nas/shared/\n# Should show nasusers group, 2775 permissions\n\n# Test unauthorized access\n# Try accessing /backups as a different user — should be denied\n\n# === AUTOMATED MONITORING SCRIPT ===\ncat << \'MONEOF\' > ~/nas-monitor.sh\n#!/bin/bash\necho "=== NAS Health Check — $(date) ==="\necho ""\necho "Storage:"\ndf -h /mnt/nas | tail -1\necho ""\necho "Active connections:"\nsmbstatus --brief 2>/dev/null | grep -v "^$" | tail -10\necho ""\necho "Open files:"\nsmbstatus --shares 2>/dev/null | grep -c ""\necho ""\necho "Samba service:"\nsystemctl is-active smbd && echo "  smbd: running" || echo "  smbd: STOPPED"\nsystemctl is-active nmbd && echo "  nmbd: running" || echo "  nmbd: STOPPED"\nMONEOF\nchmod +x ~/nas-monitor.sh\n\n# Run it\nbash ~/nas-monitor.sh',
                language: 'Bash',
                tip: '<strong>Offensive perspective:</strong> When you do penetration testing, one of the first things you check is open SMB shares (<code>smbclient -L target -N</code>). Misconfigured shares with anonymous access are treasure troves &mdash; credentials in config files, database backups, source code, internal documents. The NAS you just built is secure because you disabled guest access, required authentication, and enforced per-share permissions. Most corporate NAS deployments are not this careful.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>USB drive is mounted: <code>df -h /mnt/nas</code> shows the drive</li>' +
                 '<li>Drive mounts on boot: <code>sudo umount /mnt/nas && sudo mount -a && df -h /mnt/nas</code></li>' +
                 '<li>Samba services running: <code>systemctl is-active smbd nmbd</code></li>' +
                 '<li>Configuration valid: <code>testparm -s</code> shows no errors</li>' +
                 '<li>Windows can connect: <code>\\\\PI_IP\\shared</code> opens in File Explorer</li>' +
                 '<li>macOS can connect: <code>smb://PI_IP/shared</code> mounts in Finder</li>' +
                 '<li>Linux can connect: <code>smbclient //PI_IP/shared -U nasuser1</code> works</li>' +
                 '<li>Read-only share enforced: writing to <code>/public</code> fails from clients</li>' +
                 '<li>Private share hidden: <code>/backups</code> does not appear in share listing</li>' +
                 '<li>Anonymous access denied: <code>smbclient -L PI_IP -N</code> fails</li>' +
                 '<li>SMBv1 disabled: only SMB2/SMB3 connections succeed</li>' +
                 '</ul>' +
                 '<p>Your NAS is operational and secured. Use <code>/shared</code> for lab tool distribution, ISO storage, and evidence collection. Use <code>/backups</code> for automated Pi backups (SG-52). Use <code>/public</code> for read-only reference material that everyone can access but nobody can modify.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>USB drive not detected (<code>lsblk</code> shows no /dev/sda):</strong> (1) Try a different USB port &mdash; use the blue USB 3.0 ports. (2) The drive may need more power than the Pi can supply. Use a powered USB hub. (3) Check <code>dmesg | tail -20</code> after plugging in &mdash; look for USB reset or overcurrent errors.</li>' +
                         '<li><strong>Drive mounts manually but not on boot (fstab fails):</strong> The UUID in fstab does not match the drive. Run <code>sudo blkid /dev/sda1</code> and compare the UUID to what is in <code>/etc/fstab</code>. Also verify you included the <code>nofail</code> option &mdash; without it, a missing drive drops the Pi into emergency mode.</li>' +
                         '<li><strong>Windows cannot connect ("network path not found"):</strong> (1) Ensure smbd is running: <code>systemctl is-active smbd</code>. (2) Check firewall: <code>sudo ufw status</code> must show Samba allowed. (3) On Windows, try the IP directly: <code>\\\\192.168.1.100\\shared</code> not the hostname. (4) Verify the Samba user exists: <code>sudo pdbedit -L</code>.</li>' +
                         '<li><strong>"Access denied" when connecting with correct credentials:</strong> The Samba password is separate from the Linux password. Set it with <code>sudo smbpasswd -a username</code>. Also verify the user is in the <code>valid users</code> list or group for that share in smb.conf.</li>' +
                         '<li><strong>Files created by one user cannot be edited by another:</strong> The setgid bit is not set on the share directory. Run <code>sudo chmod 2775 /mnt/nas/shared</code>. Also check that <code>force group = nasusers</code> is in the share config so all files inherit the correct group.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Storage Monitoring</strong> &mdash; Write a cron script that checks disk usage on <code>/mnt/nas</code> every 6 hours. If usage exceeds 85%, write a warning to a log file with the top 10 largest files. Bonus: send a notification via a webhook (Discord, Slack) when the threshold is exceeded.</p>' +
                    '<p><strong>Challenge 2: SMB Audit Logging</strong> &mdash; Enable full audit logging in Samba to record every file access, create, delete, and permission change. Write a bash script that parses the audit log and generates a daily report of who accessed what files and when.</p>' +
                    '<p><strong>Challenge 3: Encrypted Share</strong> &mdash; Create a LUKS-encrypted partition on the USB drive for sensitive data (WireGuard keys, SSH keys, certificates). Mount it manually when needed and configure a Samba share that is only accessible after the volume is decrypted. This mimics how evidence drives are handled in forensic labs.</p>',

        commonMistakes: [
            {
                title: 'Enabling guest/anonymous access on Samba shares',
                correct: 'Set <code>guest ok = no</code> and <code>map to guest = never</code> in the [global] section. Require authentication for every share.',
                incorrect: 'Setting <code>guest ok = yes</code> or <code>map to guest = Bad User</code> to make connecting easier.',
                consequence: 'Anyone on the network can read (and possibly write) your files without credentials. Open SMB shares are the number one lateral movement vector in enterprise compromises. EternalBlue (WannaCry) exploited exactly this misconfiguration.',
            },
            {
                title: 'Formatting the USB drive as NTFS or exFAT for a Linux NAS',
                correct: 'Format the drive as ext4 for a Linux-native NAS. ext4 supports Unix permissions, journaling, and has the best performance without FUSE overhead.',
                incorrect: 'Using NTFS (because the drive came from Windows) or exFAT (for cross-platform compatibility).',
                consequence: 'NTFS on Linux runs through the ntfs-3g FUSE driver, which is slower and uses more CPU. exFAT does not support Unix permissions at all, so Samba cannot enforce user-level access control. Both defeat the security model.',
            },
            {
                title: 'Not using the nofail option in fstab for USB drives',
                correct: 'Always include <code>nofail</code> in the fstab mount options for removable storage: <code>UUID=xxx /mnt/nas ext4 defaults,nofail 0 2</code>.',
                incorrect: 'Adding the USB drive to fstab without <code>nofail</code>.',
                consequence: 'If the USB drive is disconnected (pulled out, failed, or loose cable), the Pi drops into emergency mode on next boot. Since the Pi is headless, you cannot interact with the recovery shell and must pull the SD card to fix it.',
            }
        ]
    },

    // ========================================================================
    // SG-47: WireGuard VPN Gateway
    // ========================================================================
    'sg-47': {
        intro: '<p>WireGuard turns your Raspberry Pi into a personal VPN server. Connect from anywhere in the world &mdash; coffee shops, airports, hotels &mdash; and your traffic routes through your home network, encrypted, as if you were sitting on your couch. No one on the public WiFi can see what you are doing. No ISP at your remote location can log your browsing. Your traffic exits from your home IP.</p>' +
               '<p>WireGuard is the modern replacement for OpenVPN and IPsec. It is faster (built into the Linux kernel), simpler (a single config file vs OpenVPN\'s dozens), and uses state-of-the-art cryptography (Curve25519, ChaCha20, Poly1305). A Raspberry Pi 4 can push 300+ Mbps through a WireGuard tunnel &mdash; more than most home internet connections.</p>' +
               '<p>For cybersecurity professionals, VPN is a daily-use tool. You need it for secure remote access to your lab, for protecting traffic on untrusted networks, and for understanding how tunnel-based network segmentation works. This project teaches public-key cryptography in practice, NAT traversal, routing, and firewall configuration.</p>',

        wiring: '    Home Network                               Remote Location\n' +
                '    +-----------+    +--------+              +-----------+\n' +
                '    | Pi VPN    |<-->| Router |<-- Internet  | Laptop    |\n' +
                '    | Server    |    |        |   ========>  | WireGuard |\n' +
                '    | 10.8.0.1  |    | NAT +  |  Encrypted  | Client    |\n' +
                '    | Port 51820|    | Port    |   Tunnel    | 10.8.0.2  |\n' +
                '    +-----------+    | Forward |              +-----------+\n' +
                '         |          +--------+                    |\n' +
                '    Home LAN                              Public WiFi\n' +
                '    192.168.1.0/24                      (untrusted network)\n' +
                '\n' +
                '    All client traffic flows through the encrypted tunnel.\n' +
                '    Remote laptop appears to be on the home network.',

        wiringNotes: '<p><strong>Port forwarding required:</strong> Your home router must forward UDP port 51820 to the Pi\'s local IP address. WireGuard uses only one port, UDP only. This is the one piece you cannot configure from the Pi &mdash; you must log into your router admin panel.</p>' +
                     '<p><strong>Dynamic DNS:</strong> If your home IP changes (most residential ISPs), set up a free dynamic DNS service (No-IP, DuckDNS, Cloudflare DDNS) so your VPN client can always find your home server.</p>' +
                     '<p><strong>Performance:</strong> WireGuard runs in the Linux kernel (not userspace like OpenVPN). On a Pi 4, expect 250&ndash;350 Mbps throughput. On a Pi 5, expect 400+ Mbps. Your actual speed is limited by your home internet upload speed.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg47-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<linearGradient id="sg47-tunnel" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.6"/><stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.15"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.6"/></linearGradient>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg47-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-47 WIREGUARD VPN GATEWAY</text>' +

            '<!-- Home Network Zone -->' +
            '<rect x="20" y="42" width="290" height="330" rx="8" fill="rgba(34,197,94,0.03)" stroke="rgba(34,197,94,0.1)" stroke-width="0.5" stroke-dasharray="8,4"/>' +
            '<text x="165" y="58" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">HOME NETWORK (TRUSTED)</text>' +

            '<!-- Pi VPN Server -->' +
            '<g>' +
            '<rect x="35" y="75" width="180" height="140" rx="8" fill="#1e2736" stroke="#8b5cf6" stroke-width="2"/>' +
            '<rect x="35" y="75" width="180" height="22" rx="8" fill="rgba(139,92,246,0.15)"/>' +
            '<text x="125" y="91" text-anchor="middle" fill="#c4b5fd" font-size="9" font-weight="700">VPN SERVER</text>' +
            '<text x="125" y="110" text-anchor="middle" fill="#8b949e" font-size="7">Raspberry Pi + WireGuard</text>' +

            '<!-- Tunnel interface -->' +
            '<rect x="48" y="120" width="154" height="24" rx="4" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" stroke-width="0.5"/>' +
            '<text x="125" y="130" text-anchor="middle" fill="#a78bfa" font-size="6">wg0: 10.8.0.1/24</text>' +
            '<text x="125" y="140" text-anchor="middle" fill="#8b5cf6" font-size="5">UDP 51820 &bull; Curve25519</text>' +

            '<!-- Crypto details -->' +
            '<rect x="48" y="150" width="154" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
            '<text x="125" y="163" text-anchor="middle" fill="#555" font-size="5">ChaCha20-Poly1305 encryption</text>' +
            '<text x="125" y="174" text-anchor="middle" fill="#555" font-size="5">BLAKE2s hashing &bull; Noise protocol</text>' +

            '<!-- Physical interface -->' +
            '<text x="125" y="198" text-anchor="middle" fill="#8b949e" font-size="6">eth0: 192.168.1.100</text>' +

            '<!-- Key icon -->' +
            '<circle cx="55" cy="131" r="6" fill="none" stroke="#a78bfa" stroke-width="1"/>' +
            '<line x1="61" y1="131" x2="68" y2="131" stroke="#a78bfa" stroke-width="1"/>' +
            '<line x1="65" y1="129" x2="65" y2="133" stroke="#a78bfa" stroke-width="0.8"/>' +
            '</g>' +

            '<!-- Home devices -->' +
            '<rect x="35" y="240" width="260" height="55" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="165" y="258" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">HOME LAN &mdash; 192.168.1.0/24</text>' +
            '<text x="165" y="273" text-anchor="middle" fill="#8b949e" font-size="6">Desktop &bull; Smart TV &bull; NAS &bull; IoT</text>' +
            '<text x="165" y="285" text-anchor="middle" fill="#555" font-size="5">VPN clients can access these via the tunnel</text>' +

            '<!-- Connection Pi to LAN -->' +
            '<line x1="125" y1="215" x2="125" y2="240" stroke="#22c55e" stroke-width="1.5"/>' +

            '<!-- Home Router -->' +
            '<g>' +
            '<rect x="225" y="110" width="80" height="70" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="265" y="135" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">ROUTER</text>' +
            '<text x="265" y="150" text-anchor="middle" fill="#8b949e" font-size="5">NAT + Port Forward</text>' +
            '<text x="265" y="163" text-anchor="middle" fill="#8b949e" font-size="5">UDP 51820 &#8594; Pi</text>' +
            '<circle cx="250" cy="170" r="2" fill="#22c55e"><animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/></circle>' +
            '</g>' +

            '<!-- Router to Pi -->' +
            '<line x1="215" y1="145" x2="225" y2="145" stroke="#8b5cf6" stroke-width="1.5"/>' +

            '<!-- Encrypted Tunnel -->' +
            '<g>' +
            '<!-- Tunnel tube visualization -->' +
            '<rect x="310" y="120" width="100" height="50" rx="25" fill="none" stroke="url(#sg47-tunnel)" stroke-width="2"/>' +
            '<rect x="315" y="127" width="90" height="36" rx="18" fill="rgba(139,92,246,0.04)"/>' +

            '<!-- Animated data packets -->' +
            '<circle r="3" fill="#a78bfa" opacity="0.8"><animate attributeName="cx" values="320;400" dur="1.5s" repeatCount="indefinite"/><animate attributeName="cy" values="145;145" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite"/></circle>' +
            '<circle r="3" fill="#c4b5fd" opacity="0.6"><animate attributeName="cx" values="400;320" dur="1.8s" repeatCount="indefinite"/><animate attributeName="cy" values="140;140" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.6;0" dur="1.8s" repeatCount="indefinite"/></circle>' +

            '<text x="360" y="112" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="600">ENCRYPTED TUNNEL</text>' +
            '<text x="360" y="185" text-anchor="middle" fill="#555" font-size="5">WireGuard &bull; UDP 51820</text>' +
            '<text x="360" y="196" text-anchor="middle" fill="#555" font-size="5">All traffic encrypted end-to-end</text>' +

            '<!-- Lock icons -->' +
            '<rect x="335" y="135" width="8" height="6" rx="1" fill="#a78bfa" opacity="0.5"/>' +
            '<path d="M337,135 L337,132 A2,2 0 0,1 341,132 L341,135" fill="none" stroke="#a78bfa" stroke-width="0.8" opacity="0.5"/>' +
            '<rect x="375" y="135" width="8" height="6" rx="1" fill="#a78bfa" opacity="0.5"/>' +
            '<path d="M377,135 L377,132 A2,2 0 0,1 381,132 L381,135" fill="none" stroke="#a78bfa" stroke-width="0.8" opacity="0.5"/>' +
            '</g>' +

            '<!-- Router to Internet -->' +
            '<line x1="305" y1="145" x2="310" y2="145" stroke="#22c55e" stroke-width="1.5"/>' +

            '<!-- Danger Zone -->' +
            '<rect x="415" y="42" width="290" height="330" rx="8" fill="rgba(239,68,68,0.02)" stroke="rgba(239,68,68,0.08)" stroke-width="0.5" stroke-dasharray="8,4"/>' +
            '<text x="560" y="58" text-anchor="middle" fill="#fca5a5" font-size="8" font-weight="600">PUBLIC INTERNET (UNTRUSTED)</text>' +

            '<!-- Remote Laptop -->' +
            '<g>' +
            '<rect x="470" y="75" width="180" height="140" rx="8" fill="#1e2736" stroke="#38bdf8" stroke-width="2"/>' +
            '<rect x="470" y="75" width="180" height="22" rx="8" fill="rgba(56,189,248,0.12)"/>' +
            '<text x="560" y="91" text-anchor="middle" fill="#7dd3fc" font-size="9" font-weight="700">REMOTE CLIENT</text>' +
            '<text x="560" y="110" text-anchor="middle" fill="#8b949e" font-size="7">Laptop &bull; Phone &bull; Tablet</text>' +

            '<!-- Tunnel interface -->' +
            '<rect x="483" y="120" width="154" height="24" rx="4" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" stroke-width="0.5"/>' +
            '<text x="560" y="130" text-anchor="middle" fill="#a78bfa" font-size="6">wg0: 10.8.0.2/32</text>' +
            '<text x="560" y="140" text-anchor="middle" fill="#8b5cf6" font-size="5">AllowedIPs: 0.0.0.0/0</text>' +

            '<!-- Status -->' +
            '<rect x="483" y="150" width="154" height="24" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<circle cx="495" cy="162" r="3" fill="#22c55e"><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/></circle>' +
            '<text x="560" y="165" text-anchor="middle" fill="#4ade80" font-size="6">Connected &bull; 42ms latency</text>' +

            '<!-- Key icon -->' +
            '<circle cx="500" cy="131" r="6" fill="none" stroke="#a78bfa" stroke-width="1"/>' +
            '<line x1="506" y1="131" x2="513" y2="131" stroke="#a78bfa" stroke-width="1"/>' +
            '<line x1="510" y1="129" x2="510" y2="133" stroke="#a78bfa" stroke-width="0.8"/>' +

            '<text x="560" y="198" text-anchor="middle" fill="#8b949e" font-size="6">Connected to: Hotel WiFi</text>' +
            '</g>' +

            '<!-- Internet to Client -->' +
            '<line x1="410" y1="145" x2="470" y2="145" stroke="#38bdf8" stroke-width="1.5"/>' +

            '<!-- Untrusted network -->' +
            '<rect x="470" y="240" width="210" height="55" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.12)" stroke-width="0.5"/>' +
            '<text x="575" y="258" text-anchor="middle" fill="#fca5a5" font-size="7" font-weight="600">PUBLIC WIFI</text>' +
            '<text x="575" y="273" text-anchor="middle" fill="#8b949e" font-size="6">Hotel &bull; Coffee Shop &bull; Airport</text>' +
            '<text x="575" y="285" text-anchor="middle" fill="#ef4444" font-size="5">Attackers can see unencrypted traffic</text>' +

            '<!-- Sniffing icon (what attackers see without VPN) -->' +
            '<rect x="490" y="310" width="170" height="50" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
            '<text x="575" y="326" text-anchor="middle" fill="#fca5a5" font-size="6" font-weight="600">WITHOUT VPN attackers see:</text>' +
            '<text x="575" y="340" text-anchor="middle" fill="#ef4444" font-size="5">DNS queries &bull; HTTP traffic &bull; login pages</text>' +
            '<text x="575" y="352" text-anchor="middle" fill="#22c55e" font-size="5">WITH VPN: only encrypted WireGuard packets</text>' +

            '<!-- Performance stats -->' +
            '<rect x="30" y="315" width="150" height="50" rx="6" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.12)" stroke-width="0.5"/>' +
            '<text x="105" y="331" text-anchor="middle" fill="#a78bfa" font-size="6" font-weight="600">WIREGUARD vs OPENVPN</text>' +
            '<text x="105" y="344" text-anchor="middle" fill="#8b949e" font-size="5">WG: 300 Mbps &bull; 1ms overhead &bull; 4K lines</text>' +
            '<text x="105" y="356" text-anchor="middle" fill="#8b949e" font-size="5">OV: 150 Mbps &bull; 4ms overhead &bull; 70K lines</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install WireGuard',
                content: '<p>WireGuard is built into the Linux kernel since version 5.6. On Raspberry Pi OS (Debian-based), the tools are available in the default repositories. Installation takes seconds.</p>',
                code: '# Install WireGuard tools\nsudo apt update\nsudo apt install wireguard -y\n\n# Verify kernel module is available\nsudo modprobe wireguard\nlsmod | grep wireguard\n# Should show: wireguard  xxxxx  0\n\n# Check WireGuard version\nwg --version\n# Should show: wireguard-tools v1.0.x\n\n# Enable IP forwarding (required for routing client traffic)\necho "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf\nsudo sysctl -p\n# Verify: sysctl net.ipv4.ip_forward\n# Should show: net.ipv4.ip_forward = 1',
                language: 'Bash',
                tip: '<strong>Kernel vs userspace:</strong> WireGuard runs in the Linux kernel, not as a userspace process like OpenVPN. This is why it is so fast &mdash; packets never leave kernel space. No context switching, no copying data between kernel and userspace. The <code>wg</code> command is just a configuration tool; the actual encryption happens in the kernel module.'
            },
            {
                title: 'Generate Server Key Pair',
                content: '<p>WireGuard uses Curve25519 key pairs for authentication &mdash; the same elliptic curve used by Signal, SSH, and TLS 1.3. Each side (server and client) has a private key and a public key. No certificates, no certificate authorities, no PKI overhead.</p>',
                code: '# Create a directory for WireGuard config\nsudo mkdir -p /etc/wireguard\ncd /etc/wireguard\n\n# Generate server private key\nwg genkey | sudo tee server_private.key\n\n# Derive public key from private key\nsudo cat server_private.key | wg pubkey | sudo tee server_public.key\n\n# Lock down the private key file\nsudo chmod 600 server_private.key\n\n# Display keys (you will need the public key for client config)\necho ""\necho "=== Server Keys ==="\necho "Private: $(sudo cat server_private.key)"\necho "Public:  $(sudo cat server_public.key)"\necho ""\necho "Share the PUBLIC key with clients."\necho "NEVER share the PRIVATE key with anyone."',
                language: 'Bash',
                tip: '<strong>Key management:</strong> WireGuard keys are just Base64-encoded 32-byte values. They are not certificates &mdash; they never expire. If a key is compromised, you generate a new pair and update the configs. There is no revocation list, no CA to manage, no renewal process. This simplicity is by design.'
            },
            {
                title: 'Create Server Configuration',
                content: '<p>The server config defines the tunnel interface (IP address, port, private key) and the list of authorized clients (peers). Each peer is identified by its public key and assigned an IP address within the tunnel subnet.</p>',
                code: '# Generate client keys (do this for each client device)\n# Client 1: Laptop\nwg genkey | sudo tee client1_private.key\nsudo cat client1_private.key | wg pubkey | sudo tee client1_public.key\nsudo chmod 600 client1_private.key\n\n# Client 2: Phone\nwg genkey | sudo tee client2_private.key\nsudo cat client2_private.key | wg pubkey | sudo tee client2_public.key\nsudo chmod 600 client2_private.key\n\n# Create server config\nsudo tee /etc/wireguard/wg0.conf << WGEOF\n[Interface]\n# Server tunnel address\nAddress = 10.8.0.1/24\n\n# WireGuard listen port\nListenPort = 51820\n\n# Server private key\nPrivateKey = $(sudo cat server_private.key)\n\n# NAT: route client traffic through this server\'s internet\nPostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\nPostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE\n\n# ─── Peers (authorized clients) ───\n\n[Peer]\n# Client 1: Laptop\nPublicKey = $(sudo cat client1_public.key)\nAllowedIPs = 10.8.0.2/32\n\n[Peer]\n# Client 2: Phone\nPublicKey = $(sudo cat client2_public.key)\nAllowedIPs = 10.8.0.3/32\nWGEOF\n\n# Lock down config (contains private key)\nsudo chmod 600 /etc/wireguard/wg0.conf',
                language: 'Bash',
                tip: '<strong>AllowedIPs explained:</strong> On the server, <code>AllowedIPs = 10.8.0.2/32</code> means "this peer is allowed to identify itself as 10.8.0.2 and only 10.8.0.2." It acts as both a routing table entry (send packets destined for 10.8.0.2 through this peer\'s tunnel) and an access control rule (this peer cannot claim any other IP). It is a routing + firewall rule in one line.'
            },
            {
                title: 'Start WireGuard and Enable on Boot',
                content: '<p>WireGuard integrates with systemd through <code>wg-quick</code>, which handles interface creation, IP assignment, routing, and the PostUp/PostDown iptables rules. Start it and enable persistence:</p>',
                code: '# Start the WireGuard interface\nsudo wg-quick up wg0\n\n# Check status\nsudo wg show\n# Shows: interface wg0, public key, listen port, peers\n\n# Verify the tunnel interface exists\nip addr show wg0\n# Should show: 10.8.0.1/24\n\n# Verify iptables NAT rules were added\nsudo iptables -t nat -L POSTROUTING -n\n# Should show: MASQUERADE ... eth0\n\n# Enable on boot\nsudo systemctl enable wg-quick@wg0\n\n# Open firewall\nsudo ufw allow 51820/udp comment "WireGuard VPN"\nsudo ufw status\n\n# IMPORTANT: Configure your router to forward UDP 51820\n# Router admin panel > Port Forwarding > Add:\n#   External port: 51820 (UDP)\n#   Internal IP: 192.168.1.100\n#   Internal port: 51820 (UDP)\n# This lets external clients reach your Pi through the router',
                language: 'Bash',
                tip: '<strong>Port forwarding is mandatory:</strong> Without it, WireGuard packets from the internet hit your router and get dropped. The router does not know to send them to the Pi. This is the one configuration step that happens outside the Pi &mdash; every router brand has a different interface for port forwarding. Search your router model + "port forwarding" for specific instructions.'
            },
            {
                title: 'Create Client Configuration',
                content: '<p>Generate a config file for each client device. This config contains the client\'s private key, the server\'s public key, and the server\'s public endpoint (your home IP or dynamic DNS hostname). Clients import this config file into their WireGuard app.</p>',
                code: '# Create client 1 (laptop) config\nsudo tee /etc/wireguard/client1.conf << CLIENTEOF\n[Interface]\n# Client tunnel address\nAddress = 10.8.0.2/32\n\n# Client private key\nPrivateKey = $(sudo cat client1_private.key)\n\n# Use Pi-hole as DNS through the tunnel (optional)\nDNS = 192.168.1.100\n\n[Peer]\n# Server public key\nPublicKey = $(sudo cat server_public.key)\n\n# Route ALL traffic through the tunnel (full tunnel mode)\nAllowedIPs = 0.0.0.0/0, ::/0\n\n# Server endpoint — your home public IP or dynamic DNS\n# Replace with your actual public IP or DuckDNS hostname\nEndpoint = YOUR_PUBLIC_IP:51820\n\n# Keep the tunnel alive through NAT (send keepalive every 25s)\nPersistentKeepalive = 25\nCLIENTEOF\n\n# Generate QR code for phone (client 2)\nsudo apt install qrencode -y\nsudo tee /etc/wireguard/client2.conf << CLIENT2EOF\n[Interface]\nAddress = 10.8.0.3/32\nPrivateKey = $(sudo cat client2_private.key)\nDNS = 192.168.1.100\n\n[Peer]\nPublicKey = $(sudo cat server_public.key)\nAllowedIPs = 0.0.0.0/0, ::/0\nEndpoint = YOUR_PUBLIC_IP:51820\nPersistentKeepalive = 25\nCLIENT2EOF\n\n# Display QR code in terminal (scan with WireGuard mobile app)\necho ""\necho "=== Scan this QR code with the WireGuard app on your phone ==="\nsudo cat /etc/wireguard/client2.conf | qrencode -t ansiutf8\n\n# For laptop: copy client1.conf to the laptop via SCP, USB, or paste\necho ""\necho "=== Copy client1.conf to your laptop ==="\necho "scp pi@192.168.1.100:/etc/wireguard/client1.conf ~/"\n\n# Find your public IP (for the Endpoint field)\ncurl -s ifconfig.me\necho ""',
                language: 'Bash',
                tip: '<strong>Full tunnel vs split tunnel:</strong> <code>AllowedIPs = 0.0.0.0/0</code> routes ALL traffic through the VPN (full tunnel). This is what you want for privacy on untrusted WiFi. For split tunnel (only route home network traffic through VPN), use <code>AllowedIPs = 192.168.1.0/24, 10.8.0.0/24</code>. Split tunnel is faster since internet traffic goes directly, but does not protect you on public WiFi.'
            },
            {
                title: 'Test the VPN Connection',
                content: '<p>Install the WireGuard client on your laptop or phone, import the config file (or scan the QR code), and activate the tunnel. Then verify everything works from both sides:</p>',
                code: '# === ON THE CLIENT (after connecting) ===\n\n# Check your public IP — should show your HOME IP, not the WiFi network\'s\ncurl ifconfig.me\n\n# Ping the server through the tunnel\nping 10.8.0.1\n\n# Ping a device on your home network (if full tunnel)\nping 192.168.1.1\n\n# Test DNS resolution (if using Pi-hole)\nnslookup google.com\n\n# Speed test through the tunnel\n# Install: pip install speedtest-cli\nspeedtest-cli\n\n# === ON THE SERVER (Pi) ===\n\n# Check connected peers\nsudo wg show\n# Shows: latest handshake, transfer stats, endpoint\n\n# Detailed peer info\nsudo wg show wg0 dump\n\n# Monitor in real time\nwatch -n 2 sudo wg show\n\n# Check traffic flow\nsudo iptables -L FORWARD -n -v | head -5\n# Should show packet/byte counters increasing\n\n# Test that client can reach the internet through the Pi\n# On the server, watch traffic:\nsudo tcpdump -i wg0 -n -c 20\n# Should show traffic from 10.8.0.2\n\n# === TROUBLESHOOTING ===\n# No handshake? → Port forwarding not configured on router\n# Handshake but no traffic? → IP forwarding not enabled\n# Slow speeds? → Check if running on USB 2.0 ethernet adapter\n# DNS not working? → Check DNS setting in client config\n# Connection drops? → Add PersistentKeepalive = 25',
                language: 'Bash',
                tip: '<strong>The handshake is key:</strong> If <code>wg show</code> does not show a "latest handshake" timestamp for a peer, the tunnel is not established. The most common cause is router port forwarding not configured or the wrong public IP in the Endpoint field. Use <code>curl ifconfig.me</code> on the Pi to get your actual public IP.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>WireGuard interface up: <code>ip addr show wg0</code> shows 10.8.0.1</li>' +
                 '<li>Service enabled: <code>systemctl is-enabled wg-quick@wg0</code> shows enabled</li>' +
                 '<li>Firewall open: <code>sudo ufw status</code> shows 51820/udp ALLOW</li>' +
                 '<li>Router port forward configured: external UDP 51820 &#8594; Pi 192.168.1.100</li>' +
                 '<li>Client connects: <code>sudo wg show</code> shows a recent handshake for the peer</li>' +
                 '<li>Client IP test: <code>curl ifconfig.me</code> on client shows your home public IP</li>' +
                 '<li>Client can ping 10.8.0.1 (server tunnel address)</li>' +
                 '<li>Client can reach home LAN devices (192.168.1.x) through the tunnel</li>' +
                 '<li>DNS resolves correctly through the tunnel</li>' +
                 '<li>After Pi reboot, WireGuard starts automatically and clients can reconnect</li>' +
                 '</ul>' +
                 '<p>Your personal VPN is operational. You can now connect securely from any public WiFi network. All your traffic is encrypted and exits from your home IP address. No one on the local network can see what you are doing.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Client connects but has no internet (handshake succeeds, no traffic):</strong> IP forwarding is not enabled on the server. Run <code>sudo sysctl net.ipv4.ip_forward</code> &mdash; it must return <code>1</code>. If it shows <code>0</code>, enable it: <code>echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf && sudo sysctl -p</code>. Also check that iptables NAT masquerade rule is active: <code>sudo iptables -t nat -L POSTROUTING</code>.</li>' +
                         '<li><strong>Client cannot connect at all (no handshake):</strong> (1) Verify port forwarding: your router must forward UDP 51820 to the Pi\'s LAN IP. Test from outside with <code>nc -zu YOUR_PUBLIC_IP 51820</code>. (2) Check if the WireGuard interface is up: <code>sudo wg show</code>. (3) Verify the client config has the correct Endpoint (your public IP or DDNS hostname).</li>' +
                         '<li><strong>"RTNETLINK answers: Operation not permitted" when starting WireGuard:</strong> The WireGuard kernel module is not loaded. Run <code>sudo modprobe wireguard</code>. If it fails, your kernel may need updating: <code>sudo apt update && sudo apt full-upgrade -y && sudo reboot</code>.</li>' +
                         '<li><strong>VPN works on phone but not on laptop (or vice versa):</strong> Each peer needs a unique <code>AllowedIPs</code> entry on the server with a unique tunnel IP (10.8.0.2, 10.8.0.3, etc.). Two clients cannot share the same tunnel IP or the same key pair.</li>' +
                         '<li><strong>DNS does not resolve through the tunnel:</strong> The client config needs <code>DNS = 10.8.0.1</code> (or your Pi-hole IP) in the [Interface] section. Without it, DNS queries bypass the tunnel and go to the remote network\'s DNS, leaking your browsing activity.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Split Tunnel Configuration</strong> &mdash; Modify the client config to route only home LAN traffic (192.168.1.0/24) through the VPN, while letting general internet traffic go directly. Change <code>AllowedIPs</code> from <code>0.0.0.0/0</code> to <code>192.168.1.0/24, 10.8.0.0/24</code>. Test that you can reach home devices but your public IP shows the remote network\'s IP.</p>' +
                    '<p><strong>Challenge 2: Dynamic DNS Setup</strong> &mdash; Register a free DuckDNS hostname and set up a cron job on the Pi that updates your public IP every 5 minutes. Update the client config to use the DDNS hostname instead of a hardcoded IP. Verify that reconnection works after your ISP changes your public IP.</p>' +
                    '<p><strong>Challenge 3: Multi-Client QR Codes</strong> &mdash; Generate WireGuard configs for 5 different devices (phone, tablet, laptop, second phone, travel laptop). Use <code>qrencode -t ansiutf8</code> to generate terminal QR codes for each mobile config. Document which tunnel IP belongs to which device.</p>',

        commonMistakes: [
            {
                title: 'Reusing the same private key on multiple clients',
                correct: 'Generate a unique key pair for every client device: <code>wg genkey | tee privatekey | wg pubkey > publickey</code>. Each device gets its own [Peer] block on the server with its own public key and AllowedIPs.',
                incorrect: 'Copying the same client config (including private key) to multiple devices.',
                consequence: 'WireGuard uses the public key as the peer identity. If two devices present the same key, the server cannot distinguish them. Only the most recently connected device will work &mdash; the other gets silently dropped.',
            },
            {
                title: 'Setting AllowedIPs on the server peer to 0.0.0.0/0',
                correct: 'On the server, each [Peer] block should have <code>AllowedIPs = 10.8.0.X/32</code> (the client\'s specific tunnel IP). Only the client config should use <code>0.0.0.0/0</code> to route all traffic.',
                incorrect: 'Setting <code>AllowedIPs = 0.0.0.0/0</code> in a [Peer] block on the server.',
                consequence: 'WireGuard uses AllowedIPs for routing. Setting 0.0.0.0/0 on a server peer tells the server to route ALL traffic to that one client, breaking routing for everything else including internet access.',
            },
            {
                title: 'Forgetting to open UDP port 51820 on the router',
                correct: 'Log into your router admin panel and create a port forwarding rule: external UDP 51820 to internal IP 192.168.1.100 port 51820.',
                incorrect: 'Only opening the port in the Pi\'s UFW firewall but not configuring port forwarding on the router.',
                consequence: 'Connections from outside your home network will never reach the Pi. UFW controls the Pi\'s firewall; the router\'s NAT is a separate barrier. You need both: UFW allows the traffic on the Pi, and the router forwards it from the internet to the Pi.',
            }
        ]
    },

    // ========================================================================
    // SG-48: Home Media Server with Jellyfin
    // ========================================================================
    'sg-48': {
        intro: '<p>Jellyfin is a free, open-source media server that turns your Raspberry Pi into a personal Netflix. Point it at a folder of movies, TV shows, music, or photos, and it organizes everything with metadata, artwork, trailers, and subtitles. Stream to any device on your network &mdash; phone, tablet, smart TV, game console &mdash; through a beautiful web interface or dedicated apps.</p>' +
               '<p>Unlike Plex (which routes through cloud servers and requires a paid subscription for some features), Jellyfin is completely self-hosted with no cloud dependency. Your media never leaves your network unless you choose to expose it. No telemetry, no tracking, no accounts required. This is what self-hosting looks like.</p>' +
               '<p>For cybersecurity students, this project teaches Docker containerization, reverse proxy concepts, media transcoding, and the value of self-hosted alternatives to cloud services. You will also gain hands-on experience with the trade-offs of performance vs convenience on constrained hardware.</p>',

        wiring: '    Raspberry Pi 4/5 (4GB+)         Network\n' +
                '    +--------------------+           +----------+\n' +
                '    |  Jellyfin Server   |<--------->|  Switch  |<----> Clients\n' +
                '    |  Port 8096 (HTTP)  |   ETH     +----------+\n' +
                '    |  Port 8920 (HTTPS) |\n' +
                '    |                    |\n' +
                '    |  USB 3.0           |\n' +
                '    |   |                |    Clients:\n' +
                '    |   v                |    - Browser: http://PI_IP:8096\n' +
                '    | [External Drive]   |    - Phone: Jellyfin app\n' +
                '    |  /mnt/media/       |    - Smart TV: web browser\n' +
                '    |    /movies/        |    - Fire Stick: Jellyfin app\n' +
                '    |    /tv/            |\n' +
                '    |    /music/         |\n' +
                '    +--------------------+',

        wiringNotes: '<p><strong>RAM requirement:</strong> Jellyfin needs at least 2 GB of RAM for the server process. A Pi 4 with 4 GB is recommended; 2 GB works but will struggle with multiple simultaneous streams or transcoding.</p>' +
                     '<p><strong>Transcoding:</strong> The Pi 4\'s VideoCore VI GPU supports hardware-accelerated H.264 decoding but NOT encoding. If a client requests a format the Pi cannot direct-play, software transcoding kicks in and maxes out the CPU. For best results, use clients that support direct play (Jellyfin apps, modern browsers).</p>' +
                     '<p><strong>Storage:</strong> Media files are large. A typical movie is 2&ndash;8 GB; a TV season is 5&ndash;20 GB. Plan your storage accordingly. A 1 TB USB drive holds roughly 100&ndash;200 movies.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 350" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg48-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="350" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="330" fill="url(#sg48-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-48 JELLYFIN MEDIA SERVER</text>' +

            '<!-- Pi Media Server -->' +
            '<g>' +
            '<rect x="30" y="50" width="220" height="200" rx="10" fill="#1e2736" stroke="#a78bfa" stroke-width="2"/>' +
            '<rect x="30" y="50" width="220" height="24" rx="10" fill="rgba(167,139,250,0.15)"/>' +
            '<rect x="30" y="66" width="220" height="8" fill="rgba(167,139,250,0.15)"/>' +
            '<text x="140" y="68" text-anchor="middle" fill="#c4b5fd" font-size="10" font-weight="700">JELLYFIN</text>' +
            '<text x="140" y="88" text-anchor="middle" fill="#8b949e" font-size="7">Raspberry Pi 4 &bull; 4 GB RAM</text>' +

            '<!-- Docker container -->' +
            '<rect x="42" y="98" width="196" height="35" rx="4" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="140" y="114" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">Docker Container</text>' +
            '<text x="140" y="127" text-anchor="middle" fill="#555" font-size="5">jellyfin/jellyfin:latest</text>' +

            '<!-- Ports -->' +
            '<rect x="42" y="140" width="90" height="22" rx="3" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="87" y="154" text-anchor="middle" fill="#4ade80" font-size="6">:8096 HTTP</text>' +
            '<rect x="142" y="140" width="90" height="22" rx="3" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="187" y="154" text-anchor="middle" fill="#eab308" font-size="6">:8920 HTTPS</text>' +

            '<!-- Storage -->' +
            '<rect x="42" y="170" width="196" height="65" rx="4" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.1)" stroke-width="0.5"/>' +
            '<text x="52" y="185" fill="#3b82f6" font-size="6" font-weight="600">USB 3.0 External Drive</text>' +
            '<rect x="52" y="192" width="60" height="12" rx="2" fill="rgba(239,68,68,0.06)"/>' +
            '<text x="82" y="201" text-anchor="middle" fill="#fca5a5" font-size="5">/movies (120)</text>' +
            '<rect x="118" y="192" width="50" height="12" rx="2" fill="rgba(34,197,94,0.06)"/>' +
            '<text x="143" y="201" text-anchor="middle" fill="#4ade80" font-size="5">/tv (45)</text>' +
            '<rect x="174" y="192" width="55" height="12" rx="2" fill="rgba(234,179,8,0.06)"/>' +
            '<text x="201" y="201" text-anchor="middle" fill="#eab308" font-size="5">/music (800)</text>' +

            '<!-- Capacity bar -->' +
            '<rect x="52" y="210" width="176" height="6" rx="3" fill="rgba(255,255,255,0.06)"/>' +
            '<rect x="52" y="210" width="70" height="6" rx="3" fill="#a78bfa" opacity="0.5"/>' +
            '<text x="140" y="226" text-anchor="middle" fill="#555" font-size="5">400 GB / 1 TB used</text>' +
            '</g>' +

            '<!-- Network -->' +
            '<line x1="250" y1="150" x2="320" y2="150" stroke="#a78bfa" stroke-width="2"/>' +

            '<!-- Client devices -->' +
            '<g>' +
            '<!-- TV -->' +
            '<rect x="380" y="45" width="130" height="70" rx="6" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="395" y="55" width="100" height="45" rx="3" fill="#0d1117" stroke="#555" stroke-width="0.5"/>' +
            '<!-- Movie playing animation -->' +
            '<rect x="400" y="60" width="90" height="35" rx="2" fill="rgba(167,139,250,0.08)"/>' +
            '<text x="445" y="78" text-anchor="middle" fill="#a78bfa" font-size="6">Now Playing</text>' +
            '<rect x="410" y="82" width="70" height="3" rx="1" fill="rgba(167,139,250,0.3)"/>' +
            '<rect x="410" y="82" width="30" height="3" rx="1" fill="#a78bfa" opacity="0.6"><animate attributeName="width" values="0;70;0" dur="8s" repeatCount="indefinite"/></rect>' +
            '<text x="445" y="108" text-anchor="middle" fill="#f97316" font-size="8" font-weight="600">Smart TV</text>' +

            '<!-- Phone -->' +
            '<rect x="530" y="45" width="70" height="115" rx="10" fill="#1e2736" stroke="#38bdf8" stroke-width="1.5"/>' +
            '<rect x="537" y="55" width="56" height="90" rx="4" fill="#0d1117"/>' +
            '<text x="565" y="90" text-anchor="middle" fill="#38bdf8" font-size="6">Jellyfin</text>' +
            '<text x="565" y="102" text-anchor="middle" fill="#38bdf8" font-size="6">App</text>' +
            '<rect x="555" y="148" width="20" height="3" rx="1" fill="#555"/>' +
            '<text x="565" y="170" text-anchor="middle" fill="#38bdf8" font-size="7" font-weight="600">Phone</text>' +

            '<!-- Laptop -->' +
            '<rect x="380" y="150" width="130" height="75" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="392" y="158" width="106" height="46" rx="3" fill="#0d1117" stroke="#555" stroke-width="0.5"/>' +
            '<text x="445" y="180" text-anchor="middle" fill="#22c55e" font-size="6">Browser UI</text>' +
            '<text x="445" y="192" text-anchor="middle" fill="#22c55e" font-size="5">localhost:8096</text>' +
            '<rect x="410" y="206" width="70" height="4" rx="1" fill="#555"/>' +
            '<text x="445" y="220" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">Laptop</text>' +

            '<!-- Tablet -->' +
            '<rect x="530" y="180" width="90" height="65" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<rect x="538" y="188" width="74" height="42" rx="3" fill="#0d1117"/>' +
            '<text x="575" y="212" text-anchor="middle" fill="#eab308" font-size="6">Music</text>' +
            '<text x="575" y="240" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">Tablet</text>' +
            '</g>' +

            '<!-- Connection lines -->' +
            '<line x1="320" y1="80" x2="380" y2="80" stroke="#f97316" stroke-width="1" opacity="0.5"/>' +
            '<line x1="320" y1="100" x2="530" y2="100" stroke="#38bdf8" stroke-width="1" opacity="0.5"/>' +
            '<line x1="320" y1="190" x2="380" y2="190" stroke="#22c55e" stroke-width="1" opacity="0.5"/>' +
            '<line x1="320" y1="210" x2="530" y2="210" stroke="#eab308" stroke-width="1" opacity="0.5"/>' +

            '<!-- Network hub point -->' +
            '<circle cx="320" cy="150" r="8" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" stroke-width="1"/>' +
            '<text x="320" y="153" text-anchor="middle" fill="#a78bfa" font-size="5">LAN</text>' +
            '<line x1="320" y1="80" x2="320" y2="210" stroke="#a78bfa" stroke-width="0.5" opacity="0.3"/>' +

            '<!-- Features callout -->' +
            '<rect x="380" y="260" width="300" height="70" rx="6" fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.12)" stroke-width="0.5"/>' +
            '<text x="530" y="278" text-anchor="middle" fill="#c4b5fd" font-size="7" font-weight="600">JELLYFIN FEATURES</text>' +
            '<text x="390" y="294" fill="#8b949e" font-size="5">&bull; Auto-metadata: posters, synopsis, ratings, trailers</text>' +
            '<text x="390" y="306" fill="#8b949e" font-size="5">&bull; Subtitle download &bull; Chapter markers &bull; Collections</text>' +
            '<text x="390" y="318" fill="#8b949e" font-size="5">&bull; Multiple users &bull; Parental controls &bull; Watch history</text>' +

            '<!-- Self-hosted badge -->' +
            '<rect x="30" y="265" width="220" height="50" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" stroke-width="0.5"/>' +
            '<text x="140" y="282" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">100% SELF-HOSTED</text>' +
            '<text x="140" y="296" text-anchor="middle" fill="#8b949e" font-size="5">No cloud &bull; No subscription &bull; No tracking</text>' +
            '<text x="140" y="308" text-anchor="middle" fill="#8b949e" font-size="5">Your data never leaves your network</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install Docker',
                content: '<p>We will run Jellyfin in a Docker container rather than installing it directly on the Pi. Docker provides isolation, easy updates, and clean removal. If something goes wrong, you delete the container and start fresh &mdash; the host system is untouched.</p>',
                code: '# Install Docker\ncurl -fsSL https://get.docker.com | sh\n\n# Add your user to the docker group (avoids needing sudo)\nsudo usermod -aG docker $USER\n\n# Log out and back in for the group change to take effect\n# Or: newgrp docker\n\n# Verify Docker is running\ndocker --version\ndocker run hello-world\n\n# Install Docker Compose (for multi-container setups later)\nsudo apt install docker-compose -y\ndocker-compose --version',
                language: 'Bash',
                tip: '<strong>Why Docker?</strong> Jellyfin has native Debian packages, but Docker keeps it contained. The container has its own filesystem, libraries, and dependencies. When you update Jellyfin, you pull a new container image &mdash; no apt dependency conflicts, no leftover files. This is how production servers run services in 2026.'
            },
            {
                title: 'Prepare Media Storage',
                content: '<p>Create a clean directory structure for your media. Jellyfin uses these paths to scan, identify, and organize your content. Proper folder naming is critical &mdash; Jellyfin matches folder names against metadata databases (TMDB, TVDB) to fetch posters, descriptions, and ratings.</p>',
                code: '# Create media directories\n# (Use your external drive if you have one — SG-46)\nsudo mkdir -p /mnt/media/movies\nsudo mkdir -p /mnt/media/tv\nsudo mkdir -p /mnt/media/music\nsudo mkdir -p /mnt/media/photos\n\n# Create Jellyfin config and cache directories\nsudo mkdir -p /opt/jellyfin/config\nsudo mkdir -p /opt/jellyfin/cache\n\n# Set ownership\nsudo chown -R $USER:$USER /opt/jellyfin\nsudo chown -R $USER:$USER /mnt/media\n\n# === FOLDER NAMING CONVENTIONS ===\n# Movies: /mnt/media/movies/Movie Name (Year)/Movie Name (Year).mkv\n# Example: /mnt/media/movies/Inception (2010)/Inception (2010).mkv\n#\n# TV Shows: /mnt/media/tv/Show Name/Season 01/Show Name - S01E01.mkv\n# Example: /mnt/media/tv/Breaking Bad/Season 01/Breaking Bad - S01E01.mkv\n#\n# Music: /mnt/media/music/Artist/Album/01 - Track.mp3\n# Example: /mnt/media/music/Pink Floyd/The Wall/01 - In The Flesh.mp3\n\n# Copy some media files to test with\n# (use scp, rsync, or the Samba share from SG-46)\nls -la /mnt/media/movies/',
                language: 'Bash',
                tip: '<strong>Naming matters:</strong> Jellyfin\'s metadata scraper matches folder/file names against online databases. "Movie Name (Year)" format gives the most accurate matches. If a movie is not recognized, check the naming. Tools like <a href="https://filebot.net/" target="_blank" rel="noopener">FileBot</a> or <a href="https://github.com/Radarr/Radarr" target="_blank" rel="noopener">Radarr</a> can auto-rename your library.'
            },
            {
                title: 'Run Jellyfin in Docker',
                content: '<p>Launch the Jellyfin container with Docker. The command maps the config directory, cache directory, and media library into the container. It also maps the necessary ports for the web interface.</p>',
                code: '# Pull and run Jellyfin\ndocker run -d \\\n  --name jellyfin \\\n  --restart unless-stopped \\\n  -p 8096:8096 \\\n  -p 8920:8920 \\\n  -v /opt/jellyfin/config:/config \\\n  -v /opt/jellyfin/cache:/cache \\\n  -v /mnt/media:/media:ro \\\n  --device /dev/video10:/dev/video10 \\\n  --device /dev/video11:/dev/video11 \\\n  --device /dev/video12:/dev/video12 \\\n  jellyfin/jellyfin:latest\n\n# Explanation of flags:\n# -d                     Run in background (detached)\n# --name jellyfin        Container name (for docker stop/start/logs)\n# --restart unless-stopped  Auto-restart on crash or reboot\n# -p 8096:8096           Map HTTP port\n# -p 8920:8920           Map HTTPS port\n# -v /config:/config     Persist Jellyfin settings outside container\n# -v /cache:/cache       Persist transcoding cache\n# -v /media:/media:ro    Mount media library (read-only for safety)\n# --device /dev/video*   Enable hardware acceleration (Pi GPU)\n\n# Verify it is running\ndocker ps\ndocker logs jellyfin --tail 20\n\n# Wait 30 seconds for first-time initialization\nsleep 30\n\n# Test the web interface\ncurl -sI http://localhost:8096 | head -3\n# Should show: HTTP/1.1 200 OK',
                language: 'Bash',
                tip: '<strong>Read-only mount:</strong> The <code>:ro</code> flag on the media volume means Jellyfin can read your files but cannot modify or delete them. This is a safety measure &mdash; a bug or misconfiguration in Jellyfin cannot accidentally delete your media library. If you want Jellyfin to manage files (rename, delete watched), remove <code>:ro</code>.'
            },
            {
                title: 'Initial Setup Wizard',
                content: '<p>Open a browser and navigate to <code>http://PI_IP:8096</code>. Jellyfin\'s setup wizard walks you through the initial configuration:</p>' +
                         '<ol>' +
                         '<li><strong>Select language</strong> &mdash; English</li>' +
                         '<li><strong>Create admin account</strong> &mdash; username and password for the admin user</li>' +
                         '<li><strong>Add media libraries</strong> &mdash; click Add Media Library for each content type:</li>' +
                         '</ol>' +
                         '<ul style="margin-left:40px">' +
                         '<li>Type: Movies &rarr; Folder: <code>/media/movies</code></li>' +
                         '<li>Type: Shows &rarr; Folder: <code>/media/tv</code></li>' +
                         '<li>Type: Music &rarr; Folder: <code>/media/music</code></li>' +
                         '</ul>' +
                         '<p>4. <strong>Metadata language</strong> &mdash; your preferred language for descriptions<br>' +
                         '5. <strong>Remote access</strong> &mdash; enable if you want access outside your network (requires port forwarding)<br>' +
                         '6. <strong>Finish</strong> &mdash; Jellyfin starts scanning your library. Large libraries take 10&ndash;30 minutes to fully scan and download metadata.</p>',
                code: '# After the wizard, Jellyfin scans your library.\n# Monitor the scan progress:\ndocker logs jellyfin -f | grep -i "scan\\|library\\|item"\n\n# Force a library rescan if needed:\n# Dashboard > Libraries > ... menu > Scan Library Files\n\n# Check container resource usage\ndocker stats jellyfin --no-stream\n\n# Open firewall for LAN access\nsudo ufw allow 8096/tcp comment "Jellyfin HTTP"\nsudo ufw allow 8920/tcp comment "Jellyfin HTTPS"',
                language: 'Bash',
                tip: '<strong>Metadata sources:</strong> Jellyfin fetches metadata from TMDB (movies/TV), TVDB (TV shows), MusicBrainz (music), and fanart.tv (artwork). If you are behind a restrictive firewall or Pi-hole, whitelist these domains: <code>api.themoviedb.org</code>, <code>thetvdb.com</code>, <code>musicbrainz.org</code>, <code>webservice.fanart.tv</code>.'
            },
            {
                title: 'Configure Clients and Users',
                content: '<p>Jellyfin supports multiple user accounts with individual watch history, favorites, and parental controls. Set up accounts for household members, then install apps on their devices.</p>',
                code: '# === CLIENT APPS ===\n# Browser:     http://PI_IP:8096 (works everywhere)\n# Android:     Jellyfin app from Google Play / F-Droid\n# iOS:         Jellyfin app from App Store (free)\n# Fire TV:     Jellyfin app from Amazon Appstore\n# Roku:        Jellyfin channel (community)\n# Apple TV:    Infuse or Swiftfin app\n# Smart TV:    Use the built-in browser\n# Kodi:        Jellyfin for Kodi add-on\n# Desktop:     Jellyfin Media Player (MPV-based)\n\n# === CREATE ADDITIONAL USERS ===\n# Dashboard > Users > Add User\n# Set username, password\n# Configure library access (restrict specific libraries)\n# Set parental rating limits\n# Enable/disable transcoding permission\n\n# === REMOTE ACCESS (optional) ===\n# Dashboard > Networking > Allow Remote Connections\n# Set your public port (default 8096)\n# On your router: port forward 8096 TCP to Pi\'s IP\n# Access from anywhere: http://YOUR_PUBLIC_IP:8096\n\n# === HARDWARE TRANSCODING (Pi 4) ===\n# Dashboard > Playback > Transcoding\n# Hardware acceleration type: Video4Linux2 (V4L2)\n# This offloads H.264 decoding to the Pi\'s GPU\n# Note: encoding is still CPU-only on Pi',
                language: 'Bash',
                tip: '<strong>Direct play vs transcoding:</strong> When a client supports the video/audio format natively, Jellyfin streams the file as-is (direct play) &mdash; zero CPU usage on the Pi. When the client needs a different format, Jellyfin transcodes in real-time, which hammers the CPU. For best performance: use .mp4 containers with H.264 video and AAC audio. These direct-play on virtually every device.'
            },
            {
                title: 'Maintain and Update',
                content: '<p>Docker makes updates dead simple &mdash; pull the latest image, stop the old container, start a new one. Your config and library survive because they live in mounted volumes outside the container.</p>',
                code: '# === UPDATE JELLYFIN ===\n# Pull latest image\ndocker pull jellyfin/jellyfin:latest\n\n# Stop and remove old container\ndocker stop jellyfin\ndocker rm jellyfin\n\n# Start new container with same settings\ndocker run -d \\\n  --name jellyfin \\\n  --restart unless-stopped \\\n  -p 8096:8096 \\\n  -p 8920:8920 \\\n  -v /opt/jellyfin/config:/config \\\n  -v /opt/jellyfin/cache:/cache \\\n  -v /mnt/media:/media:ro \\\n  --device /dev/video10:/dev/video10 \\\n  --device /dev/video11:/dev/video11 \\\n  --device /dev/video12:/dev/video12 \\\n  jellyfin/jellyfin:latest\n\n# === MONITORING ===\n# Check container health\ndocker ps\ndocker stats jellyfin --no-stream\n\n# View recent logs\ndocker logs jellyfin --tail 50\n\n# Check disk usage\ndu -sh /opt/jellyfin/config/\ndu -sh /opt/jellyfin/cache/\ndf -h /mnt/media\n\n# === BACKUP ===\n# Backup Jellyfin config (settings, users, library database)\ntar czf ~/jellyfin-backup-$(date +%Y%m%d).tar.gz -C /opt/jellyfin config/\nls -lh ~/jellyfin-backup-*.tar.gz\n\n# === CLEAN UP OLD IMAGES ===\ndocker image prune -f',
                language: 'Bash',
                tip: '<strong>Backup strategy:</strong> Your media files are the irreplaceable asset. Your Jellyfin config is the convenience asset (it can be rebuilt). Back up <code>/opt/jellyfin/config/</code> weekly to your NAS (SG-46) or cloud storage. If the Pi\'s SD card fails, you can spin up a new container and restore the config backup &mdash; your library, users, and watch history come back instantly.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Jellyfin container running: <code>docker ps | grep jellyfin</code></li>' +
                 '<li>Web interface loads: <code>http://PI_IP:8096</code> shows the Jellyfin dashboard</li>' +
                 '<li>Library scanned: movies/shows appear with correct metadata and artwork</li>' +
                 '<li>Playback works: play a video in the browser &mdash; it should stream smoothly</li>' +
                 '<li>Mobile app connects: install Jellyfin app, enter server URL, play media</li>' +
                 '<li>Multiple users: create a second user, verify separate watch history</li>' +
                 '<li>Container survives reboot: <code>sudo reboot</code>, wait, confirm Jellyfin is accessible</li>' +
                 '<li>Update works: <code>docker pull</code> + restart cycle does not lose settings</li>' +
                 '</ul>' +
                 '<p>Your personal media server is operational. No subscription fees, no cloud dependency, no tracking. Add media to <code>/mnt/media/</code> and Jellyfin picks it up automatically. Combined with the NAS from SG-46, you have a complete self-hosted entertainment system.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Jellyfin container won\'t start (<code>docker ps</code> shows nothing):</strong> Check the container logs: <code>docker logs jellyfin</code>. Common causes: (1) Port 8096 is already in use by another service. (2) The media volume mount path does not exist. (3) Insufficient RAM &mdash; Jellyfin needs at least 2 GB free. Check with <code>free -h</code>.</li>' +
                         '<li><strong>Media library is empty after adding files:</strong> Jellyfin needs to scan the library. Go to Dashboard &gt; Libraries &gt; click the three dots &gt; Scan Library. Also verify the files are inside the mount path you specified in the Docker volume mapping. Check permissions: <code>ls -la /mnt/media/movies/</code> &mdash; the files must be readable by the Jellyfin container user.</li>' +
                         '<li><strong>Video plays but is extremely choppy or buffers constantly:</strong> The Pi is software transcoding, which overwhelms the CPU. Check Dashboard &gt; Active Streams &mdash; if it says "Transcoding" instead of "Direct Play", the client does not support the video codec natively. Solutions: (1) Use a client that supports direct play (Jellyfin mobile app, modern browsers). (2) Pre-transcode your media to H.264 with <code>ffmpeg</code>. (3) Reduce stream quality in playback settings.</li>' +
                         '<li><strong>Metadata and artwork not loading:</strong> Jellyfin fetches metadata from TheMovieDB and TheTVDB. Ensure the Pi has internet access and DNS is working. Check Dashboard &gt; Scheduled Tasks &gt; Scan Media Library for errors. File naming matters &mdash; use the format <code>Movie Name (2024)/Movie Name (2024).mkv</code> for movies and <code>Show Name/Season 01/Show Name S01E01.mkv</code> for TV.</li>' +
                         '<li><strong>Container settings lost after <code>docker pull</code> and restart:</strong> You need to use a persistent volume for the config directory. Ensure your Docker run command includes <code>-v /opt/jellyfin/config:/config</code>. If you used <code>--rm</code> flag, the container is destroyed on stop. Use restart policies instead: <code>--restart=unless-stopped</code>.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Remote Access via VPN</strong> &mdash; Combine this project with SG-47 (WireGuard). Configure your phone to connect to Jellyfin through the VPN tunnel while on cellular data. You should be able to stream your home media library from anywhere without exposing Jellyfin to the public internet.</p>' +
                    '<p><strong>Challenge 2: Automated Media Organization</strong> &mdash; Write a bash script that watches a "drop" folder for new video files (using <code>inotifywait</code>), automatically moves them into the correct Jellyfin directory structure based on filename patterns, and triggers a library scan via the Jellyfin API.</p>' +
                    '<p><strong>Challenge 3: Hardware Transcoding Benchmark</strong> &mdash; Test different video formats (H.264, H.265, VP9, AV1) and resolutions (720p, 1080p, 4K) to map out exactly which combinations the Pi can direct-play vs transcode. Document your findings in a matrix showing codec + resolution + client = direct play or transcode.</p>',

        commonMistakes: [
            {
                title: 'Running Jellyfin directly on the host instead of in Docker',
                correct: 'Run Jellyfin in a Docker container with explicit volume mounts for config and media. This isolates the application, makes updates trivial (<code>docker pull</code>), and prevents dependency conflicts.',
                incorrect: 'Installing Jellyfin directly on the Pi OS with <code>apt install</code> or a manual .deb package.',
                consequence: 'Direct installs are harder to update, harder to back up, and can conflict with other services. If Jellyfin\'s dependencies break during an OS upgrade, you may need to reinstall from scratch. Docker containers are disposable &mdash; your data lives in volumes.',
            },
            {
                title: 'Exposing Jellyfin directly to the internet without a reverse proxy',
                correct: 'Keep Jellyfin bound to localhost or your LAN. Access remotely through WireGuard VPN (SG-47) or behind an nginx reverse proxy (SG-51) with TLS and authentication.',
                incorrect: 'Port-forwarding 8096 directly on your router so you can access Jellyfin from outside.',
                consequence: 'Jellyfin\'s built-in web server is not hardened for public internet exposure. You expose your media library, user credentials, and potentially your home network to anyone who scans your IP. Use a VPN or reverse proxy instead.',
            },
            {
                title: 'Storing media on the SD card instead of an external USB drive',
                correct: 'Store all media files on an external USB drive mounted at a dedicated path like <code>/mnt/media</code>. Keep the SD card for the OS and application configs only.',
                incorrect: 'Downloading movies and shows directly to the Pi\'s SD card.',
                consequence: 'SD cards have limited write endurance and small capacity (typically 32-64 GB). Constant read/write from media streaming accelerates wear. A single TV season can fill the entire card. Use a USB SSD or HDD for media storage.',
            }
        ]
    },

    // ========================================================================
    // SG-49: Monitoring Dashboard with Grafana
    // ========================================================================
    'sg-49': {
        intro: '<p>Prometheus collects metrics. Grafana visualizes them. Together they form the industry-standard monitoring stack used by companies from startups to Netflix. In this project you will install both on your Raspberry Pi and build a real-time dashboard showing CPU load, memory usage, disk I/O, network traffic, and temperature &mdash; for every machine in your lab.</p>' +
               '<p>This is not just a pretty dashboard. Monitoring is the first line of defense in security operations. Unusual CPU spikes reveal crypto miners. Unexpected network traffic reveals data exfiltration. Sudden disk consumption reveals ransomware. A SOC analyst who cannot read monitoring dashboards is blind to the most common indicators of compromise.</p>' +
               '<p>You will learn the Prometheus pull model (scraping metrics from exporters), PromQL query language, Grafana data sources, and dashboard design. These are skills that translate directly to enterprise monitoring with Datadog, New Relic, Splunk, and every major observability platform.</p>',

        wiring: '    Monitoring Architecture\n' +
                '    \n' +
                '    +-------------------+      +-------------------+\n' +
                '    |   Prometheus      |----->|   Grafana         |\n' +
                '    |   Port 9090       |      |   Port 3000      |\n' +
                '    |   Scrapes metrics |      |   Visualizes data |\n' +
                '    |   every 15s       |      |   Web dashboards  |\n' +
                '    +-------------------+      +-------------------+\n' +
                '            |  scrapes\n' +
                '            v\n' +
                '    +-------------------+      +-------------------+\n' +
                '    | node_exporter     |      | node_exporter     |\n' +
                '    | Pi (localhost)     |      | Other lab machine |\n' +
                '    | Port 9100         |      | Port 9100         |\n' +
                '    +-------------------+      +-------------------+\n' +
                '    \n' +
                '    Prometheus pulls (scrapes) metrics from exporters.\n' +
                '    Exporters expose system stats as HTTP endpoints.\n' +
                '    Grafana queries Prometheus and renders dashboards.',

        wiringNotes: '<p><strong>Pull vs Push:</strong> Prometheus uses a pull model &mdash; it reaches out to exporters and scrapes their metrics endpoint every 15 seconds. This is the opposite of push-based systems (like StatsD) where services send metrics to a collector. The pull model lets Prometheus detect when a target is down (scrape fails), which is itself a useful alert.</p>' +
                     '<p><strong>node_exporter:</strong> This is the standard Prometheus exporter for Linux system metrics. It exposes ~500 metrics covering CPU, memory, disk, network, filesystem, and more at <code>http://hostname:9100/metrics</code>. You install it on every machine you want to monitor.</p>' +
                     '<p><strong>Resource usage:</strong> Prometheus stores time-series data on disk. On a Pi, plan for ~100 MB per monitored machine per month at 15-second scrape intervals. Grafana itself uses minimal resources &mdash; it is just a frontend that queries Prometheus.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg49-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg49-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-49 PROMETHEUS + GRAFANA MONITORING STACK</text>' +

            '<!-- Grafana Dashboard (main visual) -->' +
            '<g>' +
            '<rect x="280" y="45" width="410" height="230" rx="10" fill="#1e2736" stroke="#f97316" stroke-width="2"/>' +
            '<rect x="280" y="45" width="410" height="24" rx="10" fill="rgba(249,115,22,0.15)"/>' +
            '<text x="485" y="62" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="700">GRAFANA DASHBOARD &mdash; :3000</text>' +

            '<!-- CPU Graph -->' +
            '<rect x="295" y="80" width="185" height="85" rx="6" fill="#0d1117" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="305" y="95" fill="#8b949e" font-size="6">CPU Usage %</text>' +
            '<!-- Graph lines -->' +
            '<polyline points="300,150 320,140 340,135 360,142 380,125 400,130 420,118 440,128 460,122 470,130" fill="none" stroke="#22c55e" stroke-width="1.5" opacity="0.8"/>' +
            '<polyline points="300,148 320,145 340,148 360,146 380,138 400,142 420,135 440,140 460,138 470,142" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.5"/>' +
            '<!-- Y axis labels -->' +
            '<text x="297" y="100" fill="#555" font-size="4" text-anchor="end">100</text>' +
            '<text x="297" y="125" fill="#555" font-size="4" text-anchor="end">50</text>' +
            '<text x="297" y="150" fill="#555" font-size="4" text-anchor="end">0</text>' +
            '<!-- Current value -->' +
            '<text x="470" y="95" text-anchor="end" fill="#22c55e" font-size="12" font-weight="700">23%</text>' +

            '<!-- Memory Graph -->' +
            '<rect x="490" y="80" width="185" height="85" rx="6" fill="#0d1117" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="500" y="95" fill="#8b949e" font-size="6">Memory Usage</text>' +
            '<!-- Memory bar -->' +
            '<rect x="500" y="105" width="160" height="12" rx="3" fill="rgba(255,255,255,0.06)"/>' +
            '<rect x="500" y="105" width="96" height="12" rx="3" fill="rgba(139,92,246,0.5)"/>' +
            '<text x="580" y="114" text-anchor="middle" fill="#c4b5fd" font-size="6">2.4 / 4.0 GB (60%)</text>' +
            '<!-- Swap bar -->' +
            '<rect x="500" y="122" width="160" height="8" rx="2" fill="rgba(255,255,255,0.04)"/>' +
            '<rect x="500" y="122" width="16" height="8" rx="2" fill="rgba(234,179,8,0.4)"/>' +
            '<text x="580" y="138" text-anchor="middle" fill="#eab308" font-size="5">Swap: 100 MB / 1 GB</text>' +
            '<!-- Process count -->' +
            '<text x="580" y="155" text-anchor="middle" fill="#8b949e" font-size="6">Processes: 142 &bull; Threads: 384</text>' +

            '<!-- Disk I/O -->' +
            '<rect x="295" y="175" width="120" height="85" rx="6" fill="#0d1117" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="305" y="190" fill="#8b949e" font-size="6">Disk I/O</text>' +
            '<text x="355" y="215" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="700">4.2</text>' +
            '<text x="355" y="230" text-anchor="middle" fill="#38bdf8" font-size="6">MB/s read</text>' +
            '<text x="355" y="245" text-anchor="middle" fill="#f97316" font-size="8">1.1 MB/s write</text>' +

            '<!-- Network -->' +
            '<rect x="425" y="175" width="120" height="85" rx="6" fill="#0d1117" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="435" y="190" fill="#8b949e" font-size="6">Network eth0</text>' +
            '<!-- Animated traffic indicator -->' +
            '<text x="485" y="215" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="700">12.4 Mbps</text>' +
            '<text x="485" y="228" text-anchor="middle" fill="#22c55e" font-size="5">&#8595; download</text>' +
            '<text x="485" y="245" text-anchor="middle" fill="#ef4444" font-size="8">3.1 Mbps &#8593;</text>' +
            '<text x="485" y="255" text-anchor="middle" fill="#ef4444" font-size="5">upload</text>' +

            '<!-- Temperature -->' +
            '<rect x="555" y="175" width="120" height="85" rx="6" fill="#0d1117" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="565" y="190" fill="#8b949e" font-size="6">CPU Temperature</text>' +
            '<!-- Thermometer -->' +
            '<rect x="605" y="200" width="14" height="40" rx="7" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
            '<rect x="607" y="218" width="10" height="22" rx="5" fill="rgba(249,115,22,0.5)"/>' +
            '<circle cx="612" cy="245" r="8" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1"/>' +
            '<text x="612" y="248" text-anchor="middle" fill="#fb923c" font-size="6" font-weight="700">48</text>' +
            '<text x="640" y="230" fill="#fb923c" font-size="8" font-weight="700">48.2 C</text>' +
            '<text x="640" y="245" fill="#8b949e" font-size="5">Normal (&lt;70C)</text>' +
            '</g>' +

            '<!-- Prometheus -->' +
            '<g>' +
            '<rect x="30" y="55" width="220" height="100" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="30" y="55" width="220" height="22" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="140" y="71" text-anchor="middle" fill="#fca5a5" font-size="9" font-weight="600">PROMETHEUS &mdash; :9090</text>' +
            '<text x="140" y="92" text-anchor="middle" fill="#8b949e" font-size="7">Time-Series Database</text>' +
            '<text x="140" y="106" text-anchor="middle" fill="#555" font-size="6">Scrapes targets every 15s</text>' +
            '<text x="140" y="120" text-anchor="middle" fill="#555" font-size="6">Stores metrics with timestamps</text>' +

            '<!-- Scrape indicator -->' +
            '<circle cx="50" cy="140" r="4" fill="#ef4444" opacity="0.3"><animate attributeName="opacity" values="0.1;0.8;0.1" dur="15s" repeatCount="indefinite"/></circle>' +
            '<text x="60" y="143" fill="#fca5a5" font-size="5">scraping...</text>' +
            '</g>' +

            '<!-- Arrow: Prometheus -> Grafana -->' +
            '<line x1="250" y1="100" x2="280" y2="100" stroke="#f97316" stroke-width="1.5"/>' +
            '<polygon points="276,96 286,100 276,104" fill="#f97316"/>' +
            '<text x="265" y="92" text-anchor="middle" fill="#f97316" font-size="5">PromQL</text>' +

            '<!-- node_exporters -->' +
            '<g>' +
            '<rect x="30" y="180" width="105" height="75" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="82" y="200" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">node_exporter</text>' +
            '<text x="82" y="215" text-anchor="middle" fill="#8b949e" font-size="6">Pi (localhost)</text>' +
            '<text x="82" y="228" text-anchor="middle" fill="#555" font-size="5">:9100/metrics</text>' +
            '<text x="82" y="245" text-anchor="middle" fill="#555" font-size="5">~500 metrics</text>' +
            '<circle cx="42" cy="200" r="3" fill="#22c55e"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>' +
            '</g>' +

            '<g>' +
            '<rect x="145" y="180" width="105" height="75" rx="6" fill="#1e2736" stroke="#38bdf8" stroke-width="1"/>' +
            '<text x="197" y="200" text-anchor="middle" fill="#7dd3fc" font-size="7" font-weight="600">node_exporter</text>' +
            '<text x="197" y="215" text-anchor="middle" fill="#8b949e" font-size="6">Lab Server</text>' +
            '<text x="197" y="228" text-anchor="middle" fill="#555" font-size="5">192.168.1.50:9100</text>' +
            '<text x="197" y="245" text-anchor="middle" fill="#555" font-size="5">~500 metrics</text>' +
            '<circle cx="157" cy="200" r="3" fill="#38bdf8"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>' +
            '</g>' +

            '<!-- Scrape arrows -->' +
            '<line x1="82" y1="180" x2="82" y2="155" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<line x1="82" y1="155" x2="140" y2="140" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<line x1="197" y1="180" x2="197" y2="155" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<line x1="197" y1="155" x2="140" y2="140" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>' +

            '<!-- PromQL Examples -->' +
            '<rect x="30" y="280" width="250" height="110" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.12)" stroke-width="0.5"/>' +
            '<text x="40" y="296" fill="#fca5a5" font-size="7" font-weight="600">PROMQL EXAMPLES</text>' +
            '<text x="40" y="312" fill="#8b949e" font-size="5"><tspan fill="#ef4444">rate(</tspan>node_cpu_seconds_total{mode!="idle"}<tspan fill="#ef4444">[5m])</tspan></text>' +
            '<text x="45" y="322" fill="#555" font-size="5">&#8594; CPU usage rate over 5 minutes</text>' +
            '<text x="40" y="338" fill="#8b949e" font-size="5">node_memory_MemTotal_bytes <tspan fill="#ef4444">-</tspan> node_memory_MemAvailable_bytes</text>' +
            '<text x="45" y="348" fill="#555" font-size="5">&#8594; Used memory in bytes</text>' +
            '<text x="40" y="364" fill="#8b949e" font-size="5"><tspan fill="#ef4444">predict_linear(</tspan>node_filesystem_avail_bytes<tspan fill="#ef4444">[6h], 24*3600)</tspan></text>' +
            '<text x="45" y="374" fill="#555" font-size="5">&#8594; Predict disk space 24h from now</text>' +
            '<text x="45" y="386" fill="#22c55e" font-size="5">&#8594; Alert before you run out!</text>' +

            '<!-- Alerting callout -->' +
            '<rect x="300" y="290" width="380" height="100" rx="6" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.12)" stroke-width="0.5"/>' +
            '<text x="310" y="308" fill="#eab308" font-size="7" font-weight="600">ALERTING RULES (Prometheus Alertmanager)</text>' +
            '<rect x="310" y="315" width="360" height="16" rx="3" fill="rgba(239,68,68,0.06)"/>' +
            '<circle cx="320" cy="323" r="3" fill="#ef4444"/>' +
            '<text x="328" y="326" fill="#fca5a5" font-size="5">CRITICAL: CPU &gt; 90% for 5 minutes &rarr; Email/Slack alert</text>' +
            '<rect x="310" y="335" width="360" height="16" rx="3" fill="rgba(234,179,8,0.06)"/>' +
            '<circle cx="320" cy="343" r="3" fill="#eab308"/>' +
            '<text x="328" y="346" fill="#eab308" font-size="5">WARNING: Disk usage &gt; 80% &rarr; Dashboard warning</text>' +
            '<rect x="310" y="355" width="360" height="16" rx="3" fill="rgba(34,197,94,0.06)"/>' +
            '<circle cx="320" cy="363" r="3" fill="#22c55e"/>' +
            '<text x="328" y="366" fill="#4ade80" font-size="5">INFO: CPU temp &gt; 70C &rarr; Log entry + dashboard color change</text>' +
            '<text x="310" y="384" fill="#555" font-size="5">Alerts trigger via Alertmanager &rarr; email, Slack, Discord, PagerDuty, webhook</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install node_exporter',
                content: '<p><code>node_exporter</code> is the agent that exposes system metrics as an HTTP endpoint. Install it on every machine you want to monitor. For this guide, start with the Pi itself.</p>',
                code: '# Download node_exporter for ARM\ncd /tmp\nwget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-arm64.tar.gz\ntar xzf node_exporter-1.7.0.linux-arm64.tar.gz\nsudo cp node_exporter-1.7.0.linux-arm64/node_exporter /usr/local/bin/\n\n# Create a systemd service\nsudo tee /etc/systemd/system/node_exporter.service << \'NODEEOF\'\n[Unit]\nDescription=Prometheus Node Exporter\nAfter=network.target\n\n[Service]\nType=simple\nUser=nobody\nExecStart=/usr/local/bin/node_exporter \\\n  --collector.cpu \\\n  --collector.meminfo \\\n  --collector.diskstats \\\n  --collector.filesystem \\\n  --collector.netdev \\\n  --collector.hwmon \\\n  --collector.loadavg \\\n  --collector.uname\nRestart=always\n\n[Install]\nWantedBy=multi-user.target\nNODEEOF\n\nsudo systemctl daemon-reload\nsudo systemctl enable node_exporter\nsudo systemctl start node_exporter\n\n# Verify — should show hundreds of metrics\ncurl -s http://localhost:9100/metrics | head -20\ncurl -s http://localhost:9100/metrics | wc -l\n# Expect: 400-600 lines of metrics\n\n# Check CPU temperature metric (Pi-specific)\ncurl -s http://localhost:9100/metrics | grep hwmon\n# Shows: node_hwmon_temp_celsius',
                language: 'Bash',
                tip: '<strong>What is a metric?</strong> Each metric is a named value with a timestamp: <code>node_cpu_seconds_total{cpu="0",mode="idle"} 123456.78</code>. Prometheus scrapes this endpoint every 15 seconds, stores each value with its timestamp, and you can query the history with PromQL. The <code>{cpu="0",mode="idle"}</code> part is a label &mdash; labels let you filter and aggregate metrics.'
            },
            {
                title: 'Install Prometheus',
                content: '<p>Prometheus is the time-series database that scrapes, stores, and queries metrics. It runs as a single binary with a YAML config file.</p>',
                code: '# Download Prometheus for ARM\ncd /tmp\nwget https://github.com/prometheus/prometheus/releases/download/v2.50.0/prometheus-2.50.0.linux-arm64.tar.gz\ntar xzf prometheus-2.50.0.linux-arm64.tar.gz\n\n# Install binaries\nsudo cp prometheus-2.50.0.linux-arm64/prometheus /usr/local/bin/\nsudo cp prometheus-2.50.0.linux-arm64/promtool /usr/local/bin/\n\n# Create config and data directories\nsudo mkdir -p /etc/prometheus\nsudo mkdir -p /var/lib/prometheus\n\n# Create Prometheus config\nsudo tee /etc/prometheus/prometheus.yml << \'PROMEOF\'\n# ═══ Hexworth Lab Monitoring ═══\n\nglobal:\n  scrape_interval: 15s      # How often to scrape targets\n  evaluation_interval: 15s  # How often to evaluate alert rules\n\n# Targets to monitor\nscrape_configs:\n  # Monitor Prometheus itself\n  - job_name: "prometheus"\n    static_configs:\n      - targets: ["localhost:9090"]\n\n  # Monitor this Pi\n  - job_name: "pi-server"\n    static_configs:\n      - targets: ["localhost:9100"]\n        labels:\n          host: "hexlab-pi"\n          role: "server"\n\n  # Add more machines here:\n  # - job_name: "lab-desktop"\n  #   static_configs:\n  #     - targets: ["192.168.1.50:9100"]\n  #       labels:\n  #         host: "lab-desktop"\n  #         role: "workstation"\nPROMEOF\n\n# Validate config\npromtool check config /etc/prometheus/prometheus.yml\n\n# Create systemd service\nsudo tee /etc/systemd/system/prometheus.service << \'PROMSVC\'\n[Unit]\nDescription=Prometheus Monitoring\nAfter=network.target\n\n[Service]\nType=simple\nUser=nobody\nExecStart=/usr/local/bin/prometheus \\\n  --config.file=/etc/prometheus/prometheus.yml \\\n  --storage.tsdb.path=/var/lib/prometheus/ \\\n  --storage.tsdb.retention.time=30d \\\n  --web.console.templates=/etc/prometheus/consoles \\\n  --web.console.libraries=/etc/prometheus/console_libraries\nRestart=always\n\n[Install]\nWantedBy=multi-user.target\nPROMSVC\n\nsudo chown -R nobody:nogroup /var/lib/prometheus\nsudo systemctl daemon-reload\nsudo systemctl enable prometheus\nsudo systemctl start prometheus\n\n# Verify\ncurl -s http://localhost:9090/api/v1/targets | python3 -m json.tool | head -20\n\n# Open firewall\nsudo ufw allow 9090/tcp comment "Prometheus"\nsudo ufw allow 9100/tcp comment "node_exporter"',
                language: 'Bash',
                tip: '<strong>Retention:</strong> <code>--storage.tsdb.retention.time=30d</code> keeps 30 days of metrics. On a Pi monitoring one machine at 15-second intervals, this uses about 100&ndash;200 MB of disk. Increase for more history, decrease if disk is tight. The data is compacted automatically &mdash; older data uses less space per sample.'
            },
            {
                title: 'Install Grafana',
                content: '<p>Grafana is the visualization layer. It connects to Prometheus as a data source and renders dashboards with graphs, gauges, tables, and alerts. The community has published thousands of pre-built dashboards you can import with one click.</p>',
                code: '# Add Grafana APT repository\nsudo apt install -y apt-transport-https software-properties-common\nwget -q -O - https://apt.grafana.com/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/grafana.gpg\necho "deb [signed-by=/usr/share/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list\n\n# Install Grafana\nsudo apt update\nsudo apt install grafana -y\n\n# Enable and start\nsudo systemctl enable grafana-server\nsudo systemctl start grafana-server\n\n# Open firewall\nsudo ufw allow 3000/tcp comment "Grafana"\n\n# Verify\ncurl -sI http://localhost:3000 | head -3\n# Should show: HTTP/1.1 302 Found (redirect to login)\n\necho ""\necho "=== Grafana Ready ==="\necho "URL:      http://$(hostname -I | awk \'{print $1}\'):3000"\necho "Username: admin"\necho "Password: admin (change on first login)"',
                language: 'Bash',
                tip: '<strong>First login:</strong> The default credentials are <code>admin</code> / <code>admin</code>. Grafana forces you to change the password on first login. Pick a strong password &mdash; the Grafana dashboard has full access to your monitoring data and system metrics.'
            },
            {
                title: 'Connect Prometheus Data Source and Import Dashboard',
                content: '<p>Log into Grafana at <code>http://PI_IP:3000</code>. The first thing to do is add Prometheus as a data source, then import a pre-built dashboard for the Node Exporter metrics.</p>' +
                         '<ol>' +
                         '<li>Go to <strong>Configuration</strong> (gear icon) &gt; <strong>Data Sources</strong> &gt; <strong>Add data source</strong></li>' +
                         '<li>Select <strong>Prometheus</strong></li>' +
                         '<li>URL: <code>http://localhost:9090</code></li>' +
                         '<li>Click <strong>Save &amp; Test</strong> &mdash; should show "Data source is working"</li>' +
                         '</ol>' +
                         '<p>Now import the community Node Exporter dashboard:</p>' +
                         '<ol start="5">' +
                         '<li>Go to <strong>Dashboards</strong> &gt; <strong>Import</strong></li>' +
                         '<li>Enter dashboard ID: <strong>1860</strong> (Node Exporter Full)</li>' +
                         '<li>Click <strong>Load</strong> &gt; select your Prometheus data source &gt; <strong>Import</strong></li>' +
                         '</ol>' +
                         '<p>Dashboard 1860 is the gold standard &mdash; it shows CPU, memory, disk, network, filesystem, system load, and hardware temperature in beautiful pre-configured panels.</p>',
                code: '# You can also configure data sources via the API:\ncurl -X POST http://admin:YOUR_PASSWORD@localhost:3000/api/datasources \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name":"Prometheus","type":"prometheus","url":"http://localhost:9090","access":"proxy","isDefault":true}\'\n\n# Import dashboard via API:\ncurl -X POST http://admin:YOUR_PASSWORD@localhost:3000/api/dashboards/import \\\n  -H "Content-Type: application/json" \\\n  -d \'{"dashboard":{"id":null,"uid":null,"title":"Node Exporter","tags":["monitoring"],"timezone":"browser","schemaVersion":16,"version":0},"folderId":0,"overwrite":true,"inputs":[{"name":"DS_PROMETHEUS","type":"datasource","pluginId":"prometheus","value":"Prometheus"}],"dashboardId":1860}\'\n\n# Or simply use the Grafana UI — it is much easier for dashboards\n# The API is useful for automation and Infrastructure-as-Code\n\n# Test a PromQL query in the Grafana Explore tab:\n# CPU usage: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)\n# Memory used: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / 1024^3\n# Disk used %: 100 - ((node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100)\n# Temperature: node_hwmon_temp_celsius',
                language: 'Bash',
                tip: '<strong>Dashboard 1860:</strong> This is the most popular Node Exporter dashboard on Grafana\'s community hub with 50M+ downloads. It includes 30+ panels organized into rows for CPU, memory, disk, network, and system. You can customize any panel &mdash; click the title, Edit, and modify the PromQL query or visualization settings.'
            },
            {
                title: 'Create Custom Alerts',
                content: '<p>Monitoring without alerting is just looking at pretty graphs. Set up alert rules that notify you when something is wrong &mdash; before users or attackers notice.</p>',
                code: '# Create Prometheus alerting rules\nsudo tee /etc/prometheus/alert_rules.yml << \'ALERTEOF\'\ngroups:\n  - name: hexlab_alerts\n    rules:\n      # High CPU usage\n      - alert: HighCPU\n        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90\n        for: 5m\n        labels:\n          severity: critical\n        annotations:\n          summary: "High CPU usage on {{ $labels.instance }}"\n          description: "CPU usage is above 90% for 5 minutes (current: {{ $value | printf \\\"%.1f\\\" }}%)"\n\n      # High memory usage\n      - alert: HighMemory\n        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85\n        for: 5m\n        labels:\n          severity: warning\n        annotations:\n          summary: "High memory usage on {{ $labels.instance }}"\n          description: "Memory usage is above 85% (current: {{ $value | printf \\\"%.1f\\\" }}%)"\n\n      # Disk space running low\n      - alert: DiskSpaceLow\n        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 15\n        for: 10m\n        labels:\n          severity: warning\n        annotations:\n          summary: "Disk space low on {{ $labels.instance }}"\n          description: "Root filesystem has less than 15% free (current: {{ $value | printf \\\"%.1f\\\" }}%)"\n\n      # High CPU temperature (Pi-specific)\n      - alert: HighTemperature\n        expr: node_hwmon_temp_celsius > 70\n        for: 2m\n        labels:\n          severity: warning\n        annotations:\n          summary: "CPU temperature high on {{ $labels.instance }}"\n          description: "Temperature is {{ $value | printf \\\"%.1f\\\" }}°C (throttling starts at 80°C)"\n\n      # Target down (exporter unreachable)\n      - alert: TargetDown\n        expr: up == 0\n        for: 1m\n        labels:\n          severity: critical\n        annotations:\n          summary: "Target {{ $labels.instance }} is DOWN"\n          description: "Prometheus cannot scrape {{ $labels.job }} at {{ $labels.instance }}"\nALERTEOF\n\n# Add rules file to Prometheus config\nsudo sed -i \'/global:/a\\\\nrule_files:\\n  - "alert_rules.yml"\' /etc/prometheus/prometheus.yml\n\n# Validate\npromtool check rules /etc/prometheus/alert_rules.yml\npromtool check config /etc/prometheus/prometheus.yml\n\n# Restart Prometheus\nsudo systemctl restart prometheus\n\n# Check alerts in Prometheus UI\n# http://PI_IP:9090/alerts\n\n# In Grafana: set up notification channels\n# Alerting > Contact Points > Add > Email/Slack/Discord/Webhook',
                language: 'Bash',
                tip: '<strong>The "for" clause:</strong> <code>for: 5m</code> means the condition must be true for 5 consecutive minutes before firing. This prevents flapping alerts from momentary spikes. A brief CPU spike during package updates should not page anyone. Sustained high CPU for 5+ minutes might indicate a crypto miner.'
            },
            {
                title: 'Monitor Additional Machines',
                content: '<p>The real power of this stack is monitoring your entire lab from one dashboard. Install node_exporter on each machine and add it to Prometheus\'s scrape config.</p>',
                code: '# === ON THE TARGET MACHINE ===\n# (repeat for each machine in your lab)\n\n# Install node_exporter (same steps as Step 1)\n# For x86_64 machines, use the linux-amd64 build:\nwget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz\ntar xzf node_exporter-1.7.0.linux-amd64.tar.gz\nsudo cp node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/\n# (create the systemd service as in Step 1)\n\n# === ON THE PI (Prometheus server) ===\n# Add the new target to prometheus.yml:\nsudo tee -a /etc/prometheus/prometheus.yml << \'TARGETEOF\'\n\n  - job_name: "lab-desktop"\n    static_configs:\n      - targets: ["192.168.1.50:9100"]\n        labels:\n          host: "lab-desktop"\n          role: "workstation"\n\n  - job_name: "kali-vm"\n    static_configs:\n      - targets: ["192.168.1.51:9100"]\n        labels:\n          host: "kali-vm"\n          role: "attack"\nTARGETEOF\n\n# Validate and reload\npromtool check config /etc/prometheus/prometheus.yml\nsudo systemctl reload prometheus\n\n# Check targets — all should show UP\ncurl -s http://localhost:9090/api/v1/targets | \\\n  python3 -c "import json,sys; d=json.load(sys.stdin); \\\n  [print(f\\\"  {t[\\x27labels\\x27][\\x27job\\x27]:20} {t[\\x27health\\x27]:6} {t[\\x27labels\\x27][\\x27instance\\x27]}\\\") \\\n   for t in d[\\x27data\\x27][\\x27activeTargets\\x27]]"\n\n# In Grafana, the Node Exporter dashboard now shows\n# a dropdown to select which host to view.\n# Each machine gets its own graphs, metrics, and alerts.',
                language: 'Bash',
                tip: '<strong>Scale:</strong> A single Raspberry Pi running Prometheus can comfortably monitor 10&ndash;20 machines at 15-second scrape intervals. For larger labs, increase the scrape interval to 30s or 60s. For production environments with hundreds of machines, Prometheus supports federation (aggregating from sub-Prometheus instances) and Thanos/Mimir for long-term storage.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>node_exporter running: <code>curl http://localhost:9100/metrics | wc -l</code> shows 400+ lines</li>' +
                 '<li>Prometheus running: <code>http://PI_IP:9090</code> shows Prometheus UI</li>' +
                 '<li>Targets healthy: <code>http://PI_IP:9090/targets</code> shows all targets as UP (green)</li>' +
                 '<li>Grafana running: <code>http://PI_IP:3000</code> shows login page</li>' +
                 '<li>Data source connected: Grafana &gt; Data Sources &gt; Prometheus shows "Data source is working"</li>' +
                 '<li>Dashboard imported: Node Exporter Full dashboard shows live CPU, memory, disk graphs</li>' +
                 '<li>Alert rules loaded: <code>http://PI_IP:9090/alerts</code> shows your rules in Inactive state</li>' +
                 '<li>Temperature visible: <code>curl http://localhost:9100/metrics | grep hwmon</code> shows Pi CPU temp</li>' +
                 '<li>Services survive reboot: <code>sudo reboot</code> &mdash; all three services restart automatically</li>' +
                 '</ul>' +
                 '<p>Your monitoring stack is operational. Every machine in your lab is now visible through Grafana dashboards. You can detect CPU spikes, memory exhaustion, disk pressure, network anomalies, and temperature issues &mdash; all the indicators that something is wrong before it becomes a crisis.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Prometheus shows target as DOWN (red) on /targets page:</strong> The node_exporter on that machine is not reachable. (1) Check if node_exporter is running on the target: <code>curl http://TARGET_IP:9100/metrics</code>. (2) Verify the target\'s firewall allows port 9100: <code>sudo ufw allow 9100/tcp</code>. (3) Confirm the IP and port in <code>/etc/prometheus/prometheus.yml</code> are correct. Restart Prometheus after config changes: <code>sudo systemctl restart prometheus</code>.</li>' +
                         '<li><strong>Grafana dashboard shows "No data" on all panels:</strong> The Prometheus data source is misconfigured. Go to Grafana &gt; Configuration &gt; Data Sources &gt; Prometheus. The URL should be <code>http://localhost:9090</code> (not http://127.0.0.1 if IPv6 is causing issues). Click "Save &amp; Test" and verify it says "Data source is working".</li>' +
                         '<li><strong>Prometheus uses too much RAM or disk:</strong> Prometheus stores 15 days of metrics by default. On a Pi with 4 GB RAM, this can consume 1-2 GB. Reduce retention: add <code>--storage.tsdb.retention.time=7d</code> to the Prometheus systemd service file. Also reduce scrape frequency from 15s to 30s or 60s for non-critical targets.</li>' +
                         '<li><strong>node_exporter shows no temperature data (hwmon metrics missing):</strong> On Raspberry Pi OS, the thermal sensor path may differ. Check <code>cat /sys/class/thermal/thermal_zone0/temp</code> &mdash; it should return a value (in millidegrees). If node_exporter does not auto-detect it, pass <code>--collector.hwmon</code> flag explicitly when starting the exporter.</li>' +
                         '<li><strong>Grafana login page shows but default admin/admin credentials rejected:</strong> The password was changed during initial setup or by a previous config. Reset it from the CLI: <code>sudo grafana-cli admin reset-admin-password newpassword</code>.</li>' +
                         '<li><strong>Alerts never fire even when thresholds are exceeded:</strong> Check that your alerting rules are syntactically valid: <code>promtool check rules /etc/prometheus/alert_rules.yml</code>. Also verify the rules file is referenced in <code>prometheus.yml</code> under the <code>rule_files:</code> section and Prometheus was restarted after adding it.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Custom Alert Rules</strong> &mdash; Create Prometheus alerting rules for: (1) CPU usage above 80% for 5 minutes, (2) disk usage above 90%, (3) Pi temperature above 75 degrees C, (4) a node_exporter target being down for more than 2 minutes. Configure Alertmanager to send notifications to a Discord or Slack webhook.</p>' +
                    '<p><strong>Challenge 2: Multi-Node Dashboard</strong> &mdash; Add node_exporter to every Pi in your lab (Pi-hole, NAS, VPN, media server). Build a custom Grafana dashboard that shows all nodes side-by-side with CPU, memory, disk, temperature, and network graphs. Add variables so you can filter by node.</p>' +
                    '<p><strong>Challenge 3: Application Metrics</strong> &mdash; Pi-hole exposes metrics at its API endpoint. Write a custom Prometheus exporter (a simple Python script using the <code>prometheus_client</code> library) that scrapes Pi-hole\'s API and exposes total queries, blocked queries, and blocked percentage as Prometheus metrics. Build a Grafana panel for DNS analytics.</p>',

        commonMistakes: [
            {
                title: 'Scraping targets too frequently on a Pi',
                correct: 'Set scrape_interval to 30s or 60s for home lab monitoring. The default 15s is designed for production servers with dedicated hardware.',
                incorrect: 'Using the default 15-second scrape interval on a Raspberry Pi that is already running other services.',
                consequence: 'Prometheus, node_exporter, and the network traffic from frequent scrapes consume noticeable CPU and RAM on a Pi. With 5+ targets at 15s intervals, you are generating thousands of data points per minute. 60s intervals provide plenty of resolution for home lab use.',
            },
            {
                title: 'Not setting up Prometheus data retention limits',
                correct: 'Add <code>--storage.tsdb.retention.time=7d</code> and <code>--storage.tsdb.retention.size=1GB</code> to the Prometheus startup flags.',
                incorrect: 'Running Prometheus with default settings (15-day retention, no size limit) on a Pi with a 32 GB SD card.',
                consequence: 'Prometheus TSDB grows continuously. On a Pi scraping 5 targets every 30 seconds, the database can reach 2-4 GB within weeks. Combined with the OS and other services, the SD card fills up and the Pi crashes.',
            },
            {
                title: 'Exposing Grafana and Prometheus to the network without authentication',
                correct: 'Keep Prometheus bound to localhost (<code>--web.listen-address=127.0.0.1:9090</code>) and access it only through Grafana. Use Grafana\'s built-in authentication. For remote access, use the reverse proxy from SG-51.',
                incorrect: 'Binding Prometheus to 0.0.0.0:9090 with no authentication, making it accessible to anyone on the network.',
                consequence: 'Prometheus has no built-in authentication. Anyone on your network can query your metrics, view system information, and potentially identify vulnerabilities. In enterprise environments, exposed Prometheus instances have been used for reconnaissance in breaches.',
            }
        ]
    },

    // ========================================================================
    // SG-50: Pi Cluster with Docker Swarm
    // ========================================================================
    'sg-50': {
        intro: '<p>Three Raspberry Pis, one network switch, one purpose: build a distributed computing cluster that spreads workloads across multiple machines and survives hardware failure. When one node dies, the services automatically migrate to the survivors. This is how cloud providers deliver "99.99% uptime" &mdash; not by building perfect hardware, but by building systems that expect failure.</p>' +
               '<p>Docker Swarm is Docker\'s built-in clustering system. It is simpler than Kubernetes but teaches the same fundamental concepts: service replication, load balancing, rolling updates, secrets management, and node failure recovery. If you understand Swarm, you understand 80% of what Kubernetes does &mdash; just at a smaller scale.</p>' +
               '<p>This project is the capstone of the Home Lab Builds section. It combines everything: headless Pi setup (SG-43), networking, Docker, monitoring, and distributed systems. When you finish, you will have a miniature data center on your desk that runs real services with real fault tolerance.</p>',

        wiring: '    Pi Cluster — 3 Nodes\n' +
                '    \n' +
                '    +----------+   +----------+   +----------+\n' +
                '    |  Pi #1   |   |  Pi #2   |   |  Pi #3   |\n' +
                '    |  MANAGER |   |  WORKER  |   |  WORKER  |\n' +
                '    |  .100    |   |  .101    |   |  .102    |\n' +
                '    +----+-----+   +----+-----+   +----+-----+\n' +
                '         |              |              |\n' +
                '    +----+--------------+--------------+----+\n' +
                '    |        Gigabit Ethernet Switch         |\n' +
                '    +----+----------------------------------+\n' +
                '         |\n' +
                '    +----+-----+\n' +
                '    |  Router  |  ---> Internet\n' +
                '    +----------+\n' +
                '    \n' +
                '    Docker Swarm overlay network spans all 3 nodes.\n' +
                '    Services replicated across workers.\n' +
                '    Manager handles orchestration + scheduling.',

        wiringNotes: '<p><strong>Hardware:</strong> Three Raspberry Pi 4 or 5 boards (4 GB RAM minimum each), three USB-C power supplies, three Ethernet cables, one gigabit switch, and optionally a cluster case/stand to keep them organized. Total cost: ~$200&ndash;280 for the cluster.</p>' +
                     '<p><strong>Why 3 nodes?</strong> Swarm uses the Raft consensus algorithm for manager election. Raft requires a majority (quorum) to agree on decisions. With 3 managers, you can lose 1 and still have quorum (2 of 3). With 2 nodes, losing 1 kills quorum. With 1 node, there is no fault tolerance. Three is the minimum for meaningful clustering.</p>' +
                     '<p><strong>Power:</strong> Three Pis draw ~15W total under load. A quality 4-port USB charger can power all three if each port delivers 3A. Or use individual power supplies for reliability.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg50-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="440" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="420" fill="url(#sg50-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-50 RASPBERRY PI CLUSTER — DOCKER SWARM</text>' +

            '<!-- Node 1: Manager -->' +
            '<g>' +
            '<rect x="30" y="50" width="200" height="155" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="30" y="50" width="200" height="22" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="130" y="66" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="700">NODE 1 — MANAGER</text>' +

            '<!-- Crown icon for manager -->' +
            '<polygon points="130,78 120,90 125,86 130,92 135,86 140,90" fill="#eab308" opacity="0.6"/>' +

            '<text x="130" y="108" text-anchor="middle" fill="#8b949e" font-size="7">hexcluster-01</text>' +
            '<text x="130" y="120" text-anchor="middle" fill="#eab308" font-size="7">192.168.1.100</text>' +

            '<!-- Services on this node -->' +
            '<rect x="42" y="130" width="80" height="18" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
            '<text x="82" y="142" text-anchor="middle" fill="#4ade80" font-size="5">nginx (replica 1)</text>' +
            '<rect x="130" y="130" width="88" height="18" rx="3" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.25)" stroke-width="0.5"/>' +
            '<text x="174" y="142" text-anchor="middle" fill="#a78bfa" font-size="5">monitoring stack</text>' +

            '<rect x="42" y="155" width="80" height="18" rx="3" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.25)" stroke-width="0.5"/>' +
            '<text x="82" y="167" text-anchor="middle" fill="#60a5fa" font-size="5">app (replica 1)</text>' +
            '<rect x="130" y="155" width="88" height="18" rx="3" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.25)" stroke-width="0.5"/>' +
            '<text x="174" y="167" text-anchor="middle" fill="#fb923c" font-size="5">Raft consensus</text>' +

            '<!-- Status LED -->' +
            '<circle cx="45" cy="108" r="4" fill="#22c55e"><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/></circle>' +
            '</g>' +

            '<!-- Node 2: Worker -->' +
            '<g>' +
            '<rect x="260" y="50" width="200" height="155" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="2"/>' +
            '<rect x="260" y="50" width="200" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="360" y="66" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="700">NODE 2 — WORKER</text>' +

            '<text x="360" y="100" text-anchor="middle" fill="#8b949e" font-size="7">hexcluster-02</text>' +
            '<text x="360" y="112" text-anchor="middle" fill="#3b82f6" font-size="7">192.168.1.101</text>' +

            '<rect x="272" y="130" width="80" height="18" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
            '<text x="312" y="142" text-anchor="middle" fill="#4ade80" font-size="5">nginx (replica 2)</text>' +
            '<rect x="360" y="130" width="88" height="18" rx="3" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.25)" stroke-width="0.5"/>' +
            '<text x="404" y="142" text-anchor="middle" fill="#60a5fa" font-size="5">app (replica 2)</text>' +

            '<rect x="272" y="155" width="80" height="18" rx="3" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.25)" stroke-width="0.5"/>' +
            '<text x="312" y="167" text-anchor="middle" fill="#fca5a5" font-size="5">redis cache</text>' +

            '<circle cx="275" cy="100" r="4" fill="#22c55e"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>' +
            '</g>' +

            '<!-- Node 3: Worker -->' +
            '<g>' +
            '<rect x="490" y="50" width="200" height="155" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="2"/>' +
            '<rect x="490" y="50" width="200" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="590" y="66" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="700">NODE 3 — WORKER</text>' +

            '<text x="590" y="100" text-anchor="middle" fill="#8b949e" font-size="7">hexcluster-03</text>' +
            '<text x="590" y="112" text-anchor="middle" fill="#22c55e" font-size="7">192.168.1.102</text>' +

            '<rect x="502" y="130" width="80" height="18" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
            '<text x="542" y="142" text-anchor="middle" fill="#4ade80" font-size="5">nginx (replica 3)</text>' +
            '<rect x="590" y="130" width="88" height="18" rx="3" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.25)" stroke-width="0.5"/>' +
            '<text x="634" y="142" text-anchor="middle" fill="#60a5fa" font-size="5">app (replica 3)</text>' +

            '<rect x="502" y="155" width="175" height="18" rx="3" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.25)" stroke-width="0.5"/>' +
            '<text x="589" y="167" text-anchor="middle" fill="#eab308" font-size="5">shared NFS volume (from SG-46 NAS)</text>' +

            '<circle cx="505" cy="100" r="4" fill="#22c55e"><animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/></circle>' +
            '</g>' +

            '<!-- Network Switch -->' +
            '<g>' +
            '<rect x="200" y="230" width="320" height="50" rx="8" fill="#1e2736" stroke="#8b949e" stroke-width="1.5"/>' +
            '<text x="360" y="255" text-anchor="middle" fill="#8b949e" font-size="9" font-weight="600">GIGABIT SWITCH</text>' +
            '<text x="360" y="270" text-anchor="middle" fill="#555" font-size="6">Unmanaged &bull; 5+ ports &bull; 1 Gbps</text>' +

            '<!-- Port LEDs -->' +
            '<circle cx="280" cy="243" r="3" fill="#eab308"><animate attributeName="opacity" values="1;0.3;1" dur="0.6s" repeatCount="indefinite"/></circle>' +
            '<circle cx="330" cy="243" r="3" fill="#3b82f6"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.6s" repeatCount="indefinite"/></circle>' +
            '<circle cx="380" cy="243" r="3" fill="#22c55e"><animate attributeName="opacity" values="1;0.5;1" dur="0.8s" repeatCount="indefinite"/></circle>' +
            '<circle cx="430" cy="243" r="3" fill="#555"/>' +
            '<circle cx="460" cy="243" r="3" fill="#555"/>' +
            '</g>' +

            '<!-- Cables from nodes to switch -->' +
            '<line x1="130" y1="205" x2="280" y2="230" stroke="#eab308" stroke-width="2"/>' +
            '<line x1="360" y1="205" x2="360" y2="230" stroke="#3b82f6" stroke-width="2"/>' +
            '<line x1="590" y1="205" x2="440" y2="230" stroke="#22c55e" stroke-width="2"/>' +

            '<!-- Overlay Network visualization -->' +
            '<rect x="30" y="300" width="660" height="55" rx="8" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.15)" stroke-width="1" stroke-dasharray="6,3"/>' +
            '<text x="360" y="318" text-anchor="middle" fill="#a78bfa" font-size="8" font-weight="600">DOCKER SWARM OVERLAY NETWORK (ingress)</text>' +
            '<text x="360" y="335" text-anchor="middle" fill="#8b949e" font-size="6">Virtual network spanning all nodes &bull; Encrypted inter-node traffic &bull; Built-in load balancer</text>' +
            '<text x="360" y="348" text-anchor="middle" fill="#8b949e" font-size="6">Any node can receive traffic for any service &bull; Swarm routes to the correct container</text>' +

            '<!-- Animated packets on overlay -->' +
            '<circle r="3" fill="#a78bfa" opacity="0.6"><animate attributeName="cx" values="50;680" dur="3s" repeatCount="indefinite"/><animate attributeName="cy" values="325;325" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite"/></circle>' +
            '<circle r="3" fill="#c4b5fd" opacity="0.4"><animate attributeName="cx" values="680;50" dur="4s" repeatCount="indefinite"/><animate attributeName="cy" values="325;325" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.4;0" dur="4s" repeatCount="indefinite"/></circle>' +

            '<!-- Failure scenario -->' +
            '<rect x="30" y="370" width="320" height="55" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.12)" stroke-width="0.5"/>' +
            '<text x="40" y="388" fill="#fca5a5" font-size="7" font-weight="600">FAILURE SCENARIO</text>' +
            '<text x="40" y="402" fill="#8b949e" font-size="5">If Node 2 dies: its replicas (nginx #2, app #2, redis)</text>' +
            '<text x="40" y="414" fill="#8b949e" font-size="5">automatically reschedule onto Node 1 or Node 3 within 10s</text>' +

            '<!-- Scaling info -->' +
            '<rect x="370" y="370" width="320" height="55" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" stroke-width="0.5"/>' +
            '<text x="380" y="388" fill="#4ade80" font-size="7" font-weight="600">SCALING</text>' +
            '<text x="380" y="402" fill="#8b949e" font-size="5">docker service scale nginx=5 → Swarm spreads 5 replicas</text>' +
            '<text x="380" y="414" fill="#8b949e" font-size="5">across all healthy nodes. Load balancer routes automatically.</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Prepare Three Raspberry Pis',
                content: '<p>Each Pi needs a headless setup (SG-43) with Docker installed. Use the same process three times with different hostnames and static IPs. All three must be on the same network subnet.</p>',
                code: '# === DO THIS ON EACH PI ===\n# Follow SG-43 for each Pi with these settings:\n\n# Pi 1 (Manager):\n#   Hostname: hexcluster-01\n#   Static IP: 192.168.1.100\n\n# Pi 2 (Worker):\n#   Hostname: hexcluster-02\n#   Static IP: 192.168.1.101\n\n# Pi 3 (Worker):\n#   Hostname: hexcluster-03\n#   Static IP: 192.168.1.102\n\n# On EACH Pi, install Docker:\ncurl -fsSL https://get.docker.com | sh\nsudo usermod -aG docker $USER\n\n# Set the hostname:\nsudo hostnamectl set-hostname hexcluster-01  # (or -02, -03)\n\n# Set static IP:\nsudo nmcli con mod "Wired connection 1" \\\n  ipv4.addresses 192.168.1.100/24 \\\n  ipv4.gateway 192.168.1.1 \\\n  ipv4.dns "1.1.1.1" \\\n  ipv4.method manual\nsudo nmcli con up "Wired connection 1"\n\n# Verify all 3 can ping each other:\nping -c 2 192.168.1.100\nping -c 2 192.168.1.101\nping -c 2 192.168.1.102\n\n# Verify Docker on all 3:\ndocker --version',
                language: 'Bash',
                tip: '<strong>Time sync:</strong> Cluster nodes must have synchronized clocks. Docker Swarm uses timestamps for leader election and log ordering. All Pis should use NTP: <code>sudo timedatectl set-ntp true</code>. Verify with <code>timedatectl status</code> &mdash; "NTP service: active" should appear on all three.'
            },
            {
                title: 'Initialize Docker Swarm',
                content: '<p>Initialize Swarm on the manager node (Pi #1). This creates the cluster and generates join tokens for worker nodes. The manager handles orchestration &mdash; it decides where containers run, monitors their health, and reschedules them on failure.</p>',
                code: '# === ON PI #1 (Manager) ===\n\n# Initialize the swarm\ndocker swarm init --advertise-addr 192.168.1.100\n\n# This outputs a join command with a token. Copy it.\n# It looks like:\n# docker swarm join --token SWMTKN-1-xxx... 192.168.1.100:2377\n\n# Get the worker join token (in case you lost it):\ndocker swarm join-token worker\n\n# Get the manager join token (for adding backup managers):\ndocker swarm join-token manager\n\n# === ON PI #2 and PI #3 (Workers) ===\n\n# Paste the join command from above:\ndocker swarm join --token SWMTKN-1-xxx... 192.168.1.100:2377\n# Should output: "This node joined a swarm as a worker."\n\n# === BACK ON PI #1 (Manager) ===\n\n# Verify the cluster\ndocker node ls\n# Should show all 3 nodes:\n# ID          HOSTNAME        STATUS    AVAILABILITY   MANAGER STATUS\n# xxx *       hexcluster-01   Ready     Active         Leader\n# yyy         hexcluster-02   Ready     Active\n# zzz         hexcluster-03   Ready     Active\n\n# Label the nodes for scheduling constraints\ndocker node update --label-add role=manager hexcluster-01\ndocker node update --label-add role=worker hexcluster-02\ndocker node update --label-add role=worker hexcluster-03',
                language: 'Bash',
                tip: '<strong>Swarm ports:</strong> Docker Swarm uses three ports: TCP 2377 (cluster management), TCP/UDP 7946 (node communication), UDP 4789 (overlay network traffic). These must be open between all nodes. If you have UFW enabled: <code>sudo ufw allow 2377/tcp && sudo ufw allow 7946 && sudo ufw allow 4789/udp</code>.'
            },
            {
                title: 'Deploy Your First Replicated Service',
                content: '<p>Deploy a web server replicated across all three nodes. Swarm\'s built-in load balancer (the routing mesh) distributes incoming requests across all healthy replicas. Any node can receive the request &mdash; Swarm routes it to a node running the container.</p>',
                code: '# Create an overlay network for our services\ndocker network create --driver overlay --attachable hexlab-net\n\n# Deploy nginx with 3 replicas (one per node)\ndocker service create \\\n  --name nginx \\\n  --replicas 3 \\\n  --publish published=80,target=80 \\\n  --network hexlab-net \\\n  --update-delay 10s \\\n  --update-parallelism 1 \\\n  --restart-condition on-failure \\\n  nginx:alpine\n\n# Check the service\ndocker service ls\ndocker service ps nginx\n# Shows which node each replica is running on\n\n# Test — each node should serve the nginx welcome page\ncurl http://192.168.1.100\ncurl http://192.168.1.101\ncurl http://192.168.1.102\n# All three return the same nginx page because of the routing mesh\n\n# Scale up to 5 replicas\ndocker service scale nginx=5\ndocker service ps nginx\n# Swarm distributes 5 replicas across 3 nodes\n\n# Scale back down\ndocker service scale nginx=3\n\n# View logs from all replicas\ndocker service logs nginx --follow --tail 20',
                language: 'Bash',
                tip: '<strong>Routing mesh magic:</strong> When you <code>curl http://192.168.1.102</code>, Node 3 might not even be running an nginx replica. The routing mesh intercepts the request at the node level and forwards it to a node that IS running nginx. From the client\'s perspective, every node is the service. This is the same concept as a cloud load balancer.'
            },
            {
                title: 'Deploy a Multi-Service Stack',
                content: '<p>Real applications have multiple services that work together. Deploy a stack using a Docker Compose file &mdash; Swarm reads the same <code>docker-compose.yml</code> format and distributes services across the cluster.</p>',
                code: '# Create a stack definition\nmkdir -p ~/hexlab-stack\ntee ~/hexlab-stack/docker-compose.yml << \'STACKEOF\'\nversion: "3.8"\n\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - "80:80"\n    networks:\n      - frontend\n    deploy:\n      replicas: 3\n      update_config:\n        parallelism: 1\n        delay: 10s\n      restart_policy:\n        condition: on-failure\n        delay: 5s\n        max_attempts: 3\n\n  app:\n    image: python:3.12-slim\n    command: python -m http.server 8000\n    networks:\n      - frontend\n      - backend\n    deploy:\n      replicas: 2\n      placement:\n        constraints:\n          - node.labels.role == worker\n\n  redis:\n    image: redis:7-alpine\n    networks:\n      - backend\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.labels.role == worker\n    volumes:\n      - redis-data:/data\n\n  visualizer:\n    image: dockersamples/visualizer:latest\n    ports:\n      - "8080:8080"\n    volumes:\n      - /var/run/docker.sock:/var/run/docker.sock\n    deploy:\n      placement:\n        constraints:\n          - node.role == manager\n\nnetworks:\n  frontend:\n    driver: overlay\n  backend:\n    driver: overlay\n    internal: true\n\nvolumes:\n  redis-data:\nSTACKEOF\n\n# Deploy the stack\ndocker stack deploy -c ~/hexlab-stack/docker-compose.yml hexlab\n\n# Monitor deployment\nwatch docker stack services hexlab\n\n# Once all services show the correct replica count:\ndocker stack services hexlab\ndocker stack ps hexlab\n\n# Open the visualizer to see your cluster graphically\n# http://192.168.1.100:8080\n# Shows each node with its containers — beautiful real-time view',
                language: 'Bash',
                tip: '<strong>The visualizer:</strong> <code>dockersamples/visualizer</code> renders a real-time graphical view of your cluster. Each node is a column, each container is a colored box. Watch it while you scale services or kill nodes &mdash; you can see containers migrate in real time. This is the most satisfying thing in the entire project.'
            },
            {
                title: 'Test Failure Recovery',
                content: '<p>The whole point of a cluster is surviving failure. Deliberately kill a node and watch Swarm recover. This is the moment everything clicks &mdash; distributed systems are not theoretical, they are <em>visible</em>.</p>',
                code: '# Open the visualizer in your browser:\n# http://192.168.1.100:8080\n# Keep it visible while you do the following.\n\n# === TEST 1: Kill a container ===\n# On any worker, find and kill an nginx container:\nssh pi@192.168.1.101 "docker ps -q | head -1 | xargs docker kill"\n# Watch the visualizer — Swarm restarts it within seconds\n\n# Check service status:\ndocker service ps nginx\n# Shows the killed replica as "Shutdown" and a new one as "Running"\n\n# === TEST 2: Pull the plug on a worker ===\n# Physically unplug Pi #3 (or: ssh pi@192.168.1.102 "sudo poweroff")\n# Watch the visualizer — within 10-15 seconds:\n#   1. Node 3 shows as "Down"\n#   2. Containers from Node 3 reschedule onto Node 1 and Node 2\n#   3. Service replica count stays at the target number\n\n# Check node status:\ndocker node ls\n# hexcluster-03 shows Status: Down\n\n# Check service — still running at full replica count:\ndocker service ps nginx\ndocker service ps hexlab_app\n\n# Test that the service still works:\ncurl http://192.168.1.100\ncurl http://192.168.1.101\n# Both still serve content — the cluster survived losing a node\n\n# === TEST 3: Bring the node back ===\n# Power on Pi #3\n# It automatically rejoins the swarm\n# Swarm may rebalance replicas (or not — it only moves when needed)\ndocker node ls\n# hexcluster-03 back to Status: Ready\n\n# === TEST 4: Rolling update ===\ndocker service update --image nginx:1.25-alpine hexlab_web\n# Watch the visualizer — replicas update one at a time\n# Old replica stops, new replica starts, waits 10s, next replica\n# Zero downtime throughout the update',
                language: 'Bash',
                tip: '<strong>This is infrastructure engineering.</strong> You just witnessed automatic failure recovery, service rescheduling, and zero-downtime rolling updates. These are the same mechanisms that keep AWS, Google Cloud, and Azure running. The scale is different; the principles are identical. When an interviewer asks "do you have experience with distributed systems?" &mdash; you do now.'
            },
            {
                title: 'Monitor the Cluster with Prometheus',
                content: '<p>Connect the monitoring stack from SG-49 to your cluster. Install node_exporter on all three Pis and add Docker metrics to Prometheus for container-level visibility.</p>',
                code: '# Install node_exporter on Pi #2 and Pi #3\n# (Pi #1 already has it from SG-49)\n# SSH into each worker and repeat the SG-49 Step 1 installation\n\n# On the manager, add all three to Prometheus config:\nsudo tee -a /etc/prometheus/prometheus.yml << \'CLUSTEREOF\'\n\n  - job_name: "cluster"\n    static_configs:\n      - targets: ["192.168.1.100:9100"]\n        labels:\n          host: "hexcluster-01"\n          role: "manager"\n      - targets: ["192.168.1.101:9100"]\n        labels:\n          host: "hexcluster-02"\n          role: "worker"\n      - targets: ["192.168.1.102:9100"]\n        labels:\n          host: "hexcluster-03"\n          role: "worker"\n\n  # Docker daemon metrics (optional — requires enabling)\n  - job_name: "docker"\n    static_configs:\n      - targets: ["192.168.1.100:9323"]\n      - targets: ["192.168.1.101:9323"]\n      - targets: ["192.168.1.102:9323"]\nCLUSTEREOF\n\n# Reload Prometheus\nsudo systemctl reload prometheus\n\n# In Grafana, import Docker Swarm dashboard (ID: 15120)\n# or Node Exporter with multi-host support (ID: 1860)\n\n# Useful Swarm-specific queries:\n# Service replica count:\n# count(container_last_seen{container_label_com_docker_swarm_service_name="nginx"})\n# Node status:\n# up{job="cluster"}\n\n# === CLUSTER STATUS SCRIPT ===\ncat << \'STATUSEOF\' > ~/cluster-status.sh\n#!/bin/bash\necho "=== Hexworth Cluster Status ===" \necho ""\necho "Nodes:"\ndocker node ls --format "  {{.Hostname}}\\t{{.Status}}\\t{{.Availability}}\\t{{.ManagerStatus}}"\necho ""\necho "Services:"\ndocker service ls --format "  {{.Name}}\\t{{.Replicas}}\\t{{.Image}}"\necho ""\necho "Running containers per node:"\nfor node in 192.168.1.100 192.168.1.101 192.168.1.102; do\n  count=$(ssh -o ConnectTimeout=2 pi@$node "docker ps -q | wc -l" 2>/dev/null || echo "DOWN")\n  echo "  $node: $count containers"\ndone\nSTATUSEOF\nchmod +x ~/cluster-status.sh\nbash ~/cluster-status.sh',
                language: 'Bash',
                tip: '<strong>Production pattern:</strong> In real infrastructure, you never manage a cluster by hand. You define the desired state (3 replicas of nginx, 2 of the app, 1 redis), and the orchestrator continuously reconciles actual state with desired state. If a node dies, the orchestrator does not panic &mdash; it calmly reschedules the missing containers. This declarative model is the foundation of GitOps and Infrastructure as Code.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>All 3 nodes show Ready: <code>docker node ls</code></li>' +
                 '<li>Stack deployed: <code>docker stack services hexlab</code> shows all services with correct replica counts</li>' +
                 '<li>Routing mesh works: <code>curl</code> to any node IP returns the web service</li>' +
                 '<li>Visualizer running: <code>http://MANAGER_IP:8080</code> shows cluster graphically</li>' +
                 '<li>Failure recovery: killing a container &rarr; automatic restart within seconds</li>' +
                 '<li>Node failure: powering off a worker &rarr; services reschedule onto remaining nodes</li>' +
                 '<li>Node recovery: powering on the worker &rarr; it rejoins the swarm automatically</li>' +
                 '<li>Rolling update: <code>docker service update --image</code> updates replicas with zero downtime</li>' +
                 '<li>Monitoring: all 3 nodes visible in Grafana dashboards</li>' +
                 '</ul>' +
                 '<p>You have built a fault-tolerant distributed computing cluster from commodity hardware. Services survive node failure. Updates deploy without downtime. Monitoring watches everything. This is the same architecture running in every cloud data center &mdash; just at a smaller scale.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Worker fails to join the swarm ("connection refused" or token error):</strong> (1) Verify the join token is correct &mdash; regenerate it on the manager: <code>docker swarm join-token worker</code>. (2) Ensure port 2377/tcp is open on the manager: <code>sudo ufw allow 2377/tcp</code>. (3) Verify network connectivity: <code>ping MANAGER_IP</code> from the worker. (4) Check that Docker is running on the worker: <code>sudo systemctl status docker</code>.</li>' +
                         '<li><strong>Services stuck in "Pending" state (0/N replicas running):</strong> Run <code>docker service ps SERVICE_NAME --no-trunc</code> to see the error. Common causes: (1) Image not found &mdash; the image name is wrong or the registry is unreachable. (2) Insufficient resources &mdash; no node has enough memory. (3) Constraint violation &mdash; a placement constraint excludes all available nodes.</li>' +
                         '<li><strong>Overlay network connectivity issues (containers on different nodes cannot communicate):</strong> Docker Swarm overlay networking requires ports 7946/tcp+udp (gossip protocol) and 4789/udp (VXLAN) to be open between all nodes. Run <code>sudo ufw allow 7946 && sudo ufw allow 4789/udp</code> on every node.</li>' +
                         '<li><strong>Node shows as "Down" in <code>docker node ls</code> but the Pi is running:</strong> Docker daemon may have crashed or the swarm heartbeat timed out. On the affected node, run <code>sudo systemctl restart docker</code>. If the node was down too long, it may need to be removed and re-joined: <code>docker node rm NODEID</code> on the manager, then re-join from the worker.</li>' +
                         '<li><strong>Rolling update causes downtime instead of zero-downtime:</strong> Your service needs health checks and sufficient replicas. A single-replica service will always have brief downtime during updates. Use at least 2 replicas and configure <code>--update-parallelism 1 --update-delay 10s</code> so only one replica updates at a time.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Chaos Engineering</strong> &mdash; While services are running, randomly power off one worker node (pull the power cable). Observe how Swarm detects the failure and reschedules containers to surviving nodes. Time how long it takes. Then power the node back on and watch it rejoin. Document the recovery sequence.</p>' +
                    '<p><strong>Challenge 2: Secrets Management</strong> &mdash; Use Docker secrets to store a database password: <code>echo "MySecretPassword" | docker secret create db_password -</code>. Deploy a service that mounts this secret and reads it from <code>/run/secrets/db_password</code> inside the container. Verify the secret is not visible in <code>docker inspect</code>.</p>' +
                    '<p><strong>Challenge 3: Auto-Scaling Simulation</strong> &mdash; Write a script that monitors CPU load across the cluster (via Prometheus from SG-49). When average CPU exceeds 70%, scale up a service: <code>docker service scale myapp=6</code>. When it drops below 30%, scale down to 2. This simulates the auto-scaling behavior of cloud platforms like AWS ECS.</p>',

        commonMistakes: [
            {
                title: 'Running only one manager node with no fault tolerance',
                correct: 'For a production-like setup, use 3 manager nodes (all 3 Pis can be managers, with 2 also acting as workers). Raft consensus requires a majority &mdash; 3 managers can tolerate 1 failure.',
                incorrect: 'Running 1 manager and 2 workers. If the manager Pi fails, the entire swarm is unrecoverable.',
                consequence: 'With a single manager, losing that node means you cannot deploy, update, or manage any services. The workers keep running existing containers, but you cannot make any changes until the manager is restored. Promoting a worker to manager after the fact requires the original manager\'s state.',
            },
            {
                title: 'Using host-mode networking instead of overlay networks',
                correct: 'Use Docker overlay networks for inter-service communication. Overlay networks provide service discovery, load balancing, and encryption across nodes.',
                incorrect: 'Deploying services with <code>--network host</code> to avoid dealing with overlay networking.',
                consequence: 'Host networking bypasses Swarm\'s built-in service discovery and load balancing. Containers must know exact node IPs, ports conflict across services, and you lose the ability to seamlessly reschedule containers to different nodes.',
            },
            {
                title: 'Storing persistent data in container volumes without external mounts',
                correct: 'Mount persistent data to a shared location (NFS share from SG-46, or a local path with <code>--mount type=bind</code>). Use named volumes for data that must survive container restarts.',
                incorrect: 'Relying on Docker\'s default anonymous volumes, which are local to each node.',
                consequence: 'When a container is rescheduled to a different node (after failure or update), its data stays on the old node. The new container starts with an empty volume. For databases, caches, and any stateful service, this means complete data loss on every reschedule.',
            }
        ]
    },

    // ========================================================================
    // SG-51: Reverse Proxy with Nginx
    // ========================================================================
    'sg-51': {
        intro: '<p>A reverse proxy sits in front of your services and routes traffic to the right one based on the domain name or URL path. Instead of remembering <code>192.168.1.100:8096</code> for Jellyfin, <code>:3000</code> for Grafana, and <code>:9090</code> for Prometheus, you access everything through clean URLs: <code>media.home.lab</code>, <code>grafana.home.lab</code>, <code>monitor.home.lab</code>.</p>' +
               '<p>But a reverse proxy does more than just pretty URLs. It terminates TLS (HTTPS encryption), adds authentication headers, enforces rate limits, caches static content, and provides a single chokepoint for logging and access control. Every website you visit goes through a reverse proxy &mdash; Cloudflare, AWS ALB, and nginx are the most common.</p>' +
               '<p>This project teaches HTTP routing, virtual host configuration, TLS certificate management with Let\'s Encrypt, and the architecture pattern behind every modern web deployment. By the end, all your lab services will be accessible through a single IP address with clean domain names and HTTPS encryption.</p>',

        wiring: '    Client Browser\n' +
                '        |\n' +
                '        | https://media.home.lab\n' +
                '        v\n' +
                '    +------------------+     +------------------+\n' +
                '    | Nginx Reverse    |---->| Jellyfin :8096   |\n' +
                '    | Proxy :443/:80   |     +------------------+\n' +
                '    |                  |     +------------------+\n' +
                '    | Routes by Host   |---->| Grafana :3000    |\n' +
                '    | header:          |     +------------------+\n' +
                '    |                  |     +------------------+\n' +
                '    | media.home.lab   |---->| Pi-hole :80/admin|\n' +
                '    | grafana.home.lab |     +------------------+\n' +
                '    | pihole.home.lab  |\n' +
                '    +------------------+\n' +
                '    \n' +
                '    One IP, one port (443), multiple services.\n' +
                '    Nginx reads the Host header and routes accordingly.',

        wiringNotes: '<p><strong>How it works:</strong> When your browser requests <code>https://media.home.lab</code>, it sends an HTTP <code>Host: media.home.lab</code> header. Nginx reads this header and proxies the request to <code>http://localhost:8096</code> (Jellyfin). The response flows back through Nginx to the browser. The client never talks directly to Jellyfin.</p>' +
                     '<p><strong>DNS:</strong> For <code>.home.lab</code> domains to work, you need local DNS resolution. Pi-hole (SG-44) can do this: add local DNS records in Pi-hole Admin &gt; Local DNS &gt; DNS Records. Point all <code>*.home.lab</code> hostnames to the Pi\'s IP address.</p>' +
                     '<p><strong>TLS:</strong> For real HTTPS with valid certificates, you need a public domain. For lab use, you can use self-signed certificates (browser will warn) or install a local CA with <code>mkcert</code>. We cover both approaches.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg51-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg51-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-51 NGINX REVERSE PROXY</text>' +

            '<!-- Client -->' +
            '<rect x="30" y="120" width="120" height="80" rx="8" fill="#1e2736" stroke="#a78bfa" stroke-width="1.5"/>' +
            '<text x="90" y="155" text-anchor="middle" fill="#a78bfa" font-size="8" font-weight="600">Browser</text>' +
            '<text x="90" y="170" text-anchor="middle" fill="#555" font-size="5">Requests by hostname</text>' +
            '<text x="90" y="185" text-anchor="middle" fill="#a78bfa" font-size="5">Host: media.home.lab</text>' +

            '<!-- Arrow client to proxy -->' +
            '<line x1="150" y1="160" x2="230" y2="160" stroke="#a78bfa" stroke-width="2"/>' +
            '<polygon points="226,156 236,160 226,164" fill="#a78bfa"/>' +
            '<text x="190" y="150" text-anchor="middle" fill="#a78bfa" font-size="6">HTTPS :443</text>' +

            '<!-- Nginx Proxy -->' +
            '<g>' +
            '<rect x="230" y="50" width="200" height="250" rx="10" fill="#1e2736" stroke="#22c55e" stroke-width="2"/>' +
            '<rect x="230" y="50" width="200" height="24" rx="10" fill="rgba(34,197,94,0.15)"/>' +
            '<text x="330" y="67" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="700">NGINX PROXY</text>' +
            '<text x="330" y="88" text-anchor="middle" fill="#8b949e" font-size="6">TLS Termination + Routing</text>' +

            '<!-- Lock icon for TLS -->' +
            '<rect x="248" y="95" width="14" height="10" rx="2" fill="#22c55e" opacity="0.4"/>' +
            '<path d="M250,95 L250,91 A5,5 0 0,1 260,91 L260,95" fill="none" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="270" y="103" fill="#4ade80" font-size="6">TLS 1.3 &bull; Let\'s Encrypt</text>' +

            '<!-- Route rules -->' +
            '<rect x="245" y="115" width="170" height="22" rx="4" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.2)" stroke-width="0.5"/>' +
            '<text x="255" y="130" fill="#c4b5fd" font-size="6">media.home.lab</text>' +
            '<text x="405" y="130" text-anchor="end" fill="#8b949e" font-size="5">&#8594; :8096</text>' +

            '<rect x="245" y="142" width="170" height="22" rx="4" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="255" y="157" fill="#eab308" font-size="6">grafana.home.lab</text>' +
            '<text x="405" y="157" text-anchor="end" fill="#8b949e" font-size="5">&#8594; :3000</text>' +

            '<rect x="245" y="169" width="170" height="22" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="255" y="184" fill="#fca5a5" font-size="6">pihole.home.lab</text>' +
            '<text x="405" y="184" text-anchor="end" fill="#8b949e" font-size="5">&#8594; :80/admin</text>' +

            '<rect x="245" y="196" width="170" height="22" rx="4" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.2)" stroke-width="0.5"/>' +
            '<text x="255" y="211" fill="#22d3ee" font-size="6">monitor.home.lab</text>' +
            '<text x="405" y="211" text-anchor="end" fill="#8b949e" font-size="5">&#8594; :9090</text>' +

            '<!-- Features -->' +
            '<text x="330" y="240" text-anchor="middle" fill="#555" font-size="5">+ Rate limiting</text>' +
            '<text x="330" y="252" text-anchor="middle" fill="#555" font-size="5">+ Access logging</text>' +
            '<text x="330" y="264" text-anchor="middle" fill="#555" font-size="5">+ Caching headers</text>' +
            '<text x="330" y="276" text-anchor="middle" fill="#555" font-size="5">+ WebSocket support</text>' +
            '<text x="330" y="288" text-anchor="middle" fill="#555" font-size="5">+ Custom error pages</text>' +
            '</g>' +

            '<!-- Upstream Services -->' +
            '<line x1="430" y1="126" x2="490" y2="80" stroke="#c4b5fd" stroke-width="1.5"/>' +
            '<line x1="430" y1="153" x2="490" y2="155" stroke="#eab308" stroke-width="1.5"/>' +
            '<line x1="430" y1="180" x2="490" y2="225" stroke="#fca5a5" stroke-width="1.5"/>' +
            '<line x1="430" y1="207" x2="490" y2="295" stroke="#22d3ee" stroke-width="1.5"/>' +

            '<!-- Jellyfin -->' +
            '<rect x="490" y="55" width="140" height="50" rx="6" fill="#1e2736" stroke="#a78bfa" stroke-width="1"/>' +
            '<text x="560" y="77" text-anchor="middle" fill="#c4b5fd" font-size="7" font-weight="600">Jellyfin</text>' +
            '<text x="560" y="92" text-anchor="middle" fill="#555" font-size="5">localhost:8096</text>' +

            '<!-- Grafana -->' +
            '<rect x="490" y="130" width="140" height="50" rx="6" fill="#1e2736" stroke="#eab308" stroke-width="1"/>' +
            '<text x="560" y="152" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">Grafana</text>' +
            '<text x="560" y="167" text-anchor="middle" fill="#555" font-size="5">localhost:3000</text>' +

            '<!-- Pi-hole -->' +
            '<rect x="490" y="200" width="140" height="50" rx="6" fill="#1e2736" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="560" y="222" text-anchor="middle" fill="#fca5a5" font-size="7" font-weight="600">Pi-hole</text>' +
            '<text x="560" y="237" text-anchor="middle" fill="#555" font-size="5">localhost:80/admin</text>' +

            '<!-- Prometheus -->' +
            '<rect x="490" y="270" width="140" height="50" rx="6" fill="#1e2736" stroke="#06b6d4" stroke-width="1"/>' +
            '<text x="560" y="292" text-anchor="middle" fill="#22d3ee" font-size="7" font-weight="600">Prometheus</text>' +
            '<text x="560" y="307" text-anchor="middle" fill="#555" font-size="5">localhost:9090</text>' +

            '<!-- DNS note -->' +
            '<rect x="30" y="240" width="170" height="65" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
            '<text x="40" y="258" fill="#fca5a5" font-size="6" font-weight="600">LOCAL DNS (Pi-hole)</text>' +
            '<text x="40" y="272" fill="#8b949e" font-size="5">media.home.lab  &#8594; 192.168.1.100</text>' +
            '<text x="40" y="284" fill="#8b949e" font-size="5">grafana.home.lab &#8594; 192.168.1.100</text>' +
            '<text x="40" y="296" fill="#8b949e" font-size="5">All point to same IP, different Host</text>' +

            '<!-- Before/After comparison -->' +
            '<rect x="30" y="320" width="660" height="30" rx="6" fill="rgba(34,197,94,0.03)" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>' +
            '<text x="40" y="339" fill="#ef4444" font-size="6"><tspan text-decoration="line-through">Before: http://192.168.1.100:8096 http://192.168.1.100:3000 http://192.168.1.100:9090</tspan></text>' +
            '<text x="460" y="339" fill="#4ade80" font-size="6">After: https://media.home.lab https://grafana.home.lab</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install Nginx (if not already installed)',
                content: '<p>If you built the PXE server (SG-45), nginx is already installed but configured for port 8080. We will add reverse proxy server blocks alongside the existing config. If nginx is not installed:</p>',
                code: '# Install nginx\nsudo apt install nginx -y\n\n# Verify it runs\nsudo systemctl status nginx\ncurl -sI http://localhost | head -3\n\n# Remove the default site (we will add our own)\nsudo rm -f /etc/nginx/sites-enabled/default\n\n# Test config after any change\nsudo nginx -t',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Set Up Local DNS Records',
                content: '<p>Your browser needs to resolve <code>media.home.lab</code> to the Pi\'s IP. If you have Pi-hole (SG-44), add local DNS records. Otherwise, edit your computer\'s hosts file.</p>',
                code: '# === OPTION A: Pi-hole (recommended) ===\n# Pi-hole Admin > Local DNS > DNS Records\n# Add:\n#   media.home.lab    -> 192.168.1.100\n#   grafana.home.lab  -> 192.168.1.100\n#   pihole.home.lab   -> 192.168.1.100\n#   monitor.home.lab  -> 192.168.1.100\n\n# Or via CLI:\necho "192.168.1.100 media.home.lab" | sudo tee -a /etc/pihole/custom.list\necho "192.168.1.100 grafana.home.lab" | sudo tee -a /etc/pihole/custom.list\necho "192.168.1.100 pihole.home.lab" | sudo tee -a /etc/pihole/custom.list\necho "192.168.1.100 monitor.home.lab" | sudo tee -a /etc/pihole/custom.list\npihole restartdns\n\n# === OPTION B: Hosts file (per-device) ===\n# On macOS/Linux: sudo nano /etc/hosts\n# On Windows: notepad C:\\Windows\\System32\\drivers\\etc\\hosts\n# Add:\n# 192.168.1.100  media.home.lab grafana.home.lab pihole.home.lab monitor.home.lab\n\n# Verify DNS resolution\nping -c 1 media.home.lab\nping -c 1 grafana.home.lab',
                language: 'Bash',
                tip: '<strong>Why <code>.home.lab</code>?</strong> You should never use a real TLD (like <code>.com</code>) for local domains &mdash; it will conflict with public DNS. The <code>.lab</code>, <code>.local</code>, <code>.home</code>, and <code>.internal</code> suffixes are safe for private use. Google recently reserved <code>.internal</code> specifically for this purpose.'
            },
            {
                title: 'Create Reverse Proxy Server Blocks',
                content: '<p>Each service gets its own nginx server block (virtual host). The <code>server_name</code> directive matches the <code>Host</code> header, and <code>proxy_pass</code> forwards the request to the upstream service.</p>',
                code: '# Jellyfin reverse proxy\nsudo tee /etc/nginx/sites-available/media.home.lab << \'JELLYFIN_CONF\'\nserver {\n    listen 80;\n    server_name media.home.lab;\n\n    # Redirect HTTP to HTTPS (enable after TLS setup)\n    # return 301 https://$host$request_uri;\n\n    location / {\n        proxy_pass http://127.0.0.1:8096;\n\n        # Standard proxy headers\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n\n        # WebSocket support (Jellyfin uses it for real-time updates)\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection "upgrade";\n\n        # Buffering for large media files\n        proxy_buffering off;\n        proxy_request_buffering off;\n        client_max_body_size 0;\n    }\n}\nJELLYFIN_CONF\n\n# Grafana reverse proxy\nsudo tee /etc/nginx/sites-available/grafana.home.lab << \'GRAFANA_CONF\'\nserver {\n    listen 80;\n    server_name grafana.home.lab;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n\n        # WebSocket for live dashboard updates\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection "upgrade";\n    }\n}\nGRAFANA_CONF\n\n# Pi-hole reverse proxy\nsudo tee /etc/nginx/sites-available/pihole.home.lab << \'PIHOLE_CONF\'\nserver {\n    listen 80;\n    server_name pihole.home.lab;\n\n    location / {\n        proxy_pass http://127.0.0.1:8081;  # Pi-hole lighttpd\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}\nPIHOLE_CONF\n\n# Prometheus reverse proxy\nsudo tee /etc/nginx/sites-available/monitor.home.lab << \'PROM_CONF\'\nserver {\n    listen 80;\n    server_name monitor.home.lab;\n\n    location / {\n        proxy_pass http://127.0.0.1:9090;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}\nPROM_CONF\n\n# Enable all sites\nsudo ln -sf /etc/nginx/sites-available/media.home.lab /etc/nginx/sites-enabled/\nsudo ln -sf /etc/nginx/sites-available/grafana.home.lab /etc/nginx/sites-enabled/\nsudo ln -sf /etc/nginx/sites-available/pihole.home.lab /etc/nginx/sites-enabled/\nsudo ln -sf /etc/nginx/sites-available/monitor.home.lab /etc/nginx/sites-enabled/\n\n# Test and reload\nsudo nginx -t\nsudo systemctl reload nginx\n\n# Test each hostname\ncurl -sI http://media.home.lab | head -5\ncurl -sI http://grafana.home.lab | head -5',
                language: 'Bash',
                tip: '<strong>The proxy headers explained:</strong> <code>X-Real-IP</code> tells the backend the client\'s actual IP (not the proxy\'s). <code>X-Forwarded-For</code> builds a chain of proxy IPs. <code>X-Forwarded-Proto</code> tells the backend whether the client used HTTP or HTTPS. Without these headers, the backend sees all requests as coming from <code>127.0.0.1</code> over HTTP &mdash; which breaks logging, rate limiting, and redirect logic.'
            },
            {
                title: 'Add TLS with Self-Signed Certificates',
                content: '<p>For local lab use, generate self-signed certificates with <code>mkcert</code>. This creates a local Certificate Authority that your browser trusts &mdash; no "Not Secure" warnings, no certificate exceptions.</p>',
                code: '# Install mkcert\nsudo apt install libnss3-tools -y\nwget -q https://dl.filippo.io/mkcert/latest?for=linux/arm64 -O mkcert\nchmod +x mkcert\nsudo mv mkcert /usr/local/bin/\n\n# Create a local CA and install it\nmkcert -install\n# This creates a root CA in ~/.local/share/mkcert/\n# Copy the CA cert to your other devices to trust it:\nls ~/.local/share/mkcert/rootCA.pem\n\n# Generate certificates for all lab domains\nmkcert -cert-file /tmp/homelab.pem -key-file /tmp/homelab-key.pem \\\n  "*.home.lab" "home.lab" "localhost" "127.0.0.1"\n\n# Install certificates\nsudo mkdir -p /etc/nginx/ssl\nsudo cp /tmp/homelab.pem /etc/nginx/ssl/\nsudo cp /tmp/homelab-key.pem /etc/nginx/ssl/\nsudo chmod 600 /etc/nginx/ssl/homelab-key.pem\n\n# Update each server block to add HTTPS\n# Add this to each server block in /etc/nginx/sites-available/:\n#\n#   listen 443 ssl http2;\n#   ssl_certificate     /etc/nginx/ssl/homelab.pem;\n#   ssl_certificate_key /etc/nginx/ssl/homelab-key.pem;\n#   ssl_protocols TLSv1.2 TLSv1.3;\n#   ssl_ciphers HIGH:!aNULL:!MD5;\n#\n# And uncomment the HTTP->HTTPS redirect:\n#   return 301 https://$host$request_uri;\n\n# Reload\nsudo nginx -t\nsudo systemctl reload nginx\n\n# Test HTTPS\ncurl -sI https://media.home.lab | head -5\n# Should show: HTTP/2 200 (if mkcert CA is trusted)\n# Otherwise: curl -k https://media.home.lab (skip verify)',
                language: 'Bash',
                tip: '<strong>Trust the CA on other devices:</strong> Copy <code>~/.local/share/mkcert/rootCA.pem</code> to your laptop/phone and install it as a trusted CA. On macOS: double-click to add to Keychain, set to Always Trust. On Windows: install to Trusted Root CAs. On iOS: email it, install profile, enable full trust in Settings > General > About > Certificate Trust Settings.'
            },
            {
                title: 'Add Security Headers and Logging',
                content: '<p>Harden the reverse proxy with security headers that protect against common web attacks, and set up access logging so you can see who is accessing what.</p>',
                code: '# Create a shared security headers config\nsudo tee /etc/nginx/conf.d/security-headers.conf << \'SECEOF\'\n# ─── Security Headers ───\n# Applied to all proxied responses\n\n# Prevent MIME type sniffing\nadd_header X-Content-Type-Options "nosniff" always;\n\n# Prevent clickjacking\nadd_header X-Frame-Options "SAMEORIGIN" always;\n\n# XSS protection (legacy, but still useful)\nadd_header X-XSS-Protection "1; mode=block" always;\n\n# Referrer policy\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\n# Permissions policy\nadd_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;\n\n# HSTS (only enable if you have real TLS)\n# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\nSECEOF\n\n# Custom access log format with upstream info\nsudo tee /etc/nginx/conf.d/logging.conf << \'LOGEOF\'\nlog_format proxy_log \'$remote_addr - $remote_user [$time_local] \'\n                     \'"$request" $status $body_bytes_sent \'\n                     \'"$http_referer" "$http_user_agent" \'\n                     \'upstream: $upstream_addr response: ${upstream_response_time}s\';\n\naccess_log /var/log/nginx/proxy-access.log proxy_log;\nLOGEOF\n\n# Reload\nsudo nginx -t\nsudo systemctl reload nginx\n\n# Watch the access log\nsudo tail -f /var/log/nginx/proxy-access.log\n# Visit media.home.lab in your browser and see the log entry',
                language: 'Bash',
                tip: '<strong>Access logs are gold for security:</strong> The proxy access log shows every HTTP request hitting your lab. Unusual User-Agents, unexpected source IPs, brute force patterns (hundreds of 401s), and path traversal attempts all show up here. In a SOC, web proxy logs are one of the primary data sources for threat detection.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li><code>http://media.home.lab</code> loads Jellyfin (not <code>:8096</code>)</li>' +
                 '<li><code>http://grafana.home.lab</code> loads Grafana (not <code>:3000</code>)</li>' +
                 '<li><code>http://pihole.home.lab</code> loads Pi-hole admin (not <code>:80/admin</code>)</li>' +
                 '<li><code>http://monitor.home.lab</code> loads Prometheus (not <code>:9090</code>)</li>' +
                 '<li>HTTPS works: <code>https://media.home.lab</code> shows padlock (with mkcert CA trusted)</li>' +
                 '<li>Access logs record every request: <code>tail /var/log/nginx/proxy-access.log</code></li>' +
                 '<li>Security headers present: <code>curl -sI https://media.home.lab | grep -i x-frame</code></li>' +
                 '<li>WebSocket works: Jellyfin real-time updates function, Grafana live dashboards refresh</li>' +
                 '<li>Config survives reboot: <code>sudo reboot</code> &mdash; all sites accessible after restart</li>' +
                 '</ul>' +
                 '<p>All your lab services are now accessible through clean hostnames with TLS encryption, security headers, and centralized logging. This is the exact architecture used by every production web deployment &mdash; AWS ALB, Cloudflare, and Traefik all work on the same proxy_pass principle.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>nginx fails to start with "address already in use" error:</strong> Another service is already bound to port 80 or 443. Check what is using the port: <code>sudo ss -tlnp | grep :80</code>. Common culprit: Pi-hole\'s lighttpd is on port 80. Move lighttpd to port 8081 in <code>/etc/lighttpd/lighttpd.conf</code> (<code>server.port = 8081</code>) and restart it.</li>' +
                         '<li><strong>Browser shows "502 Bad Gateway":</strong> nginx cannot reach the upstream service. (1) Verify the upstream service is running: <code>curl http://localhost:8096</code> for Jellyfin, <code>curl http://localhost:3000</code> for Grafana, etc. (2) Check the proxy_pass URL in the server block matches the actual port. (3) Check nginx error log: <code>sudo tail /var/log/nginx/error.log</code>.</li>' +
                         '<li><strong>Domain names do not resolve (ERR_NAME_NOT_RESOLVED):</strong> DNS records for your <code>.home.lab</code> domains are not configured. Add them in Pi-hole (Local DNS &gt; DNS Records) or in your computer\'s <code>/etc/hosts</code> file. Verify: <code>nslookup media.home.lab</code> should return the Pi\'s IP.</li>' +
                         '<li><strong>HTTPS shows certificate warning ("Your connection is not private"):</strong> The mkcert CA certificate is not trusted on the client device. Copy <code>~/.local/share/mkcert/rootCA.pem</code> to the client and install it as a trusted root CA. On macOS: Keychain Access &gt; Always Trust. On Windows: certmgr &gt; Trusted Root CAs.</li>' +
                         '<li><strong>WebSocket connections fail (Jellyfin real-time updates, Grafana live dashboards):</strong> The proxy config is missing WebSocket headers. Ensure the server block includes: <code>proxy_http_version 1.1;</code>, <code>proxy_set_header Upgrade $http_upgrade;</code>, and <code>proxy_set_header Connection "upgrade";</code>.</li>' +
                         '<li><strong>Config test passes but changes not taking effect:</strong> You restarted nginx but did not enable the site. Verify a symlink exists in <code>/etc/nginx/sites-enabled/</code> pointing to your config in <code>/etc/nginx/sites-available/</code>. Use <code>sudo nginx -T</code> (capital T) to dump the full effective configuration.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Rate Limiting</strong> &mdash; Add nginx rate limiting to prevent brute force attacks on your services. Configure a rate zone: <code>limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;</code>. Apply it to sensitive endpoints. Test by sending rapid requests with <code>ab</code> or <code>curl</code> in a loop and confirm requests get 429 responses.</p>' +
                    '<p><strong>Challenge 2: Basic Auth Gateway</strong> &mdash; Add HTTP Basic Authentication to Prometheus (which has no built-in auth). Use <code>htpasswd</code> to create a credentials file and add <code>auth_basic</code> directives to the Prometheus server block. Verify that unauthenticated requests are rejected with 401.</p>' +
                    '<p><strong>Challenge 3: Centralized Error Pages</strong> &mdash; Create custom error pages (404, 502, 503) with consistent branding that nginx serves when an upstream service is down. Include diagnostic information like which service is unavailable and the expected port. Test by stopping a backend service and visiting its hostname.</p>',

        commonMistakes: [
            {
                title: 'Forgetting to pass proxy headers to the backend',
                correct: 'Always include <code>proxy_set_header Host $host;</code>, <code>proxy_set_header X-Real-IP $remote_addr;</code>, and <code>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;</code> in every proxy location.',
                incorrect: 'Using a bare <code>proxy_pass http://localhost:PORT;</code> without any proxy_set_header directives.',
                consequence: 'Without these headers, the backend sees all requests as coming from 127.0.0.1. Access logs are useless, rate limiting does not work, and applications that use the Host header for generating URLs (like Jellyfin redirect links) will break or point to localhost.',
            },
            {
                title: 'Editing the default site config instead of creating separate server blocks',
                correct: 'Create one file per virtual host in <code>/etc/nginx/sites-available/</code> and symlink to <code>sites-enabled/</code>. Remove the default site.',
                incorrect: 'Cramming all server blocks into the default config file or putting proxy rules in <code>nginx.conf</code> directly.',
                consequence: 'A single file with multiple server blocks is hard to maintain, easy to misconfigure, and impossible to selectively disable. With separate files, you can disable one service by removing its symlink without touching any other config.',
            },
            {
                title: 'Using IP addresses instead of localhost for proxy_pass',
                correct: 'Use <code>proxy_pass http://127.0.0.1:PORT;</code> or <code>http://localhost:PORT;</code> for services running on the same machine.',
                incorrect: 'Using <code>proxy_pass http://192.168.1.100:PORT;</code> (the Pi\'s LAN IP) for local services.',
                consequence: 'Using the LAN IP adds a network hop through the kernel\'s routing stack and the physical interface. It also breaks if the IP changes. More critically, if the upstream service is bound only to localhost (which is common for security), requests to the LAN IP will be refused.',
            }
        ]
    },

    // ========================================================================
    // SG-52: Automated Backup Station
    // ========================================================================
    'sg-52': {
        intro: '<p>Data loss is permanent. An SD card corruption, a bad <code>rm -rf</code>, a ransomware infection &mdash; without backups, everything is gone. This project builds an automated backup system that runs nightly on your Pi, backs up critical data to an external drive, keeps multiple generations, verifies backup integrity, and alerts you if anything fails.</p>' +
               '<p>The 3-2-1 backup rule states: keep <strong>3</strong> copies of your data, on <strong>2</strong> different types of media, with <strong>1</strong> copy offsite. This project handles the first two &mdash; local copies on the Pi\'s SD card and the external USB drive. For the offsite copy, you can rsync to a remote server or upload to encrypted cloud storage.</p>' +
               '<p>This is the final Home Lab Build project. It protects everything you have built in SG-43 through SG-51: your Pi-hole config, Grafana dashboards, Prometheus data, Jellyfin metadata, WireGuard keys, Samba shares, nginx configs, and Docker volumes. If any Pi fails, you can rebuild from backup in under an hour.</p>',

        wiring: '    Backup Architecture\n' +
                '    \n' +
                '    Source (Pi SD card)          Destination (USB Drive)\n' +
                '    /etc/                  ───>  /mnt/nas/backups/daily/\n' +
                '    /opt/jellyfin/config/  ───>    ├── 2026-03-24/\n' +
                '    /etc/prometheus/       ───>    ├── 2026-03-23/\n' +
                '    /etc/wireguard/        ───>    ├── 2026-03-22/\n' +
                '    /etc/nginx/            ───>    └── ... (7 days retained)\n' +
                '    /etc/pihole/           ───>  \n' +
                '    /var/lib/prometheus/   ───>  /mnt/nas/backups/weekly/\n' +
                '    /home/pi/             ───>    ├── week-12/\n' +
                '                                   └── week-11/ (4 weeks retained)\n' +
                '    \n' +
                '    Cron: daily at 3:00 AM  |  weekly full on Sunday\n' +
                '    Verify: SHA-256 manifest after each backup\n' +
                '    Alert: email/webhook on failure',

        wiringNotes: '<p><strong>rsync is the tool:</strong> rsync copies only changed files (incremental). A full daily backup of all configs takes seconds because only modified files are transferred. The first backup copies everything; subsequent backups copy only what changed since the last run.</p>' +
                     '<p><strong>Retention policy:</strong> Keep 7 daily backups and 4 weekly backups. This gives you fine-grained recovery for the past week and coarser recovery for the past month. Old backups are automatically pruned to prevent disk from filling up.</p>' +
                     '<p><strong>Backup what matters:</strong> Do NOT back up the entire SD card &mdash; that includes the OS, which you can reinstall. Back up configuration files, data, and secrets. A fresh Pi OS install plus your config backup = full recovery.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Create the Backup Script',
                content: '<p>Write a comprehensive backup script that handles daily incremental backups, weekly full backups, integrity verification, retention pruning, and error reporting. This is a production-grade script &mdash; the same quality you would deploy in an enterprise environment.</p>',
                code: '#!/bin/bash\n# === hexlab-backup.sh ===\n# Automated backup for Hexworth Lab Raspberry Pi\n# Run via cron: 0 3 * * * /home/pi/hexlab-backup.sh\n\nset -euo pipefail\n\n# ─── Configuration ───\nBACKUP_ROOT="/mnt/nas/backups"\nDAILY_DIR="$BACKUP_ROOT/daily"\nWEEKLY_DIR="$BACKUP_ROOT/weekly"\nLOG_FILE="/var/log/hexlab-backup.log"\nMANIFEST_FILE="$BACKUP_ROOT/latest-manifest.sha256"\nDAILY_RETENTION=7    # Keep 7 daily backups\nWEEKLY_RETENTION=4   # Keep 4 weekly backups\nDATE=$(date +%Y-%m-%d)\nDAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday\nSTART_TIME=$(date +%s)\n\n# ─── Directories to back up ───\nBACKUP_SOURCES=(\n    "/etc/nginx"\n    "/etc/pihole"\n    "/etc/prometheus"\n    "/etc/wireguard"\n    "/etc/samba"\n    "/etc/dnsmasq.conf"\n    "/opt/jellyfin/config"\n    "/var/lib/prometheus"\n    "/home/pi"\n    "/etc/fstab"\n    "/etc/hosts"\n    "/etc/crontab"\n)\n\n# ─── Logging ───\nlog() { echo "[$(date +%Y-%m-%d_%H:%M:%S)] $1" | tee -a "$LOG_FILE"; }\n\nlog "=== HEXLAB BACKUP STARTED ==="\nlog "Date: $DATE | Day: $DAY_OF_WEEK (7=Sunday)"\n\n# ─── Pre-flight checks ───\nif ! mountpoint -q /mnt/nas; then\n    log "ERROR: /mnt/nas is not mounted. Aborting."\n    exit 1\nfi\n\nAVAIL=$(df -BG /mnt/nas --output=avail | tail -1 | tr -d \" G\")\nif [ "$AVAIL" -lt 5 ]; then\n    log "ERROR: Less than 5 GB free on backup drive. Aborting."\n    exit 1\nfi\n\nmkdir -p "$DAILY_DIR" "$WEEKLY_DIR"\n\n# ─── Daily incremental backup ───\nTODAY_DIR="$DAILY_DIR/$DATE"\nmkdir -p "$TODAY_DIR"\n\nfor src in "${BACKUP_SOURCES[@]}"; do\n    if [ -e "$src" ]; then\n        dest="$TODAY_DIR$(dirname "$src")"\n        mkdir -p "$dest"\n        rsync -a --relative "$src" "$TODAY_DIR/" 2>>"$LOG_FILE"\n        log "  Backed up: $src"\n    else\n        log "  SKIP (not found): $src"\n    fi\ndone\n\n# ─── Generate integrity manifest ───\nfind "$TODAY_DIR" -type f -exec sha256sum {} \\; > "$TODAY_DIR/MANIFEST.sha256"\ncp "$TODAY_DIR/MANIFEST.sha256" "$MANIFEST_FILE"\nFILE_COUNT=$(wc -l < "$TODAY_DIR/MANIFEST.sha256")\nBACKUP_SIZE=$(du -sh "$TODAY_DIR" | cut -f1)\nlog "  Manifest: $FILE_COUNT files, total size: $BACKUP_SIZE"\n\n# ─── Weekly full backup (Sunday) ───\nif [ "$DAY_OF_WEEK" -eq 7 ]; then\n    WEEK_NUM=$(date +%V)\n    WEEK_DIR="$WEEKLY_DIR/week-$WEEK_NUM"\n    log "  Weekly backup: week-$WEEK_NUM"\n    rsync -a "$TODAY_DIR/" "$WEEK_DIR/"\n    log "  Weekly backup complete"\nfi\n\n# ─── Prune old backups ───\nlog "  Pruning old daily backups (keep $DAILY_RETENTION)..."\nls -dt "$DAILY_DIR"/????-??-?? 2>/dev/null | tail -n +$((DAILY_RETENTION + 1)) | while read old; do\n    log "    Removing: $(basename "$old")"\n    rm -rf "$old"\ndone\n\nlog "  Pruning old weekly backups (keep $WEEKLY_RETENTION)..."\nls -dt "$WEEKLY_DIR"/week-* 2>/dev/null | tail -n +$((WEEKLY_RETENTION + 1)) | while read old; do\n    log "    Removing: $(basename "$old")"\n    rm -rf "$old"\ndone\n\n# ─── Summary ───\nEND_TIME=$(date +%s)\nDURATION=$((END_TIME - START_TIME))\nlog "=== BACKUP COMPLETE in ${DURATION}s ==="\nlog "  Daily: $TODAY_DIR ($BACKUP_SIZE, $FILE_COUNT files)"\nlog "  Drive free: $(df -h /mnt/nas --output=avail | tail -1 | xargs)"\nlog ""',
                language: 'Bash',
                tip: '<strong><code>set -euo pipefail</code></strong> is critical for backup scripts. <code>-e</code> exits on any error (so a failed rsync does not silently continue). <code>-u</code> catches undefined variables (typos). <code>-o pipefail</code> catches errors in piped commands. Without these, a backup script can fail silently and you discover months later that your backups are empty.'
            },
            {
                title: 'Install and Schedule with Cron',
                content: '<p>Save the script, make it executable, test it manually, then schedule it to run automatically every night at 3:00 AM.</p>',
                code: '# Save the script\nsudo tee /usr/local/bin/hexlab-backup.sh << \'SCRIPTEOF\'\n# (paste the full script from Step 1 here)\nSCRIPTEOF\n\nsudo chmod +x /usr/local/bin/hexlab-backup.sh\n\n# Create the log file\nsudo touch /var/log/hexlab-backup.log\nsudo chown pi:pi /var/log/hexlab-backup.log\n\n# Test it manually first\nsudo /usr/local/bin/hexlab-backup.sh\n\n# Check the results\ncat /var/log/hexlab-backup.log\nls -la /mnt/nas/backups/daily/\ncat /mnt/nas/backups/daily/$(date +%Y-%m-%d)/MANIFEST.sha256 | head -10\n\n# Schedule with cron\n# Daily backup at 3:00 AM\n(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/hexlab-backup.sh") | crontab -\n\n# Verify cron entry\ncrontab -l\n\n# Monitor cron execution\n# Cron logs to syslog:\ngrep CRON /var/log/syslog | tail -5',
                language: 'Bash',
                tip: '<strong>Why 3:00 AM?</strong> Choose a time when the Pi is idle and no one is streaming media or running lab exercises. Backup I/O can slow down other services. 3:00 AM works for most people. Avoid midnight (many other cron jobs run at :00) and avoid times when the Pi might be powered off.'
            },
            {
                title: 'Verify Backup Integrity',
                content: '<p>A backup you cannot restore is not a backup. Write a verification script that checks the latest backup against its SHA-256 manifest and reports any corruption.</p>',
                code: '# Create verification script\nsudo tee /usr/local/bin/hexlab-verify-backup.sh << \'VERIFYEOF\'\n#!/bin/bash\n# Verify the latest backup integrity\n\nLATEST=$(ls -dt /mnt/nas/backups/daily/????-??-?? 2>/dev/null | head -1)\n\nif [ -z "$LATEST" ]; then\n    echo "ERROR: No backups found!"\n    exit 1\nfi\n\necho "Verifying: $LATEST"\necho ""\n\nif [ ! -f "$LATEST/MANIFEST.sha256" ]; then\n    echo "ERROR: No manifest file found!"\n    exit 1\nfi\n\n# Verify each file against its hash\ncd /\nFAILED=0\nTOTAL=0\nwhile IFS= read -r line; do\n    TOTAL=$((TOTAL + 1))\n    if ! echo "$line" | sha256sum --check --status 2>/dev/null; then\n        echo "  FAIL: $(echo "$line" | awk \'{print $2}\')"\n        FAILED=$((FAILED + 1))\n    fi\ndone < "$LATEST/MANIFEST.sha256"\n\necho ""\necho "=== Verification Complete ==="\necho "Total files: $TOTAL"\necho "Passed: $((TOTAL - FAILED))"\necho "Failed: $FAILED"\n\nif [ $FAILED -eq 0 ]; then\n    echo "Status: ALL FILES VERIFIED"\n    exit 0\nelse\n    echo "Status: CORRUPTION DETECTED!"\n    exit 1\nfi\nVERIFYEOF\n\nsudo chmod +x /usr/local/bin/hexlab-verify-backup.sh\n\n# Run it\nsudo /usr/local/bin/hexlab-verify-backup.sh\n\n# Schedule weekly verification (Saturday at 4 AM)\n(crontab -l 2>/dev/null; echo "0 4 * * 6 /usr/local/bin/hexlab-verify-backup.sh >> /var/log/hexlab-backup.log 2>&1") | crontab -',
                language: 'Bash',
                tip: '<strong>Bit rot is real.</strong> Storage media degrades over time. USB drives, SD cards, and hard drives all experience silent data corruption. The SHA-256 manifest detects this &mdash; if a single bit flips in any backed-up file, the hash will not match. Run verification weekly to catch corruption early, while you still have other good copies.'
            },
            {
                title: 'Restore from Backup',
                content: '<p>The most important test: can you actually restore? Practice a restore now, while everything is working, so you know the process cold when you need it under pressure.</p>',
                code: '# === FULL RESTORE PROCEDURE ===\n# Use this if a Pi\'s SD card fails and you need to rebuild\n\n# Step 1: Flash a new SD card with Pi OS (SG-43)\n# Step 2: SSH in and install required packages\n# Step 3: Mount the backup drive\n# Step 4: Restore configs\n\n# Find the latest backup\nLATEST=$(ls -dt /mnt/nas/backups/daily/????-??-?? | head -1)\necho "Restoring from: $LATEST"\n\n# Restore all config files\nsudo rsync -av "$LATEST/etc/" /etc/\nsudo rsync -av "$LATEST/opt/" /opt/\nsudo rsync -av "$LATEST/home/" /home/\n\n# Restore Prometheus data\nsudo rsync -av "$LATEST/var/lib/prometheus/" /var/lib/prometheus/\n\n# Reinstall services and restart them\nsudo apt install nginx samba wireguard -y\n# Docker + Jellyfin: follow SG-48 Docker install, then start with existing config\n# Pi-hole: curl -sSL https://install.pi-hole.net | bash, then import teleporter backup\n# Prometheus/Grafana: follow SG-49, configs already restored\n\n# Restart everything\nsudo systemctl restart nginx smbd wireguard pihole-FTL prometheus grafana-server\n\n# === PARTIAL RESTORE (single service) ===\n# Example: restore only nginx config\nsudo rsync -av "$LATEST/etc/nginx/" /etc/nginx/\nsudo nginx -t\nsudo systemctl reload nginx\n\n# Example: restore only WireGuard keys\nsudo rsync -av "$LATEST/etc/wireguard/" /etc/wireguard/\nsudo systemctl restart wg-quick@wg0\n\n# === RESTORE TEST (non-destructive) ===\n# Restore to a temp directory to verify without overwriting\nmkdir -p /tmp/restore-test\nrsync -av "$LATEST/etc/nginx/" /tmp/restore-test/nginx/\ndiff -r /etc/nginx/ /tmp/restore-test/nginx/\n# If diff shows no differences, your backup matches live config',
                language: 'Bash',
                tip: '<strong>Practice restores regularly.</strong> A backup you have never tested is a hope, not a strategy. Schedule a quarterly "disaster recovery drill" where you flash a fresh SD card, restore from backup, and verify all services come back. Document the exact restore procedure so you (or someone else) can follow it under stress.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Manual backup runs: <code>sudo /usr/local/bin/hexlab-backup.sh</code> completes successfully</li>' +
                 '<li>Backup directory exists: <code>ls /mnt/nas/backups/daily/$(date +%Y-%m-%d)/</code></li>' +
                 '<li>Manifest generated: <code>cat /mnt/nas/backups/daily/*/MANIFEST.sha256 | wc -l</code> shows file count</li>' +
                 '<li>Verification passes: <code>sudo /usr/local/bin/hexlab-verify-backup.sh</code> shows ALL FILES VERIFIED</li>' +
                 '<li>Cron scheduled: <code>crontab -l</code> shows 3:00 AM daily entry</li>' +
                 '<li>Retention works: after 8+ days, only 7 daily backups remain</li>' +
                 '<li>Restore test: restoring nginx config to <code>/tmp/</code> matches live config</li>' +
                 '<li>Log file records all activity: <code>cat /var/log/hexlab-backup.log</code></li>' +
                 '</ul>' +
                 '<p>Your lab infrastructure is now protected by automated daily backups with integrity verification and retention management. Combined with the NAS (SG-46), you have reliable local storage. For the offsite copy (the "1" in 3-2-1), consider rsyncing to a VPS, uploading encrypted archives to Backblaze B2, or using <code>restic</code> with cloud backends.</p>' +
                 '<p><strong>Congratulations.</strong> You have completed all 10 Home Lab Build projects. Your Raspberry Pi infrastructure includes: headless server, DNS ad blocker, PXE boot server, NAS file server, VPN gateway, media server, monitoring stack, compute cluster, reverse proxy, and automated backups. This is a complete home lab &mdash; built from scratch, on real hardware, with your own hands.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Backup script fails with "not mounted" error:</strong> The backup drive at <code>/mnt/nas</code> is not mounted. Check with <code>mountpoint -q /mnt/nas && echo mounted || echo NOT mounted</code>. If the USB drive disconnected, re-mount it: <code>sudo mount -a</code>. If this happens frequently, the drive may be failing or underpowered &mdash; use a powered USB hub.</li>' +
                         '<li><strong>rsync fails with "Permission denied" errors:</strong> The backup script must run as root (via <code>sudo</code>) to read system files like <code>/etc/wireguard/</code> and <code>/var/lib/prometheus/</code>. Ensure the cron entry uses <code>sudo</code> or is in root\'s crontab: <code>sudo crontab -e</code>.</li>' +
                         '<li><strong>Backup drive filling up despite retention settings:</strong> (1) Check that the retention pruning section of the script is actually executing &mdash; look for "Pruning" entries in the log. (2) Verify the <code>ls -dt</code> pattern matches your actual directory naming. (3) Run <code>du -sh /mnt/nas/backups/daily/*</code> to see which backups are largest. A Prometheus data directory can be several GB per backup.</li>' +
                         '<li><strong>SHA-256 verification fails on some files:</strong> (1) If the backup is recent, a file may have been modified during the backup (Prometheus writes continuously). Add <code>--delete</code> flag to rsync and run backup during low-activity hours. (2) If verification fails on old backups, this may indicate bit rot on the USB drive. Copy the backup to a different drive and replace the USB.</li>' +
                         '<li><strong>Cron job not running (no new backups appearing):</strong> Check <code>crontab -l</code> to verify the entry exists. Check syslog for cron activity: <code>grep CRON /var/log/syslog | tail -20</code>. Common issues: (1) The script path is wrong. (2) The script is not executable (<code>chmod +x</code>). (3) The cron daemon is not running: <code>sudo systemctl status cron</code>.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Offsite Backup</strong> &mdash; Implement the "1" in 3-2-1: upload encrypted backup archives to a cloud storage provider. Use <code>restic</code> or <code>rclone</code> with Backblaze B2 (10 GB free tier). Schedule the offsite sync to run after the local backup completes. Verify you can restore from the cloud copy alone.</p>' +
                    '<p><strong>Challenge 2: Backup Notification System</strong> &mdash; Add a webhook notification to the backup script that sends a success/failure report to a Discord or Slack channel. Include: timestamp, backup size, file count, verification status, and drive free space. Send a different color (green/red) based on success or failure.</p>' +
                    '<p><strong>Challenge 3: Disaster Recovery Drill</strong> &mdash; Flash a fresh SD card, boot a new Pi, and restore your entire lab infrastructure from backup alone. Time the process end-to-end. Document every step that required manual intervention vs automated restoration. Your goal: full recovery in under 60 minutes.</p>',

        commonMistakes: [
            {
                title: 'Backing up the entire SD card image instead of config files only',
                correct: 'Back up only configuration files, data directories, and secrets (/etc, /opt, /home, /var/lib). The OS can be reinstalled from scratch in minutes.',
                incorrect: 'Using <code>dd</code> to clone the entire 32 GB SD card to a disk image every night.',
                consequence: 'A full SD card image is 32 GB per backup. With 7-day retention, that is 224 GB just for daily backups. The backup takes 30+ minutes and hammers the SD card with sequential reads, accelerating wear. Config-only backups are a few MB and complete in seconds.',
            },
            {
                title: 'Not testing restores until a real disaster occurs',
                correct: 'Perform a restore drill quarterly. Flash a fresh SD card, restore from backup, and verify all services come back. Document the restore procedure step by step.',
                incorrect: 'Assuming backups work because the script runs without errors. Never actually testing a restore until the day the SD card dies.',
                consequence: 'Untested backups fail at the worst time. The backup may be missing critical files, permissions may not restore correctly, or service-specific restore steps (like Pi-hole Teleporter import) may be undocumented. You discover all this while under pressure with no working lab.',
            },
            {
                title: 'Running backup during peak usage hours',
                correct: 'Schedule backups during off-peak hours (3:00-5:00 AM) when no one is streaming media, running lab exercises, or actively using the network.',
                incorrect: 'Running the backup script during the day while other services are active.',
                consequence: 'rsync reads every file being backed up, competing with Jellyfin for disk I/O, Prometheus for CPU, and the network for bandwidth. Media streams buffer, Grafana dashboards lag, and the backup itself takes longer because of resource contention.',
            }
        ]
    }
};
