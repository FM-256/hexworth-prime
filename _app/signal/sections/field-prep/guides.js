// ============================================================================
// Signal Field Prep — Build Guides (sg-31+)
// Practical IT field skills for cybersecurity students
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-31: Build a Bootable USB Drive
    // ========================================================================
    'sg-31': {
        intro: '<p>Every IT professional needs to know how to create bootable USB drives. Whether you are installing an OS on a new machine, recovering a bricked workstation, running a live forensics toolkit, or deploying a Linux distro in the field, bootable media is your Swiss army knife.</p>' +
               '<p>This guide covers three methods: Rufus (Windows GUI, fast and simple), Ventoy (multi-boot USB with drag-and-drop ISOs), and <code>dd</code> (Linux command-line, raw and powerful). You will also learn the boot fundamentals that make it all work &mdash; BIOS vs UEFI, MBR vs GPT, and Secure Boot.</p>' +
               '<p>All you need is a USB flash drive (8GB minimum, 32GB+ recommended for multi-boot) and a computer. No special hardware.</p>' +
               '<p><strong>Software needed:</strong> <a href="../../toolkit/index.html" style="color:#ff6b35">Rufus, Ventoy, and balenaEtcher</a> &mdash; all available from the Signal Toolkit page.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

            '<defs>' +
            '<pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<linearGradient id="usb-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
            '</defs>' +
            '<rect width="720" height="440" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="420" fill="url(#bg-grid)" rx="4"/>' +

            '<!-- Title -->' +
            '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">BOOT PROCESS FLOW</text>' +

            '<!-- USB Drive shape -->' +
            '<g class="svg-component">' +
            '<rect x="40" y="60" width="180" height="90" rx="8" fill="url(#usb-grad)" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="60" width="180" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="76" width="180" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="130" y="77" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">USB DRIVE</text>' +
            '<!-- USB connector tab -->' +
            '<rect x="16" y="82" width="28" height="28" rx="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<rect x="22" y="88" width="5" height="16" rx="1" fill="#3b82f6" opacity="0.4"/>' +
            '<rect x="32" y="88" width="5" height="16" rx="1" fill="#3b82f6" opacity="0.4"/>' +
            '<!-- Partition layout inside drive -->' +
            '<rect x="52" y="100" width="40" height="38" rx="3" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="72" y="115" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">MBR</text>' +
            '<text x="72" y="127" text-anchor="middle" fill="#ef4444" font-size="5" opacity="0.7">512 bytes</text>' +
            '<rect x="98" y="100" width="50" height="38" rx="3" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="123" y="115" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">EFI/Boot</text>' +
            '<text x="123" y="127" text-anchor="middle" fill="#22c55e" font-size="5" opacity="0.7">FAT32</text>' +
            '<rect x="154" y="100" width="56" height="38" rx="3" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
            '<text x="182" y="115" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">OS Data</text>' +
            '<text x="182" y="127" text-anchor="middle" fill="#a855f7" font-size="5" opacity="0.7">NTFS/ext4</text>' +
            '</g>' +

            '<!-- Firmware block -->' +
            '<g class="svg-component">' +
            '<rect x="280" y="55" width="160" height="50" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<rect x="280" y="55" width="160" height="20" rx="8" fill="rgba(234,179,8,0.1)"/>' +
            '<rect x="280" y="68" width="160" height="7" fill="rgba(234,179,8,0.1)"/>' +
            '<text x="360" y="70" text-anchor="middle" fill="#eab308" font-size="10" font-weight="600">FIRMWARE</text>' +
            '<text x="320" y="92" text-anchor="middle" fill="#fde68a" font-size="8" opacity="0.7">BIOS</text>' +
            '<text x="360" y="92" text-anchor="middle" fill="#555" font-size="8">|</text>' +
            '<text x="400" y="92" text-anchor="middle" fill="#fde68a" font-size="8" opacity="0.7">UEFI</text>' +
            '</g>' +

            '<!-- Bootloader block -->' +
            '<g class="svg-component">' +
            '<rect x="500" y="55" width="190" height="50" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="500" y="55" width="190" height="20" rx="8" fill="rgba(34,197,94,0.1)"/>' +
            '<rect x="500" y="68" width="190" height="7" fill="rgba(34,197,94,0.1)"/>' +
            '<text x="595" y="70" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">BOOTLOADER</text>' +
            '<text x="545" y="92" text-anchor="middle" fill="#86efac" font-size="7" opacity="0.7">GRUB</text>' +
            '<text x="595" y="92" text-anchor="middle" fill="#86efac" font-size="7" opacity="0.7">Windows BM</text>' +
            '<text x="650" y="92" text-anchor="middle" fill="#86efac" font-size="7" opacity="0.7">Ventoy</text>' +
            '</g>' +

            '<!-- Flow arrows -->' +
            '<line x1="220" y1="80" x2="276" y2="80" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<polygon points="276,76 284,80 276,84" fill="#3b82f6" opacity="0.5"/>' +
            '<line x1="440" y1="80" x2="496" y2="80" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<polygon points="496,76 504,80 496,84" fill="#eab308" opacity="0.5"/>' +

            '<!-- THREE METHODS section -->' +
            '<text x="360" y="150" text-anchor="middle" fill="#444" font-size="10" letter-spacing="0.15em">THREE METHODS TO CREATE BOOTABLE USB</text>' +

            '<!-- Method 1: Rufus -->' +
            '<g class="svg-component">' +
            '<rect x="40" y="170" width="200" height="150" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="40" y="170" width="200" height="24" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<rect x="40" y="186" width="200" height="8" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="140" y="186" text-anchor="middle" fill="#fb923c" font-size="11" font-weight="600">RUFUS</text>' +
            '<text x="140" y="210" text-anchor="middle" fill="#8b949e" font-size="8">Windows GUI</text>' +
            '<text x="140" y="225" text-anchor="middle" fill="#8b949e" font-size="8">Single ISO per drive</text>' +
            '<text x="140" y="240" text-anchor="middle" fill="#8b949e" font-size="8">GPT or MBR auto-config</text>' +
            '<text x="140" y="255" text-anchor="middle" fill="#8b949e" font-size="8">Win11 TPM bypass option</text>' +
            '<!-- Speed badge -->' +
            '<rect x="95" y="270" width="90" height="18" rx="4" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
            '<text x="140" y="282" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="600">FASTEST</text>' +
            '<!-- Difficulty -->' +
            '<rect x="88" y="295" width="104" height="14" rx="3" fill="rgba(34,197,94,0.08)"/>' +
            '<text x="140" y="305" text-anchor="middle" fill="#4ade80" font-size="7">Beginner Friendly</text>' +
            '</g>' +

            '<!-- Method 2: Ventoy -->' +
            '<g class="svg-component">' +
            '<rect x="260" y="170" width="200" height="150" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="260" y="170" width="200" height="24" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<rect x="260" y="186" width="200" height="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="360" y="186" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="600">VENTOY</text>' +
            '<text x="360" y="210" text-anchor="middle" fill="#8b949e" font-size="8">Windows / Linux</text>' +
            '<text x="360" y="225" text-anchor="middle" fill="#8b949e" font-size="8">Multi-ISO drag &amp; drop</text>' +
            '<text x="360" y="240" text-anchor="middle" fill="#8b949e" font-size="8">Install once, add ISOs anytime</text>' +
            '<text x="360" y="255" text-anchor="middle" fill="#8b949e" font-size="8">Boot menu auto-generated</text>' +
            '<!-- Speed badge -->' +
            '<rect x="315" y="270" width="90" height="18" rx="4" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
            '<text x="360" y="282" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="600">MOST VERSATILE</text>' +
            '<!-- Difficulty -->' +
            '<rect x="308" y="295" width="104" height="14" rx="3" fill="rgba(34,197,94,0.08)"/>' +
            '<text x="360" y="305" text-anchor="middle" fill="#4ade80" font-size="7">Beginner Friendly</text>' +
            '</g>' +

            '<!-- Method 3: dd -->' +
            '<g class="svg-component">' +
            '<rect x="480" y="170" width="200" height="150" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="480" y="170" width="200" height="24" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="480" y="186" width="200" height="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="580" y="186" text-anchor="middle" fill="#f87171" font-size="11" font-weight="600">dd (disk destroyer)</text>' +
            '<text x="580" y="210" text-anchor="middle" fill="#8b949e" font-size="8">Linux CLI only</text>' +
            '<text x="580" y="225" text-anchor="middle" fill="#8b949e" font-size="8">Raw byte-for-byte copy</text>' +
            '<text x="580" y="240" text-anchor="middle" fill="#8b949e" font-size="8">No safety net</text>' +
            '<text x="580" y="255" text-anchor="middle" fill="#8b949e" font-size="8">Built into every Linux</text>' +
            '<!-- Speed badge -->' +
            '<rect x="535" y="270" width="90" height="18" rx="4" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="580" y="282" text-anchor="middle" fill="#f87171" font-size="7" font-weight="600">MOST POWERFUL</text>' +
            '<!-- Difficulty -->' +
            '<rect x="528" y="295" width="104" height="14" rx="3" fill="rgba(239,68,68,0.08)"/>' +
            '<text x="580" y="305" text-anchor="middle" fill="#f87171" font-size="7">Advanced \u2014 Use Caution</text>' +
            '</g>' +

            '<!-- What you need section -->' +
            '<rect x="40" y="340" width="640" height="85" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
            '<text x="60" y="360" fill="#555" font-size="9" font-weight="600" letter-spacing="0.1em">WHAT YOU NEED</text>' +

            '<!-- Items -->' +
            '<g>' +
            '<rect x="55" y="372" width="120" height="40" rx="5" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="115" y="389" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">USB Drive</text>' +
            '<text x="115" y="402" text-anchor="middle" fill="#555" font-size="6">8GB min / USB 3.0</text>' +
            '</g>' +
            '<g>' +
            '<rect x="185" y="372" width="120" height="40" rx="5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="245" y="389" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">PC or Laptop</text>' +
            '<text x="245" y="402" text-anchor="middle" fill="#555" font-size="6">Win / Linux / macOS</text>' +
            '</g>' +
            '<g>' +
            '<rect x="315" y="372" width="120" height="40" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="375" y="389" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">Internet</text>' +
            '<text x="375" y="402" text-anchor="middle" fill="#555" font-size="6">To download ISOs</text>' +
            '</g>' +
            '<g>' +
            '<rect x="445" y="372" width="225" height="40" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="558" y="389" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">ISO Files</text>' +
            '<text x="558" y="402" text-anchor="middle" fill="#555" font-size="6">Ubuntu / Win11 / Kali / Hiren\'s / Clonezilla</text>' +
            '</g>' +

            '</svg>' +
            '</div>',

        wiring: '    No wiring required — this is a software build.\n' +
                '\n' +
                '    WHAT YOU NEED:\n' +
                '    +--------------------------------------------------+\n' +
                '    |  1x USB Flash Drive (8GB minimum, USB 3.0 ideal) |\n' +
                '    |  1x PC or Laptop (Windows, Linux, or macOS)      |\n' +
                '    |  Internet connection (to download ISOs)           |\n' +
                '    +--------------------------------------------------+\n' +
                '\n' +
                '    RECOMMENDED ISOs TO DOWNLOAD:\n' +
                '    - Ubuntu Desktop LTS .......... ubuntu.com/download\n' +
                '    - Windows 10/11 ISO ........... microsoft.com/software-download\n' +
                '    - Kali Linux .................. kali.org/get-kali\n' +
                '    - Hiren\'s Boot CD PE .......... hirensbootcd.org\n' +
                '    - Clonezilla .................. clonezilla.org\n' +
                '\n' +
                '    WARNING: Creating bootable media ERASES the USB drive.\n' +
                '    Back up any data on the drive before starting.',

        wiringNotes: '<p><strong>USB 3.0 vs 2.0:</strong> USB 3.0 drives (blue connector) write 5&ndash;10x faster. A Windows 11 ISO (~5.5GB) takes ~3 minutes on USB 3.0 vs ~20 minutes on USB 2.0. Use 3.0 if you have it.</p>' +
                     '<p><strong>Drive size:</strong> 8GB is the minimum for a single OS ISO. For a Ventoy multi-boot setup, 32GB+ lets you carry Windows, Linux, Kali, recovery tools, and forensics distros all on one stick.</p>' +
                     '<p><strong>Drive quality matters:</strong> Cheap flash drives have higher failure rates. SanDisk, Samsung, and Kingston are reliable. Avoid no-name drives for production use.</p>',

        steps: [
            {
                title: 'Understand Boot Fundamentals',
                content: '<p>Before creating bootable media, understand what makes a drive bootable:</p>' +
                         '<p><strong>BIOS (Legacy)</strong> &mdash; The original firmware interface. Looks for a Master Boot Record (MBR) in the first 512 bytes of the drive. MBR supports drives up to 2TB with a maximum of 4 primary partitions. Older machines (pre-2012) typically use BIOS.</p>' +
                         '<p><strong>UEFI</strong> &mdash; The modern replacement. Uses a GUID Partition Table (GPT) and looks for an EFI System Partition (ESP) containing bootloader files. Supports drives larger than 2TB, faster boot times, and Secure Boot. Most machines manufactured after 2012 use UEFI.</p>' +
                         '<p><strong>Secure Boot</strong> &mdash; A UEFI feature that only allows signed bootloaders to run. Windows requires it. Most major Linux distros (Ubuntu, Fedora, SUSE) ship signed bootloaders and work with Secure Boot enabled. Kali and some forensics distros may require Secure Boot to be disabled.</p>' +
                         '<p><strong>CSM (Compatibility Support Module)</strong> &mdash; A UEFI setting that enables legacy BIOS boot. Enable CSM if you need to boot MBR media on a UEFI machine. Disable it for pure UEFI boot.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> Most modern tools (Rufus, Ventoy) create UEFI-compatible drives by default. Unless you are working with pre-2012 hardware, stick with GPT/UEFI.'
            },
            {
                title: 'Method 1: Rufus (Windows — Single ISO)',
                content: '<p>Rufus is the fastest and simplest tool for creating a single-ISO bootable USB on Windows. Download it from <code>rufus.ie</code> &mdash; it is portable (no install needed, ~1.5MB).</p>' +
                         '<p>Steps:</p>' +
                         '<ol>' +
                         '<li>Insert your USB drive and launch Rufus.</li>' +
                         '<li><strong>Device:</strong> Select your USB drive from the dropdown. Double-check the drive letter &mdash; Rufus will erase it.</li>' +
                         '<li><strong>Boot selection:</strong> Click SELECT and browse to your ISO file.</li>' +
                         '<li><strong>Partition scheme:</strong> Choose <strong>GPT</strong> for UEFI systems (most modern PCs) or <strong>MBR</strong> for legacy BIOS.</li>' +
                         '<li><strong>File system:</strong> Rufus auto-selects the correct filesystem (NTFS for Windows ISOs, FAT32 for Linux). Leave it unless you know you need to change it.</li>' +
                         '<li>Click <strong>START</strong>. Rufus will warn you about data loss &mdash; confirm. Wait for the progress bar to complete.</li>' +
                         '<li>When done, close Rufus and safely eject the drive.</li>' +
                         '</ol>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> For Windows 11 ISOs, Rufus offers options to bypass TPM 2.0, Secure Boot, and Microsoft account requirements. Check the boxes if you need to install Windows 11 on unsupported hardware.'
            },
            {
                title: 'Method 2: Ventoy (Multi-Boot USB)',
                content: '<p>Ventoy turns your USB drive into a multi-boot platform. Install Ventoy once, then just copy ISO files onto the drive. No re-flashing needed &mdash; drop an ISO on, boot from it. Remove it, add a different one. This is the best approach for IT field work.</p>' +
                         '<p><strong>Install Ventoy:</strong></p>' +
                         '<ol>' +
                         '<li>Download Ventoy from <a href="https://github.com/ventoy/Ventoy/releases/latest" target="_blank" rel="noopener">GitHub Releases</a> (Windows or Linux version).</li>' +
                         '<li>Extract the archive and run <code>Ventoy2Disk.exe</code> (Windows) or <code>Ventoy2Disk.sh</code> (Linux).</li>' +
                         '<li>Select your USB drive and click <strong>Install</strong>. This creates two partitions: a small Ventoy boot partition and a large exFAT data partition.</li>' +
                         '<li>Once installed, your USB drive appears as a normal storage device.</li>' +
                         '</ol>' +
                         '<p><strong>Add ISOs:</strong></p>' +
                         '<ol>' +
                         '<li>Open the USB drive in your file manager.</li>' +
                         '<li>Copy any ISO files directly onto the drive. No special tools needed &mdash; just drag and drop.</li>' +
                         '<li>Organize with folders if you want: <code>/linux/</code>, <code>/windows/</code>, <code>/tools/</code>.</li>' +
                         '</ol>' +
                         '<p><strong>Boot:</strong> Restart your computer, enter the boot menu (F12, F2, or Del depending on manufacturer), and select the USB drive. Ventoy displays a menu listing every ISO on the drive. Select one and boot.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> A 64GB Ventoy USB can hold Windows 11, Ubuntu, Kali, Clonezilla, Hiren\'s Boot CD, memtest86, and GParted simultaneously. This is your field deployment Swiss army knife.'
            },
            {
                title: 'Method 3: dd (Linux Command Line)',
                content: '<p><code>dd</code> is a low-level disk utility built into every Linux system. It writes a raw byte-for-byte copy of an ISO to the USB drive. No GUI, no safety net &mdash; powerful and dangerous if you specify the wrong drive.</p>' +
                         '<p><strong>Step 1: Identify your USB drive.</strong></p>' +
                         '<p>Run <code>lsblk</code> before and after inserting the USB to identify which device it is. It will typically be <code>/dev/sdb</code> or <code>/dev/sdc</code>. <strong>Never guess.</strong></p>' +
                         '<p><strong>Step 2: Unmount the drive</strong> if it auto-mounted.</p>' +
                         '<p><strong>Step 3: Write the ISO.</strong></p>' +
                         '<p><strong>Step 4: Sync and eject.</strong></p>',
                code: '# Step 1: Identify the USB drive\nlsblk\n# Look for your USB (e.g., sdb, 14.9G, no mountpoint after unmount)\n\n# Step 2: Unmount if auto-mounted\nsudo umount /dev/sdb1\n\n# Step 3: Write the ISO (REPLACE /dev/sdX with your actual drive)\n# WARNING: dd will destroy ALL data on the target drive.\n# Triple-check the of= parameter before pressing Enter.\nsudo dd if=ubuntu-24.04-desktop-amd64.iso of=/dev/sdb bs=4M status=progress\n\n# Step 4: Sync buffers and eject\nsync\nsudo eject /dev/sdb\n\necho "Done. USB is ready to boot."',
                language: 'Bash',
                tip: '<strong>WARNING:</strong> <code>dd</code> has no confirmation prompt. If you type <code>of=/dev/sda</code> instead of <code>of=/dev/sdb</code>, you will overwrite your system drive. The nickname "disk destroyer" is earned. Always verify with <code>lsblk</code> first.'
            },
            {
                title: 'Configure BIOS/UEFI Boot Order',
                content: '<p>Creating the bootable USB is only half the job. You also need to tell the target machine to boot from it.</p>' +
                         '<p><strong>Enter BIOS/UEFI Setup:</strong> Restart the machine and press the setup key during POST. Common keys by manufacturer:</p>' +
                         '<ul>' +
                         '<li><strong>Dell:</strong> F2 or F12</li>' +
                         '<li><strong>HP:</strong> F10 or Esc</li>' +
                         '<li><strong>Lenovo:</strong> F1, F2, or Fn+F2</li>' +
                         '<li><strong>ASUS:</strong> F2 or Del</li>' +
                         '<li><strong>Acer:</strong> F2 or Del</li>' +
                         '<li><strong>MSI:</strong> Del</li>' +
                         '<li><strong>Custom builds:</strong> Del or F2 (depends on motherboard)</li>' +
                         '</ul>' +
                         '<p><strong>One-time boot menu:</strong> Most machines have a separate key (usually F12) that shows a one-time boot device menu without entering full setup. This is faster when you just need to boot from USB once.</p>' +
                         '<p><strong>Change boot order:</strong> In BIOS/UEFI setup, navigate to the Boot tab. Move USB to the top of the boot priority list. Save and exit (usually F10).</p>' +
                         '<p><strong>Secure Boot:</strong> If your USB does not appear or fails to boot, try disabling Secure Boot in the Security tab. Re-enable it after you are done.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> If the USB drive does not appear in the boot menu, try a different USB port. Some machines only boot from USB 2.0 ports (the black ones), not USB 3.0 (blue). Front panel ports can also be unreliable for boot &mdash; use rear ports on desktops.'
            },
            {
                title: 'Build Your Field USB Toolkit',
                content: '<p>A well-prepared IT professional carries a multi-boot USB with tools for any situation. Here is a recommended Ventoy loadout:</p>' +
                         '<table style="width:100%;border-collapse:collapse;margin:12px 0">' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);text-align:left"><th style="padding:6px">ISO</th><th style="padding:6px">Purpose</th><th style="padding:6px">Size</th></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">Windows 11</td><td style="padding:6px">OS installation / repair</td><td style="padding:6px">~5.5 GB</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">Ubuntu LTS</td><td style="padding:6px">Linux install / live desktop / recovery</td><td style="padding:6px">~5 GB</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">Kali Linux</td><td style="padding:6px">Penetration testing / security auditing</td><td style="padding:6px">~4 GB</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">Hiren\'s Boot CD PE</td><td style="padding:6px">Windows recovery, password reset, diagnostics</td><td style="padding:6px">~2 GB</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">Clonezilla</td><td style="padding:6px">Disk cloning and imaging</td><td style="padding:6px">~350 MB</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">GParted Live</td><td style="padding:6px">Partition management</td><td style="padding:6px">~500 MB</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">memtest86+</td><td style="padding:6px">RAM diagnostics</td><td style="padding:6px">~20 MB</td></tr>' +
                         '<tr><td style="padding:6px">DBAN</td><td style="padding:6px">Secure drive wiping</td><td style="padding:6px">~20 MB</td></tr>' +
                         '</table>' +
                         '<p><strong>Total: ~17.5 GB</strong> &mdash; fits on a 32GB drive with room to spare.</p>' +
                         '<p>Label your USB drive clearly. Write your name and "BOOTABLE - DO NOT FORMAT" on it with a marker. In a professional environment, bootable USB drives grow legs fast.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> Keep a folder called <code>/drivers/</code> on the Ventoy data partition alongside your ISOs. Store NIC, GPU, and chipset drivers for your most common hardware. When you install a fresh OS with no network, you will thank yourself.'
            }
        ],

        testing: '<p>Verify your bootable USB works before you need it in the field:</p>' +
                 '<ul>' +
                 '<li><strong>Rufus/dd single ISO:</strong> Safely eject the drive, reinsert it. Your OS may not recognize the filesystem (that is normal for bootable drives). Restart and boot from the USB to verify.</li>' +
                 '<li><strong>Ventoy multi-boot:</strong> The drive should mount as a normal exFAT volume. Verify you can see your ISO files. Restart and boot &mdash; the Ventoy menu should list all ISOs.</li>' +
                 '<li><strong>UEFI boot:</strong> In the boot menu, you should see the USB listed as "UEFI: [drive name]". If you only see it without the UEFI prefix, you are booting in legacy/CSM mode.</li>' +
                 '<li><strong>Live environment test:</strong> Boot into a Linux live USB (Ubuntu or Kali). Open a terminal and run <code>lsblk</code> to verify you can see the host machine\'s drives. If yes, your USB is fully functional.</li>' +
                 '<li><strong>Virtual machine test:</strong> If you do not want to reboot your main machine, test in VirtualBox or VMware. Attach the USB drive as a raw disk or use the ISO directly to verify it boots.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>USB drive not appearing in boot menu:</strong> (1) Try a different port (rear USB 2.0). (2) Check BIOS that USB boot is enabled. (3) If UEFI-only mode is on, make sure the drive was formatted as GPT, not MBR.</li>' +
                         '<li><strong>"No bootable device found" after selecting USB:</strong> The ISO may not have been written correctly. Re-flash with Rufus or re-run <code>dd</code>. Verify the ISO downloaded completely (check the SHA256 hash on the download page).</li>' +
                         '<li><strong>Windows ISO boots but says "A media driver your computer needs is missing":</strong> Use a USB 2.0 port. Some Windows installers lack USB 3.0 drivers and cannot read from USB 3.0 during early setup.</li>' +
                         '<li><strong>Secure Boot violation / red screen:</strong> The ISO is not signed for Secure Boot. Disable Secure Boot in UEFI settings, install the OS, then re-enable it.</li>' +
                         '<li><strong>dd wrote successfully but drive will not boot:</strong> Make sure you wrote to the raw device (<code>/dev/sdb</code>) not a partition (<code>/dev/sdb1</code>). Also run <code>sync</code> before ejecting to flush write buffers.</li>' +
                         '<li><strong>Ventoy shows menu but ISO fails to boot:</strong> The ISO may be corrupted. Re-download and verify the checksum. Some niche ISOs are not Ventoy-compatible &mdash; check the <a href="https://github.com/ventoy/Ventoy" target="_blank" rel="noopener">Ventoy GitHub repo</a> for compatibility notes.</li>' +
                         '<li><strong>USB drive shows wrong size after flashing:</strong> Rufus/dd overwrites the partition table. Use Disk Management (Windows) or <code>fdisk</code> (Linux) to delete all partitions and recreate a single exFAT partition to restore full capacity.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Persistence Mode</strong> &mdash; Create a bootable Ubuntu USB with persistent storage so changes survive reboots. Rufus has a "Persistent partition size" slider. Set it to 4GB+, boot, install a tool, reboot, and verify the tool is still installed.</p>' +
                    '<p><strong>Challenge 2: Unattended Windows Install</strong> &mdash; Create a <code>autounattend.xml</code> answer file and place it on a Windows bootable USB. The installer should auto-configure language, time zone, partitioning, and user account without any prompts. Microsoft\'s System Image Manager (SIM) can generate the XML.</p>' +
                    '<p><strong>Challenge 3: PXE Boot Server</strong> &mdash; Instead of USB, set up a PXE network boot server on a Linux machine using <code>dnsmasq</code> and <code>tftp</code>. Serve an Ubuntu installer over the network. This is how enterprise IT deploys hundreds of machines without touching a single USB drive.</p>'
    },

    // ========================================================================
    // SG-32: Build a USB Flash Drive from Scratch
    // ========================================================================
    'sg-32': {
        intro: '<p>You have used USB flash drives your entire life. But what actually IS one? A USB controller chip, a NAND flash memory chip, a tiny PCB, a connector, and a handful of passive components. That is it. In this project, you build a working USB storage device from individual parts &mdash; no pre-made flash drive involved.</p>' +
               '<p>We use a Raspberry Pi Pico (RP2040 microcontroller) as the USB controller, a MicroSD card as the storage medium, and the TinyUSB library to implement the USB Mass Storage Class protocol. When you plug the finished device into any computer, it appears as a standard USB drive. You can format it, copy files to it, and eject it &mdash; just like any store-bought flash drive.</p>' +
               '<p>Along the way, you will learn how USB enumeration works, what device descriptors are, how SPI communication connects the controller to storage, and why a $4 microcontroller can replace a dedicated flash drive controller IC.</p>' +
               '<p><strong>Hardware needed:</strong> Raspberry Pi Pico (or RP2040-Zero), MicroSD breakout board, MicroSD card, jumper wires, breadboard, and a USB cable. Total cost: ~$12.</p>',

        wiringSvg: '<div class="svg-build-wrap" id="sg32-build">' +
            '<div class="svg-build-controls">' +
            '<button class="svg-build-btn" data-state="idle">Build Circuit</button>' +
            '<button class="svg-build-btn svg-flow-btn" data-state="idle" style="display:none">Show Data Flow</button>' +
            '<span class="svg-build-step"></span>' +
            '</div>' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +

            '<defs>' +
            '<pattern id="bg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<circle id="spi-dot" r="3"/>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#bg-grid)" rx="4"/>' +

            '<!-- Breadboard base -->' +
            '<rect x="60" y="60" width="600" height="220" rx="6" fill="#1a1f2b" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>' +
            '<text x="360" y="45" text-anchor="middle" fill="#444" font-size="10" letter-spacing="0.15em">BREADBOARD LAYOUT</text>' +

            '<!-- Pico board -->' +
            '<g class="svg-component">' +
            '<rect x="90" y="100" width="140" height="160" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="90" y="100" width="140" height="28" rx="8" fill="rgba(59,130,246,0.15)"/>' +
            '<rect x="90" y="120" width="140" height="8" fill="rgba(59,130,246,0.15)"/>' +
            '<text x="160" y="117" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="600">RP2040 Pico</text>' +
            '<rect x="140" y="88" width="40" height="16" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="160" y="99" text-anchor="middle" fill="#666" font-size="7">USB</text>' +
            '<!-- Component callouts -->' +
            '<rect x="105" y="138" width="44" height="22" rx="3" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="127" y="152" text-anchor="middle" fill="#4488cc" font-size="6.5">RP2040</text>' +
            '<rect x="105" y="165" width="44" height="14" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="127" y="175" text-anchor="middle" fill="#555" font-size="5.5">133MHz</text>' +
            '<circle cx="175" cy="250" r="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
            '<text x="175" y="252" text-anchor="middle" fill="#555" font-size="4">12MHz</text>' +
            '</g>' +

            '<!-- Pico pins with tooltips -->' +
            '<g class="svg-pin-group" data-tip="3.3V regulated output — powers the SD card"><circle cx="232" cy="148" r="4" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/><text x="218" y="148" text-anchor="end" fill="#8b949e" font-size="9" dominant-baseline="middle">3V3</text></g>' +
            '<g class="svg-pin-group" data-tip="Ground — common reference for both boards"><circle cx="232" cy="172" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="218" y="172" text-anchor="end" fill="#8b949e" font-size="9" dominant-baseline="middle">GND</text></g>' +
            '<g class="svg-pin-group" data-tip="SPI0 Clock — Pico sets the data transfer speed"><circle cx="232" cy="196" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/><text x="218" y="196" text-anchor="end" fill="#8b949e" font-size="9" dominant-baseline="middle">GP18</text></g>' +
            '<g class="svg-pin-group" data-tip="SPI0 MOSI — data flows FROM Pico TO SD card"><circle cx="232" cy="220" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="218" y="220" text-anchor="end" fill="#8b949e" font-size="9" dominant-baseline="middle">GP19</text></g>' +
            '<g class="svg-pin-group" data-tip="SPI0 MISO — data flows FROM SD card TO Pico"><circle cx="232" cy="244" r="4" fill="#3b82f6" stroke="#93c5fd" stroke-width="0.5"/><text x="218" y="244" text-anchor="end" fill="#8b949e" font-size="9" dominant-baseline="middle">GP16</text></g>' +
            '<g class="svg-pin-group" data-tip="SPI0 Chip Select — tells SD card it is being addressed"><circle cx="232" cy="268" r="4" fill="#f97316" stroke="#fdba74" stroke-width="0.5"/><text x="218" y="268" text-anchor="end" fill="#8b949e" font-size="9" dominant-baseline="middle">GP17</text></g>' +

            '<!-- SD Breakout board -->' +
            '<g class="svg-component">' +
            '<rect x="490" y="100" width="140" height="160" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="490" y="100" width="140" height="28" rx="8" fill="rgba(249,115,22,0.15)"/>' +
            '<rect x="490" y="120" width="140" height="8" fill="rgba(249,115,22,0.15)"/>' +
            '<text x="560" y="117" text-anchor="middle" fill="#fb923c" font-size="11" font-weight="600">MicroSD Breakout</text>' +
            '<rect x="520" y="228" width="55" height="28" rx="3" fill="#2a2a3a" stroke="#555" stroke-width="1"/>' +
            '<text x="548" y="245" text-anchor="middle" fill="#666" font-size="7">SD CARD</text>' +
            '<!-- Component callouts -->' +
            '<rect x="505" y="138" width="54" height="14" rx="2" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
            '<text x="532" y="148" text-anchor="middle" fill="#b8702a" font-size="6">Level Shifter</text>' +
            '<rect x="505" y="156" width="54" height="14" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
            '<text x="532" y="166" text-anchor="middle" fill="#555" font-size="5.5">3.3V SPI</text>' +
            '</g>' +

            '<!-- SD Breakout pins with tooltips -->' +
            '<g class="svg-pin-group" data-tip="Voltage in — receives 3.3V power from the Pico"><circle cx="488" cy="148" r="4" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/><text x="502" y="148" fill="#8b949e" font-size="9" dominant-baseline="middle">VCC</text></g>' +
            '<g class="svg-pin-group" data-tip="Ground — return path for current"><circle cx="488" cy="172" r="4" fill="#333" stroke="#888" stroke-width="0.5"/><text x="502" y="172" fill="#8b949e" font-size="9" dominant-baseline="middle">GND</text></g>' +
            '<g class="svg-pin-group" data-tip="Serial Clock — receives clock signal from Pico"><circle cx="488" cy="196" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/><text x="502" y="196" fill="#8b949e" font-size="9" dominant-baseline="middle">SCK</text></g>' +
            '<g class="svg-pin-group" data-tip="Master Out Slave In — receives write data from Pico"><circle cx="488" cy="220" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/><text x="502" y="220" fill="#8b949e" font-size="9" dominant-baseline="middle">MOSI</text></g>' +
            '<g class="svg-pin-group" data-tip="Master In Slave Out — sends read data to Pico"><circle cx="488" cy="244" r="4" fill="#3b82f6" stroke="#93c5fd" stroke-width="0.5"/><text x="502" y="244" fill="#8b949e" font-size="9" dominant-baseline="middle">MISO</text></g>' +
            '<g class="svg-pin-group" data-tip="Chip Select — goes LOW when Pico selects this device"><circle cx="488" cy="268" r="4" fill="#f97316" stroke="#fdba74" stroke-width="0.5"/><text x="502" y="268" fill="#8b949e" font-size="9" dominant-baseline="middle">CS</text></g>' +

            '<!-- Wire groups: each wire + its label, hidden by default -->' +
            '<g class="svg-wire-group" data-wire="1" style="opacity:0">' +
            '<line class="svg-wire" x1="236" y1="148" x2="236" y2="148" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="335" y="139" width="50" height="16" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5" opacity="0"/>' +
            '<text x="360" y="150" text-anchor="middle" fill="#fca5a5" font-size="8" dominant-baseline="middle" opacity="0">3V3</text>' +
            '</g>' +

            '<g class="svg-wire-group" data-wire="2" style="opacity:0">' +
            '<line class="svg-wire" x1="236" y1="172" x2="236" y2="172" stroke="#666" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="335" y="163" width="50" height="16" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(136,136,136,0.3)" stroke-width="0.5" opacity="0"/>' +
            '<text x="360" y="174" text-anchor="middle" fill="#aaa" font-size="8" dominant-baseline="middle" opacity="0">GND</text>' +
            '</g>' +

            '<g class="svg-wire-group" data-wire="3" style="opacity:0">' +
            '<line class="svg-wire" x1="236" y1="196" x2="236" y2="196" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="335" y="187" width="50" height="16" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5" opacity="0"/>' +
            '<text x="360" y="198" text-anchor="middle" fill="#fde68a" font-size="8" dominant-baseline="middle" opacity="0">SCK</text>' +
            '</g>' +

            '<g class="svg-wire-group" data-wire="4" style="opacity:0">' +
            '<line class="svg-wire" x1="236" y1="220" x2="236" y2="220" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="335" y="211" width="50" height="16" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5" opacity="0"/>' +
            '<text x="360" y="222" text-anchor="middle" fill="#86efac" font-size="8" dominant-baseline="middle" opacity="0">MOSI</text>' +
            '</g>' +

            '<g class="svg-wire-group" data-wire="5" style="opacity:0">' +
            '<line class="svg-wire" x1="236" y1="244" x2="236" y2="244" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="335" y="235" width="50" height="16" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5" opacity="0"/>' +
            '<text x="360" y="246" text-anchor="middle" fill="#93c5fd" font-size="8" dominant-baseline="middle" opacity="0">MISO</text>' +
            '</g>' +

            '<g class="svg-wire-group" data-wire="6" style="opacity:0">' +
            '<line class="svg-wire" x1="236" y1="268" x2="236" y2="268" stroke="#f97316" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="335" y="259" width="50" height="16" rx="3" fill="rgba(0,0,0,0.8)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5" opacity="0"/>' +
            '<text x="360" y="270" text-anchor="middle" fill="#fdba74" font-size="8" dominant-baseline="middle" opacity="0">CS</text>' +
            '</g>' +

            '<!-- SPI bus label (shown at end) -->' +
            '<g class="svg-wire-group" data-wire="done" style="opacity:0">' +
            '<rect x="290" y="300" width="140" height="22" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
            '<text x="360" y="314" text-anchor="middle" fill="#555" font-size="9" dominant-baseline="middle">SPI0 Bus \u2014 6 wires</text>' +
            '</g>' +

            '<!-- Legend -->' +
            '<g transform="translate(60,335)">' +
            '<text fill="#555" font-size="8" y="8">WIRE COLORS:</text>' +
            '<circle cx="82" cy="5" r="3" fill="#ef4444"/><text fill="#8b949e" font-size="7" x="88" y="8">Power</text>' +
            '<circle cx="120" cy="5" r="3" fill="#555"/><text fill="#8b949e" font-size="7" x="126" y="8">Ground</text>' +
            '<circle cx="166" cy="5" r="3" fill="#eab308"/><text fill="#8b949e" font-size="7" x="172" y="8">Clock</text>' +
            '<circle cx="202" cy="5" r="3" fill="#22c55e"/><text fill="#8b949e" font-size="7" x="208" y="8">MOSI</text>' +
            '<circle cx="240" cy="5" r="3" fill="#3b82f6"/><text fill="#8b949e" font-size="7" x="246" y="8">MISO</text>' +
            '<circle cx="278" cy="5" r="3" fill="#f97316"/><text fill="#8b949e" font-size="7" x="284" y="8">CS</text>' +
            '</g>' +

            '<!-- USB cable indicator -->' +
            '<g transform="translate(110,80)">' +
            '<line x1="0" y1="8" x2="50" y2="8" stroke="#555" stroke-width="1" stroke-dasharray="3,3"/>' +
            '<text x="-4" y="11" text-anchor="end" fill="#555" font-size="7">To PC</text>' +
            '</g>' +

            '</svg>' +
            '</div>',

        wiring: '    RP2040 Pico / RP2040-Zero          MicroSD Breakout\n' +
                '    ========================          =================\n' +
                '\n' +
                '           3V3 (OUT) o────────────────o VCC\n' +
                '                GND o────────────────o GND\n' +
                '        GP18 (SCK) o────────────────o SCK  (Clock)\n' +
                '       GP19 (MOSI) o────────────────o MOSI (Data In)\n' +
                '       GP16 (MISO) o────────────────o MISO (Data Out)\n' +
                '         GP17 (CS) o────────────────o CS   (Chip Select)\n' +
                '\n' +
                '    +--------------------------------------------------+\n' +
                '    |  SPI0 Bus — 4 data wires + power + ground        |\n' +
                '    |  Total connections: 6 jumper wires               |\n' +
                '    +--------------------------------------------------+\n' +
                '\n' +
                '    BREADBOARD LAYOUT:\n' +
                '    +================================================+\n' +
                '    |                                                  |\n' +
                '    |   [Pico]                     [SD Breakout]      |\n' +
                '    |   ======                     =============      |\n' +
                '    |   3V3  ─── red wire ───────── VCC               |\n' +
                '    |   GND  ─── black wire ─────── GND               |\n' +
                '    |   GP18 ─── yellow wire ────── SCK               |\n' +
                '    |   GP19 ─── green wire ─────── MOSI              |\n' +
                '    |   GP16 ─── blue wire ──────── MISO              |\n' +
                '    |   GP17 ─── orange wire ────── CS                |\n' +
                '    |                                                  |\n' +
                '    +================================================+\n' +
                '\n' +
                '    USB cable connects Pico to your computer.\n' +
                '    The computer sees the Pico as a USB drive.\n' +
                '    The Pico reads/writes the SD card over SPI.',

        wiringNotes: '<p><strong>SPI (Serial Peripheral Interface):</strong> A 4-wire protocol used by microcontrollers to talk to peripherals. SCK is the clock (the Pico sets the tempo), MOSI carries data from Pico to SD card, MISO carries data back, and CS (Chip Select) tells the SD card "I am talking to you." This is the same protocol used inside commercial USB drives between the controller and NAND flash &mdash; we are just using breakout boards so you can see every wire.</p>' +
                     '<p><strong>Why GP16-19?</strong> These are the default SPI0 pins on the RP2040. You can remap SPI to other pins, but these are the path of least resistance for the firmware we are using.</p>' +
                     '<p><strong>Power:</strong> The 3V3 pin on the Pico provides regulated 3.3V output &mdash; exactly what the SD card needs. Do NOT use VBUS (5V) &mdash; it will damage the SD card.</p>',

        steps: [
            {
                title: 'Anatomy of a USB Flash Drive',
                content: '<p>Before building one, take apart a cheap flash drive (or look at a teardown photo). Every USB flash drive has these components:</p>' +
                         '<ul>' +
                         '<li><strong>USB Connector:</strong> The male USB-A (or USB-C) plug. In cheap drives, this is just copper traces on the PCB shaped to USB-A dimensions &mdash; no separate connector part at all.</li>' +
                         '<li><strong>Controller IC:</strong> The brain. Handles USB protocol negotiation, translates read/write commands into NAND flash operations, manages wear leveling (spreading writes across cells to prevent premature failure), and handles error correction. Common chips: Silicon Motion SM3257EN, Phison PS2251, Innostor IS903.</li>' +
                         '<li><strong>NAND Flash Memory:</strong> The actual storage. A grid of floating-gate transistors that trap electrons to represent 0s and 1s. Comes in SLC (1 bit/cell, fast, expensive), MLC (2 bits), TLC (3 bits), and QLC (4 bits, cheap, slower). Most consumer drives use TLC or QLC.</li>' +
                         '<li><strong>Crystal Oscillator:</strong> A tiny 12MHz crystal that provides the clock signal for the controller. Without a stable clock, USB timing fails.</li>' +
                         '<li><strong>Passive Components:</strong> Decoupling capacitors (smooth out power), pull-up resistors on USB data lines (signal the host that a device is connected), and an optional LED with current-limiting resistor.</li>' +
                         '<li><strong>PCB:</strong> A 2-layer or 4-layer board, typically smaller than a postage stamp. High-speed USB 3.0 drives need controlled-impedance traces and ground planes.</li>' +
                         '</ul>' +
                         '<p>In our build, the <strong>Pico is the controller</strong>, the <strong>SD card is the NAND flash</strong>, and the <strong>USB cable is the connector</strong>. Same architecture, just spread across a breadboard so you can see every piece.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> If you have a dead USB drive, crack it open. Most use a plastic snap-fit case. Inside you will see a PCB with two main chips (controller + NAND), a crystal, and a few capacitors. That is the entire device.'
            },
            {
                title: 'Gather Your Parts',
                content: '<p>Everything you need, where to get it, and what it costs:</p>' +
                         '<table style="width:100%;border-collapse:collapse;margin:12px 0">' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);text-align:left"><th style="padding:6px">Part</th><th style="padding:6px">Purpose</th><th style="padding:6px">Cost</th></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">Raspberry Pi Pico</td><td style="padding:6px">USB controller (RP2040 chip)</td><td style="padding:6px">$4</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">MicroSD Breakout Board</td><td style="padding:6px">Connects SD card via SPI pins</td><td style="padding:6px">$1-3</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">MicroSD Card (any size)</td><td style="padding:6px">The storage medium</td><td style="padding:6px">$3-8</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">Jumper Wires (M-M, 6x)</td><td style="padding:6px">SPI bus connections</td><td style="padding:6px">$1</td></tr>' +
                         '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)"><td style="padding:6px">Half-size Breadboard</td><td style="padding:6px">No-solder prototyping</td><td style="padding:6px">$2</td></tr>' +
                         '<tr><td style="padding:6px">USB Micro-B or C Cable</td><td style="padding:6px">Connects Pico to host PC</td><td style="padding:6px">$0 (you have one)</td></tr>' +
                         '</table>' +
                         '<p><strong>Total: ~$12.</strong> If you already have a breadboard and jumper wires from a starter kit, it is closer to $8.</p>' +
                         '<p><strong>Alternative:</strong> The RP2040-Zero is a tiny $2 board with the same chip and castellated pads. Smaller footprint but requires header soldering. The Pico is easier for beginners because it has pre-soldered headers available.</p>' +
                         '<p><strong>Where to buy:</strong> Adafruit, SparkFun, Amazon, AliExpress, or your local Micro Center. The Pico is also available directly from the <a href="https://www.raspberrypi.com/products/raspberry-pi-pico/" target="_blank" rel="noopener">Raspberry Pi Foundation</a>.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> If you have an ELEGOO or similar Arduino starter kit, it likely includes a breadboard, jumper wires, and an SD card module. The SD module from those kits works here &mdash; just make sure it has an SPI interface (SCK, MOSI, MISO, CS pins).'
            },
            {
                title: 'Wire the Circuit',
                content: '<p>This is a 6-wire build. No soldering required.</p>' +
                         '<ol>' +
                         '<li><strong>Insert the Pico into the breadboard.</strong> Place it so the USB port hangs off one end of the board. The pin labels are printed on the bottom of the Pico.</li>' +
                         '<li><strong>Insert the MicroSD breakout</strong> on the other side of the breadboard. Leave space between the two boards so wires do not cross.</li>' +
                         '<li><strong>Connect power first:</strong> Run a red jumper from Pico <code>3V3(OUT)</code> to the breakout <code>VCC</code>. Run a black jumper from Pico <code>GND</code> to breakout <code>GND</code>.</li>' +
                         '<li><strong>Connect the SPI data lines:</strong>' +
                         '<ul>' +
                         '<li>Pico <code>GP18</code> to breakout <code>SCK</code> (clock)</li>' +
                         '<li>Pico <code>GP19</code> to breakout <code>MOSI</code> (data to card)</li>' +
                         '<li>Pico <code>GP16</code> to breakout <code>MISO</code> (data from card)</li>' +
                         '<li>Pico <code>GP17</code> to breakout <code>CS</code> (chip select)</li>' +
                         '</ul></li>' +
                         '<li><strong>Insert the MicroSD card</strong> into the breakout board. It clicks in.</li>' +
                         '<li><strong>Double-check every wire.</strong> Wrong power connections can kill the SD card or the Pico. 3V3 to VCC, GND to GND. Verify before connecting USB.</li>' +
                         '</ol>' +
                         '<p>That is the hardware. Six wires and two boards on a breadboard. The SD card breakout handles level shifting and pull-up resistors internally.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> Color-code your wires. Red = power, black = ground, yellow = clock, green = MOSI, blue = MISO, orange = CS. This makes debugging trivial &mdash; you can trace any signal by color.'
            },
            {
                title: 'Install the Development Environment',
                content: '<p>We need to compile C firmware for the RP2040. Two approaches:</p>' +
                         '<p><strong>Option A: Arduino IDE (Easier)</strong></p>' +
                         '<ol>' +
                         '<li>Install <a href="https://www.arduino.cc/en/software" target="_blank" rel="noopener">Arduino IDE 2.x</a></li>' +
                         '<li>Go to <strong>File &rarr; Preferences</strong>. In "Additional Board Manager URLs", add:<br><code>https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json</code></li>' +
                         '<li>Go to <strong>Tools &rarr; Board &rarr; Boards Manager</strong>. Search "pico" and install <strong>Raspberry Pi Pico/RP2040</strong> by Earle Philhower.</li>' +
                         '<li>Go to <strong>Tools &rarr; Board</strong> and select <strong>Raspberry Pi Pico</strong>.</li>' +
                         '<li>Go to <strong>Tools &rarr; USB Stack</strong> and select <strong>Adafruit TinyUSB</strong>. This is critical &mdash; TinyUSB handles the USB Mass Storage protocol.</li>' +
                         '</ol>' +
                         '<p><strong>Option B: Pico SDK + CMake (Advanced)</strong></p>' +
                         '<ol>' +
                         '<li>Follow the official <a href="https://github.com/raspberrypi/pico-sdk" target="_blank" rel="noopener">Pico SDK setup guide</a> for your OS.</li>' +
                         '<li>Clone the TinyUSB examples: <code>git clone https://github.com/hathach/tinyusb.git</code></li>' +
                         '<li>Build the <code>msc_dual_lun</code> example targeting the Pico.</li>' +
                         '</ol>' +
                         '<p>We will use <strong>Option A</strong> for this guide. It gets you compiling in 5 minutes.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> If the Arduino IDE does not detect your Pico, hold the BOOTSEL button on the Pico while plugging it in. It will appear as a removable drive called "RPI-RP2". This is the bootloader mode &mdash; the IDE can flash firmware to it in this state.'
            },
            {
                title: 'Flash the USB Mass Storage Firmware',
                content: '<p>This is where the Pico becomes a USB drive. The firmware tells the Pico: "When a computer asks what you are, say you are a USB Mass Storage device. When it asks to read block N, read it from the SD card over SPI. When it asks to write block N, write it to the SD card."</p>' +
                         '<p>Create a new sketch in Arduino IDE and paste the code below. This uses the Adafruit TinyUSB library and the built-in SPI SD card library.</p>' +
                         '<p><strong>What the code does:</strong></p>' +
                         '<ul>' +
                         '<li>Initializes SPI communication on GP16-19</li>' +
                         '<li>Mounts the SD card and reads its capacity</li>' +
                         '<li>Registers as a USB Mass Storage Class device with TinyUSB</li>' +
                         '<li>Implements the three MSC callbacks: <code>capacity</code> (report size), <code>read10</code> (read blocks), <code>write10</code> (write blocks)</li>' +
                         '<li>Blinks the onboard LED on read/write activity</li>' +
                         '</ul>' +
                         '<p>Click <strong>Upload</strong>. The Arduino IDE compiles and flashes the Pico. After upload, the Pico disconnects and reconnects &mdash; this time as a USB storage device.</p>',
                code: '#include "SPI.h"\n#include "SdFat.h"\n#include "Adafruit_TinyUSB.h"\n\n// ----- Pin Definitions (SPI0) -----\n#define SD_CS    17   // Chip Select\n#define SD_SCK   18   // Clock\n#define SD_MOSI  19   // Data to card\n#define SD_MISO  16   // Data from card\n\n// ----- USB Mass Storage -----\nAdafruit_USBD_MSC usb_msc;\n\n// ----- SD Card -----\nSdFat sd;\nSdFile root;\nbool sd_ready = false;\n\n// MSC callbacks — TinyUSB calls these when the host reads/writes\nint32_t msc_read_cb(uint32_t lba, void* buffer, uint32_t bufsize) {\n    return sd.card()->readSectors(lba, (uint8_t*)buffer, bufsize / 512)\n        ? bufsize : -1;\n}\n\nint32_t msc_write_cb(uint32_t lba, uint8_t* buffer, uint32_t bufsize) {\n    return sd.card()->writeSectors(lba, buffer, bufsize / 512)\n        ? bufsize : -1;\n}\n\nvoid msc_flush_cb(void) {\n    sd.card()->syncDevice();\n}\n\nvoid setup() {\n    // LED for activity indicator\n    pinMode(LED_BUILTIN, OUTPUT);\n    digitalWrite(LED_BUILTIN, LOW);\n\n    // Initialize SPI with our pin mapping\n    SPI.setRX(SD_MISO);\n    SPI.setTX(SD_MOSI);\n    SPI.setSCK(SD_SCK);\n\n    // Initialize SD card\n    sd_ready = sd.begin(SD_CS, SD_SCK_MHZ(25));\n\n    if (sd_ready) {\n        uint32_t block_count = sd.card()->sectorCount();\n\n        // Configure USB Mass Storage\n        usb_msc.setID("Pico", "SD Card Drive", "1.0");\n        usb_msc.setCapacity(block_count, 512);\n        usb_msc.setReadWriteCallback(msc_read_cb, msc_write_cb, msc_flush_cb);\n        usb_msc.setUnitReady(true);\n        usb_msc.begin();\n\n        // LED on = ready\n        digitalWrite(LED_BUILTIN, HIGH);\n    }\n}\n\nvoid loop() {\n    // Nothing here — all work happens in USB callbacks\n}',
                language: 'C++',
                tip: '<strong>Tip:</strong> If compilation fails with "Adafruit_TinyUSB.h: No such file", make sure you selected "Adafruit TinyUSB" under Tools &rarr; USB Stack. The library is bundled with the Earle Philhower board package but only activates when you select that USB stack.'
            },
            {
                title: 'Test Your USB Drive',
                content: '<p>After uploading, the Pico resets and re-enumerates on USB. Within a few seconds, your operating system should detect a new removable drive.</p>' +
                         '<p><strong>Windows:</strong> A new drive letter appears in File Explorer. If the SD card was not previously formatted, Windows will prompt "You need to format the disk in drive X: before you can use it." Click Format, select FAT32 or exFAT, and format it.</p>' +
                         '<p><strong>Linux:</strong> Run <code>lsblk</code> &mdash; you will see a new <code>/dev/sdX</code> device with the SD card\'s capacity. Mount it or let your desktop environment auto-mount.</p>' +
                         '<p><strong>macOS:</strong> The drive appears on the desktop and in Finder. Same behavior as any USB stick.</p>' +
                         '<p><strong>Verify read/write:</strong></p>' +
                         '<ol>' +
                         '<li>Copy a file to the drive (a photo, a text file, anything).</li>' +
                         '<li>Safely eject the drive.</li>' +
                         '<li>Unplug the USB cable, wait 3 seconds, plug it back in.</li>' +
                         '<li>Open the drive and verify the file is still there.</li>' +
                         '</ol>' +
                         '<p>If the file survived a power cycle, congratulations &mdash; you built a USB flash drive.</p>',
                code: '# Linux verification\nlsblk\n# Look for your Pico drive — shows as "Pico SD Card Drive"\n\n# Check USB device descriptor\nlsusb\n# Should show: "Pico SD Card Drive" or similar\n\n# Mount and test\nsudo mount /dev/sdX1 /mnt\necho "Hello from my DIY USB drive" > /mnt/test.txt\ncat /mnt/test.txt\nsudo umount /mnt\n\n# Verify after re-plug\nsudo mount /dev/sdX1 /mnt\ncat /mnt/test.txt   # Should still say "Hello from my DIY USB drive"',
                language: 'Bash',
                tip: '<strong>Tip:</strong> The onboard LED should be solid ON when the drive is ready. If it stays OFF, the SD card failed to initialize. Check wiring (especially CS on GP17) and make sure the SD card is not locked (the tiny switch on the side of a full-size SD adapter).'
            },
            {
                title: 'Understand What Just Happened',
                content: '<p>You built a working USB storage device. Here is what happens when you plug it in, layer by layer:</p>' +
                         '<ol>' +
                         '<li><strong>Physical Layer:</strong> The USB cable carries 4 wires &mdash; VBUS (+5V power), D+ (data), D- (data), and GND. The Pico draws power from VBUS and communicates on D+/D-.</li>' +
                         '<li><strong>USB Enumeration:</strong> The host PC detects a new device on the bus. It sends a <code>GET_DESCRIPTOR</code> request. The Pico (via TinyUSB) responds with a Device Descriptor that says: "I am a USB device, class 0x08 (Mass Storage), subclass 0x06 (SCSI), protocol 0x50 (Bulk-Only Transport)."</li>' +
                         '<li><strong>Driver Binding:</strong> The OS sees class 0x08 and loads its built-in USB Mass Storage driver. No custom drivers needed &mdash; every OS has this driver built in since the 1990s.</li>' +
                         '<li><strong>SCSI Commands:</strong> The OS sends SCSI commands over USB. <code>READ CAPACITY</code> asks how big the drive is. <code>READ(10)</code> reads 512-byte blocks. <code>WRITE(10)</code> writes them. These are the same commands used by hard drives, SSDs, and every other block storage device.</li>' +
                         '<li><strong>SPI Translation:</strong> When the Pico receives a <code>READ(10)</code> for block N, our firmware calls <code>sd.card()->readSectors(N, buffer, count)</code>. The SdFat library translates this into SPI commands: assert CS, send CMD17 (READ_SINGLE_BLOCK), clock out the data on MISO, deassert CS. The data flows from SD card through the Pico to the host.</li>' +
                         '<li><strong>Filesystem:</strong> The OS reads the FAT32/exFAT partition table and file allocation table from the SD card (via this whole chain) and presents it as a normal drive with files and folders.</li>' +
                         '</ol>' +
                         '<p>A commercial USB flash drive does exactly the same thing &mdash; but with a dedicated controller ASIC instead of an RP2040, NAND flash chips instead of an SD card, and the entire circuit miniaturized onto a PCB the size of your thumbnail.</p>',
                code: null,
                language: null,
                tip: '<strong>Key Insight:</strong> USB is a layered protocol, just like the OSI networking model. Physical (wires) &rarr; USB (enumeration, descriptors) &rarr; SCSI (block read/write) &rarr; Filesystem (FAT32). Each layer has no idea what is above or below it. That is why your DIY Pico drive works identically to a $5 flash drive from the store &mdash; it speaks the same protocols.'
            },
            {
                title: 'Why This Matters for Cybersecurity',
                content: '<p>Understanding USB at the hardware level is not just an electronics exercise. It is directly relevant to security:</p>' +
                         '<ul>' +
                         '<li><strong>BadUSB / Rubber Ducky attacks:</strong> Malicious USB devices that identify as keyboards (HID class 0x03) instead of storage (class 0x08). They type commands at superhuman speed. Now that you understand USB device descriptors, you know exactly how this works &mdash; the device lies in its descriptor.</li>' +
                         '<li><strong>USB forensics:</strong> When examining a suspect USB device, you need to understand what the controller is doing. Is it hiding sectors? Does the reported capacity match the actual NAND size? Is there a hidden partition?</li>' +
                         '<li><strong>Hardware implants:</strong> Tiny devices that look like normal cables or adapters but contain microcontrollers (like the O.MG Cable). Same architecture as what you just built &mdash; a microcontroller pretending to be something it is not.</li>' +
                         '<li><strong>USB device policy:</strong> Enterprise environments use USB device whitelisting. Understanding device descriptors (VID/PID, device class, serial number) lets you write and audit these policies.</li>' +
                         '<li><strong>Data destruction verification:</strong> When you wipe a USB drive, how do you know the controller is not hiding data in reserved blocks? Understanding wear leveling and the controller-NAND relationship tells you why "secure erase" on flash is harder than on spinning disks.</li>' +
                         '</ul>',
                code: null,
                language: null,
                tip: '<strong>Think about it:</strong> You just proved that a $4 microcontroller can impersonate any USB device class. A keyboard, a network adapter, a webcam &mdash; all it takes is changing the device descriptor. This is why USB ports are an attack surface, and why organizations disable USB ports or deploy endpoint protection.'
            }
        ],

        testing: '<p>Verify your build works correctly:</p>' +
                 '<ul>' +
                 '<li><strong>Drive appears in OS:</strong> Plug in the Pico. Within 5 seconds, a new removable drive should appear. If not, check wiring and re-flash the firmware.</li>' +
                 '<li><strong>Format succeeds:</strong> Format the drive as FAT32 from your OS. This proves the write path works end-to-end (host &rarr; USB &rarr; Pico &rarr; SPI &rarr; SD card).</li>' +
                 '<li><strong>Read/write test:</strong> Copy a 10MB file to the drive. Eject, unplug, re-plug, and verify the file is intact and readable. Compare checksums: <code>sha256sum original.file</code> vs <code>sha256sum /mnt/drive/original.file</code>.</li>' +
                 '<li><strong>Multiple OS test:</strong> Plug into a Windows machine, then a Linux machine, then a Mac. It should be recognized on all three without any driver installation.</li>' +
                 '<li><strong>Speed test (Linux):</strong> <code>dd if=/dev/zero of=/mnt/drive/testfile bs=1M count=10</code> to measure write speed. Expect 200-400 KB/s over SPI (much slower than a commercial USB 2.0 drive, which uses a parallel interface to NAND).</li>' +
                 '<li><strong>LED activity:</strong> The onboard LED should be ON when the drive is ready. During heavy read/write, you can add LED blink code in the callbacks to visualize activity.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Drive does not appear at all:</strong> (1) Hold BOOTSEL and re-plug to enter bootloader mode &mdash; re-upload the sketch. (2) Make sure "Adafruit TinyUSB" is selected under Tools &rarr; USB Stack. (3) Try a different USB cable &mdash; some cables are charge-only with no data lines.</li>' +
                         '<li><strong>Drive appears but shows 0 bytes / cannot format:</strong> The SD card failed to initialize. Check that VCC is connected to 3V3 (not VBUS/5V). Verify CS is on GP17. Try a different SD card &mdash; some very old or very large (256GB+) cards have compatibility issues.</li>' +
                         '<li><strong>Compilation error "SdFat.h not found":</strong> Install the SdFat library: Sketch &rarr; Include Library &rarr; Manage Libraries &rarr; search "SdFat" by Bill Greiman &rarr; Install.</li>' +
                         '<li><strong>Compilation error about TinyUSB:</strong> Make sure you installed the Earle Philhower RP2040 board package (not the official Arduino Mbed OS package, which does not include TinyUSB). The board should be listed under "Raspberry Pi RP2040 Boards", not "Arduino Mbed OS RP2040 Boards".</li>' +
                         '<li><strong>Drive appears, writes work, but files corrupt after unplug:</strong> Always safely eject before unplugging. The <code>msc_flush_cb</code> function calls <code>syncDevice()</code> to flush cached writes, but only if the OS sends a sync command (which it does on eject).</li>' +
                         '<li><strong>Very slow transfer speeds:</strong> SPI is limited to ~25 MHz clock in this configuration, which caps throughput around 200-400 KB/s. This is normal. Commercial drives use parallel NAND interfaces that are 10-50x faster. Speed is not the point of this build &mdash; understanding is.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Add an Activity LED</strong> &mdash; Modify the <code>msc_read_cb</code> and <code>msc_write_cb</code> functions to blink an external LED (wired to any free GPIO pin + 220 ohm resistor) on every read/write operation. Use different blink patterns for read vs write.</p>' +
                    '<p><strong>Challenge 2: Read-Only Mode Switch</strong> &mdash; Wire a physical toggle switch to a GPIO pin. When the switch is ON, have <code>msc_write_cb</code> return -1 (write denied). This turns your drive into a write-protected forensics tool &mdash; you can read evidence without accidentally modifying it.</p>' +
                    '<p><strong>Challenge 3: Capacity Display</strong> &mdash; Add a small OLED display (SSD1306, ~$3) via I2C. Show the SD card capacity, used space, and a read/write activity indicator on screen. Now your USB drive has a dashboard.</p>' +
                    '<p><strong>Challenge 4: BadUSB Awareness Lab</strong> &mdash; Modify the firmware to register as BOTH a Mass Storage device AND a HID keyboard (composite USB device). Have it type "echo You have been pwned" into any terminal when plugged in. This demonstrates exactly how Rubber Ducky attacks work. <strong>Only use on your own machines for educational purposes.</strong></p>' +
                    '<p><strong>Challenge 5: Custom PCB</strong> &mdash; Design a custom PCB in KiCad with an RP2040 chip (QFN-56), USB-A copper finger connector, SPI flash (W25Q128, 16MB), and status LED. Reference the <a href="https://github.com/nickmccoll/OverDriveUSB" target="_blank" rel="noopener">Ovrdrive USB</a> open-source design for layout patterns. Order from JLCPCB ($5 for 5 boards). This is the jump from "breadboard project" to "product."</p>'
    }

};
