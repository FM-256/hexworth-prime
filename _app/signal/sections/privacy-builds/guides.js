/**
 * Privacy Builds — Build Guides (sg-16 through sg-20)
 *
 * Consumed by SignalEngine.renderProject() via window.SignalGuides[projectId].
 * All `code` fields are raw strings — the engine HTML-escapes them.
 * All `content`, `intro`, `testing`, `troubleshooting`, `challenges` are rendered as HTML.
 */

window.SignalGuides = window.SignalGuides || {};

// =============================================================================
// SG-16: Encrypted USB Dead Drop (Raspberry Pi Zero 2 W)
// =============================================================================
window.SignalGuides['sg-16'] = {
    intro: `
        <p>A dead drop is a method of espionage tradecraft — a secret location used to pass items between two people without requiring them to meet. In the digital world, we can build the same concept with a Raspberry Pi and an encrypted USB drive.</p>
        <p>This project sets up a Pi Zero 2 W as a covert file exchange station. Files stored on the attached USB drive are protected with LUKS full-disk encryption, so even if someone physically takes the drive, the contents are unreadable without the passphrase. On top of that, we build a minimal Flask web interface that lets users upload and download files — and optionally read self-destructing messages that delete themselves after being viewed once.</p>
        <p>This is a practical exercise in encryption at rest, secure key management, and the principle that physical access should not equal data access.</p>
    `,
    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

        '<defs>' +
        '<pattern id="sg16-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '<linearGradient id="sg16-pi-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
        '</defs>' +
        '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="680" height="380" fill="url(#sg16-grid)" rx="4"/>' +

        '<!-- Title -->' +
        '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">ENCRYPTED USB DEAD DROP — SYSTEM DIAGRAM</text>' +

        '<!-- Pi Zero 2 W -->' +
        '<g>' +
        '<rect x="40" y="60" width="200" height="120" rx="8" fill="url(#sg16-pi-grad)" stroke="#22c55e" stroke-width="1.5"/>' +
        '<rect x="40" y="60" width="200" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
        '<rect x="40" y="74" width="200" height="8" fill="rgba(34,197,94,0.12)"/>' +
        '<text x="140" y="76" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">PI ZERO 2 W</text>' +
        '<text x="140" y="100" text-anchor="middle" fill="#8b949e" font-size="8">Flask Web Server</text>' +
        '<text x="140" y="115" text-anchor="middle" fill="#8b949e" font-size="8">LUKS Key Manager</text>' +
        '<text x="140" y="130" text-anchor="middle" fill="#8b949e" font-size="8">Auto-mount Script</text>' +
        '<rect x="56" y="142" width="56" height="16" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
        '<text x="84" y="153" text-anchor="middle" fill="#4ade80" font-size="6">WiFi AP</text>' +
        '<rect x="124" y="142" width="56" height="16" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
        '<text x="152" y="153" text-anchor="middle" fill="#4ade80" font-size="6">SSH</text>' +
        '<rect x="192" y="142" width="40" height="16" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
        '<text x="212" y="153" text-anchor="middle" fill="#4ade80" font-size="6">:5000</text>' +
        '</g>' +

        '<!-- OTG Adapter -->' +
        '<rect x="270" y="95" width="70" height="35" rx="5" fill="#1a1f2b" stroke="#f59e0b" stroke-width="1"/>' +
        '<text x="305" y="110" text-anchor="middle" fill="#f59e0b" font-size="7" font-weight="600">OTG</text>' +
        '<text x="305" y="122" text-anchor="middle" fill="#fde68a" font-size="6" opacity="0.7">Adapter</text>' +

        '<!-- USB connection line Pi to OTG -->' +
        '<line x1="240" y1="112" x2="270" y2="112" stroke="#f59e0b" stroke-width="2"/>' +

        '<!-- Encrypted USB Drive -->' +
        '<g>' +
        '<rect x="370" y="55" width="200" height="130" rx="8" fill="url(#sg16-pi-grad)" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<rect x="370" y="55" width="200" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
        '<rect x="370" y="69" width="200" height="8" fill="rgba(59,130,246,0.12)"/>' +
        '<text x="470" y="71" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">USB DRIVE (LUKS2)</text>' +
        '<!-- USB connector -->' +
        '<rect x="346" y="98" width="28" height="28" rx="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
        '<rect x="352" y="104" width="5" height="16" rx="1" fill="#3b82f6" opacity="0.4"/>' +
        '<rect x="362" y="104" width="5" height="16" rx="1" fill="#3b82f6" opacity="0.4"/>' +
        '<!-- LUKS layers -->' +
        '<rect x="384" y="90" width="80" height="38" rx="3" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
        '<text x="424" y="105" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">LUKS Header</text>' +
        '<text x="424" y="118" text-anchor="middle" fill="#ef4444" font-size="5" opacity="0.7">AES-256-XTS</text>' +
        '<rect x="474" y="90" width="86" height="38" rx="3" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
        '<text x="517" y="105" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">Encrypted FS</text>' +
        '<text x="517" y="118" text-anchor="middle" fill="#a855f7" font-size="5" opacity="0.7">ext4 inside</text>' +
        '<!-- Directory structure -->' +
        '<rect x="384" y="135" width="80" height="36" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="424" y="149" text-anchor="middle" fill="#22c55e" font-size="6">/drops/</text>' +
        '<text x="424" y="162" text-anchor="middle" fill="#555" font-size="5">file exchange</text>' +
        '<rect x="474" y="135" width="86" height="36" rx="3" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
        '<text x="517" y="149" text-anchor="middle" fill="#eab308" font-size="6">/messages/</text>' +
        '<text x="517" y="162" text-anchor="middle" fill="#555" font-size="5">self-destruct</text>' +
        '</g>' +

        '<!-- USB connection line OTG to drive -->' +
        '<line x1="340" y1="112" x2="346" y2="112" stroke="#f59e0b" stroke-width="2"/>' +

        '<!-- Data flow arrows -->' +
        '<text x="350" y="210" text-anchor="middle" fill="#444" font-size="10" letter-spacing="0.15em">DATA FLOW</text>' +

        '<!-- Client device -->' +
        '<g>' +
        '<rect x="40" y="230" width="150" height="70" rx="8" fill="#1e2736" stroke="#06b6d4" stroke-width="1.5"/>' +
        '<rect x="40" y="230" width="150" height="20" rx="8" fill="rgba(6,182,212,0.1)"/>' +
        '<rect x="40" y="243" width="150" height="7" fill="rgba(6,182,212,0.1)"/>' +
        '<text x="115" y="245" text-anchor="middle" fill="#06b6d4" font-size="9" font-weight="600">CLIENT DEVICE</text>' +
        '<text x="115" y="268" text-anchor="middle" fill="#8b949e" font-size="7">Phone / Laptop</text>' +
        '<text x="115" y="282" text-anchor="middle" fill="#8b949e" font-size="7">Connects to Pi WiFi</text>' +
        '</g>' +

        '<!-- Arrow: client to Pi -->' +
        '<line x1="190" y1="265" x2="246" y2="265" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6"/>' +
        '<polygon points="246,261 254,265 246,269" fill="#06b6d4" opacity="0.6"/>' +

        '<!-- Flask server -->' +
        '<g>' +
        '<rect x="260" y="230" width="150" height="70" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
        '<rect x="260" y="230" width="150" height="20" rx="8" fill="rgba(34,197,94,0.1)"/>' +
        '<rect x="260" y="243" width="150" height="7" fill="rgba(34,197,94,0.1)"/>' +
        '<text x="335" y="245" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">FLASK :5000</text>' +
        '<text x="335" y="268" text-anchor="middle" fill="#8b949e" font-size="7">Upload / Download</text>' +
        '<text x="335" y="282" text-anchor="middle" fill="#8b949e" font-size="7">Burn-after-read msgs</text>' +
        '</g>' +

        '<!-- Arrow: Flask to vault -->' +
        '<line x1="410" y1="265" x2="466" y2="265" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6"/>' +
        '<polygon points="466,261 474,265 466,269" fill="#22c55e" opacity="0.6"/>' +

        '<!-- Encrypted vault -->' +
        '<g>' +
        '<rect x="480" y="230" width="170" height="70" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
        '<rect x="480" y="230" width="170" height="20" rx="8" fill="rgba(168,85,247,0.1)"/>' +
        '<rect x="480" y="243" width="170" height="7" fill="rgba(168,85,247,0.1)"/>' +
        '<text x="565" y="245" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="600">ENCRYPTED VAULT</text>' +
        '<text x="565" y="268" text-anchor="middle" fill="#8b949e" font-size="7">/mnt/vault</text>' +
        '<text x="565" y="282" text-anchor="middle" fill="#8b949e" font-size="7">LUKS2 + ext4</text>' +
        '</g>' +

        '<!-- What you need -->' +
        '<rect x="40" y="320" width="610" height="65" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="60" y="340" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">WHAT YOU NEED</text>' +
        '<g>' +
        '<rect x="55" y="350" width="110" height="28" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="110" y="368" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">Pi Zero 2 W</text>' +
        '</g>' +
        '<g>' +
        '<rect x="175" y="350" width="110" height="28" rx="5" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
        '<text x="230" y="368" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">USB Drive (8GB+)</text>' +
        '</g>' +
        '<g>' +
        '<rect x="295" y="350" width="110" height="28" rx="5" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
        '<text x="350" y="368" text-anchor="middle" fill="#f97316" font-size="7" font-weight="600">OTG Adapter</text>' +
        '</g>' +
        '<g>' +
        '<rect x="415" y="350" width="110" height="28" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
        '<text x="470" y="368" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">microSD Card</text>' +
        '</g>' +
        '<g>' +
        '<rect x="535" y="350" width="110" height="28" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
        '<text x="590" y="368" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">USB Power Supply</text>' +
        '</g>' +

        '</svg>' +
        '</div>',
    wiring: null,
    steps: [
        {
            title: 'Flash Raspberry Pi OS Lite',
            content: `
                <p>Use the <strong>Raspberry Pi Imager</strong> to flash <strong>Raspberry Pi OS Lite (64-bit)</strong> onto your microSD card. In the imager settings, enable SSH, set a username and password, and configure your WiFi credentials.</p>
                <p>Insert the SD card into the Pi Zero 2 W, power it on, and SSH in.</p>
            `,
            code: `# Find the Pi on your network
nmap -sn 192.168.1.0/24 | grep -i "raspberry"

# SSH in (replace with your IP)
ssh pi@192.168.1.XXX

# Update the system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y cryptsetup python3-pip python3-venv usbutils`,
            language: 'Bash',
            tip: 'If you configured a hostname in the imager (e.g. "deaddrop"), you can SSH to <code>deaddrop.local</code> instead of hunting for the IP.'
        },
        {
            title: 'Set Up LUKS Encryption on USB Drive',
            content: `
                <p>Plug in your USB flash drive via the OTG adapter. We will wipe it completely and create a LUKS-encrypted partition. <strong>This destroys all data on the drive.</strong></p>
                <p>LUKS (Linux Unified Key Setup) is the standard for Linux disk encryption. It stores a header on the drive with key slots, and the actual data is encrypted with AES-256.</p>
            `,
            code: `# Identify the USB drive (usually /dev/sda)
lsblk

# Wipe and create a new partition table
sudo wipefs -a /dev/sda
sudo parted /dev/sda mklabel gpt
sudo parted /dev/sda mkpart primary 0% 100%

# Format with LUKS encryption (you will set a passphrase)
sudo cryptsetup luksFormat --type luks2 --cipher aes-xts-plain64 \\
    --key-size 512 --hash sha512 --iter-time 5000 /dev/sda1

# Open the encrypted volume
sudo cryptsetup open /dev/sda1 deadrop_vault

# Create a filesystem inside the encrypted container
sudo mkfs.ext4 -L VAULT /dev/mapper/deadrop_vault

# Mount it
sudo mkdir -p /mnt/vault
sudo mount /dev/mapper/deadrop_vault /mnt/vault
sudo chown pi:pi /mnt/vault

# Create directory structure
mkdir -p /mnt/vault/drops /mnt/vault/messages`,
            language: 'Bash',
            tip: 'Choose a strong passphrase. LUKS supports up to 8 key slots, so you can add a backup passphrase later with <code>cryptsetup luksAddKey</code>.'
        },
        {
            title: 'Create the Auto-Mount Script',
            content: `
                <p>We need a script that automatically unlocks and mounts the encrypted volume when the Pi boots. For security, we will store the keyfile on the Pi's SD card (which is itself physically secured inside the device).</p>
                <p>This is a tradeoff: automatic unlock is convenient but means physical access to the Pi grants access to the vault. In a higher-security scenario, you would require manual passphrase entry on each boot.</p>
            `,
            code: `# Generate a random keyfile
sudo dd if=/dev/urandom of=/root/.vault-key bs=4096 count=1
sudo chmod 400 /root/.vault-key

# Add the keyfile as a second LUKS key slot
sudo cryptsetup luksAddKey /dev/sda1 /root/.vault-key

# Create the mount script
sudo tee /usr/local/bin/mount-vault.sh << 'SCRIPT'
#!/bin/bash
DEVICE="/dev/sda1"
MAPPER="deadrop_vault"
MOUNT="/mnt/vault"
KEYFILE="/root/.vault-key"

if [ ! -b "$DEVICE" ]; then
    echo "[vault] No USB device found at $DEVICE"
    exit 1
fi

if [ -e "/dev/mapper/$MAPPER" ]; then
    echo "[vault] Already unlocked"
else
    cryptsetup open "$DEVICE" "$MAPPER" --key-file "$KEYFILE"
    if [ $? -ne 0 ]; then
        echo "[vault] Failed to unlock"
        exit 1
    fi
fi

if ! mountpoint -q "$MOUNT"; then
    mount /dev/mapper/$MAPPER $MOUNT
    chown pi:pi $MOUNT
    echo "[vault] Mounted at $MOUNT"
fi
SCRIPT
sudo chmod +x /usr/local/bin/mount-vault.sh

# Add to crontab for boot
(sudo crontab -l 2>/dev/null; echo "@reboot /usr/local/bin/mount-vault.sh") | sudo crontab -`,
            language: 'Bash'
        },
        {
            title: 'Build the Dead Drop Flask App',
            content: `
                <p>Now we build the web interface. This is a minimal Flask application that provides file upload/download and self-destructing messages. It binds only to the local network — anyone on the same WiFi can access the dead drop by navigating to the Pi's IP address.</p>
            `,
            code: `# Set up Python virtual environment
cd /home/pi
python3 -m venv deaddrop-env
source deaddrop-env/bin/activate
pip install flask

# Create the application
mkdir -p /home/pi/deaddrop
cat << 'PYEOF' > /home/pi/deaddrop/app.py
import os
import uuid
import json
import time
from datetime import datetime
from flask import Flask, request, redirect, url_for, send_from_directory, render_template_string

app = Flask(__name__)
VAULT = '/mnt/vault'
DROPS = os.path.join(VAULT, 'drops')
MSGS = os.path.join(VAULT, 'messages')

HTML = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dead Drop</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: monospace; background: #0a0a0f; color: #c0c0c0; padding: 20px; }
        h1 { color: #a78bfa; margin-bottom: 10px; }
        h2 { color: #7c3aed; margin: 20px 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
        a { color: #a78bfa; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px; margin: 10px 0; }
        input[type=file], textarea { background: #111; color: #ccc; border: 1px solid #333; padding: 8px; border-radius: 4px; width: 100%; margin: 6px 0; font-family: monospace; }
        textarea { min-height: 80px; resize: vertical; }
        button { background: rgba(167,139,250,0.15); color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-family: monospace; font-weight: bold; }
        button:hover { background: rgba(167,139,250,0.25); }
        .file-list a { display: block; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .meta { font-size: 11px; color: #666; }
        .msg-link { display: block; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .warn { color: #f87171; font-size: 12px; margin-top: 4px; }
    </style>
</head>
<body>
    <h1>// DEAD DROP</h1>
    <p class="meta">Encrypted vault &mdash; files at rest protected by LUKS</p>

    <h2>Drop a File</h2>
    <div class="card">
        <form method="POST" action="/upload" enctype="multipart/form-data">
            <input type="file" name="file" required>
            <button type="submit">Upload to Vault</button>
        </form>
    </div>

    <h2>Files in Vault</h2>
    <div class="card file-list">
        {% for f in files %}
            <a href="/download/{{ f }}">{{ f }}</a>
        {% endfor %}
        {% if not files %}<span class="meta">No files in vault</span>{% endif %}
    </div>

    <h2>Self-Destructing Message</h2>
    <div class="card">
        <form method="POST" action="/msg/create">
            <textarea name="content" placeholder="Type your message..." required></textarea>
            <button type="submit">Create Burn Message</button>
        </form>
        <p class="warn">Message is deleted permanently after first read.</p>
    </div>

    <h2>Active Messages</h2>
    <div class="card">
        {% for mid in messages %}
            <a class="msg-link" href="/msg/{{ mid }}">{{ mid[:8] }}...</a>
        {% endfor %}
        {% if not messages %}<span class="meta">No pending messages</span>{% endif %}
    </div>
</body>
</html>
"""

MSG_VIEW = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Burn Message</title>
    <style>
        body { font-family: monospace; background: #0a0a0f; color: #c0c0c0; padding: 20px; }
        h1 { color: #f87171; margin-bottom: 10px; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(248,113,113,0.2); border-radius: 8px; padding: 20px; margin: 10px 0; white-space: pre-wrap; }
        a { color: #a78bfa; }
        .warn { color: #f87171; font-size: 12px; }
    </style>
</head>
<body>
    <h1>// BURN MESSAGE</h1>
    <p class="warn">This message has been destroyed. It cannot be viewed again.</p>
    <div class="card">{{ content }}</div>
    <p style="margin-top:16px"><a href="/">&larr; Back to Dead Drop</a></p>
</body>
</html>
"""

@app.route('/')
def index():
    files = sorted(os.listdir(DROPS)) if os.path.isdir(DROPS) else []
    messages = sorted(os.listdir(MSGS)) if os.path.isdir(MSGS) else []
    return render_template_string(HTML, files=files, messages=messages)

@app.route('/upload', methods=['POST'])
def upload():
    f = request.files.get('file')
    if f and f.filename:
        safe_name = f.filename.replace('/', '_').replace('\\\\', '_')
        f.save(os.path.join(DROPS, safe_name))
    return redirect('/')

@app.route('/download/<path:filename>')
def download(filename):
    return send_from_directory(DROPS, filename, as_attachment=True)

@app.route('/msg/create', methods=['POST'])
def msg_create():
    content = request.form.get('content', '').strip()
    if content:
        mid = str(uuid.uuid4())
        with open(os.path.join(MSGS, mid), 'w') as fh:
            json.dump({'content': content, 'created': time.time()}, fh)
    return redirect('/')

@app.route('/msg/<mid>')
def msg_read(mid):
    path = os.path.join(MSGS, mid)
    if not os.path.exists(path):
        return 'Message not found or already destroyed.', 404
    with open(path) as fh:
        data = json.load(fh)
    # Destroy after read
    os.remove(path)
    return render_template_string(MSG_VIEW, content=data['content'])

if __name__ == '__main__':
    os.makedirs(DROPS, exist_ok=True)
    os.makedirs(MSGS, exist_ok=True)
    app.run(host='0.0.0.0', port=8080, debug=False)
PYEOF`,
            language: 'Python / Bash'
        },
        {
            title: 'Create a Systemd Service',
            content: `
                <p>We want the dead drop web interface to start automatically on boot, after the vault is mounted. A systemd service handles this cleanly.</p>
            `,
            code: `sudo tee /etc/systemd/system/deaddrop.service << 'EOF'
[Unit]
Description=Dead Drop Web Interface
After=network.target
Wants=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/deaddrop
ExecStartPre=/usr/local/bin/mount-vault.sh
ExecStart=/home/pi/deaddrop-env/bin/python app.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable deaddrop.service
sudo systemctl start deaddrop.service

# Check status
sudo systemctl status deaddrop.service`,
            language: 'Bash'
        },
        {
            title: 'Harden the Pi',
            content: `
                <p>A dead drop is only useful if it is not trivially compromised. We lock down SSH, enable a firewall, and disable unnecessary services.</p>
            `,
            code: `# Disable password authentication for SSH (use keys only)
sudo tee -a /etc/ssh/sshd_config.d/hardened.conf << 'EOF'
PasswordAuthentication no
PermitRootLogin no
MaxAuthTries 3
EOF
sudo systemctl restart sshd

# Set up UFW firewall
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8080/tcp  # Dead drop web UI
sudo ufw enable

# Disable Bluetooth (not needed)
sudo systemctl disable bluetooth
sudo systemctl stop bluetooth

# Disable avahi (mDNS broadcast — reduces fingerprint)
sudo systemctl disable avahi-daemon
sudo systemctl stop avahi-daemon`,
            language: 'Bash',
            tip: 'Before disabling password auth, make sure you have copied your SSH public key to the Pi with <code>ssh-copy-id pi@deaddrop.local</code>.'
        },
        {
            title: 'Unmount and Lock Script',
            content: `
                <p>Create a clean shutdown script that properly unmounts and locks the encrypted volume. Run this before unplugging the USB drive or shutting down the Pi.</p>
            `,
            code: `sudo tee /usr/local/bin/lock-vault.sh << 'SCRIPT'
#!/bin/bash
echo "[vault] Stopping dead drop service..."
systemctl stop deaddrop.service

echo "[vault] Unmounting..."
umount /mnt/vault 2>/dev/null

echo "[vault] Locking LUKS volume..."
cryptsetup close deadrop_vault

echo "[vault] Vault locked."
SCRIPT
sudo chmod +x /usr/local/bin/lock-vault.sh

# Run it before pulling the USB
sudo /usr/local/bin/lock-vault.sh`,
            language: 'Bash'
        }
    ],
    testing: `
        <p>Verify each layer of the dead drop independently:</p>
        <ul>
            <li><strong>LUKS encryption</strong> — Run <code>sudo cryptsetup luksDump /dev/sda1</code> and confirm you see the LUKS2 header with your key slots. Try <code>sudo cryptsetup close deadrop_vault</code> then reopen with the passphrase to verify.</li>
            <li><strong>Auto-mount</strong> — Reboot the Pi with <code>sudo reboot</code>. After it comes back, SSH in and run <code>mount | grep vault</code> to confirm the volume mounted automatically.</li>
            <li><strong>Web interface</strong> — Open <code>http://&lt;pi-ip&gt;:8080</code> in a browser. Upload a test file, download it, verify contents match. Create a self-destructing message, open the link, confirm the message displays, refresh the page — it should return 404.</li>
            <li><strong>Physical test</strong> — Unplug the USB drive, plug it into another machine. Run <code>lsblk</code> and <code>file -s /dev/sda1</code> — it should show as a LUKS encrypted volume, completely unreadable without the passphrase.</li>
            <li><strong>Firewall</strong> — From another machine, try <code>nmap -p 1-65535 &lt;pi-ip&gt;</code>. Only ports 22 and 8080 should be open.</li>
        </ul>
    `,
    troubleshooting: `
        <ul>
            <li><strong>cryptsetup: command not found</strong> — Run <code>sudo apt install cryptsetup</code>. It is not installed by default on Pi OS Lite.</li>
            <li><strong>USB drive not detected</strong> — The Pi Zero 2 W has a single micro-USB OTG port. Make sure you are using a proper OTG adapter. Run <code>lsusb</code> to check if the drive is recognized at all.</li>
            <li><strong>LUKS open fails with "No key available"</strong> — You are using the wrong passphrase. If you added a keyfile, make sure it is at the exact path referenced in the mount script. You can test manually: <code>sudo cryptsetup open /dev/sda1 test --key-file /root/.vault-key</code>.</li>
            <li><strong>Flask app not starting</strong> — Check the service logs: <code>journalctl -u deaddrop.service -f</code>. Common issues: the venv path is wrong, the vault is not mounted yet, or port 8080 is already in use.</li>
            <li><strong>Cannot access web UI from another machine</strong> — Verify UFW allows port 8080: <code>sudo ufw status</code>. Make sure Flask is binding to <code>0.0.0.0</code>, not <code>127.0.0.1</code>.</li>
            <li><strong>Self-destructing messages persist</strong> — Check file permissions on <code>/mnt/vault/messages/</code>. The Flask app runs as user <code>pi</code> and needs write access to delete message files.</li>
        </ul>
    `,
    challenges: `
        <ul>
            <li><strong>Add expiring drops</strong> — Modify the Flask app to attach a TTL (time-to-live) to uploaded files. Write a cron job that deletes files older than their TTL. Display a countdown timer on the web UI.</li>
            <li><strong>Two-factor dead drop</strong> — Require a one-time password to access the drop. Generate TOTP codes using <code>pyotp</code> and display a QR code for the recipient to scan into their authenticator app.</li>
            <li><strong>Steganographic mode</strong> — Instead of storing files directly, embed them inside innocent-looking images using LSB steganography. The vault looks like a folder of vacation photos, but each image contains a hidden payload.</li>
        </ul>
    `
};

// =============================================================================
// SG-17: Faraday Pouch & RF Shielding Test (ESP32 DevKit)
// =============================================================================
window.SignalGuides['sg-17'] = {
    intro: `
        <p>A Faraday cage blocks electromagnetic fields by distributing charge across a conductive enclosure. This is the same principle that protects you inside a car during a lightning strike, and the same principle that Faraday bags use to prevent wireless tracking of phones, key fobs, and RFID cards.</p>
        <p>But how well do they actually work? In this project, you will use an ESP32 to quantitatively measure WiFi and Bluetooth signal attenuation through different shielding materials. Instead of trusting marketing claims, you will generate real numbers: baseline RSSI outside the bag vs. attenuated RSSI inside, measured in decibels.</p>
        <p>This is a practical exercise in RF fundamentals, signal measurement, and healthy skepticism about security products.</p>
    `,
    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

        '<defs>' +
        '<pattern id="sg17-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '<linearGradient id="sg17-comp" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
        '</defs>' +
        '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="680" height="380" fill="url(#sg17-grid)" rx="4"/>' +

        '<!-- Title -->' +
        '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">FARADAY POUCH &amp; RF SHIELDING TEST — SETUP DIAGRAM</text>' +

        '<!-- ESP32 Board -->' +
        '<g>' +
        '<rect x="40" y="55" width="180" height="140" rx="8" fill="url(#sg17-comp)" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<rect x="40" y="55" width="180" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
        '<rect x="40" y="69" width="180" height="8" fill="rgba(59,130,246,0.12)"/>' +
        '<text x="130" y="71" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ESP32 DEVKIT V1</text>' +
        '<!-- Antenna icon -->' +
        '<rect x="60" y="90" width="60" height="30" rx="3" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.25)" stroke-width="0.5"/>' +
        '<text x="90" y="100" text-anchor="middle" fill="#06b6d4" font-size="6" font-weight="600">WiFi 2.4GHz</text>' +
        '<text x="90" y="112" text-anchor="middle" fill="#06b6d4" font-size="5" opacity="0.7">Built-in Antenna</text>' +
        '<rect x="130" y="90" width="60" height="30" rx="3" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.25)" stroke-width="0.5"/>' +
        '<text x="160" y="100" text-anchor="middle" fill="#a855f7" font-size="6" font-weight="600">BLE</text>' +
        '<text x="160" y="112" text-anchor="middle" fill="#a855f7" font-size="5" opacity="0.7">Bluetooth LE</text>' +
        '<!-- USB port -->' +
        '<rect x="85" y="135" width="90" height="22" rx="3" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
        '<text x="130" y="150" text-anchor="middle" fill="#f97316" font-size="7" font-weight="600">USB (Power + Serial)</text>' +
        '<text x="130" y="175" text-anchor="middle" fill="#8b949e" font-size="7">No external components</text>' +
        '<text x="130" y="186" text-anchor="middle" fill="#8b949e" font-size="7">needed for this build</text>' +
        '</g>' +

        '<!-- USB cable to laptop -->' +
        '<line x1="130" y1="195" x2="130" y2="230" stroke="#f97316" stroke-width="2"/>' +
        '<rect x="60" y="230" width="140" height="40" rx="6" fill="#1e2736" stroke="#f97316" stroke-width="1"/>' +
        '<text x="130" y="250" text-anchor="middle" fill="#f97316" font-size="8" font-weight="600">LAPTOP (Serial Monitor)</text>' +
        '<text x="130" y="262" text-anchor="middle" fill="#555" font-size="6">Arduino IDE / PlatformIO</text>' +

        '<!-- RF waves from ESP32 -->' +
        '<path d="M220,100 Q240,95 250,100" stroke="#06b6d4" stroke-width="1" fill="none" opacity="0.4"/>' +
        '<path d="M220,100 Q245,90 260,100" stroke="#06b6d4" stroke-width="1" fill="none" opacity="0.3"/>' +
        '<path d="M220,100 Q250,85 270,100" stroke="#06b6d4" stroke-width="1" fill="none" opacity="0.2"/>' +

        '<!-- Test Setup Area -->' +
        '<text x="460" y="55" text-anchor="middle" fill="#444" font-size="10" letter-spacing="0.15em">SHIELDING MATERIALS TO TEST</text>' +

        '<!-- Material 1: Aluminum Foil -->' +
        '<g>' +
        '<rect x="310" y="70" width="130" height="50" rx="6" fill="#1e2736" stroke="#94a3b8" stroke-width="1.5"/>' +
        '<rect x="310" y="70" width="130" height="18" rx="6" fill="rgba(148,163,184,0.1)"/>' +
        '<rect x="310" y="82" width="130" height="6" fill="rgba(148,163,184,0.1)"/>' +
        '<text x="375" y="84" text-anchor="middle" fill="#94a3b8" font-size="8" font-weight="600">ALUMINUM FOIL</text>' +
        '<text x="375" y="103" text-anchor="middle" fill="#8b949e" font-size="7">1x &amp; 2x layers</text>' +
        '<text x="375" y="114" text-anchor="middle" fill="#555" font-size="6">~20-40 dB atten.</text>' +
        '</g>' +

        '<!-- Material 2: Anti-static Bag -->' +
        '<g>' +
        '<rect x="460" y="70" width="130" height="50" rx="6" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
        '<rect x="460" y="70" width="130" height="18" rx="6" fill="rgba(234,179,8,0.1)"/>' +
        '<rect x="460" y="82" width="130" height="6" fill="rgba(234,179,8,0.1)"/>' +
        '<text x="525" y="84" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">ANTI-STATIC BAG</text>' +
        '<text x="525" y="103" text-anchor="middle" fill="#8b949e" font-size="7">ESD shielding bag</text>' +
        '<text x="525" y="114" text-anchor="middle" fill="#555" font-size="6">~5-15 dB atten.</text>' +
        '</g>' +

        '<!-- Material 3: Faraday Pouch -->' +
        '<g>' +
        '<rect x="310" y="135" width="130" height="50" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
        '<rect x="310" y="135" width="130" height="18" rx="6" fill="rgba(34,197,94,0.1)"/>' +
        '<rect x="310" y="147" width="130" height="6" fill="rgba(34,197,94,0.1)"/>' +
        '<text x="375" y="149" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">FARADAY POUCH</text>' +
        '<text x="375" y="168" text-anchor="middle" fill="#8b949e" font-size="7">Commercial bag</text>' +
        '<text x="375" y="179" text-anchor="middle" fill="#555" font-size="6">~40-80 dB atten.</text>' +
        '</g>' +

        '<!-- Material 4: Open Air Baseline -->' +
        '<g>' +
        '<rect x="460" y="135" width="130" height="50" rx="6" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
        '<rect x="460" y="135" width="130" height="18" rx="6" fill="rgba(239,68,68,0.1)"/>' +
        '<rect x="460" y="147" width="130" height="6" fill="rgba(239,68,68,0.1)"/>' +
        '<text x="525" y="149" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">OPEN AIR (BASELINE)</text>' +
        '<text x="525" y="168" text-anchor="middle" fill="#8b949e" font-size="7">No shielding</text>' +
        '<text x="525" y="179" text-anchor="middle" fill="#555" font-size="6">0 dB reference</text>' +
        '</g>' +

        '<!-- RSSI Measurement Scale -->' +
        '<rect x="310" y="210" width="280" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="330" y="228" fill="#555" font-size="8" font-weight="600">RSSI SCALE (dBm)</text>' +
        '<!-- Scale bar -->' +
        '<rect x="330" y="238" width="240" height="8" rx="2" fill="none"/>' +
        '<rect x="330" y="238" width="60" height="8" rx="2" fill="rgba(34,197,94,0.4)"/>' +
        '<rect x="390" y="238" width="60" height="8" fill="rgba(234,179,8,0.4)"/>' +
        '<rect x="450" y="238" width="60" height="8" fill="rgba(249,115,22,0.4)"/>' +
        '<rect x="510" y="238" width="60" height="8" rx="2" fill="rgba(239,68,68,0.4)"/>' +
        '<text x="360" y="258" text-anchor="middle" fill="#4ade80" font-size="6">-30 Excellent</text>' +
        '<text x="420" y="258" text-anchor="middle" fill="#eab308" font-size="6">-50 Good</text>' +
        '<text x="480" y="258" text-anchor="middle" fill="#f97316" font-size="6">-70 Fair</text>' +
        '<text x="540" y="258" text-anchor="middle" fill="#ef4444" font-size="6">-90 Weak</text>' +

        '<!-- What you need -->' +
        '<rect x="40" y="300" width="610" height="85" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="60" y="320" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">WHAT YOU NEED</text>' +
        '<g>' +
        '<rect x="55" y="330" width="100" height="40" rx="5" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
        '<text x="105" y="347" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">ESP32 DevKit</text>' +
        '<text x="105" y="360" text-anchor="middle" fill="#555" font-size="5">Any variant</text>' +
        '</g>' +
        '<g>' +
        '<rect x="165" y="330" width="100" height="40" rx="5" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
        '<text x="215" y="347" text-anchor="middle" fill="#f97316" font-size="7" font-weight="600">USB Cable</text>' +
        '<text x="215" y="360" text-anchor="middle" fill="#555" font-size="5">Micro USB</text>' +
        '</g>' +
        '<g>' +
        '<rect x="275" y="330" width="100" height="40" rx="5" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.2)" stroke-width="0.5"/>' +
        '<text x="325" y="347" text-anchor="middle" fill="#94a3b8" font-size="7" font-weight="600">Aluminum Foil</text>' +
        '<text x="325" y="360" text-anchor="middle" fill="#555" font-size="5">Kitchen variety</text>' +
        '</g>' +
        '<g>' +
        '<rect x="385" y="330" width="100" height="40" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
        '<text x="435" y="347" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">Anti-Static Bag</text>' +
        '<text x="435" y="360" text-anchor="middle" fill="#555" font-size="5">ESD bag</text>' +
        '</g>' +
        '<g>' +
        '<rect x="495" y="330" width="120" height="40" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="555" y="347" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">Faraday Pouch</text>' +
        '<text x="555" y="360" text-anchor="middle" fill="#555" font-size="5">Commercial RF bag</text>' +
        '</g>' +

        '</svg>' +
        '</div>',
    wiring: `
  ESP32 DevKit V1
  +------------------+
  |  USB to computer |
  |  (power + serial)|
  |                  |
  |  [No external    |
  |   components     |
  |   needed]        |
  |                  |
  |  Built-in WiFi   |
  |  Built-in BLE    |
  +------------------+`,
    wiringNotes: '<p>No external wiring required. The ESP32 uses its built-in WiFi and Bluetooth radios for all measurements. Power and serial output come through the USB connection.</p>',
    steps: [
        {
            title: 'Understand RF Shielding Principles',
            content: `
                <p>Before we write code, understand what we are measuring. Signal strength is reported as <strong>RSSI</strong> (Received Signal Strength Indicator) in dBm — a logarithmic scale where:</p>
                <ul>
                    <li><strong>-30 dBm</strong> = excellent (very close to access point)</li>
                    <li><strong>-50 dBm</strong> = good</li>
                    <li><strong>-70 dBm</strong> = fair</li>
                    <li><strong>-90 dBm</strong> = weak (near minimum detectable)</li>
                </ul>
                <p><strong>Attenuation</strong> is the difference: if baseline is -45 dBm and shielded is -85 dBm, the material attenuates by 40 dB. A good Faraday bag should attenuate WiFi (2.4 GHz) by at least 40-60 dB.</p>
                <p>We will test: aluminum foil (single layer, double layer), anti-static bags, a commercial Faraday pouch, and the empty room as baseline.</p>
            `
        },
        {
            title: 'WiFi RSSI Scanner',
            content: `
                <p>This sketch scans for WiFi networks and reports the RSSI of a specific target network. We run multiple scan cycles and average the results to reduce noise.</p>
                <p>Set your <strong>TARGET_SSID</strong> to the WiFi network you are testing against. Place the phone inside the Faraday bag while the ESP32 stays outside, scanning for the phone's hotspot — or use a fixed access point and move the ESP32 into the bag.</p>
            `,
            code: `#include <WiFi.h>

#define TARGET_SSID "YourTestNetwork"
#define SCAN_CYCLES 5
#define SCAN_DELAY  3000

void setup() {
    Serial.begin(115200);
    delay(1000);
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    delay(100);

    Serial.println("=== Faraday RF Shielding Test ===");
    Serial.println("Target SSID: " TARGET_SSID);
    Serial.println("Scanning...");
    Serial.println();
}

void loop() {
    float rssiSum = 0;
    int found = 0;

    for (int cycle = 0; cycle < SCAN_CYCLES; cycle++) {
        int n = WiFi.scanNetworks();

        for (int i = 0; i < n; i++) {
            if (WiFi.SSID(i) == TARGET_SSID) {
                int rssi = WiFi.RSSI(i);
                rssiSum += rssi;
                found++;
                Serial.printf("  Cycle %d: %s  CH:%d  RSSI:%d dBm  Enc:%s\\n",
                    cycle + 1,
                    WiFi.SSID(i).c_str(),
                    WiFi.channel(i),
                    rssi,
                    getEncType(WiFi.encryptionType(i))
                );
                break;
            }
        }

        if (cycle < SCAN_CYCLES - 1) {
            WiFi.scanDelete();
            delay(SCAN_DELAY);
        }
    }

    Serial.println("--------------------------------");
    if (found > 0) {
        float avg = rssiSum / found;
        Serial.printf("RESULT: %d/%d scans detected\\n", found, SCAN_CYCLES);
        Serial.printf("AVG RSSI: %.1f dBm\\n", avg);

        // Signal quality assessment
        if (avg > -50) Serial.println("QUALITY: Excellent");
        else if (avg > -65) Serial.println("QUALITY: Good");
        else if (avg > -80) Serial.println("QUALITY: Fair");
        else Serial.println("QUALITY: Weak");
    } else {
        Serial.println("TARGET NOT FOUND - signal fully blocked or out of range");
    }
    Serial.println("================================");
    Serial.println();

    delay(10000);  // Wait before next test round
}

const char* getEncType(wifi_auth_mode_t encType) {
    switch (encType) {
        case WIFI_AUTH_OPEN:            return "OPEN";
        case WIFI_AUTH_WEP:             return "WEP";
        case WIFI_AUTH_WPA_PSK:         return "WPA";
        case WIFI_AUTH_WPA2_PSK:        return "WPA2";
        case WIFI_AUTH_WPA_WPA2_PSK:    return "WPA/2";
        case WIFI_AUTH_WPA3_PSK:        return "WPA3";
        default:                        return "???";
    }
}`,
            language: 'C++ (Arduino)',
            tip: 'For the most controlled test, use your phone as a mobile hotspot with a known SSID. This gives you a consistent signal source you can place inside and outside shielding materials.'
        },
        {
            title: 'Add Bluetooth BLE Scanning',
            content: `
                <p>WiFi is only half the picture. Bluetooth Low Energy (BLE) operates at the same 2.4 GHz band but uses different modulation. Some Faraday materials block WiFi but leak BLE. We need to test both.</p>
                <p>This second sketch scans for BLE advertisements and reports RSSI for a target device. Enable Bluetooth on your phone and note its advertised name.</p>
            `,
            code: `#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

#define TARGET_NAME "YourPhone"
#define SCAN_TIME   5  // seconds per scan

int scanCount = 0;
float rssiAccum = 0;
int detections = 0;

class ScanCallback : public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice device) {
        if (device.haveName() && String(device.getName().c_str()) == TARGET_NAME) {
            int rssi = device.getRSSI();
            rssiAccum += rssi;
            detections++;
            Serial.printf("  BLE FOUND: %s  RSSI: %d dBm  Addr: %s\\n",
                device.getName().c_str(),
                rssi,
                device.getAddress().toString().c_str()
            );
        }
    }
};

void setup() {
    Serial.begin(115200);
    delay(1000);
    BLEDevice::init("FaradayTester");
    Serial.println("=== BLE Faraday Shielding Test ===");
    Serial.println("Target: " TARGET_NAME);
    Serial.println();
}

void loop() {
    scanCount++;
    detections = 0;
    rssiAccum = 0;

    Serial.printf("--- BLE Scan #%d ---\\n", scanCount);

    BLEScan* scanner = BLEDevice::getScan();
    scanner->setAdvertisedDeviceCallbacks(new ScanCallback());
    scanner->setActiveScan(true);
    scanner->setInterval(100);
    scanner->setWindow(99);
    scanner->start(SCAN_TIME, false);
    scanner->clearResults();

    if (detections > 0) {
        Serial.printf("  Detections: %d  Avg RSSI: %.1f dBm\\n",
            detections, rssiAccum / detections);
    } else {
        Serial.println("  Target NOT detected (blocked or out of range)");
    }
    Serial.println();

    delay(5000);
}`,
            language: 'C++ (Arduino)'
        },
        {
            title: 'Run Baseline Measurements',
            content: `
                <p>Before testing any shielding, establish your baseline. Place the target device (phone hotspot or BLE beacon) at a fixed distance from the ESP32 — 1 meter is a good standard.</p>
                <p>Record at least 10 scan cycles with no shielding. Note the average RSSI and the variance. This is your <strong>baseline</strong>.</p>
                <p>Create a data table like this:</p>
                <ul>
                    <li><strong>Baseline (open air, 1m)</strong> — WiFi: ___ dBm, BLE: ___ dBm</li>
                    <li><strong>Single aluminum foil</strong> — WiFi: ___ dBm, BLE: ___ dBm</li>
                    <li><strong>Double aluminum foil</strong> — WiFi: ___ dBm, BLE: ___ dBm</li>
                    <li><strong>Anti-static bag</strong> — WiFi: ___ dBm, BLE: ___ dBm</li>
                    <li><strong>Commercial Faraday bag</strong> — WiFi: ___ dBm, BLE: ___ dBm</li>
                </ul>
            `
        },
        {
            title: 'Test Shielding Materials',
            content: `
                <p>For each material, wrap the target device completely (no gaps — RF leaks through even small openings) and run the scanner. Record whether the target is detected, and if so, the average RSSI.</p>
                <p><strong>Important</strong>: Faraday shielding fails at seams and openings. Fold aluminum foil edges over multiple times. For bags, fold the opening closed and clip it.</p>
                <p>If the ESP32 reports "TARGET NOT FOUND," the attenuation exceeds the radio's sensitivity floor (roughly -90 to -95 dBm). Log this as <strong>>50 dB attenuation</strong> from your baseline.</p>
            `
        },
        {
            title: 'Calculate Attenuation and Log Results',
            content: `
                <p>Attenuation in dB is simply: <code>baseline_rssi - shielded_rssi</code>. Since RSSI values are negative (e.g., -45 vs -85), the result is a positive number representing how many decibels of signal the material blocked.</p>
                <p>Use this Python script on your computer to process the serial output and generate a summary.</p>
            `,
            code: `#!/usr/bin/env python3
"""faraday_report.py — process serial output into attenuation report"""
import sys

results = {
    'baseline':     {'wifi': [], 'ble': []},
    'foil_single':  {'wifi': [], 'ble': []},
    'foil_double':  {'wifi': [], 'ble': []},
    'antistatic':   {'wifi': [], 'ble': []},
    'faraday_bag':  {'wifi': [], 'ble': []},
}

# Manual entry — fill in your measurements
results['baseline']['wifi']     = [-45, -47, -44, -46, -45]  # example
results['baseline']['ble']      = [-52, -50, -53, -51, -52]  # example
results['foil_single']['wifi']  = [-78, -80, -77, -82, -79]  # example
# ... add your data ...

def avg(values):
    return sum(values) / len(values) if values else None

def attenuation(baseline, shielded):
    b = avg(baseline)
    s = avg(shielded)
    if b is None or s is None:
        return 'N/A'
    return f'{abs(b - s):.1f} dB'

print("=" * 50)
print("FARADAY SHIELDING TEST REPORT")
print("=" * 50)

baseline_wifi = avg(results['baseline']['wifi'])
baseline_ble = avg(results['baseline']['ble'])
print(f"\\nBaseline WiFi: {baseline_wifi:.1f} dBm")
print(f"Baseline BLE:  {baseline_ble:.1f} dBm")

for name, data in results.items():
    if name == 'baseline':
        continue
    label = name.replace('_', ' ').title()
    wifi_att = attenuation(results['baseline']['wifi'], data['wifi'])
    ble_att = attenuation(results['baseline']['ble'], data['ble'])
    detected = 'YES' if data['wifi'] else 'NO (fully blocked)'
    print(f"\\n{label}:")
    print(f"  WiFi detected: {detected}")
    print(f"  WiFi attenuation: {wifi_att}")
    print(f"  BLE attenuation:  {ble_att}")

print("\\n" + "=" * 50)
print("PASS criteria: commercial bag should attenuate > 40 dB")
print("=" * 50)`,
            language: 'Python'
        }
    ],
    testing: `
        <p>Verify your test setup produces reliable, repeatable results:</p>
        <ul>
            <li><strong>Repeatability</strong> — Run the baseline scan 3 separate times without moving anything. Your average RSSI should vary by less than 3 dB between runs. If it varies more, you have interference or reflections — move to a more stable location.</li>
            <li><strong>Baseline sanity check</strong> — At 1 meter with no shielding, WiFi RSSI should be approximately -40 to -55 dBm. If you are getting -70 or worse at 1 meter, something is wrong (antenna orientation, interference, wrong channel).</li>
            <li><strong>Foil test</strong> — Single-layer aluminum foil should attenuate at least 20-30 dB. If you see less than 10 dB, the foil has gaps or is not fully enclosing the device.</li>
            <li><strong>Commercial bag validation</strong> — A proper Faraday bag should completely block the signal (ESP32 cannot find the target at all). If it still detects the target, the bag is defective or not sealed properly.</li>
            <li><strong>BLE vs WiFi</strong> — Both operate at 2.4 GHz but BLE uses frequency hopping. If WiFi is blocked but BLE leaks through, the shielding has narrow-band gaps.</li>
        </ul>
    `,
    troubleshooting: `
        <ul>
            <li><strong>ESP32 does not scan any networks</strong> — Make sure you call <code>WiFi.mode(WIFI_STA)</code> before scanning. Some ESP32 boards need a short delay after mode set before scanning works.</li>
            <li><strong>Target SSID not found even without shielding</strong> — Verify the SSID string matches exactly (case-sensitive). If using a phone hotspot, make sure the hotspot is active and broadcasting (some phones sleep the hotspot if no clients are connected).</li>
            <li><strong>BLE scan finds nothing</strong> — Check that the target phone has Bluetooth enabled and is discoverable. On iOS, the advertised name may differ from what you expect. Try scanning without a name filter first to see all devices.</li>
            <li><strong>RSSI values jump wildly</strong> — Multipath interference from nearby walls and objects. Move to a more open area, or increase the scan cycle count and rely on averages.</li>
            <li><strong>Aluminum foil shows zero attenuation</strong> — The foil is not fully enclosing the device. RF leaks through any opening. Ensure complete coverage with folded seams. Even a 1 cm gap can reduce effectiveness dramatically.</li>
            <li><strong>Serial output garbled</strong> — Baud rate mismatch. Ensure the Serial Monitor is set to 115200 to match the sketch.</li>
        </ul>
    `,
    challenges: `
        <ul>
            <li><strong>Frequency comparison</strong> — If you have access to a 5 GHz WiFi network, compare attenuation at 2.4 GHz vs 5 GHz. Higher frequencies are generally easier to block. Quantify the difference.</li>
            <li><strong>Build a DIY Faraday pouch</strong> — Using your test results, construct a pouch from the best-performing material (likely multiple layers of foil with conductive tape at seams). Test it against the commercial bag. Can you match or beat it?</li>
            <li><strong>Add TFT visualization</strong> — If you have an ESP32 CYD, port the scanner to display a real-time bar chart of RSSI on the TFT, with a horizontal line showing the baseline. This turns the tool into a portable RF shielding tester.</li>
        </ul>
    `
};

// =============================================================================
// SG-18: Air-Gapped File Transfer Station (Raspberry Pi 4)
// =============================================================================
window.SignalGuides['sg-18'] = {
    intro: `
        <p>An air gap is the strongest form of network isolation — a system that is physically disconnected from all networks. No WiFi, no Bluetooth, no Ethernet. The only way data moves in or out is through removable media that a human physically carries. Governments and military organizations use air-gapped systems for their most sensitive data.</p>
        <p>This project builds a dedicated file transfer station on a Raspberry Pi 4. The Pi has all wireless radios permanently disabled. Two USB drives are used: an IN drive (source files) and an OUT drive (sanitized output). Every file that passes through is scanned for malware with ClamAV, hashed with SHA-256 for integrity verification, and logged in an audit trail.</p>
        <p>The key discipline of an air-gapped system is the <strong>one-way data flow</strong>: data moves from IN to OUT, never backwards. The IN drive is treated as untrusted. The OUT drive is your clean output. This is the same principle behind data diodes used in critical infrastructure.</p>
    `,
    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

        '<defs>' +
        '<pattern id="sg18-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '<linearGradient id="sg18-comp" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
        '<marker id="sg18-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#22c55e"/></marker>' +
        '<marker id="sg18-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#ef4444"/></marker>' +
        '</defs>' +
        '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="680" height="380" fill="url(#sg18-grid)" rx="4"/>' +

        '<!-- Title -->' +
        '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">AIR-GAPPED FILE TRANSFER STATION — DATA FLOW</text>' +

        '<!-- IN Drive (Untrusted) -->' +
        '<g>' +
        '<rect x="30" y="70" width="160" height="120" rx="8" fill="url(#sg18-comp)" stroke="#ef4444" stroke-width="1.5"/>' +
        '<rect x="30" y="70" width="160" height="22" rx="8" fill="rgba(239,68,68,0.12)"/>' +
        '<rect x="30" y="84" width="160" height="8" fill="rgba(239,68,68,0.12)"/>' +
        '<text x="110" y="86" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="600">IN DRIVE (USB-A)</text>' +
        '<!-- USB connector -->' +
        '<rect x="6" y="112" width="28" height="28" rx="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
        '<rect x="12" y="118" width="5" height="16" rx="1" fill="#ef4444" opacity="0.4"/>' +
        '<rect x="22" y="118" width="5" height="16" rx="1" fill="#ef4444" opacity="0.4"/>' +
        '<text x="110" y="112" text-anchor="middle" fill="#8b949e" font-size="8">UNTRUSTED source</text>' +
        '<text x="110" y="127" text-anchor="middle" fill="#8b949e" font-size="7">Potentially malicious files</text>' +
        '<rect x="55" y="148" width="110" height="16" rx="3" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="110" y="159" text-anchor="middle" fill="#f87171" font-size="6" font-weight="600">READ-ONLY MOUNT</text>' +
        '<text x="110" y="175" text-anchor="middle" fill="#555" font-size="6">/mnt/in</text>' +
        '</g>' +

        '<!-- Raspberry Pi 4 (Center) -->' +
        '<g>' +
        '<rect x="230" y="55" width="240" height="165" rx="8" fill="url(#sg18-comp)" stroke="#22c55e" stroke-width="1.5"/>' +
        '<rect x="230" y="55" width="240" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
        '<rect x="230" y="69" width="240" height="8" fill="rgba(34,197,94,0.12)"/>' +
        '<text x="350" y="71" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">RASPBERRY PI 4 (AIR-GAPPED)</text>' +

        '<!-- Crossed-out wireless -->' +
        '<rect x="245" y="88" width="70" height="22" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="280" y="102" text-anchor="middle" fill="#ef4444" font-size="6">WiFi DISABLED</text>' +
        '<line x1="248" y1="90" x2="312" y2="107" stroke="#ef4444" stroke-width="1" opacity="0.5"/>' +
        '<rect x="325" y="88" width="70" height="22" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="360" y="102" text-anchor="middle" fill="#ef4444" font-size="6">BT DISABLED</text>' +
        '<line x1="328" y1="90" x2="392" y2="107" stroke="#ef4444" stroke-width="1" opacity="0.5"/>' +
        '<rect x="405" y="88" width="55" height="22" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="432" y="102" text-anchor="middle" fill="#ef4444" font-size="6">No ETH</text>' +
        '<line x1="408" y1="90" x2="457" y2="107" stroke="#ef4444" stroke-width="1" opacity="0.5"/>' +

        '<!-- Processing pipeline -->' +
        '<rect x="250" y="120" width="80" height="32" rx="4" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
        '<text x="290" y="134" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">ClamAV</text>' +
        '<text x="290" y="145" text-anchor="middle" fill="#fde68a" font-size="5" opacity="0.7">Malware Scan</text>' +
        '<rect x="340" y="120" width="60" height="32" rx="4" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.3)" stroke-width="0.5"/>' +
        '<text x="370" y="134" text-anchor="middle" fill="#06b6d4" font-size="7" font-weight="600">SHA-256</text>' +
        '<text x="370" y="145" text-anchor="middle" fill="#67e8f9" font-size="5" opacity="0.7">Hash</text>' +
        '<rect x="410" y="120" width="50" height="32" rx="4" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
        '<text x="435" y="134" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">Log</text>' +
        '<text x="435" y="145" text-anchor="middle" fill="#c084fc" font-size="5" opacity="0.7">Audit</text>' +

        '<!-- Pipeline arrows -->' +
        '<line x1="330" y1="136" x2="338" y2="136" stroke="#8b949e" stroke-width="1"/>' +
        '<line x1="400" y1="136" x2="408" y2="136" stroke="#8b949e" stroke-width="1"/>' +

        '<!-- Transfer direction labels -->' +
        '<text x="350" y="172" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">ONE-WAY DATA FLOW</text>' +
        '<rect x="285" y="178" width="130" height="14" rx="3" fill="rgba(34,197,94,0.08)"/>' +
        '<text x="350" y="189" text-anchor="middle" fill="#22c55e" font-size="6">IN &rarr; SCAN &rarr; HASH &rarr; OUT</text>' +
        '<rect x="248" y="198" width="204" height="14" rx="3" fill="rgba(239,68,68,0.06)"/>' +
        '<text x="350" y="209" text-anchor="middle" fill="#ef4444" font-size="6">NEVER: OUT &rarr; IN (data diode principle)</text>' +
        '</g>' +

        '<!-- Data flow arrows IN to Pi -->' +
        '<line x1="190" y1="126" x2="228" y2="126" stroke="#22c55e" stroke-width="2" marker-end="url(#sg18-arrow)"/>' +
        '<text x="209" y="120" text-anchor="middle" fill="#22c55e" font-size="6">files</text>' +

        '<!-- OUT Drive (Clean) -->' +
        '<g>' +
        '<rect x="510" y="70" width="160" height="120" rx="8" fill="url(#sg18-comp)" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<rect x="510" y="70" width="160" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
        '<rect x="510" y="84" width="160" height="8" fill="rgba(59,130,246,0.12)"/>' +
        '<text x="590" y="86" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">OUT DRIVE (USB-B)</text>' +
        '<!-- USB connector -->' +
        '<rect x="666" y="112" width="28" height="28" rx="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
        '<rect x="672" y="118" width="5" height="16" rx="1" fill="#3b82f6" opacity="0.4"/>' +
        '<rect x="682" y="118" width="5" height="16" rx="1" fill="#3b82f6" opacity="0.4"/>' +
        '<text x="590" y="112" text-anchor="middle" fill="#8b949e" font-size="8">CLEAN output</text>' +
        '<text x="590" y="127" text-anchor="middle" fill="#8b949e" font-size="7">Scanned &amp; verified files</text>' +
        '<rect x="535" y="148" width="110" height="16" rx="3" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
        '<text x="590" y="159" text-anchor="middle" fill="#60a5fa" font-size="6" font-weight="600">READ-WRITE MOUNT</text>' +
        '<text x="590" y="175" text-anchor="middle" fill="#555" font-size="6">/mnt/out</text>' +
        '</g>' +

        '<!-- Data flow arrows Pi to OUT -->' +
        '<line x1="472" y1="126" x2="508" y2="126" stroke="#22c55e" stroke-width="2" marker-end="url(#sg18-arrow)"/>' +
        '<text x="490" y="120" text-anchor="middle" fill="#22c55e" font-size="6">clean</text>' +

        '<!-- Blocked reverse arrow -->' +
        '<line x1="508" y1="140" x2="472" y2="140" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>' +
        '<text x="490" y="152" text-anchor="middle" fill="#ef4444" font-size="5" opacity="0.6">BLOCKED</text>' +

        '<!-- Physical setup bottom -->' +
        '<rect x="40" y="240" width="620" height="50" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="60" y="260" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">PHYSICAL SETUP</text>' +
        '<text x="60" y="278" fill="#8b949e" font-size="7">Pi 4 + keyboard + HDMI monitor (direct console only) + 2x USB drives + USB power supply + microSD card</text>' +

        '<!-- What you need -->' +
        '<rect x="40" y="310" width="620" height="75" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="60" y="328" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">WHAT YOU NEED</text>' +
        '<g>' +
        '<rect x="55" y="338" width="90" height="36" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="100" y="354" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">Pi 4</text>' +
        '<text x="100" y="366" text-anchor="middle" fill="#555" font-size="5">2GB+ RAM</text>' +
        '</g>' +
        '<g>' +
        '<rect x="155" y="338" width="90" height="36" rx="5" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="200" y="354" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">IN Drive</text>' +
        '<text x="200" y="366" text-anchor="middle" fill="#555" font-size="5">USB-A</text>' +
        '</g>' +
        '<g>' +
        '<rect x="255" y="338" width="90" height="36" rx="5" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
        '<text x="300" y="354" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">OUT Drive</text>' +
        '<text x="300" y="366" text-anchor="middle" fill="#555" font-size="5">USB-A</text>' +
        '</g>' +
        '<g>' +
        '<rect x="355" y="338" width="100" height="36" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
        '<text x="405" y="354" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">HDMI Monitor</text>' +
        '<text x="405" y="366" text-anchor="middle" fill="#555" font-size="5">Direct console</text>' +
        '</g>' +
        '<g>' +
        '<rect x="465" y="338" width="90" height="36" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
        '<text x="510" y="354" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">Keyboard</text>' +
        '<text x="510" y="366" text-anchor="middle" fill="#555" font-size="5">USB</text>' +
        '</g>' +
        '<g>' +
        '<rect x="565" y="338" width="90" height="36" rx="5" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.2)" stroke-width="0.5"/>' +
        '<text x="610" y="354" text-anchor="middle" fill="#06b6d4" font-size="7" font-weight="600">microSD</text>' +
        '<text x="610" y="366" text-anchor="middle" fill="#555" font-size="5">16GB+</text>' +
        '</g>' +

        '</svg>' +
        '</div>',
    wiring: null,
    steps: [
        {
            title: 'Flash Pi OS and Disable All Wireless',
            content: `
                <p>Flash <strong>Raspberry Pi OS Lite</strong> onto the SD card. For initial setup, you will need a keyboard and monitor connected directly — since we are disabling all wireless, you cannot use SSH over WiFi after hardening.</p>
                <p>After first boot, permanently disable WiFi and Bluetooth at the firmware level.</p>
            `,
            code: `# Disable WiFi and Bluetooth at firmware level (survives reboots)
sudo tee -a /boot/firmware/config.txt << 'EOF'

# Air-gap hardening: disable all wireless radios
dtoverlay=disable-wifi
dtoverlay=disable-bt
EOF

# Blacklist wireless kernel modules for defense in depth
sudo tee /etc/modprobe.d/air-gap.conf << 'EOF'
blacklist brcmfmac
blacklist brcmutil
blacklist btbcm
blacklist hci_uart
blacklist bluetooth
EOF

# Disable wireless services
sudo systemctl disable wpa_supplicant
sudo systemctl disable bluetooth
sudo systemctl disable hciuart

# Disable NetworkManager WiFi
sudo nmcli radio wifi off 2>/dev/null

# Reboot to apply
sudo reboot`,
            language: 'Bash',
            tip: 'After reboot, verify wireless is truly dead: <code>ip link</code> should show no wlan0 interface. <code>hciconfig</code> should show no Bluetooth adapters. If either still appears, double-check the config.txt overlay lines.'
        },
        {
            title: 'Install ClamAV Malware Scanner',
            content: `
                <p>ClamAV is an open-source antivirus engine. It is not perfect — no scanner is — but it catches known malware signatures and gives us a baseline layer of protection for files passing through the station.</p>
                <p>The virus database must be updated before first use. Since the Pi is air-gapped, you will need to do this <strong>before</strong> disabling wireless, or transfer the database files manually via USB.</p>
            `,
            code: `# Install ClamAV (do this BEFORE disabling wireless, or transfer .cvd files via USB)
sudo apt update
sudo apt install -y clamav clamav-daemon

# Stop the daemon so we can update the database
sudo systemctl stop clamav-freshclam

# Update virus definitions
sudo freshclam

# Verify the database loaded
clamscan --version

# Test with the EICAR test file (safe, triggers AV on purpose)
echo 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > /tmp/eicar.txt
clamscan /tmp/eicar.txt
# Should report: /tmp/eicar.txt: Eicar-Signature FOUND
rm /tmp/eicar.txt`,
            language: 'Bash',
            tip: 'To update ClamAV on an air-gapped system, download the .cvd database files on a connected machine from <code>https://database.clamav.net</code>, copy them to a USB drive, and place them in <code>/var/lib/clamav/</code>.'
        },
        {
            title: 'Set Up USB Drive Auto-Detection',
            content: `
                <p>We use udev rules to automatically detect when USB drives are inserted and mount them to known locations. The first drive plugged in becomes IN, the second becomes OUT.</p>
            `,
            code: `# Create mount points
sudo mkdir -p /mnt/drive-in /mnt/drive-out

# Create a mount helper script
sudo tee /usr/local/bin/airgap-mount.sh << 'SCRIPT'
#!/bin/bash
# Called by udev when a USB block device appears
DEVICE="$1"
LABEL=$(lsblk -no LABEL "$DEVICE" 2>/dev/null)

if [ ! -d /mnt/drive-in ] || [ ! -d /mnt/drive-out ]; then
    mkdir -p /mnt/drive-in /mnt/drive-out
fi

# Mount to first available slot
if ! mountpoint -q /mnt/drive-in; then
    mount -o ro "$DEVICE" /mnt/drive-in
    echo "[airgap] IN drive mounted: $DEVICE ($LABEL)" | tee -a /var/log/airgap.log
elif ! mountpoint -q /mnt/drive-out; then
    mount "$DEVICE" /mnt/drive-out
    echo "[airgap] OUT drive mounted: $DEVICE ($LABEL)" | tee -a /var/log/airgap.log
else
    echo "[airgap] Both slots full, ignoring: $DEVICE" | tee -a /var/log/airgap.log
fi
SCRIPT
sudo chmod +x /usr/local/bin/airgap-mount.sh

# Create udev rule for USB storage
sudo tee /etc/udev/rules.d/99-airgap-usb.rules << 'EOF'
ACTION=="add", SUBSYSTEM=="block", ENV{ID_USB_DRIVER}=="usb-storage", ENV{DEVTYPE}=="partition", RUN+="/usr/local/bin/airgap-mount.sh %N"
EOF

sudo udevadm control --reload-rules`,
            language: 'Bash',
            tip: 'The IN drive is mounted <strong>read-only</strong> (<code>-o ro</code>) to enforce one-way data flow. The station can read from IN but never write to it.'
        },
        {
            title: 'Build the Transfer and Scan Script',
            content: `
                <p>This is the core of the air-gap station. The script reads files from the IN drive, scans each one with ClamAV, computes SHA-256 hashes, copies clean files to the OUT drive, and logs everything.</p>
            `,
            code: `sudo tee /usr/local/bin/airgap-transfer.py << 'PYEOF'
#!/usr/bin/env python3
"""Air-Gapped File Transfer Station — scan, hash, transfer, audit."""

import os
import sys
import hashlib
import subprocess
import json
from datetime import datetime

IN_DIR   = '/mnt/drive-in'
OUT_DIR  = '/mnt/drive-out'
LOG_FILE = '/var/log/airgap-transfers.json'

def sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def scan_file(filepath):
    """Run ClamAV on a single file. Returns (clean, details)."""
    result = subprocess.run(
        ['clamscan', '--no-summary', filepath],
        capture_output=True, text=True
    )
    clean = result.returncode == 0
    details = result.stdout.strip()
    return clean, details

def log_entry(entry):
    """Append a JSON entry to the audit log."""
    logs = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE) as f:
                logs = json.load(f)
        except (json.JSONDecodeError, IOError):
            logs = []
    logs.append(entry)
    with open(LOG_FILE, 'w') as f:
        json.dump(logs, f, indent=2)

def transfer():
    if not os.path.ismount(IN_DIR):
        print('[!] IN drive not mounted.')
        return
    if not os.path.ismount(OUT_DIR):
        print('[!] OUT drive not mounted.')
        return

    files = []
    for root, dirs, fnames in os.walk(IN_DIR):
        for fname in fnames:
            files.append(os.path.join(root, fname))

    if not files:
        print('[*] No files found on IN drive.')
        return

    print(f'[*] Found {len(files)} file(s) on IN drive.')
    print(f'[*] Scanning and transferring...')
    print()

    transferred = 0
    quarantined = 0

    for filepath in files:
        rel = os.path.relpath(filepath, IN_DIR)
        size = os.path.getsize(filepath)
        src_hash = sha256(filepath)

        print(f'  Scanning: {rel} ({size:,} bytes)')
        clean, scan_result = scan_file(filepath)

        entry = {
            'timestamp': datetime.now().isoformat(),
            'file': rel,
            'size': size,
            'sha256': src_hash,
            'scan_result': 'CLEAN' if clean else 'INFECTED',
            'scan_detail': scan_result,
            'action': None
        }

        if clean:
            dest = os.path.join(OUT_DIR, rel)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            # Copy file
            with open(filepath, 'rb') as sf, open(dest, 'wb') as df:
                while True:
                    chunk = sf.read(65536)
                    if not chunk:
                        break
                    df.write(chunk)
            # Verify copy integrity
            dest_hash = sha256(dest)
            if dest_hash == src_hash:
                print(f'    [OK] Clean. Transferred. SHA256 verified.')
                entry['action'] = 'TRANSFERRED'
                transferred += 1
            else:
                os.remove(dest)
                print(f'    [!!] Hash mismatch after copy! File removed.')
                entry['action'] = 'HASH_MISMATCH'
                quarantined += 1
        else:
            print(f'    [XX] INFECTED: {scan_result}')
            entry['action'] = 'QUARANTINED'
            quarantined += 1

        log_entry(entry)

    print()
    print(f'[*] Complete: {transferred} transferred, {quarantined} blocked')
    print(f'[*] Audit log: {LOG_FILE}')

if __name__ == '__main__':
    transfer()
PYEOF
sudo chmod +x /usr/local/bin/airgap-transfer.py`,
            language: 'Python'
        },
        {
            title: 'Build the Terminal UI',
            content: `
                <p>The station needs a simple interface since it runs headless (or with a small attached display). This script provides a text-based menu for the operator.</p>
            `,
            code: `sudo tee /usr/local/bin/airgap-ui.sh << 'SCRIPT'
#!/bin/bash
# Air-Gap Station — Terminal UI

RED='\\033[0;31m'
GRN='\\033[0;32m'
PUR='\\033[0;35m'
CYN='\\033[0;36m'
RST='\\033[0m'

show_status() {
    echo -e "\${PUR}=== AIR-GAP FILE TRANSFER STATION ===\${RST}"
    echo ""

    # Wireless check
    if ip link show wlan0 &>/dev/null; then
        echo -e "  Wireless: \${RED}WARNING - wlan0 detected\${RST}"
    else
        echo -e "  Wireless: \${GRN}DISABLED (air-gapped)\${RST}"
    fi

    # Drive status
    if mountpoint -q /mnt/drive-in; then
        COUNT=$(find /mnt/drive-in -type f | wc -l)
        echo -e "  IN drive:  \${GRN}MOUNTED\${RST} ($COUNT files)"
    else
        echo -e "  IN drive:  \${RED}NOT MOUNTED\${RST}"
    fi

    if mountpoint -q /mnt/drive-out; then
        COUNT=$(find /mnt/drive-out -type f 2>/dev/null | wc -l)
        echo -e "  OUT drive: \${GRN}MOUNTED\${RST} ($COUNT files)"
    else
        echo -e "  OUT drive: \${RED}NOT MOUNTED\${RST}"
    fi

    # ClamAV status
    CLAM_VER=$(clamscan --version 2>/dev/null | head -1)
    echo -e "  ClamAV:    \${CYN}\${CLAM_VER}\${RST}"
    echo ""
}

while true; do
    clear
    show_status

    echo "  [1] Scan & Transfer (IN -> OUT)"
    echo "  [2] View Audit Log"
    echo "  [3] Eject IN drive"
    echo "  [4] Eject OUT drive"
    echo "  [5] Eject both drives"
    echo "  [q] Quit"
    echo ""
    read -p "  Select: " choice

    case $choice in
        1)
            echo ""
            python3 /usr/local/bin/airgap-transfer.py
            echo ""
            read -p "  Press Enter to continue..."
            ;;
        2)
            echo ""
            if [ -f /var/log/airgap-transfers.json ]; then
                python3 -m json.tool /var/log/airgap-transfers.json | less
            else
                echo "  No transfers logged yet."
                read -p "  Press Enter to continue..."
            fi
            ;;
        3)
            sudo umount /mnt/drive-in 2>/dev/null
            echo -e "  \${GRN}IN drive ejected.\${RST}"
            sleep 1
            ;;
        4)
            sudo umount /mnt/drive-out 2>/dev/null
            echo -e "  \${GRN}OUT drive ejected.\${RST}"
            sleep 1
            ;;
        5)
            sudo umount /mnt/drive-in 2>/dev/null
            sudo umount /mnt/drive-out 2>/dev/null
            echo -e "  \${GRN}Both drives ejected.\${RST}"
            sleep 1
            ;;
        q|Q)
            echo "  Shutting down station."
            exit 0
            ;;
    esac
done
SCRIPT
sudo chmod +x /usr/local/bin/airgap-ui.sh`,
            language: 'Bash'
        },
        {
            title: 'Auto-Launch on Boot',
            content: `
                <p>Configure the station to launch the terminal UI automatically when the Pi boots, so it is ready to use immediately when you plug in a monitor and keyboard.</p>
            `,
            code: `# Add auto-login and auto-launch to .bashrc
# Only activate on tty1 (physical console), not SSH
cat << 'EOF' >> /home/pi/.bashrc

# Auto-launch air-gap station UI on physical console
if [ "$(tty)" = "/dev/tty1" ]; then
    /usr/local/bin/airgap-ui.sh
fi
EOF

# Enable auto-login on tty1
sudo mkdir -p /etc/systemd/system/getty@tty1.service.d
sudo tee /etc/systemd/system/getty@tty1.service.d/override.conf << 'EOF'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin pi --noclear %I $TERM
EOF

sudo systemctl daemon-reload`,
            language: 'Bash'
        },
        {
            title: 'Verify the Air Gap',
            content: `
                <p>The most critical step: <strong>prove</strong> that the air gap is real. If any wireless interface is active, the entire security model collapses.</p>
            `,
            code: `# Check for wireless interfaces (should be empty)
ip link | grep -i wlan
# Expected: no output

# Check for Bluetooth (should fail)
hciconfig
# Expected: no devices

# Check loaded kernel modules (should not include wireless)
lsmod | grep -E "brcm|bluetooth|wifi"
# Expected: no output

# Verify NetworkManager has no wireless connections
nmcli device status
# Expected: only 'lo' and 'eth0' (if wired), no 'wlan0'

# Scan for wireless hardware
sudo rfkill list
# Expected: empty or all entries show "Hard blocked: yes"

echo "=== Air Gap Verification ==="
PASS=true
if ip link show wlan0 &>/dev/null; then
    echo "FAIL: wlan0 interface exists"
    PASS=false
fi
if hciconfig 2>/dev/null | grep -q "hci"; then
    echo "FAIL: Bluetooth adapter found"
    PASS=false
fi
if lsmod | grep -qE "brcmfmac|bluetooth"; then
    echo "FAIL: Wireless kernel modules loaded"
    PASS=false
fi
if $PASS; then
    echo "PASS: System is air-gapped"
fi`,
            language: 'Bash'
        }
    ],
    testing: `
        <p>Test the complete transfer pipeline end-to-end:</p>
        <ul>
            <li><strong>Clean file transfer</strong> — Put a few normal files (text, images, PDFs) on the IN drive. Run the transfer. Verify they appear on the OUT drive with matching SHA-256 hashes.</li>
            <li><strong>Malware detection</strong> — Create the EICAR test file on the IN drive: <code>echo 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > /mnt/drive-in/eicar.txt</code>. Run the transfer — it should be quarantined and NOT appear on the OUT drive.</li>
            <li><strong>Hash verification</strong> — After transfer, compare hashes: <code>sha256sum /mnt/drive-in/testfile.txt</code> vs <code>sha256sum /mnt/drive-out/testfile.txt</code>. They must match exactly.</li>
            <li><strong>Audit log</strong> — Check <code>/var/log/airgap-transfers.json</code>. Every file — clean or infected — should have a timestamped entry with hash and scan result.</li>
            <li><strong>Read-only enforcement</strong> — Try writing to the IN drive: <code>touch /mnt/drive-in/test</code>. It should fail with "Read-only file system."</li>
            <li><strong>Air gap</strong> — Run the wireless verification script from Step 7. All checks must pass.</li>
        </ul>
    `,
    troubleshooting: `
        <ul>
            <li><strong>ClamAV "Can't open database" error</strong> — The virus database was not downloaded. On the air-gapped Pi, you need to manually copy <code>main.cvd</code>, <code>daily.cvd</code>, and <code>bytecode.cvd</code> from <code>https://database.clamav.net</code> into <code>/var/lib/clamav/</code> via USB.</li>
            <li><strong>USB drive not auto-mounting</strong> — Check udev logs: <code>journalctl -f</code> while plugging in the drive. The drive might use a filesystem the Pi cannot read (NTFS needs <code>ntfs-3g</code> package, exFAT needs <code>exfatprogs</code>).</li>
            <li><strong>Both drives mount as IN</strong> — The udev rule fires for each partition. If you plug both drives in simultaneously, there is a race condition. Plug the IN drive first, wait for the mount log message, then plug the OUT drive.</li>
            <li><strong>Permission denied on OUT drive</strong> — The OUT drive filesystem may not allow the <code>pi</code> user to write. Either mount with <code>-o uid=1000,gid=1000</code> (for FAT/exFAT) or run the transfer script as root.</li>
            <li><strong>WiFi still active after disabling</strong> — The <code>config.txt</code> path changed in recent Pi OS versions. Try <code>/boot/firmware/config.txt</code> instead of <code>/boot/config.txt</code>. Also verify the kernel module blacklist is being loaded: <code>cat /proc/modules | grep brcm</code>.</li>
            <li><strong>Transfer hangs on large files</strong> — ClamAV can be slow on the Pi 4, especially for files over 100 MB. Be patient. You can skip the scan for known-safe files by modifying the transfer script to accept a <code>--no-scan</code> flag.</li>
        </ul>
    `,
    challenges: `
        <ul>
            <li><strong>Add encryption to the OUT drive</strong> — Combine this project with SG-16. Encrypt the OUT drive with LUKS so that the transferred files are protected both in transit and at rest. The station decrypts IN, scans, and encrypts to OUT.</li>
            <li><strong>File type whitelisting</strong> — Instead of just scanning for malware, add a whitelist of allowed file extensions (.pdf, .docx, .txt, .csv). Reject any file with an extension not on the list, regardless of scan results. This mimics how classified networks restrict file types at transfer points.</li>
            <li><strong>Add a small TFT display</strong> — Attach a 3.5" TFT HAT to the Pi and build a graphical status display showing drive status, transfer progress, and the last 10 audit log entries. No keyboard needed for monitoring — just glance at the screen.</li>
        </ul>
    `
};

// =============================================================================
// SG-19: Pi Tor Router (Anonymous Gateway) (Raspberry Pi 4)
// =============================================================================
window.SignalGuides['sg-19'] = {
    intro: `
        <p>Tor (The Onion Router) anonymizes internet traffic by routing it through a series of encrypted relays around the world. Each relay only knows the previous and next hop — no single point can see both the source and destination. This is the same network used by journalists, activists, and whistleblowers to communicate under surveillance.</p>
        <p>In this project, you turn a Raspberry Pi 4 into a transparent Tor proxy. Any device connected to the Pi's network has all its traffic automatically routed through Tor — no special software or configuration needed on the client device. Optionally, you can set up a WiFi access point so that connecting to the Pi's WiFi network instantly gives you anonymous browsing.</p>
        <p>This is a practical exercise in network routing, iptables firewall rules, transparent proxying, and operational security. You will also learn the limitations of Tor — it is not magic, and misconfigured Tor is worse than no Tor at all because it creates a false sense of security.</p>
    `,
    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

        '<defs>' +
        '<pattern id="sg19-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '<linearGradient id="sg19-comp" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
        '</defs>' +
        '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="680" height="380" fill="url(#sg19-grid)" rx="4"/>' +

        '<!-- Title -->' +
        '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">PI TOR ROUTER — NETWORK ROUTING DIAGRAM</text>' +

        '<!-- Client Devices -->' +
        '<g>' +
        '<rect x="30" y="65" width="130" height="115" rx="8" fill="url(#sg19-comp)" stroke="#06b6d4" stroke-width="1.5"/>' +
        '<rect x="30" y="65" width="130" height="22" rx="8" fill="rgba(6,182,212,0.12)"/>' +
        '<rect x="30" y="79" width="130" height="8" fill="rgba(6,182,212,0.12)"/>' +
        '<text x="95" y="81" text-anchor="middle" fill="#06b6d4" font-size="10" font-weight="600">CLIENT DEVICES</text>' +
        '<text x="95" y="103" text-anchor="middle" fill="#8b949e" font-size="7">Laptop / Phone / Tablet</text>' +
        '<text x="95" y="118" text-anchor="middle" fill="#8b949e" font-size="7">Connect to Pi WiFi AP</text>' +
        '<rect x="48" y="130" width="95" height="18" rx="3" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.25)" stroke-width="0.5"/>' +
        '<text x="95" y="142" text-anchor="middle" fill="#67e8f9" font-size="6">No config needed</text>' +
        '<rect x="48" y="152" width="95" height="18" rx="3" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.25)" stroke-width="0.5"/>' +
        '<text x="95" y="164" text-anchor="middle" fill="#67e8f9" font-size="6">192.168.4.0/24</text>' +
        '</g>' +

        '<!-- WiFi connection -->' +
        '<line x1="160" y1="122" x2="198" y2="122" stroke="#06b6d4" stroke-width="2" stroke-dasharray="4,3"/>' +
        '<polygon points="198,118 206,122 198,126" fill="#06b6d4"/>' +
        '<text x="183" y="115" text-anchor="middle" fill="#06b6d4" font-size="6">WiFi</text>' +

        '<!-- Pi Tor Router -->' +
        '<g>' +
        '<rect x="210" y="50" width="220" height="180" rx="8" fill="url(#sg19-comp)" stroke="#a855f7" stroke-width="1.5"/>' +
        '<rect x="210" y="50" width="220" height="22" rx="8" fill="rgba(168,85,247,0.12)"/>' +
        '<rect x="210" y="64" width="220" height="8" fill="rgba(168,85,247,0.12)"/>' +
        '<text x="320" y="66" text-anchor="middle" fill="#a855f7" font-size="10" font-weight="600">RASPBERRY PI 4 (TOR ROUTER)</text>' +

        '<!-- wlan0 - AP -->' +
        '<rect x="222" y="82" width="95" height="50" rx="4" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.25)" stroke-width="0.5"/>' +
        '<text x="270" y="96" text-anchor="middle" fill="#06b6d4" font-size="7" font-weight="600">wlan0 (AP)</text>' +
        '<text x="270" y="109" text-anchor="middle" fill="#8b949e" font-size="6">hostapd</text>' +
        '<text x="270" y="121" text-anchor="middle" fill="#8b949e" font-size="6">192.168.4.1</text>' +

        '<!-- eth0 - WAN -->' +
        '<rect x="325" y="82" width="95" height="50" rx="4" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.25)" stroke-width="0.5"/>' +
        '<text x="372" y="96" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">eth0 (WAN)</text>' +
        '<text x="372" y="109" text-anchor="middle" fill="#8b949e" font-size="6">Upstream router</text>' +
        '<text x="372" y="121" text-anchor="middle" fill="#8b949e" font-size="6">DHCP client</text>' +

        '<!-- Tor Process -->' +
        '<rect x="230" y="142" width="190" height="40" rx="4" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
        '<text x="325" y="157" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">TOR (TransPort 9040)</text>' +
        '<text x="325" y="170" text-anchor="middle" fill="#c084fc" font-size="6">DNSPort 5353 + iptables NAT rules</text>' +

        '<!-- iptables label -->' +
        '<rect x="230" y="190" width="190" height="26" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="325" y="207" text-anchor="middle" fill="#f87171" font-size="7">iptables: REDIRECT all TCP &rarr; :9040</text>' +
        '</g>' +

        '<!-- Ethernet to upstream -->' +
        '<line x1="430" y1="107" x2="468" y2="107" stroke="#eab308" stroke-width="2"/>' +
        '<polygon points="468,103 476,107 468,111" fill="#eab308"/>' +
        '<text x="453" y="100" text-anchor="middle" fill="#eab308" font-size="6">ETH</text>' +

        '<!-- Upstream Router -->' +
        '<g>' +
        '<rect x="480" y="70" width="120" height="75" rx="8" fill="url(#sg19-comp)" stroke="#eab308" stroke-width="1.5"/>' +
        '<rect x="480" y="70" width="120" height="22" rx="8" fill="rgba(234,179,8,0.12)"/>' +
        '<rect x="480" y="84" width="120" height="8" fill="rgba(234,179,8,0.12)"/>' +
        '<text x="540" y="86" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">HOME ROUTER</text>' +
        '<text x="540" y="108" text-anchor="middle" fill="#8b949e" font-size="7">Gateway to ISP</text>' +
        '<text x="540" y="122" text-anchor="middle" fill="#8b949e" font-size="7">DHCP server</text>' +
        '<text x="540" y="136" text-anchor="middle" fill="#fde68a" font-size="6" opacity="0.7">192.168.1.1</text>' +
        '</g>' +

        '<!-- To Internet -->' +
        '<line x1="600" y1="107" x2="638" y2="107" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3"/>' +
        '<polygon points="638,103 646,107 638,111" fill="#eab308"/>' +

        '<!-- Internet/Tor cloud -->' +
        '<g>' +
        '<rect x="612" y="55" width="75" height="105" rx="8" fill="url(#sg19-comp)" stroke="#a855f7" stroke-width="1.5"/>' +
        '<rect x="612" y="55" width="75" height="22" rx="8" fill="rgba(168,85,247,0.12)"/>' +
        '<rect x="612" y="69" width="75" height="8" fill="rgba(168,85,247,0.12)"/>' +
        '<text x="650" y="71" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">TOR NET</text>' +
        '<text x="650" y="94" text-anchor="middle" fill="#8b949e" font-size="6">Guard</text>' +
        '<text x="650" y="108" text-anchor="middle" fill="#8b949e" font-size="6">Middle</text>' +
        '<text x="650" y="122" text-anchor="middle" fill="#8b949e" font-size="6">Exit</text>' +
        '<line x1="637" y1="98" x2="637" y2="116" stroke="#a855f7" stroke-width="0.5" opacity="0.3"/>' +
        '<text x="650" y="148" text-anchor="middle" fill="#c084fc" font-size="5" opacity="0.7">3 hops encrypted</text>' +
        '</g>' +

        '<!-- Traffic Flow Label -->' +
        '<text x="350" y="260" text-anchor="middle" fill="#444" font-size="10" letter-spacing="0.15em">TRAFFIC FLOW</text>' +
        '<rect x="60" y="270" width="580" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="100" y="290" text-anchor="middle" fill="#06b6d4" font-size="7" font-weight="600">Client</text>' +
        '<line x1="130" y1="288" x2="160" y2="288" stroke="#555" stroke-width="1"/>' +
        '<polygon points="160,285 165,288 160,291" fill="#555"/>' +
        '<text x="200" y="290" text-anchor="middle" fill="#06b6d4" font-size="7">wlan0 AP</text>' +
        '<line x1="230" y1="288" x2="260" y2="288" stroke="#555" stroke-width="1"/>' +
        '<polygon points="260,285 265,288 260,291" fill="#555"/>' +
        '<text x="300" y="290" text-anchor="middle" fill="#f87171" font-size="7">iptables</text>' +
        '<line x1="330" y1="288" x2="360" y2="288" stroke="#555" stroke-width="1"/>' +
        '<polygon points="360,285 365,288 360,291" fill="#555"/>' +
        '<text x="400" y="290" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">Tor :9040</text>' +
        '<line x1="430" y1="288" x2="460" y2="288" stroke="#555" stroke-width="1"/>' +
        '<polygon points="460,285 465,288 460,291" fill="#555"/>' +
        '<text x="500" y="290" text-anchor="middle" fill="#eab308" font-size="7">eth0 WAN</text>' +
        '<line x1="530" y1="288" x2="560" y2="288" stroke="#555" stroke-width="1"/>' +
        '<polygon points="560,285 565,288 560,291" fill="#555"/>' +
        '<text x="605" y="290" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">Tor Network</text>' +
        '<text x="350" y="304" text-anchor="middle" fill="#555" font-size="6">All DNS resolves through Tor (DNSPort 5353) — no DNS leaks</text>' +

        '<!-- What you need -->' +
        '<rect x="40" y="325" width="620" height="60" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="60" y="342" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">WHAT YOU NEED</text>' +
        '<g>' +
        '<rect x="55" y="350" width="100" height="28" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
        '<text x="105" y="368" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">Pi 4 (2GB+)</text>' +
        '</g>' +
        '<g>' +
        '<rect x="165" y="350" width="100" height="28" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
        '<text x="215" y="368" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">Ethernet Cable</text>' +
        '</g>' +
        '<g>' +
        '<rect x="275" y="350" width="100" height="28" rx="5" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.2)" stroke-width="0.5"/>' +
        '<text x="325" y="368" text-anchor="middle" fill="#06b6d4" font-size="7" font-weight="600">WiFi (built-in)</text>' +
        '</g>' +
        '<g>' +
        '<rect x="385" y="350" width="100" height="28" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="435" y="368" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">microSD 16GB+</text>' +
        '</g>' +
        '<g>' +
        '<rect x="495" y="350" width="120" height="28" rx="5" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
        '<text x="555" y="368" text-anchor="middle" fill="#f97316" font-size="7" font-weight="600">USB-C Power Supply</text>' +
        '</g>' +

        '</svg>' +
        '</div>',
    wiring: null,
    steps: [
        {
            title: 'Install Tor and Dependencies',
            content: `
                <p>Start with a fresh Raspberry Pi OS Lite install. SSH in or use the console directly. We install Tor and the tools needed for transparent proxying and DNS resolution.</p>
            `,
            code: `# Update and install Tor
sudo apt update && sudo apt upgrade -y
sudo apt install -y tor iptables-persistent dnsutils curl

# Verify Tor installed
tor --version

# Check the Tor service is not running yet (we configure first)
sudo systemctl stop tor`,
            language: 'Bash'
        },
        {
            title: 'Configure Tor as a Transparent Proxy',
            content: `
                <p>We configure Tor to act as a transparent proxy, intercepting all TCP traffic on specific ports and routing it through the Tor network. We also set up Tor's DNS resolver so DNS queries do not leak your real IP.</p>
            `,
            code: `# Backup the original Tor config
sudo cp /etc/tor/torrc /etc/tor/torrc.bak

# Write the transparent proxy configuration
sudo tee /etc/tor/torrc << 'EOF'
# Hexworth Tor Router Configuration

# Run as a transparent proxy
VirtualAddrNetworkIPv4 10.192.0.0/10
AutomapHostsOnResolve 1

# Transparent proxy port (iptables redirects traffic here)
TransPort 9040 IsolateClientAddr IsolateClientProtocol

# DNS port (resolve DNS through Tor)
DNSPort 5353

# SOCKS port (for applications that support it directly)
SocksPort 9050

# Logging
Log notice file /var/log/tor/notices.log

# Security settings
SafeLogging 1
AvoidDiskWrites 1
EOF

# Set permissions
sudo chown debian-tor:debian-tor /etc/tor/torrc
sudo chmod 644 /etc/tor/torrc

# Start Tor and verify it bootstraps
sudo systemctl start tor
sudo systemctl status tor

# Watch the bootstrap progress
sudo tail -f /var/log/tor/notices.log
# Wait until you see: "Bootstrapped 100% (done): Done"`,
            language: 'Bash',
            tip: 'Bootstrap can take 30-60 seconds. If it stalls below 100%, check your internet connection. If Tor cannot reach directory authorities, it will never complete bootstrap.'
        },
        {
            title: 'Set Up iptables Rules for Transparent Routing',
            content: `
                <p>This is the core of the transparent proxy. We use iptables to redirect all outgoing TCP and UDP (DNS) traffic through Tor. Traffic from the Tor process itself is exempted to avoid infinite loops.</p>
            `,
            code: `# Get the Tor user UID (usually debian-tor)
TOR_UID=$(id -u debian-tor)

# Flush existing rules
sudo iptables -F
sudo iptables -t nat -F

# NAT rules: redirect TCP through Tor's TransPort
sudo iptables -t nat -A OUTPUT -m owner --uid-owner $TOR_UID -j RETURN
sudo iptables -t nat -A OUTPUT -p udp --dport 53 -j REDIRECT --to-ports 5353
sudo iptables -t nat -A OUTPUT -p tcp --syn -j REDIRECT --to-ports 9040

# If acting as a router for other devices (AP mode):
sudo iptables -t nat -A PREROUTING -i wlan1 -p udp --dport 53 -j REDIRECT --to-ports 5353
sudo iptables -t nat -A PREROUTING -i wlan1 -p tcp --syn -j REDIRECT --to-ports 9040

# Block non-Tor UDP (except DNS which we handle above)
sudo iptables -A OUTPUT -m owner --uid-owner $TOR_UID -j ACCEPT
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
sudo iptables -A OUTPUT -p udp -j DROP

# Allow loopback
sudo iptables -A OUTPUT -o lo -j ACCEPT
sudo iptables -A INPUT -i lo -j ACCEPT

# Save the rules so they persist across reboots
sudo netfilter-persistent save`,
            language: 'Bash',
            tip: 'The <code>--uid-owner</code> rule is critical — it lets Tor itself reach the internet directly while redirecting all other traffic. Without this exception, Tor cannot connect to relays and the whole system deadlocks.'
        },
        {
            title: 'Test Anonymous Browsing',
            content: `
                <p>Before setting up the WiFi access point, verify that the Pi itself is routing through Tor correctly. Every request from the Pi should now exit through a Tor relay.</p>
            `,
            code: `# Check your IP through Tor
curl -s https://check.torproject.org/api/ip
# Should return a JSON object with "IsTor": true

# Alternative check
curl -s https://api.ipify.org
# Should NOT return your real IP — it should be a Tor exit node

# Verify DNS is not leaking
nslookup myip.opendns.com resolver1.opendns.com
# This should fail or return a Tor exit IP, not your ISP's resolver

# Check Tor circuit info
curl -s https://check.torproject.org | grep -i "congratulations"
# Should say: "Congratulations. This browser is configured to use Tor."

echo "=== Tor Verification ==="
TOR_CHECK=$(curl -s https://check.torproject.org/api/ip)
echo "Tor check: $TOR_CHECK"

REAL_IP=$(curl -s --connect-timeout 5 https://api.ipify.org)
echo "Exit IP: $REAL_IP"`,
            language: 'Bash'
        },
        {
            title: 'Set Up WiFi Access Point',
            content: `
                <p>Now we turn the Pi into a WiFi access point. Devices that connect to this AP will have all their traffic transparently routed through Tor. You need a USB WiFi adapter for this — the Pi's built-in WiFi will be used as the AP, or you can use the USB adapter as the AP.</p>
            `,
            code: `# Install hostapd and dnsmasq
sudo apt install -y hostapd dnsmasq

# Stop services while we configure
sudo systemctl stop hostapd
sudo systemctl stop dnsmasq

# Configure the AP interface (wlan0 = built-in, wlan1 = USB adapter)
# We use wlan0 for the AP if built-in WiFi is available,
# otherwise use the USB adapter
sudo tee /etc/hostapd/hostapd.conf << 'EOF'
interface=wlan0
driver=nl80211
ssid=TorGateway
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=ChangeThisPassphrase
wpa_key_mgmt=WPA-PSK
rsn_pairwise=CCMP
EOF

# Point hostapd to the config
sudo tee /etc/default/hostapd << 'EOF'
DAEMON_CONF="/etc/hostapd/hostapd.conf"
EOF

# Configure static IP for the AP interface
sudo tee -a /etc/dhcpcd.conf << 'EOF'

# Static IP for Tor AP
interface wlan0
static ip_address=192.168.4.1/24
nohook wpa_supplicant
EOF

# Configure DHCP server for AP clients
sudo tee /etc/dnsmasq.d/tor-ap.conf << 'EOF'
interface=wlan0
dhcp-range=192.168.4.10,192.168.4.50,255.255.255.0,24h
port=0
EOF

# Enable IP forwarding
sudo sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf
sudo sysctl -p

# Start the services
sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl start hostapd
sudo systemctl restart dnsmasq`,
            language: 'Bash',
            tip: 'Change the <code>wpa_passphrase</code> to a strong password. The SSID "TorGateway" is intentionally obvious for testing — in production, you might use a nondescript name.'
        },
        {
            title: 'Add a Kill Switch',
            content: `
                <p>A kill switch ensures that if Tor stops working (crashes, fails to bootstrap, loses connection), <strong>no traffic leaves the Pi at all</strong>. Without a kill switch, traffic would fall back to your normal internet connection, silently deanonymizing you.</p>
            `,
            code: `sudo tee /usr/local/bin/tor-killswitch.sh << 'SCRIPT'
#!/bin/bash
# Tor Kill Switch — blocks all traffic if Tor is not running

TOR_UID=$(id -u debian-tor)

check_tor() {
    # Check if Tor process is running and bootstrapped
    if ! systemctl is-active --quiet tor; then
        return 1
    fi
    # Verify we can reach the Tor check API
    RESULT=$(curl -s --max-time 10 --socks5 127.0.0.1:9050 https://check.torproject.org/api/ip 2>/dev/null)
    if echo "$RESULT" | grep -q '"IsTor":true'; then
        return 0
    fi
    return 1
}

enable_killswitch() {
    echo "[killswitch] Tor is DOWN — blocking all traffic"
    # Drop everything except Tor's own traffic and loopback
    iptables -P OUTPUT DROP
    iptables -A OUTPUT -m owner --uid-owner $TOR_UID -j ACCEPT
    iptables -A OUTPUT -o lo -j ACCEPT
    iptables -A OUTPUT -j DROP
}

disable_killswitch() {
    echo "[killswitch] Tor is UP — restoring transparent proxy rules"
    # Restore normal Tor routing rules
    iptables -P OUTPUT ACCEPT
}

# Main loop
while true; do
    if check_tor; then
        disable_killswitch
    else
        enable_killswitch
    fi
    sleep 30
done
SCRIPT
sudo chmod +x /usr/local/bin/tor-killswitch.sh

# Run as a systemd service
sudo tee /etc/systemd/system/tor-killswitch.service << 'EOF'
[Unit]
Description=Tor Kill Switch Monitor
After=tor.service
Requires=tor.service

[Service]
Type=simple
ExecStart=/usr/local/bin/tor-killswitch.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable tor-killswitch.service
sudo systemctl start tor-killswitch.service`,
            language: 'Bash'
        },
        {
            title: 'DNS Leak Testing',
            content: `
                <p>A DNS leak means your DNS queries bypass Tor and go to your ISP's resolver, revealing which sites you visit even though the HTTP traffic is anonymized. We test for this explicitly.</p>
            `,
            code: `# Method 1: Use Tor Project's check
curl -s https://check.torproject.org/api/ip
# Must show "IsTor": true

# Method 2: Check what DNS resolver you are using
# This should NOT return your ISP's DNS server
curl -s https://dnsleaktest.com/results.html 2>/dev/null || echo "Check https://dnsleaktest.com in browser"

# Method 3: Manual DNS test
# Resolve a domain and check who answered
nslookup check.torproject.org 127.0.0.1
# Should resolve through Tor's DNS (port 5353)

# Method 4: Packet capture test (advanced)
# Capture DNS traffic on the outgoing interface
sudo timeout 10 tcpdump -i eth0 port 53 -c 5 2>/dev/null
# If this captures ANY packets, DNS is leaking!
# All DNS should go through Tor (port 5353 locally), not port 53 externally.

echo ""
echo "=== DNS Leak Test Summary ==="
echo "1. Visit https://dnsleaktest.com from a device on the Tor AP"
echo "2. Click 'Extended Test'"
echo "3. Results should show Tor exit relay DNS servers"
echo "4. If you see your ISP's servers, DNS is leaking"`,
            language: 'Bash',
            tip: 'DNS leaks are the most common Tor misconfiguration. If the iptables rules are correct, all UDP port 53 traffic is redirected to Tor on port 5353. The tcpdump test is the definitive check.'
        }
    ],
    testing: `
        <p>Verify every aspect of the anonymous gateway:</p>
        <ul>
            <li><strong>Tor connectivity</strong> — Run <code>curl -s https://check.torproject.org/api/ip</code> from the Pi. Confirm <code>"IsTor": true</code>. Note the exit IP — it should change every 10 minutes as Tor rotates circuits.</li>
            <li><strong>AP connectivity</strong> — Connect a phone or laptop to the "TorGateway" WiFi network. Open <code>https://check.torproject.org</code> in a browser. It should congratulate you for using Tor.</li>
            <li><strong>DNS leak test</strong> — From a device on the AP, visit <code>https://dnsleaktest.com</code> and run the extended test. All DNS servers in the results should be Tor exit relays, not your ISP.</li>
            <li><strong>Kill switch</strong> — Stop Tor manually: <code>sudo systemctl stop tor</code>. Try to curl anything from the Pi or from a connected device. All connections should fail. Restart Tor: <code>sudo systemctl start tor</code>. Wait 60 seconds, verify connectivity returns.</li>
            <li><strong>Speed test</strong> — Tor is slow by design. Expect 1-5 Mbps throughput. If you are getting full-speed connections, something is misconfigured and traffic may be bypassing Tor.</li>
        </ul>
    `,
    troubleshooting: `
        <ul>
            <li><strong>Tor stuck at "Bootstrapped 5%"</strong> — Tor cannot reach directory authorities. Check that the Pi has a working internet connection via Ethernet: <code>ping -c 3 8.8.8.8</code>. If your network blocks Tor, you may need to configure bridges in <code>torrc</code>: add <code>UseBridges 1</code> and obtain bridge addresses from <code>bridges.torproject.org</code>.</li>
            <li><strong>Devices connect to AP but cannot browse</strong> — Check IP forwarding: <code>cat /proc/sys/net/ipv4/ip_forward</code> should return <code>1</code>. Verify iptables PREROUTING rules are in place for the AP interface (wlan0 or wlan1).</li>
            <li><strong>hostapd fails to start</strong> — The most common cause is driver incompatibility. Run <code>sudo hostapd -d /etc/hostapd/hostapd.conf</code> for debug output. Not all WiFi chipsets support AP mode — check with <code>iw list | grep "Supported interface modes" -A 8</code>.</li>
            <li><strong>"No internet" on connected devices but Pi works fine</strong> — The PREROUTING iptables rules are missing or targeting the wrong interface. The interface in the iptables rules must match the AP interface name exactly.</li>
            <li><strong>DNS leaks detected</strong> — Verify the iptables UDP port 53 redirect rule is active: <code>sudo iptables -t nat -L -v</code>. Also check that dnsmasq is not running its own DNS resolver on port 53 — we set <code>port=0</code> in the dnsmasq config to disable it.</li>
            <li><strong>Very slow speeds (under 0.5 Mbps)</strong> — Tor circuits sometimes route through slow relays. Restart Tor to get new circuits: <code>sudo systemctl restart tor</code>. If consistently slow, your ISP may be throttling Tor traffic — bridges with pluggable transports (obfs4) can help.</li>
        </ul>
    `,
    challenges: `
        <ul>
            <li><strong>Captive portal gateway</strong> — Add a lightweight web server (nginx) on the Pi that serves a landing page when devices first connect to the AP. Display the current Tor circuit info, exit node country, and connection status before the user starts browsing.</li>
            <li><strong>Multi-hop VPN + Tor</strong> — Route traffic through a VPN first, then through Tor (VPN -> Tor). This hides the fact that you are using Tor from your ISP. Configure OpenVPN on the Pi to connect to a VPN provider before Tor starts.</li>
            <li><strong>Hidden service hosting</strong> — Configure a Tor hidden service (.onion address) on the Pi. Host a simple static web page accessible only through Tor. This makes your dead drop (SG-16) accessible from anywhere without revealing the Pi's IP address.</li>
        </ul>
    `
};

// =============================================================================
// SG-20: Signal Jammer Detector (ESP32 CYD)
// =============================================================================
window.SignalGuides['sg-20'] = {
    intro: `
        <p>A signal jammer floods the radio spectrum with noise, drowning out legitimate WiFi, Bluetooth, and cellular signals. Jammers are illegal in most countries, but they are cheap and easy to obtain — and they are used for everything from exam cheating to disabling security cameras during break-ins.</p>
        <p>This project builds a spectrum monitor on the ESP32 CYD that scans all 14 WiFi channels in the 2.4 GHz band, measures the noise floor on each channel, and detects anomalies that suggest active jamming. The built-in TFT display shows a real-time spectrum visualization — a bar graph of signal energy per channel — with alert thresholds that trigger when broadband noise spikes across multiple channels simultaneously.</p>
        <p>The key insight is that legitimate WiFi congestion affects specific channels (1, 6, 11 are most common), while a broadband jammer raises the noise floor across ALL channels at once. That simultaneous broadband spike is the signature we detect.</p>
    `,
    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

        '<defs>' +
        '<pattern id="sg20-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '<linearGradient id="sg20-comp" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
        '</defs>' +
        '<rect width="700" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="680" height="380" fill="url(#sg20-grid)" rx="4"/>' +

        '<!-- Title -->' +
        '<text x="350" y="32" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SIGNAL JAMMER DETECTOR — ESP32 CYD WIRING DIAGRAM</text>' +

        '<!-- ESP32 CYD Board -->' +
        '<g>' +
        '<rect x="200" y="50" width="300" height="170" rx="8" fill="url(#sg20-comp)" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<rect x="200" y="50" width="300" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
        '<rect x="200" y="64" width="300" height="8" fill="rgba(59,130,246,0.12)"/>' +
        '<text x="350" y="66" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ESP32 CYD (Cheap Yellow Display)</text>' +

        '<!-- Built-in TFT -->' +
        '<rect x="215" y="82" width="130" height="70" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
        '<text x="280" y="96" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">BUILT-IN 2.8" TFT</text>' +
        '<text x="280" y="109" text-anchor="middle" fill="#8b949e" font-size="6">320x240 ILI9341</text>' +
        '<!-- Mini spectrum bars -->' +
        '<rect x="228" y="116" width="8" height="12" rx="1" fill="rgba(34,197,94,0.4)"/>' +
        '<rect x="238" y="120" width="8" height="8" rx="1" fill="rgba(34,197,94,0.3)"/>' +
        '<rect x="248" y="114" width="8" height="14" rx="1" fill="rgba(239,68,68,0.5)"/>' +
        '<rect x="258" y="118" width="8" height="10" rx="1" fill="rgba(234,179,8,0.4)"/>' +
        '<rect x="268" y="122" width="8" height="6" rx="1" fill="rgba(34,197,94,0.3)"/>' +
        '<rect x="278" y="113" width="8" height="15" rx="1" fill="rgba(239,68,68,0.5)"/>' +
        '<rect x="288" y="119" width="8" height="9" rx="1" fill="rgba(234,179,8,0.4)"/>' +
        '<rect x="298" y="116" width="8" height="12" rx="1" fill="rgba(34,197,94,0.4)"/>' +
        '<rect x="308" y="121" width="8" height="7" rx="1" fill="rgba(34,197,94,0.3)"/>' +
        '<rect x="318" y="117" width="8" height="11" rx="1" fill="rgba(234,179,8,0.4)"/>' +
        '<rect x="328" y="124" width="8" height="4" rx="1" fill="rgba(34,197,94,0.2)"/>' +
        '<text x="280" y="144" text-anchor="middle" fill="#555" font-size="5">CH1 CH2 CH3 CH4 CH5 CH6 CH7 CH8 CH9 CH10 CH11</text>' +

        '<!-- Built-in WiFi radio -->' +
        '<rect x="360" y="82" width="130" height="45" rx="4" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.25)" stroke-width="0.5"/>' +
        '<text x="425" y="96" text-anchor="middle" fill="#06b6d4" font-size="7" font-weight="600">WiFi RADIO 2.4GHz</text>' +
        '<text x="425" y="109" text-anchor="middle" fill="#8b949e" font-size="6">Built-in PCB antenna</text>' +
        '<text x="425" y="120" text-anchor="middle" fill="#67e8f9" font-size="5" opacity="0.7">Scans CH 1-14</text>' +

        '<!-- Built-in touch -->' +
        '<rect x="360" y="133" width="130" height="30" rx="4" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.25)" stroke-width="0.5"/>' +
        '<text x="425" y="147" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">XPT2046 Touch</text>' +
        '<text x="425" y="157" text-anchor="middle" fill="#8b949e" font-size="6">Threshold adjust</text>' +

        '<!-- USB port -->' +
        '<rect x="310" y="176" width="80" height="20" rx="3" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
        '<text x="350" y="190" text-anchor="middle" fill="#f97316" font-size="7" font-weight="600">USB-C (Power)</text>' +

        '<!-- Pin labels on sides -->' +
        '<text x="210" y="200" fill="#555" font-size="6">GPIO pins (optional external antenna)</text>' +
        '</g>' +

        '<!-- External Antenna (optional) -->' +
        '<g>' +
        '<rect x="30" y="80" width="130" height="80" rx="8" fill="url(#sg20-comp)" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2"/>' +
        '<rect x="30" y="80" width="130" height="20" rx="8" fill="rgba(245,158,11,0.1)"/>' +
        '<rect x="30" y="93" width="130" height="7" fill="rgba(245,158,11,0.1)"/>' +
        '<text x="95" y="95" text-anchor="middle" fill="#f59e0b" font-size="8" font-weight="600">OPTIONAL</text>' +
        '<text x="95" y="115" text-anchor="middle" fill="#8b949e" font-size="7">External 2.4GHz</text>' +
        '<text x="95" y="128" text-anchor="middle" fill="#8b949e" font-size="7">Antenna + IPEX</text>' +
        '<text x="95" y="148" text-anchor="middle" fill="#fde68a" font-size="6" opacity="0.7">Better sensitivity</text>' +
        '</g>' +

        '<!-- Antenna wire -->' +
        '<line x1="160" y1="120" x2="200" y2="104" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2" opacity="0.5"/>' +

        '<!-- USB Power -->' +
        '<line x1="350" y1="196" x2="350" y2="230" stroke="#ef4444" stroke-width="2"/>' +
        '<rect x="300" y="230" width="100" height="30" rx="5" fill="#1e2736" stroke="#ef4444" stroke-width="1"/>' +
        '<text x="350" y="249" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">5V USB-C PSU</text>' +
        '<text x="330" y="218" text-anchor="middle" fill="#ef4444" font-size="6">VCC (red)</text>' +

        '<!-- Detection Logic -->' +
        '<text x="350" y="285" text-anchor="middle" fill="#444" font-size="10" letter-spacing="0.15em">JAMMING DETECTION LOGIC</text>' +

        '<rect x="40" y="295" width="620" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +

        '<!-- Normal -->' +
        '<rect x="55" y="302" width="180" height="30" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="145" y="315" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">NORMAL: Uneven RSSI</text>' +
        '<text x="145" y="327" text-anchor="middle" fill="#555" font-size="6">CH 1,6,11 busy; others quiet</text>' +

        '<!-- Suspicious -->' +
        '<rect x="250" y="302" width="190" height="30" rx="4" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
        '<text x="345" y="315" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">SUSPICIOUS: Elevated noise</text>' +
        '<text x="345" y="327" text-anchor="middle" fill="#555" font-size="6">Multiple channels above threshold</text>' +

        '<!-- Jamming -->' +
        '<rect x="455" y="302" width="190" height="30" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="550" y="315" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">JAMMING: Broadband spike</text>' +
        '<text x="550" y="327" text-anchor="middle" fill="#555" font-size="6">ALL channels high simultaneously</text>' +

        '<!-- What you need -->' +
        '<rect x="40" y="350" width="620" height="38" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
        '<text x="60" y="367" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">WHAT YOU NEED</text>' +
        '<g>' +
        '<rect x="190" y="354" width="120" height="28" rx="5" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
        '<text x="250" y="372" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">ESP32 CYD Board</text>' +
        '</g>' +
        '<g>' +
        '<rect x="320" y="354" width="100" height="28" rx="5" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="370" y="372" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">USB-C Cable</text>' +
        '</g>' +
        '<g>' +
        '<rect x="430" y="354" width="140" height="28" rx="5" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" stroke-width="0.5" stroke-dasharray="3,2"/>' +
        '<text x="500" y="372" text-anchor="middle" fill="#f59e0b" font-size="7" font-weight="600">Ext Antenna (optional)</text>' +
        '</g>' +

        '</svg>' +
        '</div>',
    wiring: null,
    steps: [
        {
            title: 'Understand RF Jamming vs. Congestion',
            content: `
                <p>Before writing code, understand what we are detecting. In the 2.4 GHz ISM band:</p>
                <ul>
                    <li><strong>Normal congestion</strong> — Channels 1, 6, 11 are heavily used. You will see high signal energy on these channels but low energy on channels 2-5, 7-10, 12-14. The pattern is uneven.</li>
                    <li><strong>Broadband jamming</strong> — A jammer transmits wideband noise across the entire 2.4 GHz range. ALL channels show elevated noise floors simultaneously. The pattern is a flat wall of noise.</li>
                    <li><strong>Targeted jamming</strong> — A more sophisticated jammer targets specific channels. Harder to detect, but it still shows as a sudden, sustained spike that does not match normal traffic patterns.</li>
                </ul>
                <p>We measure the noise floor by scanning each channel and counting the number of detected packets and their signal strengths using the ESP32's promiscuous mode.</p>
            `
        },
        {
            title: 'Set Up the TFT Display',
            content: `
                <p>The ESP32 CYD (Cheap Yellow Display) uses an ILI9341 TFT controller. We initialize the display and create the spectrum visualization framework.</p>
                <p>Install <strong>TFT_eSPI</strong> via the Arduino Library Manager. The CYD requires specific pin definitions — create or modify <code>User_Setup.h</code> in the TFT_eSPI library folder.</p>
            `,
            code: `// User_Setup.h for ESP32-2432S028R (CYD)
// Place in: Arduino/libraries/TFT_eSPI/User_Setup.h

#define ILI9341_DRIVER

#define TFT_WIDTH  240
#define TFT_HEIGHT 320

#define TFT_MISO 12
#define TFT_MOSI 13
#define TFT_SCLK 14
#define TFT_CS   15
#define TFT_DC    2
#define TFT_RST  -1
#define TFT_BL   21

#define SPI_FREQUENCY  40000000
#define SPI_READ_FREQUENCY 20000000

#define LOAD_GLCD
#define LOAD_FONT2
#define LOAD_FONT4`,
            language: 'C++ (Arduino)',
            tip: 'If you get a white screen, the pin definitions are wrong for your specific CYD board revision. Check the silkscreen on your board and compare with the TFT_eSPI documentation.'
        },
        {
            title: 'Build the Channel Scanner',
            content: `
                <p>We use the ESP32's WiFi promiscuous mode to capture raw frames on each channel. For each channel, we count the number of packets received in a fixed time window and record the average RSSI. This gives us a noise + signal energy measurement per channel.</p>
            `,
            code: `#include <WiFi.h>
#include "esp_wifi.h"
#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

#define NUM_CHANNELS 14
#define DWELL_TIME   100  // ms per channel
#define HISTORY_LEN  60   // rolling window for baseline

// Per-channel data
typedef struct {
    int packetCount;
    float avgRssi;
    float baseline;
    float history[HISTORY_LEN];
    int histIdx;
    bool alert;
} ChannelData;

ChannelData channels[NUM_CHANNELS];
volatile int pktCount = 0;
volatile float rssiSum = 0;

bool globalAlert = false;
int alertChannels = 0;
float alertThreshold = 15.0;  // dB above baseline triggers alert

// Promiscuous mode callback
void IRAM_ATTR snifferCallback(void* buf, wifi_promiscuous_pkt_type_t type) {
    const wifi_promiscuous_pkt_t* pkt = (wifi_promiscuous_pkt_t*)buf;
    pktCount++;
    rssiSum += pkt->rx_ctrl.rssi;
}

void setup() {
    Serial.begin(115200);

    // Init display
    tft.init();
    tft.setRotation(1);  // Landscape
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setTextSize(1);

    // Draw header
    tft.fillRect(0, 0, 320, 20, 0x1082);
    tft.setTextColor(0xB77F, 0x1082);  // Purple on dark
    tft.drawString("SIGNAL JAMMER DETECTOR", 10, 4, 2);

    // Init WiFi in promiscuous mode
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    esp_wifi_set_promiscuous(true);
    esp_wifi_set_promiscuous_rx_cb(snifferCallback);

    // Init channel data
    for (int i = 0; i < NUM_CHANNELS; i++) {
        channels[i].packetCount = 0;
        channels[i].avgRssi = -90;
        channels[i].baseline = -90;
        channels[i].alert = false;
        channels[i].histIdx = 0;
        for (int j = 0; j < HISTORY_LEN; j++) {
            channels[i].history[j] = -90;
        }
    }

    Serial.println("Jammer Detector initialized. Building baseline...");
}

void scanAllChannels() {
    alertChannels = 0;

    for (int ch = 0; ch < NUM_CHANNELS; ch++) {
        // Switch channel
        esp_wifi_set_channel(ch + 1, WIFI_SECOND_CHAN_NONE);

        // Reset counters
        pktCount = 0;
        rssiSum = 0;

        // Dwell on this channel
        delay(DWELL_TIME);

        // Record results
        channels[ch].packetCount = pktCount;
        channels[ch].avgRssi = (pktCount > 0) ? (rssiSum / pktCount) : -95;

        // Update rolling baseline
        channels[ch].history[channels[ch].histIdx] = channels[ch].avgRssi;
        channels[ch].histIdx = (channels[ch].histIdx + 1) % HISTORY_LEN;

        // Calculate baseline (average of history)
        float sum = 0;
        for (int j = 0; j < HISTORY_LEN; j++) {
            sum += channels[ch].history[j];
        }
        channels[ch].baseline = sum / HISTORY_LEN;

        // Check for anomaly: signal significantly above baseline
        float delta = channels[ch].avgRssi - channels[ch].baseline;
        channels[ch].alert = (delta > alertThreshold);
        if (channels[ch].alert) alertChannels++;
    }

    // Global alert: jamming if many channels spike simultaneously
    // Normal congestion hits 1-3 channels; jamming hits 6+
    globalAlert = (alertChannels >= 6);
}`,
            language: 'C++ (Arduino)'
        },
        {
            title: 'Build the TFT Spectrum Visualization',
            content: `
                <p>We draw a bar chart on the TFT showing the signal energy per channel. Each bar's height represents the RSSI measurement. A horizontal line shows the baseline, and bars that exceed the alert threshold turn red.</p>
            `,
            code: `// Display constants
#define GRAPH_X      20
#define GRAPH_Y      30
#define GRAPH_W      280
#define GRAPH_H      150
#define BAR_GAP      2
#define RSSI_MIN     -100
#define RSSI_MAX     -20

// Color palette
#define COL_BG       TFT_BLACK
#define COL_GRID     0x2104   // Dark gray
#define COL_BAR_OK   0x6DFB   // Purple (normal)
#define COL_BAR_WARN 0xFBE0   // Yellow (elevated)
#define COL_BAR_CRIT 0xF800   // Red (alert)
#define COL_BASELINE 0x07E0   // Green
#define COL_TEXT     0xC618   // Light gray

void drawSpectrum() {
    int barW = (GRAPH_W - (NUM_CHANNELS - 1) * BAR_GAP) / NUM_CHANNELS;

    // Clear graph area
    tft.fillRect(GRAPH_X - 5, GRAPH_Y, GRAPH_W + 10, GRAPH_H + 5, COL_BG);

    // Draw grid lines
    for (int db = RSSI_MIN; db <= RSSI_MAX; db += 20) {
        int y = map(db, RSSI_MIN, RSSI_MAX, GRAPH_Y + GRAPH_H, GRAPH_Y);
        tft.drawFastHLine(GRAPH_X, y, GRAPH_W, COL_GRID);
        tft.setTextColor(COL_GRID, COL_BG);
        tft.drawNumber(db, 0, y - 4, 1);
    }

    // Draw bars
    for (int i = 0; i < NUM_CHANNELS; i++) {
        int x = GRAPH_X + i * (barW + BAR_GAP);
        int rssi = constrain((int)channels[i].avgRssi, RSSI_MIN, RSSI_MAX);
        int barH = map(rssi, RSSI_MIN, RSSI_MAX, 0, GRAPH_H);
        int barY = GRAPH_Y + GRAPH_H - barH;

        // Choose color based on alert state
        uint16_t color = COL_BAR_OK;
        float delta = channels[i].avgRssi - channels[i].baseline;
        if (channels[i].alert) {
            color = COL_BAR_CRIT;
        } else if (delta > alertThreshold * 0.6) {
            color = COL_BAR_WARN;
        }

        // Draw the bar
        tft.fillRect(x, barY, barW, barH, color);

        // Draw baseline indicator
        int baseRssi = constrain((int)channels[i].baseline, RSSI_MIN, RSSI_MAX);
        int baseY = map(baseRssi, RSSI_MIN, RSSI_MAX, GRAPH_Y + GRAPH_H, GRAPH_Y);
        tft.drawFastHLine(x - 1, baseY, barW + 2, COL_BASELINE);

        // Channel label
        tft.setTextColor(COL_TEXT, COL_BG);
        tft.drawNumber(i + 1, x + barW / 2 - 3, GRAPH_Y + GRAPH_H + 2, 1);
    }
}

void drawStatus() {
    int y = GRAPH_Y + GRAPH_H + 16;
    tft.fillRect(0, y, 320, 44, COL_BG);

    if (globalAlert) {
        // JAMMING DETECTED
        tft.fillRect(0, y, 320, 22, 0x7800);  // Dark red background
        tft.setTextColor(TFT_WHITE, 0x7800);
        tft.drawString("!! JAMMING DETECTED !!", 70, y + 3, 2);
        tft.setTextColor(TFT_RED, COL_BG);
        char buf[40];
        snprintf(buf, sizeof(buf), "%d/%d channels above threshold", alertChannels, NUM_CHANNELS);
        tft.drawString(buf, 40, y + 26, 1);
    } else {
        tft.setTextColor(COL_BASELINE, COL_BG);
        tft.drawString("SPECTRUM NORMAL", 100, y + 3, 2);
        tft.setTextColor(COL_TEXT, COL_BG);
        char buf[40];
        snprintf(buf, sizeof(buf), "Elevated: %d ch  Threshold: %.0f dB",
            alertChannels, alertThreshold);
        tft.drawString(buf, 40, y + 26, 1);
    }
}

void loop() {
    scanAllChannels();
    drawSpectrum();
    drawStatus();

    // Serial logging
    Serial.printf("Scan complete | Alert channels: %d/14 | Global: %s\n",
        alertChannels, globalAlert ? "JAMMING" : "normal");
    for (int i = 0; i < NUM_CHANNELS; i++) {
        Serial.printf("  CH%02d: %6.1f dBm (base: %6.1f, delta: %+.1f) %s\n",
            i + 1,
            channels[i].avgRssi,
            channels[i].baseline,
            channels[i].avgRssi - channels[i].baseline,
            channels[i].alert ? "[ALERT]" : ""
        );
    }
    Serial.println();
}`,
            language: 'C++ (Arduino)'
        },
        {
            title: 'Calibrate the Baseline',
            content: `
                <p>The detector needs a stable baseline to distinguish jamming from normal activity. On first power-up, let it run for at least 5 minutes (60 scan cycles) in a normal environment before relying on the alerts.</p>
                <p>During calibration, the rolling history buffer fills with normal noise floor readings. Once full, the baseline accurately represents "normal" for your environment.</p>
                <ul>
                    <li>Urban environments with many WiFi networks will have higher baselines on channels 1, 6, 11</li>
                    <li>Rural or shielded environments will have lower, more uniform baselines</li>
                    <li>The <code>alertThreshold</code> (15 dB default) may need tuning — increase it in noisy environments to reduce false positives</li>
                </ul>
            `
        },
        {
            title: 'Add Event Logging',
            content: `
                <p>Log jamming events with timestamps so you can review them later. Since the CYD does not have an RTC, we use uptime-based timestamps. For persistent logging, add an SD card module.</p>
            `,
            code: `// Add at the top of your sketch
#define MAX_EVENTS 50

typedef struct {
    unsigned long timestamp;  // millis()
    int affectedChannels;
    float peakRssi;
    int durationMs;
} JamEvent;

JamEvent eventLog[MAX_EVENTS];
int eventCount = 0;
bool wasAlerting = false;
unsigned long alertStart = 0;

void logJamEvent() {
    if (globalAlert && !wasAlerting) {
        // Jamming just started
        alertStart = millis();
        wasAlerting = true;
        Serial.println(">>> JAMMING EVENT STARTED <<<");
    }
    else if (!globalAlert && wasAlerting) {
        // Jamming just ended — log the event
        wasAlerting = false;
        unsigned long duration = millis() - alertStart;

        if (eventCount < MAX_EVENTS) {
            eventLog[eventCount].timestamp = alertStart;
            eventLog[eventCount].affectedChannels = alertChannels;
            eventLog[eventCount].durationMs = duration;

            // Find peak RSSI during event
            float peak = -100;
            for (int i = 0; i < NUM_CHANNELS; i++) {
                if (channels[i].avgRssi > peak) peak = channels[i].avgRssi;
            }
            eventLog[eventCount].peakRssi = peak;
            eventCount++;

            Serial.printf(">>> JAMMING EVENT ENDED: %lu ms, %d channels, peak %.1f dBm <<<\n",
                duration, alertChannels, peak);
        }
    }
}

void printEventLog() {
    Serial.println("\n=== JAMMING EVENT LOG ===");
    for (int i = 0; i < eventCount; i++) {
        unsigned long t = eventLog[i].timestamp / 1000;
        Serial.printf("Event %d: T+%lus | Duration: %dms | Channels: %d | Peak: %.1f dBm\n",
            i + 1, t, eventLog[i].durationMs,
            eventLog[i].affectedChannels, eventLog[i].peakRssi);
    }
    Serial.printf("Total events: %d\n", eventCount);
    Serial.println("========================\n");
}

// Add to loop():
// logJamEvent();
// To print the log, send 'L' over serial:
// if (Serial.available() && Serial.read() == 'L') printEventLog();`,
            language: 'C++ (Arduino)'
        },
        {
            title: 'Tune Alert Thresholds',
            content: `
                <p>The default threshold of 15 dB above baseline works in most environments, but you may need to adjust based on your specific location. Use the serial output to understand your environment's normal variation.</p>
            `,
            code: `// Add serial commands to adjust threshold at runtime
// Place this in loop() after the main scan/draw cycle

if (Serial.available()) {
    char cmd = Serial.read();
    switch (cmd) {
        case '+':
            alertThreshold += 2.0;
            Serial.printf("Threshold: %.0f dB\n", alertThreshold);
            break;
        case '-':
            alertThreshold -= 2.0;
            if (alertThreshold < 5.0) alertThreshold = 5.0;
            Serial.printf("Threshold: %.0f dB\n", alertThreshold);
            break;
        case 'R':
            // Reset baseline
            for (int i = 0; i < NUM_CHANNELS; i++) {
                for (int j = 0; j < HISTORY_LEN; j++) {
                    channels[i].history[j] = channels[i].avgRssi;
                }
                channels[i].baseline = channels[i].avgRssi;
            }
            Serial.println("Baseline reset to current readings.");
            break;
        case 'L':
            printEventLog();
            break;
        case 'S':
            // Print current status
            Serial.printf("Threshold: %.0f dB | Events: %d | Alert: %s\n",
                alertThreshold, eventCount, globalAlert ? "YES" : "no");
            break;
    }
}`,
            language: 'C++ (Arduino)',
            tip: 'Use <code>+</code> and <code>-</code> over serial to adjust the threshold in real-time while observing the display. This lets you fine-tune sensitivity without reflashing.'
        }
    ],
    testing: `
        <p>Test the detector under controlled conditions:</p>
        <ul>
            <li><strong>Baseline verification</strong> — Let the detector run for 5+ minutes in a normal environment. The serial output should show stable baselines per channel, with delta values under 5 dB. The display should show "SPECTRUM NORMAL."</li>
            <li><strong>Simulated congestion</strong> — Start a large WiFi file transfer or video stream near the detector. You should see 1-2 channels spike (the channel your AP uses) while others stay normal. The detector should NOT trigger a global alert.</li>
            <li><strong>Simulated broadband event</strong> — Turn on a microwave oven near the detector (microwaves leak 2.4 GHz radiation). You should see multiple channels spike. Depending on the microwave and distance, this may trigger the jammer alert — which is actually correct behavior since microwave leakage IS broadband 2.4 GHz interference.</li>
            <li><strong>Serial commands</strong> — Send <code>S</code> to verify status, <code>L</code> to review the event log, <code>R</code> to reset baseline. All should respond correctly.</li>
            <li><strong>Display accuracy</strong> — Compare the bar heights on the TFT with the serial RSSI values. They should correspond: channels with higher (less negative) RSSI should have taller bars.</li>
        </ul>
    `,
    troubleshooting: `
        <ul>
            <li><strong>White or blank TFT screen</strong> — Pin definitions in <code>User_Setup.h</code> do not match your CYD board revision. The ESP32-2432S028R has multiple hardware versions with different TFT pin mappings. Check the silkscreen labels on the board and compare with known pinouts online.</li>
            <li><strong>All channels show -95 dBm</strong> — Promiscuous mode is not enabled, or the callback is not firing. Verify <code>esp_wifi_set_promiscuous(true)</code> returns ESP_OK. Some Arduino core versions have bugs with promiscuous mode — try updating the ESP32 board package.</li>
            <li><strong>Constant false alarms</strong> — The alert threshold is too low for your environment. Increase it with the <code>+</code> serial command. In dense urban environments, you may need 25+ dB threshold. Also ensure the baseline has had time to stabilize (5+ minutes).</li>
            <li><strong>Detector never alerts</strong> — The threshold may be too high, or the baseline is already elevated (noisy environment). Reset the baseline with <code>R</code> in a known-clean period, then test again.</li>
            <li><strong>ESP32 crashes or reboots</strong> — The promiscuous mode callback runs in an ISR context. Make sure the callback only updates simple counters (volatile int/float). Do not call Serial.print, malloc, or any complex functions inside the callback.</li>
            <li><strong>Channel 14 shows zero activity</strong> — Channel 14 is only legal in Japan. Most access points worldwide do not use it, so seeing zero activity there is normal.</li>
        </ul>
    `,
    challenges: `
        <ul>
            <li><strong>Add a spectrogram (waterfall display)</strong> — Instead of just the current snapshot, scroll the display vertically to show a time-based waterfall. Each horizontal line represents one scan cycle, with color intensity mapped to RSSI. This lets you see jamming events as horizontal bright bands across all channels.</li>
            <li><strong>Bluetooth monitoring</strong> — Extend the detector to also monitor Bluetooth channel energy. BLE uses 40 channels across 2.4 GHz — a jammer that blocks WiFi will also disrupt BLE. Compare WiFi and BLE measurements for confirmation.</li>
            <li><strong>SD card logging with timestamps</strong> — Add an SD card module and log every scan cycle as a CSV row: <code>uptime_ms, ch1_rssi, ch2_rssi, ..., ch14_rssi, alert_status</code>. Post-process the CSV in Python with matplotlib to generate publication-quality spectrum analysis plots.</li>
        </ul>
    `
};
