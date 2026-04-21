// ============================================================================
// Signal SDR & Radio — Build Guides (sg-53 through sg-62)
// Software Defined Radio projects for cybersecurity students
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-53: RTL-SDR Setup and First Reception
    // ========================================================================
    'sg-53': {
        intro: '<p>Software Defined Radio (SDR) replaces traditional radio hardware with software. Instead of a fixed-purpose receiver that only tunes one frequency band, an SDR dongle receives a wide swath of the radio spectrum and lets software decode whatever signals are present. With a $25 RTL-SDR dongle, you can listen to FM radio, decode aircraft transmissions, receive weather satellite images, analyze car key fobs, and monitor emergency services &mdash; all from the same device.</p>' +
               '<p>For cybersecurity professionals, SDR is a window into the invisible world of radio frequency (RF) communication. WiFi, Bluetooth, Zigbee, LoRa, cellular, pagers, car keys, garage doors, and baby monitors all transmit RF signals that you can receive and analyze. Understanding RF is essential for wireless security assessments, IoT hacking, and counter-surveillance.</p>' +
               '<p>In this first project, you will install the RTL-SDR drivers, connect your dongle, receive your first FM radio station, and explore the radio spectrum. This is the foundation for every SDR project that follows.</p>',

        wiring: '    RTL-SDR Dongle            Computer / Raspberry Pi\n' +
                '    +---------------+         +-----------------+\n' +
                '    |  RTL2832U     |<------->|  USB 2.0/3.0    |\n' +
                '    |  + R820T2     |  USB    |                 |\n' +
                '    |  tuner        |         |  SDR Software:  |\n' +
                '    +-------+-------+         |  - GQRX         |\n' +
                '            |                 |  - SDR++        |\n' +
                '    +-------+-------+         |  - rtl_fm       |\n' +
                '    | Dipole Antenna |         |  - rtl_power    |\n' +
                '    | (included in  |         +-----------------+\n' +
                '    |  RTL-SDR Blog |\n' +
                '    |  V4 kit)      |    Frequency range: 24 MHz — 1.766 GHz\n' +
                '    +---------------+    Bandwidth: up to 3.2 MHz\n' +
                '                         8-bit resolution, ~50 dB dynamic range',

        wiringNotes: '<p><strong>Antenna placement matters:</strong> Place the antenna near a window or outside for best reception. FM radio is forgiving, but satellite and weak signal projects (SG-55, SG-56) require line-of-sight or outdoor antennas. The dipole elements should be extended to the correct length for your target frequency: ~75 cm each element for FM (88&ndash;108 MHz), ~17 cm for ADS-B (1090 MHz).</p>' +
                     '<p><strong>RTL-SDR Blog V4:</strong> The V4 dongle includes a built-in LNA (Low Noise Amplifier), TCXO crystal (better frequency accuracy), and metal case (shielding). It is significantly better than generic RTL-SDR dongles for $25. Highly recommended over the $8 generic alternatives.</p>' +
                     '<p><strong>Legal note:</strong> In most countries, receiving radio signals is legal. <em>Transmitting</em> without a license is illegal and dangerous. SDR receive-only projects are fully legal. Do not modify hardware to transmit.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg53-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg53-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-53 RTL-SDR FIRST RECEPTION</text>' +

            '<!-- Radio Spectrum Visualization -->' +
            '<g>' +
            '<rect x="30" y="45" width="660" height="120" rx="8" fill="#0d1117" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
            '<text x="360" y="62" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">RADIO FREQUENCY SPECTRUM</text>' +

            '<!-- Spectrum line -->' +
            '<line x1="50" y1="130" x2="670" y2="130" stroke="#333" stroke-width="1"/>' +

            '<!-- Frequency labels -->' +
            '<text x="70" y="145" text-anchor="middle" fill="#555" font-size="5">24 MHz</text>' +
            '<text x="160" y="145" text-anchor="middle" fill="#555" font-size="5">88 MHz</text>' +
            '<text x="250" y="145" text-anchor="middle" fill="#555" font-size="5">150 MHz</text>' +
            '<text x="340" y="145" text-anchor="middle" fill="#555" font-size="5">433 MHz</text>' +
            '<text x="430" y="145" text-anchor="middle" fill="#555" font-size="5">800 MHz</text>' +
            '<text x="520" y="145" text-anchor="middle" fill="#555" font-size="5">1090 MHz</text>' +
            '<text x="610" y="145" text-anchor="middle" fill="#555" font-size="5">1.7 GHz</text>' +

            '<!-- Signal peaks with animation -->' +
            '<!-- FM Radio -->' +
            '<polyline points="140,125 145,110 150,95 155,90 160,85 165,92 170,105 175,120 180,125" fill="none" stroke="#22c55e" stroke-width="1.5"><animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/></polyline>' +
            '<text x="160" y="80" text-anchor="middle" fill="#22c55e" font-size="6" font-weight="600">FM Radio</text>' +
            '<text x="160" y="155" text-anchor="middle" fill="#22c55e" font-size="5">88-108</text>' +

            '<!-- Pagers -->' +
            '<polyline points="240,128 245,118 250,108 253,115 256,122 260,128" fill="none" stroke="#a78bfa" stroke-width="1"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="5s" repeatCount="indefinite"/></polyline>' +
            '<text x="250" y="100" text-anchor="middle" fill="#a78bfa" font-size="5">Pagers</text>' +

            '<!-- ISM Band / Key Fobs -->' +
            '<polyline points="325,128 330,120 335,112 338,108 340,110 343,115 348,125 352,128" fill="none" stroke="#f97316" stroke-width="1.2"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/></polyline>' +
            '<text x="340" y="100" text-anchor="middle" fill="#f97316" font-size="5">Key Fobs</text>' +
            '<text x="340" y="155" text-anchor="middle" fill="#f97316" font-size="5">433 ISM</text>' +

            '<!-- Cell/LTE -->' +
            '<polyline points="410,128 420,115 425,105 430,100 435,103 440,110 445,118 450,128" fill="none" stroke="#ef4444" stroke-width="1"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite"/></polyline>' +
            '<text x="430" y="92" text-anchor="middle" fill="#ef4444" font-size="5">Cellular</text>' +

            '<!-- ADS-B -->' +
            '<polyline points="510,128 515,118 518,108 520,100 522,95 524,98 526,105 530,118 535,128" fill="none" stroke="#38bdf8" stroke-width="1.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/></polyline>' +
            '<text x="522" y="85" text-anchor="middle" fill="#38bdf8" font-size="6" font-weight="600">ADS-B</text>' +
            '<text x="522" y="155" text-anchor="middle" fill="#38bdf8" font-size="5">1090</text>' +

            '<!-- NOAA Satellite -->' +
            '<polyline points="222,128 225,122 228,118 230,115 232,118 234,122 236,128" fill="none" stroke="#eab308" stroke-width="1"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="6s" repeatCount="indefinite"/></polyline>' +
            '<text x="230" y="108" text-anchor="middle" fill="#eab308" font-size="5">NOAA</text>' +

            '<!-- Range bracket -->' +
            '<line x1="50" y1="150" x2="50" y2="158" stroke="#eab308" stroke-width="0.5"/>' +
            '<line x1="670" y1="150" x2="670" y2="158" stroke="#eab308" stroke-width="0.5"/>' +
            '<line x1="50" y1="155" x2="670" y2="155" stroke="#eab308" stroke-width="0.5" stroke-dasharray="4,3"/>' +
            '<text x="360" y="163" text-anchor="middle" fill="#eab308" font-size="5">RTL-SDR V4 Reception Range: 24 MHz — 1.766 GHz</text>' +
            '</g>' +

            '<!-- RTL-SDR Dongle -->' +
            '<g>' +
            '<rect x="30" y="185" width="180" height="140" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="30" y="185" width="180" height="22" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="120" y="201" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="700">RTL-SDR BLOG V4</text>' +

            '<!-- Dongle body -->' +
            '<rect x="55" y="215" width="80" height="35" rx="4" fill="#2a2a3a" stroke="#eab308" stroke-width="1"/>' +
            '<rect x="42" y="225" width="16" height="15" rx="2" fill="#1a1a2a" stroke="#555" stroke-width="0.5"/>' +
            '<text x="50" y="235" text-anchor="middle" fill="#555" font-size="4">USB</text>' +

            '<!-- SMA connector -->' +
            '<circle cx="145" cy="232" r="6" fill="#1a1a2a" stroke="#eab308" stroke-width="1"/>' +
            '<circle cx="145" cy="232" r="2" fill="#eab308"/>' +
            '<text x="145" y="248" text-anchor="middle" fill="#8b949e" font-size="5">SMA</text>' +

            '<!-- Specs -->' +
            '<text x="120" y="270" text-anchor="middle" fill="#8b949e" font-size="6">RTL2832U + R820T2</text>' +
            '<text x="120" y="283" text-anchor="middle" fill="#555" font-size="5">TCXO &bull; Built-in LNA &bull; Metal case</text>' +
            '<text x="120" y="296" text-anchor="middle" fill="#555" font-size="5">8-bit ADC &bull; 3.2 MHz bandwidth</text>' +

            '<!-- Price tag -->' +
            '<rect x="85" y="305" width="70" height="16" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
            '<text x="120" y="316" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">~$25 USD</text>' +
            '</g>' +

            '<!-- Antenna -->' +
            '<g>' +
            '<line x1="151" y1="232" x2="200" y2="232" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="175" y="226" text-anchor="middle" fill="#eab308" font-size="5">coax</text>' +

            '<!-- Dipole antenna -->' +
            '<line x1="200" y1="195" x2="200" y2="270" stroke="#555" stroke-width="1"/>' +
            '<line x1="200" y1="195" x2="170" y2="185" stroke="#eab308" stroke-width="2"/>' +
            '<line x1="200" y1="195" x2="230" y2="185" stroke="#eab308" stroke-width="2"/>' +

            '<!-- RF waves -->' +
            '<path d="M 230,185 Q 240,180 240,175 Q 240,170 250,165" fill="none" stroke="rgba(234,179,8,0.3)" stroke-width="0.8"/>' +
            '<path d="M 250,165 Q 260,160 260,155 Q 260,150 270,145" fill="none" stroke="rgba(234,179,8,0.2)" stroke-width="0.6"/>' +
            '<text x="195" y="180" text-anchor="middle" fill="#8b949e" font-size="5">Dipole</text>' +
            '</g>' +

            '<!-- Computer / Software -->' +
            '<g>' +
            '<rect x="290" y="185" width="200" height="140" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="290" y="185" width="200" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="390" y="201" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600">SDR SOFTWARE</text>' +

            '<!-- Software list -->' +
            '<rect x="302" y="215" width="88" height="18" rx="3" fill="rgba(34,197,94,0.08)"/>' +
            '<text x="346" y="227" text-anchor="middle" fill="#4ade80" font-size="6">GQRX</text>' +

            '<rect x="398" y="215" width="80" height="18" rx="3" fill="rgba(59,130,246,0.08)"/>' +
            '<text x="438" y="227" text-anchor="middle" fill="#60a5fa" font-size="6">SDR++</text>' +

            '<rect x="302" y="240" width="88" height="18" rx="3" fill="rgba(234,179,8,0.08)"/>' +
            '<text x="346" y="252" text-anchor="middle" fill="#eab308" font-size="6">rtl_fm (CLI)</text>' +

            '<rect x="398" y="240" width="80" height="18" rx="3" fill="rgba(167,139,250,0.08)"/>' +
            '<text x="438" y="252" text-anchor="middle" fill="#a78bfa" font-size="6">rtl_power</text>' +

            '<rect x="302" y="265" width="88" height="18" rx="3" fill="rgba(239,68,68,0.08)"/>' +
            '<text x="346" y="277" text-anchor="middle" fill="#fca5a5" font-size="6">dump1090</text>' +

            '<rect x="398" y="265" width="80" height="18" rx="3" fill="rgba(6,182,212,0.08)"/>' +
            '<text x="438" y="277" text-anchor="middle" fill="#22d3ee" font-size="6">multimon-ng</text>' +

            '<text x="390" y="305" text-anchor="middle" fill="#8b949e" font-size="6">Demodulate &bull; Decode &bull; Visualize</text>' +
            '<text x="390" y="318" text-anchor="middle" fill="#555" font-size="5">Linux (native) &bull; Windows (SDR#) &bull; macOS (GQRX)</text>' +
            '</g>' +

            '<!-- USB connection -->' +
            '<line x1="42" y1="232" x2="30" y2="232" stroke="#555" stroke-width="1.5"/>' +
            '<line x1="30" y1="232" x2="30" y2="260" stroke="#555" stroke-width="1.5"/>' +
            '<line x1="30" y1="260" x2="290" y2="260" stroke="#555" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            '<text x="160" y="255" text-anchor="middle" fill="#555" font-size="5">USB 2.0</text>' +

            '<!-- Projects callout -->' +
            '<rect x="510" y="185" width="180" height="140" rx="8" fill="rgba(234,179,8,0.03)" stroke="rgba(234,179,8,0.1)" stroke-width="0.5"/>' +
            '<text x="600" y="205" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">WHAT YOU CAN RECEIVE</text>' +
            '<text x="520" y="222" fill="#22c55e" font-size="5">&bull; FM Radio (88-108 MHz)</text>' +
            '<text x="520" y="236" fill="#38bdf8" font-size="5">&bull; Aircraft ADS-B (1090 MHz)</text>' +
            '<text x="520" y="250" fill="#eab308" font-size="5">&bull; Weather satellites (137 MHz)</text>' +
            '<text x="520" y="264" fill="#a78bfa" font-size="5">&bull; Pagers/POCSAG (150-170 MHz)</text>' +
            '<text x="520" y="278" fill="#f97316" font-size="5">&bull; Car key fobs (315/433 MHz)</text>' +
            '<text x="520" y="292" fill="#fca5a5" font-size="5">&bull; Emergency services (VHF/UHF)</text>' +
            '<text x="520" y="306" fill="#22d3ee" font-size="5">&bull; ISS amateur radio (145.8 MHz)</text>' +
            '<text x="520" y="318" fill="#8b949e" font-size="5">&bull; LoRa / IoT (868/915 MHz)</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install RTL-SDR Drivers and Tools',
                content: '<p>The RTL-SDR dongle uses the RTL2832U chipset, originally designed for DVB-T television reception. The <code>rtl-sdr</code> driver repurposes it as a general-purpose SDR receiver. Install the drivers and essential command-line tools:</p>',
                code: '# Install RTL-SDR drivers and tools\nsudo apt update\nsudo apt install rtl-sdr librtlsdr-dev -y\n\n# Blacklist the default DVB-T kernel module\n# (it conflicts with the SDR driver)\necho "blacklist dvb_usb_rtl28xxu" | sudo tee /etc/modprobe.d/rtl-sdr-blacklist.conf\n\n# Plug in your RTL-SDR dongle\n# Check that it is detected\nlsusb | grep -i rtl\n# Should show: Realtek Semiconductor Corp. RTL2838 DVB-T\n\n# Test the driver\nrtl_test -t\n# Should show:\n#   Found 1 device(s):\n#   0: Realtek, RTL2838UHIDIR, SN: 00000001\n#   Using device 0: Generic RTL2832U OEM\n#   Found Rafael Micro R820T tuner\n#   Supported gain values: 0.0 0.9 1.4 ... 49.6\n\n# If you get "usb_claim_interface error -6":\n# The DVB-T module is still loaded. Remove it:\nsudo rmmod dvb_usb_rtl28xxu 2>/dev/null\nsudo rmmod dvb_usb_v2 2>/dev/null\n# Then try rtl_test again\n\n# Install additional decoding tools\nsudo apt install gqrx-sdr multimon-ng sox -y\n# gqrx: GUI spectrum analyzer + receiver\n# multimon-ng: multi-protocol decoder (POCSAG, DTMF, etc.)\n# sox: audio processing (play, record, convert)',
                language: 'Bash',
                tip: '<strong>The blacklist is essential.</strong> Without it, the Linux kernel claims the dongle as a TV tuner and the SDR driver cannot access it. If you ever plug in the dongle and <code>rtl_test</code> fails with a claim error, the blacklist file was not applied. Reboot after creating it.'
            },
            {
                title: 'Receive Your First FM Station',
                content: '<p>The easiest first reception: FM radio. FM stations broadcast at high power (50&ndash;100 kW) on frequencies between 88 and 108 MHz. Even with a poor antenna indoors, you will receive local stations clearly. This validates that your entire chain works: antenna &rarr; dongle &rarr; driver &rarr; demodulator &rarr; audio.</p>',
                code: '# Receive FM radio from the command line\n# Replace 101.1M with a strong local FM station frequency\nrtl_fm -f 101.1M -M wbfm -s 200000 -r 48000 | play -r 48000 -t raw -e s -b 16 -c 1 -V1 -\n\n# Explanation:\n# -f 101.1M     Tune to 101.1 MHz\n# -M wbfm       Wideband FM demodulation\n# -s 200000     Sample rate 200 kHz (captures the full FM signal)\n# -r 48000      Audio output sample rate (48 kHz)\n# | play ...    Pipe to sox audio player\n\n# Try different stations:\nrtl_fm -f 93.3M -M wbfm -s 200000 -r 48000 | play -r 48000 -t raw -e s -b 16 -c 1 -V1 -\n\n# Record to a WAV file instead of playing live:\nrtl_fm -f 101.1M -M wbfm -s 200000 -r 48000 | sox -t raw -r 48000 -e s -b 16 -c 1 - fm-recording.wav\n# Press Ctrl+C to stop recording\n\n# Play the recording:\nplay fm-recording.wav\n\n# Scan for active FM stations:\nrtl_power -f 87M:108M:125k -g 40 -i 10 -e 30 fm-scan.csv\n# This scans 87-108 MHz in 125 kHz steps for 30 seconds\n# Output: CSV file with frequency vs power level\n\n# Visualize the scan (quick text output):\nawk -F, \'{if ($7 > -30) print $3/1e6 " MHz: " $7 " dB"}\' fm-scan.csv | sort -t: -k2 -rn | head -20\n# Shows the strongest signals in your area',
                language: 'Bash',
                tip: '<strong>Adjust the gain:</strong> If audio is too quiet or too distorted, add <code>-g 40</code> (gain in dB). RTL-SDR supports 0 to 49.6 dB gain. Start at 40 for FM radio. Lower gain reduces noise for strong signals; higher gain is needed for weak signals. Finding the right gain is a fundamental SDR skill.'
            },
            {
                title: 'Explore the Spectrum with GQRX',
                content: '<p>GQRX is a graphical SDR receiver that shows you the radio spectrum in real time. The waterfall display scrolls downward, painting signal strength as colors: blue is noise floor, green/yellow are signals, red is a strong signal. This is where SDR gets visually stunning.</p>' +
                         '<p>Launch GQRX, select your RTL-SDR dongle as the input device, and start exploring:</p>',
                code: '# Launch GQRX\ngqrx &\n\n# First launch setup:\n# 1. Device: RTL-SDR / RTL2838UHIDIR (or similar)\n# 2. Input rate: 2400000 (2.4 MHz bandwidth)\n# 3. Click OK\n\n# In the main window:\n# - The top pane is the FFT (frequency spectrum — power vs frequency)\n# - The bottom pane is the waterfall (frequency vs time, colored by power)\n# - Set the frequency in the top bar: 101100000 (101.1 MHz FM)\n# - Set mode: WFM (Wideband FM) for FM radio\n# - Click the Play button to start receiving\n\n# Explore these frequencies:\n# FM Radio:     88.0 - 108.0 MHz  (WFM mode)\n# Air Band:    118.0 - 137.0 MHz  (AM mode) — airport traffic\n# NOAA Weather: 162.4 - 162.55 MHz (NFM mode) — weather broadcasts\n# Marine VHF:  156.0 - 162.0 MHz  (NFM mode) — ship traffic\n# Ham 2m band: 144.0 - 148.0 MHz  (various modes)\n# ISM band:    433.0 - 434.0 MHz  (raw) — wireless devices\n\n# === HEADLESS (no GUI) spectrum visualization ===\n# If using a Pi without desktop:\nrtl_power -f 80M:180M:25k -g 40 -i 10 -e 60 spectrum.csv\n# Then transfer spectrum.csv to your computer for visualization\n# Or use heatmap.py from the rtl-sdr-scanner-python project',
                language: 'Bash',
                tip: '<strong>What you see on the waterfall:</strong> FM stations appear as wide (~200 kHz) peaks that stay constant (they broadcast 24/7). Pagers appear as brief narrow bursts. Aircraft ADS-B is a faint constant presence at 1090 MHz. Key fobs are momentary blips at 315/433 MHz when someone presses a button nearby. Each signal type has a distinctive visual signature &mdash; learning to read the waterfall is like learning to read an oscilloscope.'
            },
            {
                title: 'Decode Narrowband FM and Two-Way Radio',
                content: '<p>FM radio is wideband (~200 kHz per station). Most two-way radio systems (police, fire, EMS, ham radio, FRS/GMRS) use narrowband FM (~12.5 kHz per channel). Narrowband signals are quieter and narrower on the spectrum display, but carry clear voice audio when demodulated correctly.</p>',
                code: '# Listen to NOAA Weather Radio (US — check local frequency)\n# Common NOAA frequencies: 162.400, 162.425, 162.450, 162.475, 162.500, 162.525, 162.550\nrtl_fm -f 162.400M -M fm -s 12000 -g 40 -l 0 | play -r 12000 -t raw -e s -b 16 -c 1 -V1 -\n\n# Listen to Marine VHF Channel 16 (international distress/calling)\nrtl_fm -f 156.800M -M fm -s 12000 -g 40 -l 0 | play -r 12000 -t raw -e s -b 16 -c 1 -V1 -\n\n# Listen to Aircraft frequencies (AM modulation)\n# Tower/Approach: varies by airport — check liveatc.net for your local frequency\nrtl_fm -f 118.700M -M am -s 12000 -g 40 | play -r 12000 -t raw -e s -b 16 -c 1 -V1 -\n\n# Scan a range and stop on active signals (squelch)\n# This monitors a frequency range and plays audio when a signal is detected:\nrtl_fm -f 155.000M:155.500M:12.5k -M fm -s 12000 -g 40 -l 10 | play -r 12000 -t raw -e s -b 16 -c 1 -V1 -\n# -l 10 sets squelch level — audio mutes when signal drops below this threshold\n\n# Record a frequency for later analysis:\nrtl_fm -f 162.400M -M fm -s 12000 -g 40 -l 0 | \\\n  sox -t raw -r 12000 -e s -b 16 -c 1 - noaa-$(date +%Y%m%d-%H%M%S).wav\n# Ctrl+C to stop. Play back: play noaa-*.wav',
                language: 'Bash',
                tip: '<strong>Squelch (<code>-l</code> flag):</strong> Without squelch, you hear constant static on inactive frequencies. Squelch mutes the audio when signal strength drops below a threshold. Set it just above the noise floor. Too high and you miss weak signals; too low and static plays constantly. Start with <code>-l 10</code> and adjust up or down.'
            },
            {
                title: 'Scan and Map Your Local RF Environment',
                content: '<p>Use <code>rtl_power</code> to scan a wide frequency range and map all active transmitters in your area. This is a basic form of <strong>signals intelligence (SIGINT)</strong> &mdash; understanding the RF environment around you. The output is a CSV file that can be visualized as a heatmap.</p>',
                code: '# Full spectrum scan: 24 MHz to 1.7 GHz\n# Warning: this takes several minutes for a complete sweep\nrtl_power -f 24M:1700M:1M -g 40 -i 30 -e 120 full-spectrum.csv\n# -f 24M:1700M:1M  Scan 24-1700 MHz in 1 MHz steps\n# -g 40             Gain 40 dB\n# -i 30             Integration time: 30 seconds per step\n# -e 120            Total run time: 120 seconds\n\n# Focused scan: FM broadcast band\nrtl_power -f 87M:108M:25k -g 40 -i 10 -e 60 fm-band.csv\n\n# Focused scan: ISM band (IoT devices, key fobs)\nrtl_power -f 430M:440M:12.5k -g 40 -i 10 -e 60 ism-band.csv\n\n# Focused scan: Public safety (VHF)\nrtl_power -f 150M:174M:12.5k -g 40 -i 10 -e 120 public-safety.csv\n\n# === ANALYZE THE RESULTS ===\n\n# Find the strongest signals in your full spectrum scan:\npython3 -c "\nimport csv\nsignals = []\nwith open(\'full-spectrum.csv\') as f:\n    for row in csv.reader(f):\n        if len(row) >= 7:\n            try:\n                freq = float(row[2])\n                power = max(float(x) for x in row[6:])\n                signals.append((freq, power))\n            except: pass\n\nsignals.sort(key=lambda x: -x[1])\nprint(\'Top 20 strongest signals:\')\nfor freq, power in signals[:20]:\n    print(f\'  {freq/1e6:8.3f} MHz  {power:6.1f} dB\')\n"\n\n# The output reveals your local RF landscape:\n# - FM stations at 88-108 MHz (strongest signals)\n# - Pager transmitters around 152-158 MHz\n# - Public safety repeaters in VHF/UHF\n# - Cell towers in 700-900 MHz and 1700-2100 MHz\n# - ADS-B at 1090 MHz (if near an airport)',
                language: 'Bash',
                tip: '<strong>This is SIGINT.</strong> Mapping the RF environment is exactly what intelligence agencies and military signals units do &mdash; just at a much larger scale with much more expensive hardware. Your $25 RTL-SDR and <code>rtl_power</code> scan gives you the same fundamental data: what frequencies are active, how strong the signals are, and where the transmitters are located (based on signal strength and direction, if you have a directional antenna).'
            },
            {
                title: 'Configure for Specific Projects',
                content: '<p>Now that your SDR setup is working, configure the antenna and software for the projects ahead. Each project targets different frequencies and requires different antenna configurations.</p>',
                code: '# === ANTENNA LENGTH GUIDE ===\n# Dipole element length = speed_of_light / (frequency * 4)\n# The dipole kit from RTL-SDR Blog has telescoping elements.\n# Extend them to these lengths for each project:\n\necho "=== Antenna Length Calculator ==="\nfor freq_mhz in 101 137 145 156 162 433 868 1090; do\n    length_cm=$(python3 -c "print(f\'{(29979 / ($freq_mhz * 4)):.1f}\')")\n    echo "  ${freq_mhz} MHz: ${length_cm} cm per element"\ndone\n\n# Output:\n#   101 MHz: 74.2 cm  (FM radio)\n#   137 MHz: 54.7 cm  (NOAA weather satellite)\n#   145 MHz: 51.7 cm  (ISS / ham 2m)\n#   156 MHz: 48.1 cm  (marine VHF)\n#   162 MHz: 46.3 cm  (NOAA weather radio)\n#   433 MHz: 17.3 cm  (ISM band / key fobs)\n#   868 MHz:  8.6 cm  (LoRa EU)\n#   1090 MHz:  6.9 cm (ADS-B aircraft)\n\n# === SOFTWARE CONFIGURATION ===\n\n# Create a project directory structure\nmkdir -p ~/sdr-projects/{adsb,weather-sat,pager,spectrum,recordings}\n\n# Save useful aliases\ncat >> ~/.bashrc << \'SDREOF\'\n\n# SDR aliases\nalias sdr-fm=\'rtl_fm -M wbfm -s 200000 -r 48000 -g 40\'\nalias sdr-nfm=\'rtl_fm -M fm -s 12000 -g 40 -l 10\'\nalias sdr-am=\'rtl_fm -M am -s 12000 -g 40\'\nalias sdr-scan=\'rtl_power -g 40 -i 10\'\nalias sdr-test=\'rtl_test -t\'\nSDREOF\nsource ~/.bashrc\n\n# Test with the new aliases:\nsdr-test\n# sdr-fm -f 101.1M | play -r 48000 -t raw -e s -b 16 -c 1 -V1 -',
                language: 'Bash',
                tip: '<strong>Next projects:</strong> With your RTL-SDR working, you are ready for:<br>&bull; <strong>SG-54</strong>: Track aircraft with ADS-B (1090 MHz, 6.9 cm elements)<br>&bull; <strong>SG-55</strong>: Receive weather satellite images (137 MHz, 54.7 cm elements)<br>&bull; <strong>SG-56</strong>: Decode pager messages (150-170 MHz, 48 cm elements)<br>&bull; <strong>SG-57</strong>: Build an RF spectrum analyzer<br>Each project builds on this foundation &mdash; same dongle, different frequency and decoder.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Dongle detected: <code>lsusb | grep -i rtl</code> shows Realtek device</li>' +
                 '<li>Driver works: <code>rtl_test -t</code> completes without errors</li>' +
                 '<li>FM reception: <code>rtl_fm -f 101.1M -M wbfm -s 200000 -r 48000 | play ...</code> plays audio</li>' +
                 '<li>GQRX launches and shows the spectrum waterfall (if using desktop)</li>' +
                 '<li>Spectrum scan: <code>rtl_power</code> produces a CSV with signal data</li>' +
                 '<li>Multiple FM stations are visible and receivable</li>' +
                 '<li>Narrowband FM (NOAA weather) is receivable with clear audio</li>' +
                 '<li>DVB-T kernel module is blacklisted: <code>cat /etc/modprobe.d/rtl-sdr-blacklist.conf</code></li>' +
                 '</ul>' +
                 '<p>Your SDR station is operational. You can receive any signal between 24 MHz and 1.766 GHz. The radio spectrum is now visible to you &mdash; every FM station, every aircraft transponder, every pager transmission, every IoT device. This is the invisible world made visible.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>"usb_claim_interface error -6" when running rtl_test:</strong> The DVB-T kernel module is still loaded and holding the device. Run <code>sudo rmmod dvb_usb_rtl28xxu</code> and <code>sudo rmmod dvb_usb_v2</code>. If the blacklist file was just created, reboot for it to take effect.</li>' +
                         '<li><strong>No devices found by rtl_test:</strong> Check <code>lsusb | grep -i rtl</code>. If no Realtek device appears, try a different USB port or cable. USB 3.0 ports sometimes have compatibility issues &mdash; try a USB 2.0 port. On VMs, ensure USB passthrough is enabled.</li>' +
                         '<li><strong>FM audio is distorted or clipping:</strong> Gain is too high. Reduce gain with <code>-g 30</code> or lower. Strong FM stations near your location can overload the receiver. The RTL-SDR V4 built-in LNA makes this more likely for nearby transmitters.</li>' +
                         '<li><strong>GQRX shows "No device found" on launch:</strong> Another program (rtl_fm, rtl_test) is still holding the dongle. Only one application can use the RTL-SDR at a time. Kill any running rtl_* processes: <code>pkill -f rtl_</code>.</li>' +
                         '<li><strong>Very weak or no signal on any frequency:</strong> Check that the antenna is actually connected to the SMA port. The dipole elements must be extended &mdash; collapsed elements receive almost nothing. Verify the correct element length for your target frequency.</li>' +
                         '<li><strong>rtl_power CSV file is empty or very small:</strong> The scan was interrupted or the dongle was not detected. Run <code>rtl_test -t</code> first to confirm the device is working, then retry the scan with a shorter duration (<code>-e 30</code>) to test.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: RF Environment Map</strong> &mdash; Perform three spectrum scans at different times of day (morning, afternoon, night). Compare the results to identify signals that are active 24/7 versus signals that only appear at certain times. Document at least 5 different signal types and explain why their activity patterns differ.</p>' +
                    '<p><strong>Challenge 2: Antenna Comparison</strong> &mdash; Receive the same FM station with the dipole at three different element lengths (fully extended, half-length, quarter-length). Record the signal strength for each. Calculate the theoretical optimal length and compare to your measurements. Explain why length matters.</p>' +
                    '<p><strong>Challenge 3: Homebrew Antenna Build</strong> &mdash; Build a ground-plane antenna for 1090 MHz (ADS-B) using a chassis-mount SMA connector and a single piece of wire cut to 6.9 cm. Add four radial elements at 45 degrees. Compare its reception to the dipole antenna by counting aircraft received over 10 minutes with each antenna.</p>',

        commonMistakes: [
            {
                title: 'DVB-T Blacklist Not Applied',
                correct: 'Create the blacklist file at <code>/etc/modprobe.d/rtl-sdr-blacklist.conf</code> with the content <code>blacklist dvb_usb_rtl28xxu</code> and reboot the system.',
                incorrect: 'The blacklist file is created but the system is not rebooted, or the file is placed in the wrong directory.',
                consequence: 'The kernel DVB-T driver claims the dongle before the SDR driver can. Every rtl_* command fails with "usb_claim_interface error -6". This is the single most common setup issue.'
            },
            {
                title: 'Wrong Antenna Element Length for Target Frequency',
                correct: 'Calculate dipole element length as <code>c / (f * 4)</code> and extend each element to the correct length. For FM: ~75 cm, for ADS-B: ~6.9 cm, for NOAA satellites: ~54.7 cm.',
                incorrect: 'Dipole elements are left fully extended (default length) for all frequencies regardless of target.',
                consequence: 'Signal reception is significantly degraded. An antenna tuned for FM (75 cm elements) receives ADS-B (1090 MHz) very poorly. Performance can drop by 10-20 dB &mdash; the difference between seeing 50 aircraft and seeing 5.'
            },
            {
                title: 'Running Multiple SDR Applications Simultaneously',
                correct: 'Only one application can access the RTL-SDR dongle at a time. Close rtl_fm, rtl_test, or GQRX before starting another SDR application.',
                incorrect: 'Launching GQRX while rtl_fm is still running in the background, or opening a second terminal running rtl_power while the first is still active.',
                consequence: 'The second application fails with a device busy error. Background rtl_fm processes can persist after Ctrl+C if piped through sox/play. Use <code>pkill -f rtl_</code> to clean up.'
            }
        ]
    },

    // ========================================================================
    // SG-54: ADS-B Aircraft Tracker
    // ========================================================================
    'sg-54': {
        intro: '<p>Every commercial aircraft broadcasts its position, altitude, speed, heading, and identity on 1090 MHz &mdash; unencrypted, in the clear, 24 hours a day. This system is called ADS-B (Automatic Dependent Surveillance-Broadcast), and with your $25 RTL-SDR dongle, you can receive and decode these transmissions. Within minutes, you will see every aircraft within 100+ miles on a real-time map.</p>' +
               '<p>ADS-B is the foundation of modern air traffic control. Aircraft compute their position from GPS, then broadcast it as a digital message twice per second. Ground stations, other aircraft, and &mdash; now &mdash; your Raspberry Pi receive these messages and display the traffic picture. This is not a simulation or an API feed; you are receiving raw radio signals directly from aircraft and decoding them yourself.</p>' +
               '<p>For cybersecurity students, ADS-B demonstrates a critical security lesson: <strong>broadcast protocols without encryption or authentication are inherently vulnerable.</strong> Anyone can receive ADS-B (legal). Anyone can <em>transmit</em> fake ADS-B messages (illegal, dangerous, but technically trivial). This is the same class of vulnerability that affects unencrypted IoT, SCADA, and legacy industrial protocols.</p>',

        wiring: '    ADS-B Reception Setup\n' +
                '    \n' +
                '    Aircraft at 35,000 ft                RTL-SDR\n' +
                '    [Broadcasting at 1090 MHz]            + 1090 MHz antenna\n' +
                '           |                                  |\n' +
                '           | ADS-B signal (2x per second)     |\n' +
                '           v                                  v\n' +
                '    +-----------+                     +---------------+\n' +
                '    | Line-of-  |------ RF waves ---->| dump1090      |\n' +
                '    | sight     |   (up to 250 nm)    | decoder       |\n' +
                '    +-----------+                     +-------+-------+\n' +
                '                                              |\n' +
                '                                     +--------+--------+\n' +
                '                                     | Web interface   |\n' +
                '                                     | http://pi:8080  |\n' +
                '                                     | Real-time map   |\n' +
                '                                     +-----------------+',

        wiringNotes: '<p><strong>Antenna:</strong> ADS-B operates at 1090 MHz. Set your dipole elements to <strong>6.9 cm each</strong>. For best results, use a dedicated 1090 MHz quarter-wave or collinear antenna mounted outside or near a window with a view of the sky. The included dipole works, but a purpose-built antenna doubles your reception range.</p>' +
                     '<p><strong>Range:</strong> ADS-B range depends on antenna height and line-of-sight. With a good outdoor antenna, expect 100&ndash;200 nautical miles. With the dipole indoors near a window, expect 30&ndash;80 nm. Higher altitude aircraft are received further because the signal path clears terrain.</p>' +
                     '<p><strong>Legal:</strong> Receiving ADS-B is 100% legal everywhere in the world. The signals are broadcast publicly for safety purposes. Do NOT transmit on 1090 MHz &mdash; that is illegal and dangerous to aviation.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg54-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg54-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-54 ADS-B AIRCRAFT TRACKING</text>' +

            '<!-- Sky/map background -->' +
            '<rect x="30" y="40" width="660" height="200" rx="8" fill="rgba(56,189,248,0.03)" stroke="rgba(56,189,248,0.08)" stroke-width="0.5"/>' +

            '<!-- Aircraft 1 -->' +
            '<g>' +
            '<polygon points="120,80 130,74 140,80 135,80 135,85 125,85 125,80" fill="#38bdf8" opacity="0.8"/>' +
            '<text x="130" y="70" text-anchor="middle" fill="#38bdf8" font-size="5" font-weight="600">UAL1234</text>' +
            '<text x="130" y="95" text-anchor="middle" fill="#555" font-size="4">FL350 &bull; 478kt &bull; A320</text>' +
            '<!-- Movement animation -->' +
            '<animateTransform attributeName="transform" type="translate" values="0,0;40,10;80,20" dur="8s" repeatCount="indefinite"/>' +
            '</g>' +

            '<!-- Aircraft 2 -->' +
            '<g>' +
            '<polygon points="400,60 410,54 420,60 415,60 415,65 405,65 405,60" fill="#22c55e" opacity="0.8"/>' +
            '<text x="410" y="50" text-anchor="middle" fill="#22c55e" font-size="5" font-weight="600">DAL567</text>' +
            '<text x="410" y="75" text-anchor="middle" fill="#555" font-size="4">FL410 &bull; 512kt &bull; B738</text>' +
            '<animateTransform attributeName="transform" type="translate" values="0,0;-30,15;-60,30" dur="10s" repeatCount="indefinite"/>' +
            '</g>' +

            '<!-- Aircraft 3 -->' +
            '<g>' +
            '<polygon points="550,100 560,94 570,100 565,100 565,105 555,105 555,100" fill="#f97316" opacity="0.8"/>' +
            '<text x="560" y="90" text-anchor="middle" fill="#f97316" font-size="5" font-weight="600">AAL890</text>' +
            '<text x="560" y="115" text-anchor="middle" fill="#555" font-size="4">FL280 &bull; 425kt &bull; B77W</text>' +
            '<animateTransform attributeName="transform" type="translate" values="0,0;-20,-5;-40,-10" dur="12s" repeatCount="indefinite"/>' +
            '</g>' +

            '<!-- Aircraft 4 (small/low) -->' +
            '<g>' +
            '<polygon points="280,150 286,146 292,150 289,150 289,153 283,153 283,150" fill="#eab308" opacity="0.6"/>' +
            '<text x="286" y="142" text-anchor="middle" fill="#eab308" font-size="4">N12345</text>' +
            '<text x="286" y="163" text-anchor="middle" fill="#555" font-size="3">4500ft &bull; 120kt &bull; C172</text>' +
            '<animateTransform attributeName="transform" type="translate" values="0,0;15,5;30,10" dur="15s" repeatCount="indefinite"/>' +
            '</g>' +

            '<!-- Reception cone -->' +
            '<path d="M 360,230 L 100,50 L 620,50 Z" fill="rgba(56,189,248,0.02)" stroke="rgba(56,189,248,0.06)" stroke-width="0.5" stroke-dasharray="4,4"/>' +

            '<!-- Antenna at bottom center -->' +
            '<g>' +
            '<line x1="360" y1="250" x2="360" y2="230" stroke="#eab308" stroke-width="2"/>' +
            '<line x1="360" y1="230" x2="345" y2="220" stroke="#eab308" stroke-width="1.5"/>' +
            '<line x1="360" y1="230" x2="375" y2="220" stroke="#eab308" stroke-width="1.5"/>' +
            '<circle cx="360" cy="252" r="4" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1"/>' +

            '<!-- Signal waves -->' +
            '<circle cx="360" cy="230" r="15" fill="none" stroke="rgba(56,189,248,0.15)" stroke-width="0.5"><animate attributeName="r" values="15;50;15" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/></circle>' +
            '<circle cx="360" cy="230" r="15" fill="none" stroke="rgba(56,189,248,0.15)" stroke-width="0.5"><animate attributeName="r" values="15;50;15" dur="3s" begin="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="3s" begin="1s" repeatCount="indefinite"/></circle>' +

            '<text x="360" y="268" text-anchor="middle" fill="#eab308" font-size="6">1090 MHz Antenna</text>' +
            '<text x="360" y="280" text-anchor="middle" fill="#555" font-size="5">6.9 cm elements</text>' +
            '</g>' +

            '<!-- Dashboard mockup -->' +
            '<g>' +
            '<rect x="30" y="295" width="320" height="85" rx="8" fill="#1e2736" stroke="#38bdf8" stroke-width="1.5"/>' +
            '<rect x="30" y="295" width="320" height="20" rx="8" fill="rgba(56,189,248,0.12)"/>' +
            '<text x="190" y="309" text-anchor="middle" fill="#7dd3fc" font-size="8" font-weight="600">dump1090 DASHBOARD</text>' +

            '<!-- Stats -->' +
            '<rect x="42" y="322" width="70" height="22" rx="3" fill="rgba(34,197,94,0.06)"/>' +
            '<text x="77" y="332" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="700">47</text>' +
            '<text x="77" y="341" text-anchor="middle" fill="#4ade80" font-size="5">Aircraft</text>' +

            '<rect x="120" y="322" width="70" height="22" rx="3" fill="rgba(56,189,248,0.06)"/>' +
            '<text x="155" y="332" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="700">143</text>' +
            '<text x="155" y="341" text-anchor="middle" fill="#38bdf8" font-size="5">nm Range</text>' +

            '<rect x="198" y="322" width="70" height="22" rx="3" fill="rgba(234,179,8,0.06)"/>' +
            '<text x="233" y="332" text-anchor="middle" fill="#eab308" font-size="10" font-weight="700">1.2K</text>' +
            '<text x="233" y="341" text-anchor="middle" fill="#eab308" font-size="5">Msg/sec</text>' +

            '<rect x="276" y="322" width="62" height="22" rx="3" fill="rgba(167,139,250,0.06)"/>' +
            '<text x="307" y="332" text-anchor="middle" fill="#a78bfa" font-size="10" font-weight="700">99.2</text>' +
            '<text x="307" y="341" text-anchor="middle" fill="#a78bfa" font-size="5">% decoded</text>' +

            '<!-- Table rows -->' +
            '<text x="42" y="360" fill="#8b949e" font-size="4">ICAO</text>' +
            '<text x="90" y="360" fill="#8b949e" font-size="4">CALLSIGN</text>' +
            '<text x="150" y="360" fill="#8b949e" font-size="4">ALT</text>' +
            '<text x="195" y="360" fill="#8b949e" font-size="4">SPD</text>' +
            '<text x="240" y="360" fill="#8b949e" font-size="4">HDG</text>' +
            '<text x="280" y="360" fill="#8b949e" font-size="4">TYPE</text>' +
            '<text x="320" y="360" fill="#8b949e" font-size="4">DIST</text>' +

            '<text x="42" y="370" fill="#38bdf8" font-size="4">A1B2C3</text>' +
            '<text x="90" y="370" fill="#e2e8f0" font-size="4">UAL1234</text>' +
            '<text x="150" y="370" fill="#e2e8f0" font-size="4">35000</text>' +
            '<text x="195" y="370" fill="#e2e8f0" font-size="4">478</text>' +
            '<text x="240" y="370" fill="#e2e8f0" font-size="4">095</text>' +
            '<text x="280" y="370" fill="#e2e8f0" font-size="4">A320</text>' +
            '<text x="320" y="370" fill="#4ade80" font-size="4">23nm</text>' +
            '</g>' +

            '<!-- Security callout -->' +
            '<rect x="370" y="295" width="320" height="85" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="530" y="312" text-anchor="middle" fill="#fca5a5" font-size="7" font-weight="600">ADS-B SECURITY CONCERNS</text>' +
            '<text x="380" y="328" fill="#8b949e" font-size="5">&bull; No encryption — anyone can receive all traffic</text>' +
            '<text x="380" y="342" fill="#8b949e" font-size="5">&bull; No authentication — fake messages are easy to craft</text>' +
            '<text x="380" y="356" fill="#8b949e" font-size="5">&bull; GPS spoofing can feed false position data</text>' +
            '<text x="380" y="370" fill="#8b949e" font-size="5">&bull; Same vulnerability class as unencrypted IoT/SCADA</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install dump1090 Decoder',
                content: '<p><code>dump1090</code> is the standard ADS-B decoder. It reads raw samples from the RTL-SDR dongle, demodulates the 1090 MHz signal, decodes the Mode S and ADS-B messages, and serves a web interface with a real-time aircraft map. The <code>dump1090-mutability</code> fork adds Mapbox/OpenStreetMap integration.</p>',
                code: '# Install build dependencies\nsudo apt install build-essential pkg-config librtlsdr-dev libusb-1.0-0-dev -y\n\n# Clone and build dump1090-fa (FlightAware fork — best maintained)\ngit clone https://github.com/flightaware/dump1090.git ~/dump1090\ncd ~/dump1090\nmake\n\n# Or install the pre-built package (Raspberry Pi):\nwget https://flightaware.com/adsb/piaware/files/packages/pool/piaware/d/dump1090-fa/dump1090-fa_9.0_arm64.deb\nsudo dpkg -i dump1090-fa_9.0_arm64.deb\nsudo apt install -f -y  # fix dependencies if needed\n\n# If building from source, test it:\ncd ~/dump1090\n./dump1090 --interactive\n# You should immediately see aircraft appearing:\n# Hex    Mode  Sqwk  Flight   Alt    Spd  Hdg    Lat      Long   RSSI  Msgs  Ti\n# A1B2C3 S     1234  UAL1234  35000  478  095   33.9425  -118.4   -5   42    3\n\n# Press Ctrl+C to stop',
                language: 'Bash',
                tip: '<strong>Immediate results:</strong> Unlike most SDR projects that require careful tuning, ADS-B works the moment you start dump1090. Aircraft signals are strong (they broadcast at high power), digital (no demodulation tuning), and constant (2 messages per second per aircraft). If you see zero aircraft, check your antenna connection and make sure the dipole elements are extended to ~6.9 cm.'
            },
            {
                title: 'Start dump1090 with Web Interface',
                content: '<p>Run dump1090 as a background service with the built-in web server. This serves a real-time map showing all received aircraft with their positions, altitudes, speeds, and headings. The map updates every second.</p>',
                code: '# Start dump1090 with web interface\ncd ~/dump1090\n./dump1090 --net --interactive --write-json /tmp/dump1090 &\n\n# Flags:\n# --net          Enable network services (web, raw data, SBS output)\n# --interactive  Show aircraft table in terminal\n# --write-json   Write aircraft data as JSON for the web map\n\n# The web interface is now at:\n# http://PI_IP:8080\n# Open in your browser — you should see a map with aircraft!\n\n# If using dump1090-fa (installed as package):\nsudo systemctl start dump1090-fa\nsudo systemctl enable dump1090-fa\n# Web interface: http://PI_IP/dump1090/\n\n# === JSON API ===\n# dump1090 also serves JSON data for programmatic access:\ncurl -s http://localhost:8080/data/aircraft.json | python3 -m json.tool | head -30\n\n# Count current aircraft:\ncurl -s http://localhost:8080/data/aircraft.json | python3 -c "\nimport json, sys\ndata = json.load(sys.stdin)\nprint(f\\\"Aircraft tracked: {len(data[\'aircraft\'])}\\\")\nfor a in sorted(data[\'aircraft\'], key=lambda x: x.get(\'rssi\', -99), reverse=True)[:10]:\n    print(f\\\"  {a.get(\'flight\',\'?\').strip():8} alt:{a.get(\'alt_baro\',\'?\'):>6} spd:{a.get(\'gs\',\'?\'):>4} rssi:{a.get(\'rssi\',\'?\'):>5} dB\\\")\n"',
                language: 'Bash',
                tip: '<strong>The map is mesmerizing.</strong> Watching dozens of aircraft update in real time, seeing their trails draw across the map, and zooming in to watch an approach sequence at your local airport &mdash; this is one of the most visually satisfying SDR projects. Leave it running for 24 hours and observe the daily patterns: morning rush of departures, evening arrivals, red-eye transcontinental flights at 2 AM.'
            },
            {
                title: 'Optimize Reception and Track Range',
                content: '<p>ADS-B reception range depends on antenna quality, placement, and gain settings. Optimize each factor to maximize the number of aircraft and the reception radius.</p>',
                code: '# Check your current stats\ncurl -s http://localhost:8080/data/stats.json | python3 -c "\nimport json, sys\ndata = json.load(sys.stdin)\nlast = data[\'last1min\']\nprint(f\\\"Messages/sec:  {last[\'local\'][\'messages_total\'] / 60:.0f}\\\")\nprint(f\\\"Aircraft:      {last[\'local\'][\'accepted\'][0]}\\\")\nprint(f\\\"Strong signals: {last[\'local\'][\'strong_signals\']}\\\")\nprint(f\\\"Signal power:  {last[\'local\'][\'signal\']:.1f} dBFS\\\")\n"\n\n# === GAIN OPTIMIZATION ===\n# Default gain is AGC (automatic). Manual gain often performs better.\n# Test different gain values and compare aircraft count:\nfor gain in 20 30 40 44 48 49.6; do\n    echo "Testing gain $gain dB..."\n    timeout 60 ./dump1090 --gain $gain --write-json /tmp/test --quiet &\n    PID=$!\n    sleep 55\n    COUNT=$(curl -s http://localhost:8080/data/aircraft.json 2>/dev/null | python3 -c "import json,sys; print(len(json.load(sys.stdin).get(\'aircraft\',[])))" 2>/dev/null || echo 0)\n    kill $PID 2>/dev/null\n    echo "  Gain $gain: $COUNT aircraft"\n    sleep 5\ndone\n# Use the gain value that gives the highest aircraft count\n\n# === ANTENNA IMPROVEMENT ===\n# The included dipole works but a dedicated 1090 MHz antenna doubles range:\n# Option 1: DIY quarter-wave ground plane (coat hanger + SO-239)\n#   - 6.9 cm radiator, four 6.9 cm radials at 45 degrees\n#   - Mount outdoors or in attic\n# Option 2: Buy FlightAware 1090 MHz antenna (~$35)\n# Option 3: Spider antenna from RTL-SDR Blog ($12)\n\n# Track your maximum range over time:\necho "$(date),$(curl -s http://localhost:8080/data/stats.json | python3 -c \\\n  "import json,sys; print(json.load(sys.stdin)[\'last1min\'][\'local\'][\'accepted\'][0])"\n)" >> ~/sdr-projects/adsb/range-log.csv',
                language: 'Bash',
                tip: '<strong>Gain sweet spot:</strong> Too much gain causes signal clipping (strong signals become distorted, weak signals are lost). Too little gain means weak signals are below the noise floor. For ADS-B, the sweet spot is usually 40&ndash;49.6 dB with the RTL-SDR V4\'s built-in LNA. Start at 49.6 (maximum) and reduce if you see high error rates in the stats.'
            },
            {
                title: 'Feed Data to FlightAware or ADS-B Exchange',
                content: '<p>Share your ADS-B data with flight tracking networks. In exchange, FlightAware gives you a free Enterprise account ($109/month value) with access to real-time data, historical tracks, and alerts. ADS-B Exchange is a community-run, unfiltered alternative that shows military and government aircraft that commercial trackers block.</p>',
                code: '# === FLIGHTAWARE (PiAware) ===\n# Create a FlightAware account at flightaware.com\n# Get your unique feeder ID\n\n# Install PiAware\nwget https://flightaware.com/adsb/piaware/files/packages/pool/piaware/p/piaware-support/piaware-repository_9.0_all.deb\nsudo dpkg -i piaware-repository_9.0_all.deb\nsudo apt update\nsudo apt install piaware -y\n\n# Configure your FlightAware credentials\nsudo piaware-config flightaware-user YOUR_USERNAME\nsudo piaware-config flightaware-password YOUR_PASSWORD\n\n# Start feeding\nsudo systemctl enable piaware\nsudo systemctl start piaware\n\n# Check your feeder status:\n# https://flightaware.com/adsb/stats/user/YOUR_USERNAME\n# You get a free Enterprise account after 24 hours of feeding!\n\n# === ADS-B Exchange ===\n# Community-run, unfiltered (shows military/government)\ncurl -L -o /tmp/feed-adsbx.sh https://www.adsbexchange.com/feed/\nbash /tmp/feed-adsbx.sh\n# Follow the prompts\n\n# Check your ADS-B Exchange stats:\n# https://www.adsbexchange.com/myip/\n\n# === VERIFY FEEDING ===\npiaware-status\n# Should show: "PiAware is connected to FlightAware"\n# Should show: "dump1090 is producing data"',
                language: 'Bash',
                tip: '<strong>Free FlightAware Enterprise:</strong> This is the best perk of ADS-B tracking. A FlightAware Enterprise account normally costs $109/month and includes real-time worldwide flight tracking, 3-month history, arrival/departure alerts, and API access. You get all of this for free, forever, as long as your feeder is active. The value of the account far exceeds the $25 cost of the RTL-SDR dongle.'
            },
            {
                title: 'Build an Aircraft Data Logger',
                content: '<p>Log all received ADS-B data for analysis. This creates a historical database of aircraft movements in your area &mdash; useful for pattern analysis, anomaly detection, and correlation with other data sources.</p>',
                code: '# Create a logging script that captures aircraft data every minute\nmkdir -p ~/sdr-projects/adsb/logs\n\ncat << \'LOGEOF\' > ~/sdr-projects/adsb/adsb-logger.sh\n#!/bin/bash\n# ADS-B Data Logger — captures aircraft snapshot every 60 seconds\n\nLOG_DIR=~/sdr-projects/adsb/logs\nDATE=$(date +%Y-%m-%d)\nLOG_FILE="$LOG_DIR/adsb-$DATE.jsonl"\n\nwhile true; do\n    TIMESTAMP=$(date -Iseconds)\n    DATA=$(curl -s http://localhost:8080/data/aircraft.json 2>/dev/null)\n    \n    if [ -n "$DATA" ]; then\n        # Append timestamped snapshot as JSON Lines\n        echo "{\"timestamp\":\"$TIMESTAMP\",\"data\":$DATA}" >> "$LOG_FILE"\n    fi\n    \n    sleep 60\ndone\nLOGEOF\nchmod +x ~/sdr-projects/adsb/adsb-logger.sh\n\n# Run in background\nnohup ~/sdr-projects/adsb/adsb-logger.sh > /dev/null 2>&1 &\n\n# === ANALYZE LOGGED DATA ===\n# After 24 hours, analyze the data:\npython3 << \'PYEOF\'\nimport json\n\nunique_aircraft = set()\ntotal_messages = 0\nmax_alt = 0\nmax_alt_flight = ""\n\nwith open(f"logs/adsb-{__import__(\'datetime\').date.today()}.jsonl") as f:\n    for line in f:\n        try:\n            snapshot = json.loads(line)\n            for ac in snapshot["data"].get("aircraft", []):\n                icao = ac.get("hex", "")\n                if icao:\n                    unique_aircraft.add(icao)\n                alt = ac.get("alt_baro", 0)\n                if isinstance(alt, (int, float)) and alt > max_alt:\n                    max_alt = alt\n                    max_alt_flight = ac.get("flight", "?").strip()\n                total_messages += 1\n        except: pass\n\nprint(f"=== ADS-B Daily Summary ===")\nprint(f"Unique aircraft: {len(unique_aircraft)}")\nprint(f"Total position reports: {total_messages}")\nprint(f"Highest aircraft: {max_alt_flight} at {max_alt:,} ft")\nPYEOF',
                language: 'Bash',
                tip: '<strong>Security application:</strong> ADS-B logs can detect anomalies. An aircraft that suddenly disappears from radar (transponder off), an aircraft flying an unusual pattern (circling, low-altitude in restricted airspace), or a spike in military traffic can all indicate significant events. Government agencies correlate ADS-B data with other intelligence sources for exactly this purpose.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>dump1090 running: <code>./dump1090 --interactive</code> shows aircraft in the terminal</li>' +
                 '<li>Web map loads: <code>http://PI_IP:8080</code> shows aircraft on the map</li>' +
                 '<li>Aircraft count: at least 5&ndash;10 aircraft visible (depends on location and antenna)</li>' +
                 '<li>JSON API works: <code>curl http://localhost:8080/data/aircraft.json</code> returns data</li>' +
                 '<li>Gain optimized: tested multiple gain values, using the one with highest aircraft count</li>' +
                 '<li>Feeder active: FlightAware or ADS-B Exchange stats page shows your data</li>' +
                 '<li>Logger running: <code>ls ~/sdr-projects/adsb/logs/</code> shows daily log files growing</li>' +
                 '<li>Position reports: aircraft show lat/lon coordinates (not just ICAO hex codes)</li>' +
                 '</ul>' +
                 '<p>You are now receiving live aircraft position data directly from radio signals. Every commercial flight within 100+ miles is visible on your dashboard. This is the same data that air traffic controllers use to manage the skies &mdash; and it is broadcast in the clear for anyone to receive.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>dump1090 shows zero aircraft:</strong> Check antenna connection and element length (6.9 cm for 1090 MHz). Try running <code>rtl_test -t</code> to confirm the dongle is working. If indoors, move the antenna to a window with a view of the sky. Low-altitude locations surrounded by buildings may have very limited line-of-sight to aircraft.</li>' +
                         '<li><strong>Web interface does not load:</strong> Confirm dump1090 was started with <code>--net</code> flag. Check that port 8080 is not blocked by a firewall: <code>sudo ufw allow 8080</code>. If using dump1090-fa, the web interface is at <code>/dump1090/</code> not the root path.</li>' +
                         '<li><strong>Aircraft appear but have no position (no lat/lon):</strong> These are Mode S replies without ADS-B position data. Older aircraft and military transponders may only transmit ICAO hex and altitude. This is normal &mdash; only ADS-B equipped aircraft broadcast position.</li>' +
                         '<li><strong>Very short range (under 30 nm):</strong> The dipole antenna is marginal for ADS-B. Build or buy a dedicated 1090 MHz antenna for significantly better range. Also check gain settings &mdash; try <code>--gain 49.6</code> for maximum sensitivity, or use the gain optimization sweep from Step 3.</li>' +
                         '<li><strong>PiAware not connecting to FlightAware:</strong> Check internet connectivity and verify credentials with <code>piaware-config</code>. Run <code>piaware-status</code> to see detailed connection state. Firewall must allow outbound connections on port 1200 and 443.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Range Optimization Competition</strong> &mdash; Build a dedicated 1090 MHz antenna (quarter-wave ground plane or collinear) and compare your maximum reception range against the dipole. Log aircraft count per hour for 24 hours with each antenna. Target: at least 2x the dipole range.</p>' +
                    '<p><strong>Challenge 2: Flight Pattern Analysis</strong> &mdash; Run the data logger for one full week. Write a Python script that identifies the busiest hour of the day, the most common flight routes over your area, and any aircraft that appear repeatedly (cargo flights, regional commuters). Visualize the daily pattern as a histogram.</p>' +
                    '<p><strong>Challenge 3: Military Traffic Detection</strong> &mdash; Feed your data to ADS-B Exchange (which does not filter military aircraft). Write a script that detects aircraft with ICAO hex codes in the military block ranges (AE0000-AE99FF for US Air Force). Log and timestamp any military aircraft detected over a 48-hour period.</p>',

        commonMistakes: [
            {
                title: 'Antenna Elements Set to Wrong Length',
                correct: 'Each dipole element should be approximately 6.9 cm for 1090 MHz reception. This is a quarter-wavelength at the ADS-B frequency.',
                incorrect: 'Dipole elements left at their previous length (e.g., 75 cm for FM radio) or fully collapsed.',
                consequence: 'Reception range drops dramatically. A 75 cm element tuned for FM receives 1090 MHz signals at 15-20 dB below optimal. You may see zero aircraft where you should see dozens.'
            },
            {
                title: 'Using AGC Instead of Fixed Gain',
                correct: 'Set a fixed gain value (typically 40-49.6 dB) using <code>--gain</code> flag. Test multiple values to find the optimum for your location.',
                incorrect: 'Leaving dump1090 on AGC (automatic gain control), which is the default if no --gain flag is specified.',
                consequence: 'AGC constantly adjusts gain, which can cause weak signals to be missed while the receiver reacts to strong ones. Fixed gain at an optimized level typically receives 10-20% more aircraft than AGC.'
            },
            {
                title: 'Running dump1090 Without --net Flag',
                correct: 'Start dump1090 with <code>--net</code> to enable the web interface, JSON API, and network output for feeder software.',
                incorrect: 'Running <code>./dump1090 --interactive</code> without <code>--net</code> and wondering why the web interface and PiAware feed do not work.',
                consequence: 'The web map at port 8080 is not served. PiAware and ADS-B Exchange feeders cannot connect. JSON data output is not available. The decoder works but only in terminal-only mode.'
            }
        ]
    },

    // ========================================================================
    // SG-55: Weather Satellite Image Receiver
    // ========================================================================
    'sg-55': {
        intro: '<p>NOAA polar-orbiting weather satellites pass overhead several times daily, broadcasting real-time infrared and visible-light images of the Earth below. With your RTL-SDR dongle, a simple antenna, and open-source decoding software, you can receive these transmissions and produce actual satellite weather images &mdash; cloud formations, storm systems, coastlines, and thermal patterns, captured directly from space.</p>' +
               '<p>The satellites transmit using APT (Automatic Picture Transmission) on 137 MHz, a protocol designed in the 1960s to be easily received by simple ground stations. The signal is an analog FM transmission carrying a 2-line scanner image. Each pass takes about 12 minutes as the satellite crosses from horizon to horizon, and the resulting image covers roughly 2,000 km wide.</p>' +
               '<p>This is the project that makes people\'s jaws drop. You are literally receiving images from a satellite 850 km above you, traveling at 27,000 km/h, using a $25 radio dongle and a homemade antenna. No internet required. No API. No subscription. Just you and the satellite.</p>',

        wiring: '    NOAA Satellite (850 km altitude)\n' +
                '         |\n' +
                '         |  APT signal @ 137 MHz\n' +
                '         |  (analog FM, 2 lines/sec)\n' +
                '         v\n' +
                '    +-----------+     +-----------+     +------------+\n' +
                '    | V-Dipole  |---->| RTL-SDR   |---->| Raspberry  |\n' +
                '    | or QFH    |     | Dongle    |     | Pi         |\n' +
                '    | Antenna   |     | 137 MHz   |     | rtl_fm +   |\n' +
                '    | (outdoor) |     |           |     | noaa-apt   |\n' +
                '    +-----------+     +-----------+     +------+-----+\n' +
                '                                              |\n' +
                '    Schedule: predict satellite passes         v\n' +
                '    with gpredict or pass-predict.py    [Decoded Image]\n' +
                '    Record during the pass window       Cloud maps from space\n' +
                '    Decode the audio to an image',

        wiringNotes: '<p><strong>Antenna is critical:</strong> The 137 MHz band requires a properly sized antenna. Set your dipole elements to <strong>54.7 cm each</strong>. For best results, mount the antenna <strong>horizontally</strong> (NOAA satellites transmit right-hand circular polarization; a horizontal dipole captures more signal than a vertical one). A V-dipole at 120&deg; angle is even better. The gold standard is a QFH (Quadrifilar Helix) antenna &mdash; you can build one from coax cable.</p>' +
                     '<p><strong>Satellite passes:</strong> NOAA-15, NOAA-18, and NOAA-19 are the active APT satellites. Each passes overhead 2&ndash;4 times per day (depending on your latitude). Higher elevation passes (more overhead) produce better images. Use <a href="https://www.n2yo.com/" target="_blank" rel="noopener">n2yo.com</a> or <code>gpredict</code> to predict passes for your location.</p>' +
                     '<p><strong>APT frequencies:</strong> NOAA-15: 137.620 MHz, NOAA-18: 137.9125 MHz, NOAA-19: 137.100 MHz. These are fixed and do not change.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg55-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg55-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-55 NOAA WEATHER SATELLITE RECEIVER</text>' +

            '<!-- NOAA Satellite -->' +
            '<g>' +
            '<rect x="40" y="50" width="140" height="80" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<rect x="40" y="50" width="140" height="20" rx="8" fill="rgba(234,179,8,0.12)"/>' +
            '<text x="110" y="65" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="600">NOAA SATELLITE</text>' +
            '<!-- Solar panels -->' +
            '<rect x="10" y="70" width="28" height="40" rx="2" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="0.8"/>' +
            '<rect x="172" y="70" width="28" height="40" rx="2" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="0.8"/>' +
            '<text x="24" y="94" text-anchor="middle" fill="#60a5fa" font-size="5">Solar</text>' +
            '<text x="186" y="94" text-anchor="middle" fill="#60a5fa" font-size="5">Solar</text>' +
            '<!-- Orbit info -->' +
            '<text x="110" y="86" text-anchor="middle" fill="#8b949e" font-size="6">850 km polar orbit</text>' +
            '<text x="110" y="98" text-anchor="middle" fill="#8b949e" font-size="6">APT @ 137 MHz</text>' +
            '<text x="110" y="110" text-anchor="middle" fill="#555" font-size="5">2 lines/sec &bull; analog FM</text>' +
            '<text x="110" y="122" text-anchor="middle" fill="#555" font-size="5">27,000 km/h orbital velocity</text>' +
            '</g>' +

            '<!-- Signal path from satellite -->' +
            '<line x1="110" y1="132" x2="110" y2="155" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3"><animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></line>' +
            '<line x1="110" y1="155" x2="180" y2="195" stroke="#eab308" stroke-width="1" stroke-dasharray="4,3"><animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></line>' +
            '<text x="155" y="170" fill="#eab308" font-size="5" transform="rotate(-30,155,170)">137 MHz APT</text>' +

            '<!-- V-Dipole Antenna -->' +
            '<g>' +
            '<rect x="150" y="195" width="120" height="85" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="150" y="195" width="120" height="20" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="210" y="210" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">V-DIPOLE ANT</text>' +
            '<!-- V shape -->' +
            '<line x1="210" y1="250" x2="175" y2="225" stroke="#22c55e" stroke-width="2"/>' +
            '<line x1="210" y1="250" x2="245" y2="225" stroke="#22c55e" stroke-width="2"/>' +
            '<text x="210" y="265" text-anchor="middle" fill="#8b949e" font-size="5">54.7 cm elements</text>' +
            '<text x="210" y="275" text-anchor="middle" fill="#555" font-size="5">120&#176; V-angle &bull; horizontal</text>' +
            '</g>' +

            '<!-- Coax to RTL-SDR -->' +
            '<line x1="270" y1="240" x2="320" y2="240" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="295" y="234" text-anchor="middle" fill="#eab308" font-size="5">coax</text>' +

            '<!-- RTL-SDR Dongle -->' +
            '<g>' +
            '<rect x="320" y="200" width="120" height="80" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="320" y="200" width="120" height="20" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="380" y="215" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="700">RTL-SDR V4</text>' +
            '<rect x="340" y="230" width="60" height="20" rx="3" fill="#2a2a3a" stroke="#eab308" stroke-width="0.8"/>' +
            '<text x="370" y="243" text-anchor="middle" fill="#eab308" font-size="6">RTL2832U</text>' +
            '<text x="380" y="268" text-anchor="middle" fill="#555" font-size="5">Gain: 40 dB &bull; 48 kHz sample</text>' +
            '</g>' +

            '<!-- USB to Pi -->' +
            '<line x1="440" y1="240" x2="490" y2="240" stroke="#555" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            '<text x="465" y="234" text-anchor="middle" fill="#555" font-size="5">USB</text>' +

            '<!-- Raspberry Pi -->' +
            '<g>' +
            '<rect x="490" y="195" width="140" height="90" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="490" y="195" width="140" height="20" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="560" y="210" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">RASPBERRY PI</text>' +
            '<text x="560" y="232" text-anchor="middle" fill="#8b949e" font-size="6">rtl_fm -f 137.1M</text>' +
            '<text x="560" y="245" text-anchor="middle" fill="#8b949e" font-size="6">sox &#8594; WAV</text>' +
            '<text x="560" y="258" text-anchor="middle" fill="#8b949e" font-size="6">noaa-apt decoder</text>' +
            '<text x="560" y="275" text-anchor="middle" fill="#555" font-size="5">predict &bull; gpredict</text>' +
            '</g>' +

            '<!-- Arrow to Decoded Image -->' +
            '<line x1="560" y1="288" x2="560" y2="310" stroke="#22c55e" stroke-width="1.5"/>' +
            '<polygon points="555,310 565,310 560,318" fill="#22c55e"/>' +

            '<!-- Decoded Image -->' +
            '<g>' +
            '<rect x="490" y="320" width="140" height="55" rx="8" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="560" y="338" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">DECODED IMAGE</text>' +
            '<text x="560" y="353" text-anchor="middle" fill="#8b949e" font-size="6">Visible + Infrared channels</text>' +
            '<text x="560" y="365" text-anchor="middle" fill="#555" font-size="5">2080px wide &bull; cloud maps from space</text>' +
            '</g>' +

            '<!-- Frequency Reference -->' +
            '<rect x="30" y="300" width="200" height="75" rx="6" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="316" fill="#eab308" font-size="7" font-weight="600">APT FREQUENCIES</text>' +
            '<text x="40" y="330" fill="#22c55e" font-size="6">NOAA-15: 137.620 MHz</text>' +
            '<text x="40" y="343" fill="#60a5fa" font-size="6">NOAA-18: 137.9125 MHz</text>' +
            '<text x="40" y="356" fill="#f97316" font-size="6">NOAA-19: 137.100 MHz</text>' +
            '<text x="40" y="369" fill="#555" font-size="5">Passes: 2-4x/day &bull; ~12 min each</text>' +

            '<!-- Signal wave animation -->' +
            '<g opacity="0.6">' +
            '<path d="M 95,150 Q 100,145 105,150 Q 110,155 115,150 Q 120,145 125,150" fill="none" stroke="#eab308" stroke-width="0.8"><animate attributeName="d" values="M 95,150 Q 100,145 105,150 Q 110,155 115,150 Q 120,145 125,150;M 95,150 Q 100,155 105,150 Q 110,145 115,150 Q 120,155 125,150;M 95,150 Q 100,145 105,150 Q 110,155 115,150 Q 120,145 125,150" dur="1.5s" repeatCount="indefinite"/></path>' +
            '</g>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install Satellite Tracking and Decoding Software',
                content: '<p>You need three tools: a satellite pass predictor (to know when NOAA satellites are overhead), <code>rtl_fm</code> (to record the APT signal), and <code>noaa-apt</code> or <code>wxtoimg</code> (to decode the audio recording into a weather image).</p>',
                code: '# Install satellite prediction tools\nsudo apt install predict gpredict -y\n# predict: CLI satellite tracker\n# gpredict: GUI satellite tracker (if you have a desktop)\n\n# Install noaa-apt decoder\n# (Rust-based, produces beautiful images)\nwget https://github.com/martinber/noaa-apt/releases/latest/download/noaa-apt-linux-gnu-x86_64.zip\n# For ARM (Raspberry Pi):\nwget https://github.com/martinber/noaa-apt/releases/latest/download/noaa-apt-linux-gnu-aarch64.zip\nunzip noaa-apt-*.zip -d ~/noaa-apt\nchmod +x ~/noaa-apt/noaa-apt\n\n# Alternative: wxtoimg (classic decoder, more features)\n# Download from https://wxtoimgrestored.xyz/\n# wxtoimg is closed-source but the community maintains mirrors\n\n# Create project directories\nmkdir -p ~/sdr-projects/weather-sat/{recordings,images,passes}\n\n# Install sox for audio processing\nsudo apt install sox -y',
                language: 'Bash',
                tip: '<strong>Which decoder?</strong> <code>noaa-apt</code> is simpler and produces clean images. <code>wxtoimg</code> offers more enhancements (false color, temperature overlays, map overlays) but is harder to set up. Start with noaa-apt, switch to wxtoimg later when you want advanced features.'
            },
            {
                title: 'Predict the Next Satellite Pass',
                content: '<p>NOAA satellites orbit at ~850 km altitude in polar orbits, completing one revolution every ~100 minutes. They pass overhead at predictable times. You need to know when a satellite will be above your horizon and which direction it will travel.</p>',
                code: '# Update satellite TLE (Two-Line Element) data\n# TLE is the orbital parameters that prediction tools use\nwget -q -O ~/sdr-projects/weather-sat/weather.tle \\\n  "https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle"\n\n# Find the next passes for your location\n# Replace lat/lon with your coordinates\npython3 << \'PYEOF\'\nfrom datetime import datetime, timedelta\nimport subprocess\nimport re\n\n# Your location (edit these!)\nLAT = 26.12   # North latitude\nLON = -80.14  # West longitude (negative for West)\nALT = 5       # Altitude in meters\n\nsatellites = {\n    "NOAA 15": "137.620",\n    "NOAA 18": "137.9125",\n    "NOAA 19": "137.100"\n}\n\nprint(f"=== NOAA Satellite Pass Predictions ===")\nprint(f"Location: {LAT}°N, {abs(LON)}°W")\nprint(f"Date: {datetime.now().strftime(\'%Y-%m-%d %H:%M\')}")\nprint()\n\n# Use the \'predict\' command for each satellite\nfor sat, freq in satellites.items():\n    print(f"--- {sat} ({freq} MHz) ---")\n    # Check n2yo.com or use gpredict for precise predictions\n    print(f"  Check: https://www.n2yo.com/?s={sat.replace(\' \', \'+\')}")\n    print()\n\nprint("For automated predictions, use gpredict (GUI)")\nprint("or install python-skyfield for scripted predictions")\nPYEOF\n\n# Or use n2yo.com in your browser:\n# https://www.n2yo.com/passes/?s=25338  (NOAA 15)\n# https://www.n2yo.com/passes/?s=28654  (NOAA 18)\n# https://www.n2yo.com/passes/?s=33591  (NOAA 19)\n# Enter your location, look for passes with max elevation > 30°',
                language: 'Bash',
                tip: '<strong>Elevation matters:</strong> A pass that reaches 80&deg; elevation (nearly overhead) will produce a much better image than one that only reaches 20&deg; (near the horizon). Aim for passes with max elevation above 30&deg;. The highest pass of the day typically produces the cleanest image.'
            },
            {
                title: 'Record a Satellite Pass',
                content: '<p>When a NOAA satellite is about to pass overhead, start recording the 137 MHz APT signal. The recording captures about 12 minutes of audio as the satellite crosses from one horizon to the other. Timing is important &mdash; start recording 1&ndash;2 minutes before the pass begins and stop 1&ndash;2 minutes after it ends.</p>',
                code: '# Record NOAA-19 (137.100 MHz) — adjust frequency for the satellite passing\n# Start this 1-2 minutes before the predicted pass\n\n# Set variables\nSAT_FREQ="137.100M"     # NOAA-19\nSAT_NAME="noaa19"\nDURATION=900             # 15 minutes (12 min pass + margin)\nGAIN=40                  # Adjust based on your setup\nOUTPUT=~/sdr-projects/weather-sat/recordings/${SAT_NAME}-$(date +%Y%m%d-%H%M%S).wav\n\necho "Recording $SAT_NAME at $SAT_FREQ for $DURATION seconds..."\necho "Output: $OUTPUT"\necho "Press Ctrl+C to stop early"\n\n# Record and convert to WAV in one step\ntimeout $DURATION rtl_fm \\\n  -f $SAT_FREQ \\\n  -M fm \\\n  -s 48000 \\\n  -g $GAIN \\\n  -p 0 \\\n  -E dc \\\n  -A fast \\\n  - | sox -t raw -r 48000 -e s -b 16 -c 1 - $OUTPUT\n\n# Check the recording\necho ""\necho "Recording complete!"\nls -lh $OUTPUT\nsoxi $OUTPUT  # Show audio file details\n\n# Play it back (you will hear the distinctive APT chirp)\nplay $OUTPUT\n# APT sounds like a rhythmic "tick-tick-tick" — two ticks per second\n# Each tick is one scan line of the image',
                language: 'Bash',
                tip: '<strong>The APT sound is distinctive:</strong> When you play the recording, you will hear a rhythmic ticking/chirping at exactly 2 lines per second (4160 Hz subcarrier). This is the sound of a satellite sending you an image, one line at a time. If you hear static with no pattern, the pass may have been below the horizon or the antenna was not positioned correctly. Try the next pass.'
            },
            {
                title: 'Decode the Recording to an Image',
                content: '<p>Feed the audio recording into the APT decoder. It extracts the image data from the audio signal and produces a grayscale (or enhanced color) weather image. The image shows two channels side by side: visible light (daytime) and infrared (thermal, works day and night).</p>',
                code: '# Decode with noaa-apt\n~/noaa-apt/noaa-apt $OUTPUT -o ~/sdr-projects/weather-sat/images/${SAT_NAME}-$(date +%Y%m%d).png\n\n# The output image will be:\n# - Width: 2080 pixels (two channels side by side)\n# - Height: varies by pass duration (typically 800-1600 lines)\n# - Left half: Channel A (visible or near-IR, depending on time)\n# - Right half: Channel B (thermal IR)\n# - Sync bars and telemetry visible at the edges\n\n# View the image\n# If on desktop:\nxdg-open ~/sdr-projects/weather-sat/images/${SAT_NAME}-$(date +%Y%m%d).png\n\n# If headless, transfer to your computer:\n# scp pi@PI_IP:~/sdr-projects/weather-sat/images/*.png ~/Desktop/\n\n# === ENHANCE WITH wxtoimg (if installed) ===\n# wxtoimg offers false-color enhancement:\n# wxtoimg -e MSA $OUTPUT enhanced-msa.png     # Multi-Spectral Analysis\n# wxtoimg -e HVCT $OUTPUT enhanced-hvct.png   # HVC Temperature\n# wxtoimg -e sea $OUTPUT enhanced-sea.png     # Sea surface temperature\n# wxtoimg -m map.png $OUTPUT map-overlay.png  # Map overlay with borders\n\n# === WHAT YOU WILL SEE ===\n# Clear weather: coastlines, ocean, clouds as white patches\n# Storms: massive cloud formations, spiral patterns\n# Night passes: only IR channel shows data (thermal)\n# Coastlines are visible because land and sea have different temperatures\n# Snow and ice appear bright white in visible, dark in IR\n\nls -lh ~/sdr-projects/weather-sat/images/\necho ""\necho "Your satellite image is ready!"',
                language: 'Bash',
                tip: '<strong>Your first image will not be perfect.</strong> Expect noise lines, fading at the horizons (signal weakens as the satellite is low), and maybe some warping. This is normal &mdash; you are receiving a 1960s-era analog signal from a satellite 850 km away with a $25 radio. Each attempt gets better as you refine your antenna placement, gain settings, and timing. The moment you see recognizable coastlines and cloud patterns in YOUR image, from YOUR antenna, decoded by YOUR software &mdash; that is a feeling no API call will ever match.'
            },
            {
                title: 'Automate Satellite Capture',
                content: '<p>Set up a fully automated capture station that predicts passes, records them, decodes the images, and archives everything. This runs 24/7 and produces weather images every time a NOAA satellite is overhead.</p>',
                code: '# Create an automated capture script\ncat << \'CAPTEOF\' > ~/sdr-projects/weather-sat/auto-capture.sh\n#!/bin/bash\n# Automated NOAA satellite capture station\n# Checks for upcoming passes and records them automatically\n\nREC_DIR=~/sdr-projects/weather-sat/recordings\nIMG_DIR=~/sdr-projects/weather-sat/images\nLOG=~/sdr-projects/weather-sat/capture.log\n\n# Satellite frequencies\ndeclare -A SATS\nSATS[NOAA15]="137.620M"\nSATS[NOAA18]="137.9125M"\nSATS[NOAA19]="137.100M"\n\nlog() { echo "[$(date +\'%Y-%m-%d %H:%M:%S\')] $1" >> "$LOG"; }\n\nrecord_and_decode() {\n    local name=$1\n    local freq=$2\n    local duration=$3\n    local timestamp=$(date +%Y%m%d-%H%M%S)\n    local wav="$REC_DIR/${name}-${timestamp}.wav"\n    local img="$IMG_DIR/${name}-${timestamp}.png"\n\n    log "START: $name at $freq for ${duration}s"\n\n    timeout $duration rtl_fm -f $freq -M fm -s 48000 -g 42 -p 0 -E dc -A fast - | \\\n        sox -t raw -r 48000 -e s -b 16 -c 1 - "$wav" 2>/dev/null\n\n    if [ -f "$wav" ] && [ -s "$wav" ]; then\n        ~/noaa-apt/noaa-apt "$wav" -o "$img" 2>/dev/null\n        log "DECODED: $img ($(du -h "$img" | cut -f1))"\n\n        # Clean up recording to save space (keep images only)\n        rm -f "$wav"\n    else\n        log "FAIL: No recording produced for $name"\n    fi\n}\n\nlog "=== Auto-capture station started ==="\nlog "Monitoring for satellite passes..."\n\n# For a proper implementation, integrate with pyorbital or skyfield\n# to predict passes and trigger recording at the right time.\n# For now, this is a manual trigger framework.\n\n# Example: record NOAA-19 for 15 minutes\n# record_and_decode "NOAA19" "137.100M" 900\nCAPTEOF\nchmod +x ~/sdr-projects/weather-sat/auto-capture.sh\n\n# For full automation, install pyorbital:\npip3 install pyorbital\n\n# Or schedule known pass times via cron:\n# Use n2yo.com to find pass times for the next week\n# Add cron entries for each pass:\n# Example (times from prediction):\n# 30 14 24 3 * /home/pi/sdr-projects/weather-sat/auto-capture.sh NOAA19 137.100M 900\n\necho "Capture station ready."\necho "Check ~/sdr-projects/weather-sat/images/ for decoded images"',
                language: 'Bash',
                tip: '<strong>Gallery:</strong> After a week of automated capture, you will have a gallery of weather images showing how storm systems develop, clouds move, and the thermal signature of the Earth changes between day and night. This is real science data &mdash; the same imagery that meteorologists use for weather forecasting, just at a lower resolution. Some hobbyists create time-lapse videos from their satellite image archives, showing weather patterns evolving over days.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Satellite pass predicted: you know when the next NOAA pass occurs at your location</li>' +
                 '<li>Recording captured: WAV file exists and is 5&ndash;15 minutes long</li>' +
                 '<li>APT signal audible: playing the WAV produces the distinctive 2-line/sec chirp</li>' +
                 '<li>Image decoded: PNG file shows recognizable features (clouds, coastlines, ocean)</li>' +
                 '<li>Two channels visible: left (visible/near-IR) and right (thermal IR) side by side</li>' +
                 '<li>Antenna optimized: dipole elements at 54.7 cm, mounted horizontally, near a window or outside</li>' +
                 '<li>Multiple passes captured: at least 2&ndash;3 images from different passes</li>' +
                 '</ul>' +
                 '<p>You have received an image from space. A satellite orbiting at 850 km altitude, traveling at 27,000 km/h, transmitted a picture of the Earth below, and your $25 radio dongle caught it. No internet, no API, no subscription &mdash; just radio waves traveling 850 km from space to your antenna. This is one of the most impressive things you can do with an SDR.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Recording contains only static, no APT chirp:</strong> The satellite was not overhead during the recording. Verify the pass prediction time and your location coordinates. Also confirm the frequency &mdash; NOAA-15 is 137.620 MHz, NOAA-18 is 137.9125 MHz, NOAA-19 is 137.100 MHz. Using the wrong frequency for the passing satellite yields nothing.</li>' +
                         '<li><strong>Decoded image is mostly black or white with no features:</strong> Gain is too low or too high. Start at <code>-g 40</code> and adjust. Also check the antenna element length &mdash; must be 54.7 cm each for 137 MHz. If the antenna is indoors far from a window, the signal may be too weak to produce a usable image.</li>' +
                         '<li><strong>Image has heavy noise lines across it:</strong> Interference from nearby electronics. Move the antenna away from computers, monitors, and power supplies. USB cables are notorious RF noise sources. Use a USB extension cable to place the dongle near the antenna and away from the computer.</li>' +
                         '<li><strong>Image is warped or skewed:</strong> Sample rate mismatch between recording and decoder. Ensure <code>rtl_fm</code> uses <code>-s 48000</code> and sox converts at the matching rate. Some decoders expect 11025 Hz &mdash; check the decoder documentation.</li>' +
                         '<li><strong>noaa-apt produces an error about file format:</strong> The WAV file may be corrupted or in the wrong format. Verify with <code>soxi recording.wav</code> &mdash; it should show 48000 Hz, 16-bit, mono. If the format is wrong, re-convert with sox: <code>sox input.wav -r 48000 -b 16 -c 1 output.wav</code>.</li>' +
                         '<li><strong>Signal fades in and out during the pass:</strong> This is normal. The satellite is weaker near the horizons (low elevation) and strongest when directly overhead. The image edges will have more noise than the center. A QFH antenna greatly improves horizon-to-horizon reception.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: QFH Antenna Build</strong> &mdash; Build a Quadrifilar Helix (QFH) antenna for 137 MHz from coaxial cable following published designs. Compare satellite image quality between the dipole and the QFH. The QFH should produce noticeably cleaner images with better reception near the horizons.</p>' +
                    '<p><strong>Challenge 2: Automated Capture Station</strong> &mdash; Set up a fully automated station using <code>pyorbital</code> or <code>skyfield</code> to predict passes, cron jobs to trigger recording, and automatic decoding. Run it for one week and build a gallery of weather images showing weather system evolution over time.</p>' +
                    '<p><strong>Challenge 3: METEOR M2 Satellite</strong> &mdash; Receive and decode images from the Russian METEOR M2 satellite (137.1 MHz, LRPT digital protocol). This produces higher-resolution color images than NOAA APT. Use <code>meteor_demod</code> and <code>medet</code> for decoding. Compare image quality between NOAA APT and METEOR LRPT.</p>',

        commonMistakes: [
            {
                title: 'Recording the Wrong Satellite Frequency',
                correct: 'Match the frequency to the specific satellite that is passing overhead: NOAA-15 = 137.620 MHz, NOAA-18 = 137.9125 MHz, NOAA-19 = 137.100 MHz.',
                incorrect: 'Recording on 137.100 MHz when NOAA-18 (137.9125 MHz) is the satellite currently overhead.',
                consequence: 'The recording captures nothing but noise. Each satellite transmits on a fixed, unique frequency. There is no signal at the wrong frequency even during a valid pass. Always verify which satellite is passing before starting the recording.'
            },
            {
                title: 'Antenna Oriented Vertically Instead of Horizontally',
                correct: 'Mount the dipole antenna horizontally (or as a V-dipole at 120 degrees) for NOAA satellite reception. The satellites transmit right-hand circular polarization which couples better to horizontal elements.',
                incorrect: 'Leaving the dipole antenna in a vertical orientation as used for FM radio or other VHF signals.',
                consequence: 'Signal strength is reduced by 3-6 dB. Images will have more noise and may be unusable on low-elevation passes. Horizontal or V-dipole orientation significantly improves NOAA APT reception.'
            },
            {
                title: 'Not Starting Recording Before the Pass',
                correct: 'Begin recording 1-2 minutes before the predicted pass start time. Satellite predictions have some uncertainty, and the signal may appear earlier than expected.',
                incorrect: 'Starting the recording exactly at the predicted AOS (Acquisition of Signal) time or after the satellite is already overhead.',
                consequence: 'You miss the beginning of the pass, losing the first portion of the image. The strongest signal is when the satellite is at maximum elevation, so a late start is recoverable, but an early start is always safer.'
            }
        ]
    },

    // ========================================================================
    // SG-56: Pager and POCSAG Decoder
    // ========================================================================
    'sg-56': {
        intro: '<p>Pagers are still used in hospitals, fire departments, and emergency services worldwide. They transmit unencrypted text messages on VHF frequencies (150&ndash;170 MHz) using the POCSAG protocol &mdash; a digital format from 1982 that has never been updated with encryption. With your RTL-SDR and the <code>multimon-ng</code> decoder, you can receive and read these messages in real time.</p>' +
               '<p>This is one of the most eye-opening SDR projects for security students. Hospital paging systems transmit patient names, room numbers, and medical conditions in cleartext. Emergency dispatch systems broadcast incident details, addresses, and unit assignments. All of it is readable by anyone with a $25 radio dongle.</p>' +
               '<p>The lesson is stark: <strong>legacy protocols without encryption are a privacy catastrophe.</strong> POCSAG was designed before anyone considered that radio signals could be trivially intercepted by consumer hardware. The same vulnerability class exists in SCADA systems, legacy industrial controls, and unencrypted IoT protocols today.</p>',

        wiring: '    Pager Infrastructure\n' +
                '    \n' +
                '    Hospital/Emergency          Pager Transmitter        Your SDR\n' +
                '    +---------------+          +---------------+        +----------+\n' +
                '    | Dispatch      |--------->| VHF Tower     |))))))) | RTL-SDR  |\n' +
                '    | System        | landline | 150-170 MHz   | radio  | + dipole |\n' +
                '    | "Code Blue    |          | POCSAG 512/   | waves  | 48cm     |\n' +
                '    |  Room 412"    |          | 1200/2400 bps |        | elements |\n' +
                '    +---------------+          +---------------+        +----------+\n' +
                '                                                             |\n' +
                '    Pagers (one-way receive)    multimon-ng decodes     +---------+\n' +
                '    +------+  +------+         POCSAG frames into      | Decoded  |\n' +
                '    |Pager1|  |Pager2|         readable text           | Messages |\n' +
                '    +------+  +------+                                 +---------+',

        wiringNotes: '<p><strong>Frequency:</strong> Pager frequencies vary by region and provider. In the US, most paging is in the 152&ndash;163 MHz range. Use <code>rtl_power</code> to scan this range and identify active pager transmitters near you &mdash; they appear as brief narrow bursts on the waterfall.</p>' +
                     '<p><strong>Antenna:</strong> Set dipole elements to approximately <strong>48 cm each</strong> for the 152&ndash;163 MHz range. Vertical orientation works best for pager signals.</p>' +
                     '<p><strong>Legal:</strong> Receiving pager signals is legal in most jurisdictions (including the US under the Communications Act). However, <em>disclosing</em> the content of intercepted communications to third parties may violate wiretapping laws. Receive for educational purposes, do not share or publish intercepted messages, especially those containing personal or medical information.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg56-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg56-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-56 PAGER &amp; POCSAG DECODER</text>' +

            '<!-- Hospital / Dispatch -->' +
            '<g>' +
            '<rect x="30" y="55" width="150" height="110" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="30" y="55" width="150" height="20" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="105" y="70" text-anchor="middle" fill="#fca5a5" font-size="8" font-weight="600">HOSPITAL DISPATCH</text>' +
            '<text x="105" y="92" text-anchor="middle" fill="#8b949e" font-size="6">&#8220;Code Blue Room 412&#8221;</text>' +
            '<text x="105" y="106" text-anchor="middle" fill="#8b949e" font-size="6">&#8220;MVA I-95 MP 42&#8221;</text>' +
            '<text x="105" y="120" text-anchor="middle" fill="#8b949e" font-size="6">&#8220;Trauma alert Bay 3&#8221;</text>' +
            '<text x="105" y="140" text-anchor="middle" fill="#555" font-size="5">POCSAG 512/1200/2400 baud</text>' +
            '<text x="105" y="152" text-anchor="middle" fill="#ef4444" font-size="5">NO ENCRYPTION</text>' +
            '</g>' +

            '<!-- Landline connection -->' +
            '<line x1="180" y1="110" x2="240" y2="110" stroke="#8b949e" stroke-width="1.5"/>' +
            '<text x="210" y="104" text-anchor="middle" fill="#555" font-size="5">landline</text>' +

            '<!-- VHF Pager Tower -->' +
            '<g>' +
            '<rect x="240" y="45" width="130" height="130" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="240" y="45" width="130" height="20" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="305" y="60" text-anchor="middle" fill="#fb923c" font-size="8" font-weight="600">VHF TOWER</text>' +
            '<!-- Tower graphic -->' +
            '<line x1="305" y1="75" x2="305" y2="120" stroke="#f97316" stroke-width="2"/>' +
            '<line x1="290" y1="120" x2="320" y2="120" stroke="#f97316" stroke-width="1.5"/>' +
            '<line x1="295" y1="110" x2="315" y2="110" stroke="#f97316" stroke-width="1"/>' +
            '<circle cx="305" cy="72" r="4" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1"/>' +
            '<text x="305" y="138" text-anchor="middle" fill="#8b949e" font-size="6">150-170 MHz</text>' +
            '<text x="305" y="150" text-anchor="middle" fill="#555" font-size="5">High power (100-500W)</text>' +
            '<text x="305" y="162" text-anchor="middle" fill="#555" font-size="5">One-way broadcast</text>' +
            '</g>' +

            '<!-- RF waves from tower to SDR -->' +
            '<g>' +
            '<path d="M 372,90 Q 390,80 410,90" fill="none" stroke="rgba(249,115,22,0.5)" stroke-width="1"><animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite"/></path>' +
            '<path d="M 375,85 Q 395,72 418,85" fill="none" stroke="rgba(249,115,22,0.4)" stroke-width="0.8"><animate attributeName="stroke-opacity" values="0.1;0.6;0.1" dur="1.5s" begin="0.3s" repeatCount="indefinite"/></path>' +
            '<path d="M 378,80 Q 400,65 425,80" fill="none" stroke="rgba(249,115,22,0.3)" stroke-width="0.6"><animate attributeName="stroke-opacity" values="0.1;0.5;0.1" dur="1.5s" begin="0.6s" repeatCount="indefinite"/></path>' +
            '<text x="400" y="100" text-anchor="middle" fill="#f97316" font-size="5">RF waves</text>' +
            '</g>' +

            '<!-- RTL-SDR + Antenna -->' +
            '<g>' +
            '<rect x="430" y="50" width="130" height="100" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="430" y="50" width="130" height="20" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="495" y="65" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="700">RTL-SDR V4</text>' +
            '<!-- Antenna -->' +
            '<line x1="440" y1="80" x2="440" y2="55" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="440" y1="55" x2="430" y2="45" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="440" y1="55" x2="450" y2="45" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="440" y="42" text-anchor="middle" fill="#22c55e" font-size="5">48cm</text>' +
            '<text x="495" y="88" text-anchor="middle" fill="#8b949e" font-size="6">Tuned to 152-163 MHz</text>' +
            '<text x="495" y="102" text-anchor="middle" fill="#8b949e" font-size="6">-M fm -s 22050</text>' +
            '<text x="495" y="116" text-anchor="middle" fill="#555" font-size="5">NFM demod &bull; gain 40 dB</text>' +
            '<text x="495" y="130" text-anchor="middle" fill="#555" font-size="5">squelch off (-l 0)</text>' +
            '</g>' +

            '<!-- USB to Pi -->' +
            '<line x1="495" y1="152" x2="495" y2="180" stroke="#555" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            '<text x="508" y="170" fill="#555" font-size="5">USB</text>' +

            '<!-- Raspberry Pi + multimon-ng -->' +
            '<g>' +
            '<rect x="430" y="180" width="160" height="100" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="430" y="180" width="160" height="20" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="510" y="195" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">RASPBERRY PI</text>' +
            '<text x="510" y="216" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="600">multimon-ng</text>' +
            '<text x="510" y="232" text-anchor="middle" fill="#8b949e" font-size="6">POCSAG 512/1200/2400</text>' +
            '<text x="510" y="246" text-anchor="middle" fill="#8b949e" font-size="6">FLEX protocol</text>' +
            '<text x="510" y="260" text-anchor="middle" fill="#555" font-size="5">rtl_fm | multimon-ng -a POCSAG*</text>' +
            '<text x="510" y="272" text-anchor="middle" fill="#555" font-size="5">Decoded text &#8594; log file</text>' +
            '</g>' +

            '<!-- Decoded Messages Output -->' +
            '<line x1="510" y1="282" x2="510" y2="305" stroke="#22c55e" stroke-width="1.5"/>' +
            '<polygon points="505,305 515,305 510,313" fill="#22c55e"/>' +
            '<g>' +
            '<rect x="430" y="315" width="260" height="65" rx="8" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.25)" stroke-width="1"/>' +
            '<text x="440" y="332" fill="#4ade80" font-size="7" font-weight="600">DECODED MESSAGES</text>' +
            '<text x="440" y="347" fill="#8b949e" font-size="5.5">POCSAG1200: Addr: 1234567 Alpha: Code Blue Room 412</text>' +
            '<text x="440" y="360" fill="#8b949e" font-size="5.5">POCSAG1200: Addr: 2345678 Alpha: MVA I-95 MP 42</text>' +
            '<text x="440" y="373" fill="#ef4444" font-size="5.5">Cleartext &bull; No encryption &bull; HIPAA exposure</text>' +
            '</g>' +

            '<!-- Pagers (one-way) -->' +
            '<g>' +
            '<rect x="30" y="200" width="140" height="80" rx="8" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>' +
            '<text x="100" y="220" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="600">PAGERS (receive-only)</text>' +
            '<rect x="50" y="232" width="40" height="25" rx="4" fill="#1e2736" stroke="#a78bfa" stroke-width="0.8"/>' +
            '<text x="70" y="248" text-anchor="middle" fill="#a78bfa" font-size="5">Pager 1</text>' +
            '<rect x="110" y="232" width="40" height="25" rx="4" fill="#1e2736" stroke="#a78bfa" stroke-width="0.8"/>' +
            '<text x="130" y="248" text-anchor="middle" fill="#a78bfa" font-size="5">Pager 2</text>' +
            '<text x="100" y="272" text-anchor="middle" fill="#555" font-size="5">One-way &bull; No ack &bull; No encryption</text>' +
            '</g>' +

            '<!-- Signal from tower to pagers -->' +
            '<line x1="290" y1="175" x2="120" y2="200" stroke="rgba(249,115,22,0.3)" stroke-width="1" stroke-dasharray="3,3"/>' +

            '<!-- Security Warning -->' +
            '<rect x="30" y="310" width="170" height="65" rx="6" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="40" y="328" fill="#ef4444" font-size="7" font-weight="600">SECURITY LESSON</text>' +
            '<text x="40" y="343" fill="#8b949e" font-size="5.5">Protocol designed in 1982</text>' +
            '<text x="40" y="356" fill="#8b949e" font-size="5.5">Zero encryption, zero auth</text>' +
            '<text x="40" y="369" fill="#8b949e" font-size="5.5">Same vuln class as SCADA/ICS</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install multimon-ng Decoder',
                content: '<p><code>multimon-ng</code> is a multi-protocol decoder that handles POCSAG (512, 1200, 2400 baud), FLEX, DTMF, and other signaling formats. It reads raw audio from <code>rtl_fm</code> and outputs decoded text messages.</p>',
                code: '# Install multimon-ng\nsudo apt install multimon-ng -y\n\n# Verify installation\nmultimon-ng --help 2>&1 | head -5\n# Should show: multimon-ng 1.x.x\n\n# List supported protocols\nmultimon-ng -h 2>&1 | grep -A50 "enabled demodulators"\n# You will see: POCSAG512, POCSAG1200, POCSAG2400, FLEX, etc.',
                language: 'Bash',
                tip: '<strong>POCSAG baud rates:</strong> POCSAG comes in three speeds: 512, 1200, and 2400 baud. Most systems use 1200 or 512. multimon-ng decodes all three simultaneously by default, so you do not need to know the baud rate in advance.'
            },
            {
                title: 'Find Active Pager Frequencies',
                content: '<p>Before you can decode pager messages, you need to find which frequencies are active in your area. Pager transmitters are high-power (hundreds of watts) and easy to receive.</p>',
                code: '# Scan the pager band (152-163 MHz in US)\nrtl_power -f 150M:165M:12.5k -g 40 -i 10 -e 120 pager-scan.csv\n\n# Find the strongest signals\npython3 -c "\nimport csv\nsignals = {}\nwith open(\"pager-scan.csv\") as f:\n    for row in csv.reader(f):\n        if len(row) >= 7:\n            try:\n                freq = float(row[2])\n                power = max(float(x) for x in row[6:])\n                if freq not in signals or power > signals[freq]:\n                    signals[freq] = power\n            except: pass\n\nprint(\"Active pager frequencies:\")\nfor freq, power in sorted(signals.items(), key=lambda x: -x[1])[:15]:\n    if power > -40:\n        print(f\"  {freq/1e6:.4f} MHz  {power:.1f} dB\")\n"\n\n# Or use GQRX:\n# Tune to 152 MHz, set bandwidth to 10 MHz\n# Watch the waterfall for brief bursts — those are pager transmissions\n# Note the exact frequencies of active channels',
                language: 'Bash',
                tip: '<strong>Pager signals on the waterfall:</strong> Unlike FM radio (constant wide signals), pager transmissions are brief narrow bursts lasting 1&ndash;5 seconds. They appear as short horizontal lines on the GQRX waterfall. Active channels will show bursts every few seconds to minutes.'
            },
            {
                title: 'Decode Live Pager Messages',
                content: '<p>Pipe <code>rtl_fm</code> output through <code>multimon-ng</code> to decode pager messages in real time. Replace the frequency with one you found in the scan.</p>',
                code: '# Decode POCSAG on a specific frequency\n# Replace 152.480M with your local active pager frequency\nrtl_fm -f 152.480M -M fm -s 22050 -g 40 -l 0 - | \\\n  multimon-ng -a POCSAG512 -a POCSAG1200 -a POCSAG2400 -f alpha -t raw -\n\n# Flags explained:\n# rtl_fm:\n#   -f 152.480M    Tune to this frequency\n#   -M fm          Narrowband FM demodulation\n#   -s 22050       22050 Hz sample rate (what multimon-ng expects)\n#   -g 40          Gain\n#   -l 0           No squelch (we want everything)\n#   -              Output to stdout (piped to multimon-ng)\n#\n# multimon-ng:\n#   -a POCSAG512   Enable POCSAG 512 baud decoder\n#   -a POCSAG1200  Enable POCSAG 1200 baud decoder\n#   -a POCSAG2400  Enable POCSAG 2400 baud decoder\n#   -f alpha       Output alphanumeric messages\n#   -t raw         Input is raw audio\n#   -              Read from stdin\n\n# Output looks like:\n# POCSAG1200: Address: 1234567  Function: 0  Alpha: Code Blue Room 412 Dr. Smith\n# POCSAG1200: Address: 2345678  Function: 2  Alpha: MVA I-95 MP 42 2 vehicles',
                language: 'Bash',
                tip: '<strong>Address field:</strong> Each pager has a unique address (capcode). The same address appears every time that specific pager receives a message. By tracking addresses over time, you can build a profile of which pager belongs to which role (e.g., address 1234567 always receives trauma alerts = probably an ER doctor on call).'
            },
            {
                title: 'Log and Analyze Messages',
                content: '<p>Save decoded messages to a file for analysis. Over 24 hours, you will accumulate a dataset that reveals communication patterns, peak activity times, and the types of information being transmitted in cleartext.</p>',
                code: '# Log messages with timestamps\nrtl_fm -f 152.480M -M fm -s 22050 -g 40 -l 0 - | \\\n  multimon-ng -a POCSAG512 -a POCSAG1200 -a POCSAG2400 -f alpha -t raw - | \\\n  while IFS= read -r line; do\n    echo "[$(date +%Y-%m-%d_%H:%M:%S)] $line"\n  done | tee ~/sdr-projects/pager/pager-log-$(date +%Y%m%d).txt\n\n# After collecting data, analyze it:\necho "=== Pager Analysis ==="\necho "Total messages: $(wc -l < ~/sdr-projects/pager/pager-log-*.txt)"\necho "Unique addresses: $(grep -oP \"Address:\\s+\\d+\" ~/sdr-projects/pager/pager-log-*.txt | sort -u | wc -l)"\necho ""\necho "Most active addresses:"\ngrep -oP \"Address:\\s+\\d+\" ~/sdr-projects/pager/pager-log-*.txt | sort | uniq -c | sort -rn | head -10\necho ""\necho "Message types:"\ngrep -oP \"Alpha:.*\" ~/sdr-projects/pager/pager-log-*.txt | head -20',
                language: 'Bash',
                tip: '<strong>Privacy reminder:</strong> The messages you intercept may contain real names, medical information, and emergency details. This data is protected under HIPAA (medical) and various privacy laws. Use it to understand the vulnerability — do not store, share, or publish the content. Delete your logs after analysis.'
            },
            {
                title: 'Understand the Security Implications',
                content: '<p>The fact that you can read hospital paging traffic with a $25 radio dongle is a serious security and privacy concern. This exercise teaches you why encryption matters and why legacy protocols are a systemic risk.</p>',
                code: '# === WHY THIS MATTERS ===\n#\n# 1. HIPAA Violation: Hospitals transmitting PHI (Protected Health\n#    Information) via unencrypted pagers are technically in violation\n#    of HIPAA security requirements. Many hospitals still use pagers\n#    because they work reliably in concrete buildings where cell\n#    signals fail.\n#\n# 2. Same vulnerability class as:\n#    - Unencrypted SCADA/ICS protocols (Modbus, DNP3)\n#    - Legacy building management systems (BACnet)\n#    - Unencrypted IoT devices (Zigbee without security)\n#    - ADS-B (SG-54 — aircraft positions in cleartext)\n#    - Analog baby monitors, cordless phones\n#\n# 3. The fix: encrypted paging (e.g., Spok, TigerConnect)\n#    or secure messaging apps. But migration is slow because\n#    pagers work everywhere — no cell coverage required,\n#    no internet required, no battery charging.\n#\n# 4. For pentesting: demonstrating pager interception in a\n#    physical security assessment immediately shows leadership\n#    that "it works" is not the same as "it is secure."\n#    The impact is visual and undeniable.\n\necho "This project demonstrates why the following matter:"\necho "  - Encryption by default on all communication channels"\necho "  - Regular security audits of legacy systems"\necho "  - Protocol modernization even when legacy systems work"\necho "  - Defense in depth — assume the channel is compromised"',
                language: 'Bash',
                tip: '<strong>Career relevance:</strong> If you work in healthcare security, hospital IT, or critical infrastructure security, pager interception is a standard finding in physical security assessments. Being able to demonstrate it — and recommend encrypted alternatives — is a valuable skill.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>multimon-ng installed: <code>multimon-ng --help</code> shows version</li>' +
                 '<li>Active pager frequency found: <code>rtl_power</code> scan shows signals in 150&ndash;165 MHz</li>' +
                 '<li>Messages decoding: POCSAG output shows Address + Alpha text</li>' +
                 '<li>Logging works: timestamped messages saved to file</li>' +
                 '<li>Multiple unique addresses observed in the log</li>' +
                 '<li>Understanding: can explain why unencrypted paging is a privacy risk</li>' +
                 '</ul>' +
                 '<p>You have demonstrated that legacy communication protocols transmit sensitive data in cleartext. This vulnerability exists across every industry that uses unencrypted radio — healthcare, emergency services, utilities, and manufacturing. The fix is encryption. The obstacle is inertia.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>multimon-ng produces no output:</strong> You may be on the wrong frequency. Use <code>rtl_power</code> to scan 150-165 MHz and identify active pager transmitters in your area. Not all areas have active pager infrastructure &mdash; some regions have migrated entirely to encrypted digital paging.</li>' +
                         '<li><strong>Output shows addresses but no text (Alpha field empty):</strong> The pager system is sending tone-only or numeric pages, not alphanumeric. Some paging systems use only numeric codes. Try a different frequency &mdash; alphanumeric paging may be on a separate channel.</li>' +
                         '<li><strong>Messages are garbled or contain random characters:</strong> Adjust the gain. Too much gain causes signal distortion that corrupts POCSAG decoding. Try reducing from <code>-g 40</code> to <code>-g 30</code> or <code>-g 25</code>. Also ensure sample rate is exactly 22050 Hz as multimon-ng expects.</li>' +
                         '<li><strong>Very few messages received:</strong> Pager usage varies greatly by location. Urban areas near hospitals have the most traffic. If you are in a rural area, there may genuinely be little pager activity. Try monitoring for several hours including business hours when hospital paging is busiest.</li>' +
                         '<li><strong>"short read" or buffer underrun errors from rtl_fm:</strong> The CPU cannot keep up with the data stream. Close other applications consuming CPU. On a Raspberry Pi, ensure no graphical desktop is running. Reduce sample rate if needed.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Pager Traffic Analysis</strong> &mdash; Monitor pager traffic for 24 hours. Plot message count per hour as a histogram. Identify peak activity times and correlate with hospital shift changes, business hours, and overnight periods. Calculate the percentage of messages that contain identifiable personal information.</p>' +
                    '<p><strong>Challenge 2: Multi-Frequency Monitor</strong> &mdash; If your area has multiple active pager frequencies, run multiple instances of rtl_fm+multimon-ng using multiple RTL-SDR dongles (or sequential frequency scanning). Compare traffic patterns across channels and determine which channel serves which organization.</p>' +
                    '<p><strong>Challenge 3: FLEX Protocol Decoding</strong> &mdash; Some paging systems use the FLEX protocol instead of POCSAG. Enable FLEX decoding in multimon-ng (<code>-a FLEX</code>) and compare the message format, data rate, and content between POCSAG and FLEX messages on different frequencies.</p>',

        commonMistakes: [
            {
                title: 'Wrong Sample Rate for multimon-ng',
                correct: 'Use <code>-s 22050</code> in the rtl_fm command when piping to multimon-ng. This is the sample rate multimon-ng expects for POCSAG decoding.',
                incorrect: 'Using <code>-s 48000</code> or <code>-s 12000</code> with multimon-ng, which are rates used for audio playback or other decoders.',
                consequence: 'POCSAG decoding fails completely or produces heavily corrupted output. The decoder relies on precise sample timing to detect the 512/1200/2400 baud bit transitions. Wrong sample rate shifts the timing and breaks decoding.'
            },
            {
                title: 'Squelch Set Too High',
                correct: 'Set squelch to 0 (<code>-l 0</code>) when decoding digital protocols like POCSAG. Squelch is designed for voice listening, not digital decoding.',
                incorrect: 'Using a squelch value like <code>-l 10</code> or higher, which silences the audio when signal drops, cutting off the middle or end of pager bursts.',
                consequence: 'Partial messages are decoded or messages are missed entirely. POCSAG transmissions can vary in signal strength, and squelch may cut the audio during a valid transmission. Let multimon-ng handle the signal detection.'
            },
            {
                title: 'Sharing Intercepted Message Content Publicly',
                correct: 'Receive pager messages for educational understanding of the vulnerability. Do not store, share, or publish message content, especially medical or personal information.',
                incorrect: 'Posting screenshots of intercepted hospital paging messages on social media or including real message content in reports.',
                consequence: 'Potential violation of HIPAA, wiretapping laws, and privacy regulations. Even though receiving is legal, disclosing protected health information or intercepted communications content can carry civil and criminal penalties.'
            }
        ]
    },

    // ========================================================================
    // SG-57: RF Spectrum Analyzer
    // ========================================================================
    'sg-57': {
        intro: '<p>Turn your RTL-SDR into a wideband RF spectrum analyzer that scans, records, and visualizes radio activity across the entire receivable range. Unlike GQRX which shows a narrow slice of spectrum in real time, <code>rtl_power</code> scans wide frequency ranges and produces data you can visualize as heatmaps &mdash; revealing every transmitter in your area over time.</p>' +
               '<p>Spectrum analysis is a core skill in wireless security, RF engineering, and signals intelligence. It answers the question: "what is transmitting on which frequencies, how strong are the signals, and when are they active?" This data reveals hidden devices, rogue transmitters, interference sources, and communication patterns.</p>' +
               '<p>In this project you will scan the full RTL-SDR range (24 MHz to 1.7 GHz), generate heatmap visualizations, identify signal types by their characteristics, and build an automated monitoring station that alerts on new or unusual RF activity.</p>',

        wiring: '    RTL-SDR                Scan Range\n' +
                '    +----------+           24 MHz ─────────────── 1.7 GHz\n' +
                '    | Dongle + |           |  FM  | VHF |  UHF  | Cell | ADS-B |\n' +
                '    | Antenna  |  ──────>  rtl_power scans in steps\n' +
                '    +----------+           Output: CSV (freq, time, power)\n' +
                '                           Visualize: heatmap (freq vs time vs power)',

        wiringNotes: '<p><strong>Scan time:</strong> A full 24&ndash;1700 MHz scan at 25 kHz resolution takes about 2&ndash;3 minutes per sweep. For continuous monitoring, set <code>rtl_power</code> to repeat indefinitely and analyze the accumulated data.</p>' +
                     '<p><strong>Antenna:</strong> Use the wideband dipole at a compromise length (~25 cm elements) or a discone antenna for true wideband reception. No single dipole length is optimal for the full range &mdash; sensitivity will vary by frequency.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg57-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg57-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-57 RF SPECTRUM ANALYZER</text>' +

            '<!-- Spectrum Display -->' +
            '<g>' +
            '<rect x="30" y="45" width="660" height="180" rx="8" fill="#0a0e14" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="50" y="62" fill="#4ade80" font-size="7" font-weight="600">SPECTRUM VIEW: 24 MHz &#8212; 1.7 GHz</text>' +

            '<!-- Axes -->' +
            '<line x1="60" y1="80" x2="60" y2="200" stroke="#333" stroke-width="0.5"/>' +
            '<line x1="60" y1="200" x2="670" y2="200" stroke="#333" stroke-width="0.5"/>' +
            '<text x="55" y="85" text-anchor="end" fill="#555" font-size="4">0 dB</text>' +
            '<text x="55" y="120" text-anchor="end" fill="#555" font-size="4">-20</text>' +
            '<text x="55" y="160" text-anchor="end" fill="#555" font-size="4">-40</text>' +
            '<text x="55" y="200" text-anchor="end" fill="#555" font-size="4">-60</text>' +

            '<!-- Noise floor -->' +
            '<line x1="60" y1="185" x2="670" y2="185" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>' +

            '<!-- FM Broadcast peaks -->' +
            '<polyline points="110,185 115,170 120,140 125,110 130,95 135,100 140,115 145,130 150,145 155,135 160,120 165,105 170,100 175,110 180,135 185,160 190,185" fill="none" stroke="#22c55e" stroke-width="1.5"><animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite"/></polyline>' +
            '<text x="150" y="88" text-anchor="middle" fill="#22c55e" font-size="6" font-weight="600">FM Radio</text>' +
            '<text x="150" y="212" text-anchor="middle" fill="#22c55e" font-size="5">88-108 MHz</text>' +

            '<!-- VHF Public Safety -->' +
            '<polyline points="215,185 218,175 220,165 222,170 225,178 228,168 230,160 232,170 235,185" fill="none" stroke="#a78bfa" stroke-width="1.2"><animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite"/></polyline>' +
            '<text x="225" y="153" text-anchor="middle" fill="#a78bfa" font-size="5">VHF</text>' +
            '<text x="225" y="212" text-anchor="middle" fill="#a78bfa" font-size="5">150-174</text>' +

            '<!-- ISM 433 key fobs -->' +
            '<polyline points="330,185 333,178 335,172 337,168 339,165 341,168 343,175 345,180 347,185" fill="none" stroke="#f97316" stroke-width="1"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite"/></polyline>' +
            '<text x="339" y="158" text-anchor="middle" fill="#f97316" font-size="5">ISM 433</text>' +

            '<!-- UHF -->' +
            '<polyline points="375,185 378,175 380,168 382,172 385,185" fill="none" stroke="#38bdf8" stroke-width="1"><animate attributeName="opacity" values="0.5;0.8;0.5" dur="5s" repeatCount="indefinite"/></polyline>' +
            '<text x="380" y="162" text-anchor="middle" fill="#38bdf8" font-size="5">UHF</text>' +

            '<!-- Cellular bands -->' +
            '<polyline points="440,185 450,160 460,140 470,125 480,118 490,115 500,120 510,130 520,145 530,160 540,175 545,185" fill="none" stroke="#ef4444" stroke-width="1.5"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="6s" repeatCount="indefinite"/></polyline>' +
            '<text x="490" y="108" text-anchor="middle" fill="#ef4444" font-size="6" font-weight="600">Cellular</text>' +
            '<text x="490" y="212" text-anchor="middle" fill="#ef4444" font-size="5">700-960 MHz</text>' +

            '<!-- ADS-B 1090 -->' +
            '<polyline points="578,185 580,172 582,158 583,150 584,148 585,150 587,160 589,175 591,185" fill="none" stroke="#38bdf8" stroke-width="1.5"><animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite"/></polyline>' +
            '<text x="584" y="140" text-anchor="middle" fill="#38bdf8" font-size="5" font-weight="600">ADS-B</text>' +
            '<text x="584" y="212" text-anchor="middle" fill="#38bdf8" font-size="5">1090</text>' +

            '<!-- Scan line animation -->' +
            '<line x1="60" y1="80" x2="60" y2="200" stroke="#22c55e" stroke-width="1" opacity="0.4"><animate attributeName="x1" values="60;670;60" dur="8s" repeatCount="indefinite"/><animate attributeName="x2" values="60;670;60" dur="8s" repeatCount="indefinite"/></line>' +
            '</g>' +

            '<!-- RTL-SDR Dongle -->' +
            '<g>' +
            '<rect x="30" y="245" width="140" height="80" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="30" y="245" width="140" height="20" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="100" y="260" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="700">RTL-SDR V4</text>' +
            '<!-- Wideband antenna -->' +
            '<line x1="50" y1="275" x2="50" y2="250" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="50" y1="250" x2="35" y2="240" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="50" y1="250" x2="65" y2="240" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="50" y="236" text-anchor="middle" fill="#22c55e" font-size="5">wideband</text>' +
            '<text x="100" y="283" text-anchor="middle" fill="#8b949e" font-size="6">24 MHz &#8212; 1.766 GHz</text>' +
            '<text x="100" y="296" text-anchor="middle" fill="#555" font-size="5">~25cm elements (compromise)</text>' +
            '<text x="100" y="310" text-anchor="middle" fill="#555" font-size="5">or discone antenna</text>' +
            '</g>' +

            '<!-- USB to Pi -->' +
            '<line x1="170" y1="285" x2="220" y2="285" stroke="#555" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            '<text x="195" y="279" text-anchor="middle" fill="#555" font-size="5">USB</text>' +

            '<!-- Raspberry Pi + rtl_power -->' +
            '<g>' +
            '<rect x="220" y="250" width="170" height="75" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="220" y="250" width="170" height="20" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="305" y="265" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">RASPBERRY PI</text>' +
            '<text x="305" y="285" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">rtl_power</text>' +
            '<text x="305" y="300" text-anchor="middle" fill="#8b949e" font-size="6">Sweep scan &#8594; CSV data</text>' +
            '<text x="305" y="313" text-anchor="middle" fill="#555" font-size="5">freq, time, power per bin</text>' +
            '</g>' +

            '<!-- Arrow to visualization -->' +
            '<line x1="390" y1="285" x2="430" y2="285" stroke="#22c55e" stroke-width="1.5"/>' +
            '<polygon points="430,280 430,290 440,285" fill="#22c55e"/>' +

            '<!-- Heatmap Visualization -->' +
            '<g>' +
            '<rect x="445" y="245" width="240" height="85" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="445" y="245" width="240" height="20" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="565" y="260" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">HEATMAP OUTPUT</text>' +
            '<!-- Mini heatmap -->' +
            '<rect x="460" y="272" width="15" height="50" rx="1" fill="rgba(239,68,68,0.6)"/>' +
            '<rect x="478" y="282" width="15" height="40" rx="1" fill="rgba(234,179,8,0.5)"/>' +
            '<rect x="496" y="290" width="15" height="32" rx="1" fill="rgba(34,197,94,0.4)"/>' +
            '<rect x="514" y="298" width="15" height="24" rx="1" fill="rgba(59,130,246,0.3)"/>' +
            '<rect x="532" y="295" width="15" height="27" rx="1" fill="rgba(167,139,250,0.4)"/>' +
            '<rect x="550" y="285" width="15" height="37" rx="1" fill="rgba(234,179,8,0.5)"/>' +
            '<rect x="568" y="278" width="15" height="44" rx="1" fill="rgba(239,68,68,0.5)"/>' +
            '<rect x="586" y="295" width="15" height="27" rx="1" fill="rgba(59,130,246,0.3)"/>' +
            '<rect x="604" y="300" width="15" height="22" rx="1" fill="rgba(34,197,94,0.3)"/>' +
            '<text x="565" y="318" text-anchor="middle" fill="#8b949e" font-size="6">matplotlib &bull; heatmap.py</text>' +
            '</g>' +

            '<!-- Signal ID Reference -->' +
            '<rect x="30" y="345" width="660" height="40" rx="6" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="362" fill="#eab308" font-size="7" font-weight="600">SIGINT:</text>' +
            '<text x="100" y="362" fill="#22c55e" font-size="5.5">FM=wide+constant</text>' +
            '<text x="200" y="362" fill="#a78bfa" font-size="5.5">Pager=narrow+burst</text>' +
            '<text x="310" y="362" fill="#f97316" font-size="5.5">Key Fob=blip</text>' +
            '<text x="400" y="362" fill="#ef4444" font-size="5.5">Cell=wide+strong</text>' +
            '<text x="500" y="362" fill="#38bdf8" font-size="5.5">ADS-B=narrow+constant</text>' +
            '<text x="630" y="362" fill="#eab308" font-size="5.5">LoRa=chirp</text>' +
            '<text x="40" y="378" fill="#555" font-size="5">Reference: sigidwiki.com &bull; Identify signals by bandwidth, pattern, and persistence</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Full Spectrum Scan',
                content: '<p>Scan the entire RTL-SDR range and save the data as CSV for visualization.</p>',
                code: '# Full spectrum scan: 24 MHz to 1.7 GHz\nmkdir -p ~/sdr-projects/spectrum\n\n# Quick scan (2 minutes, coarse resolution)\nrtl_power -f 24M:1700M:1M -g 40 -i 10 -e 120 \\\n  ~/sdr-projects/spectrum/full-scan-$(date +%Y%m%d).csv\n\n# Detailed scan (longer, finer resolution)\nrtl_power -f 24M:1700M:100k -g 40 -i 30 -e 600 \\\n  ~/sdr-projects/spectrum/detailed-scan-$(date +%Y%m%d).csv\n\n# Focused band scans\nrtl_power -f 87M:108M:25k -g 40 -i 10 -e 60 ~/sdr-projects/spectrum/fm-band.csv\nrtl_power -f 150M:174M:12.5k -g 40 -i 10 -e 120 ~/sdr-projects/spectrum/vhf.csv\nrtl_power -f 420M:450M:12.5k -g 40 -i 10 -e 120 ~/sdr-projects/spectrum/uhf.csv\nrtl_power -f 800M:960M:25k -g 40 -i 10 -e 120 ~/sdr-projects/spectrum/cell.csv\nrtl_power -f 1080M:1100M:25k -g 40 -i 10 -e 60 ~/sdr-projects/spectrum/adsb.csv',
                language: 'Bash',
                tip: '<strong>CSV format:</strong> Each row contains: date, time, start-freq, end-freq, step, sample-count, power-values. You can process this with Python, gnuplot, or the <code>heatmap.py</code> tool from the rtl-sdr community.'
            },
            {
                title: 'Generate Heatmap Visualization',
                content: '<p>Convert the scan CSV into a visual heatmap showing frequency vs time vs signal strength. Strong signals appear as bright lines or blobs; the noise floor appears as a uniform dark background.</p>',
                code: '# Install Python visualization tools\npip3 install matplotlib numpy\n\n# Generate heatmap from scan data\npython3 << \'HEATEOF\'\nimport csv\nimport numpy as np\nimport matplotlib\nmatplotlib.use(\"Agg\")  # headless rendering\nimport matplotlib.pyplot as plt\nfrom datetime import datetime\nimport glob\nimport os\n\nscan_file = sorted(glob.glob(os.path.expanduser(\n    \"~/sdr-projects/spectrum/full-scan-*.csv\")))[-1]\nprint(f\"Processing: {scan_file}\")\n\nfreqs = []\npowers = []\ntimes = []\n\nwith open(scan_file) as f:\n    for row in csv.reader(f):\n        if len(row) < 7: continue\n        try:\n            t = datetime.strptime(row[0] + \" \" + row[1], \"%Y-%m-%d %H:%M:%S\")\n            start_freq = float(row[2])\n            step = float(row[4])\n            vals = [float(x) for x in row[6:]]\n            for i, v in enumerate(vals):\n                freqs.append((start_freq + i * step) / 1e6)\n                powers.append(v)\n                times.append(t.timestamp())\n        except: pass\n\nif not freqs:\n    print(\"No data found!\")\nelse:\n    fig, ax = plt.subplots(figsize=(16, 6))\n    scatter = ax.scatter(freqs, powers, c=powers, cmap=\"inferno\",\n                         s=0.5, alpha=0.6, vmin=-60, vmax=-10)\n    ax.set_xlabel(\"Frequency (MHz)\")\n    ax.set_ylabel(\"Power (dB)\")\n    ax.set_title(\"RF Spectrum — Full Scan\")\n    ax.set_facecolor(\"#0d1117\")\n    fig.patch.set_facecolor(\"#0d1117\")\n    ax.tick_params(colors=\"white\")\n    ax.xaxis.label.set_color(\"white\")\n    ax.yaxis.label.set_color(\"white\")\n    ax.title.set_color(\"white\")\n    plt.colorbar(scatter, label=\"Power (dB)\")\n    out = os.path.expanduser(\"~/sdr-projects/spectrum/heatmap.png\")\n    plt.savefig(out, dpi=150, bbox_inches=\"tight\")\n    print(f\"Saved: {out}\")\nHEATEOF\n\n# View the heatmap\n# Transfer to your computer: scp pi@PI_IP:~/sdr-projects/spectrum/heatmap.png ~/Desktop/',
                language: 'Bash',
                tip: '<strong>What you see:</strong> FM stations appear as tall spikes at 88&ndash;108 MHz. Cell towers show as wide elevated regions around 700&ndash;900 MHz and 1700&ndash;2100 MHz. ADS-B at 1090 MHz shows a narrow spike. Below the noise floor is empty spectrum &mdash; frequencies no one is using in your area.'
            },
            {
                title: 'Identify Signal Types',
                content: '<p>Different signal types have distinctive visual and spectral characteristics. Learning to identify them by their shape, bandwidth, and behavior is a fundamental RF analysis skill.</p>',
                code: '# === SIGNAL IDENTIFICATION GUIDE ===\n\ncat << \'SIGEOF\'\nSignal Type         | Freq Range    | Bandwidth | Shape on Waterfall\n--------------------|---------------|-----------|--------------------\nFM Broadcast        | 88-108 MHz    | ~200 kHz  | Wide, constant, strong\nNOAA Weather        | 162.4-162.55  | ~12.5 kHz | Narrow, constant\nPagers (POCSAG)     | 150-170 MHz   | ~12.5 kHz | Brief bursts, narrow\nAircraft (ADS-B)    | 1090 MHz      | ~2 MHz    | Constant weak presence\nCar Key Fobs        | 315/433 MHz   | ~200 kHz  | Momentary blip\nWiFi                | 2400-2483 MHz | ~20 MHz   | (out of RTL-SDR range)\nBluetooth           | 2400-2483 MHz | ~1 MHz    | (out of RTL-SDR range)\nCell LTE            | 700-900 MHz   | 5-20 MHz  | Wide, constant, strong\nHam Radio 2m        | 144-148 MHz   | ~12.5 kHz | Intermittent voice\nHam Radio 70cm      | 430-440 MHz   | ~12.5 kHz | Intermittent voice/data\nGarage Doors        | 300-400 MHz   | ~200 kHz  | Momentary blip\nWireless Mics       | 470-698 MHz   | ~200 kHz  | Constant during use\nLoRa/IoT            | 868/915 MHz   | ~125 kHz  | Chirp spread bursts\nSIGEOF\n\n# Identify unknown signals:\n# 1. Note the frequency\n# 2. Measure the bandwidth (how wide is the signal)\n# 3. Observe the pattern (constant? bursty? periodic?)\n# 4. Check sigidwiki.com for signal identification\necho ""\necho "Reference: https://www.sigidwiki.com/wiki/Signal_Identification_Guide"',
                language: 'Bash',
                tip: '<strong>sigidwiki.com</strong> is the definitive signal identification reference. It has audio samples, waterfall screenshots, and technical details for hundreds of signal types. Bookmark it &mdash; you will use it constantly as you explore the spectrum.'
            },
            {
                title: 'Build an Automated RF Monitor',
                content: '<p>Create a script that scans periodically and alerts when new signals appear or existing patterns change. This is basic RF anomaly detection &mdash; the same concept used by military SIGINT and commercial spectrum monitoring systems.</p>',
                code: '# Create a baseline scan\nrtl_power -f 24M:1700M:500k -g 40 -i 30 -e 300 \\\n  ~/sdr-projects/spectrum/baseline.csv\n\n# Create monitoring script\ncat << \'MONEOF\' > ~/sdr-projects/spectrum/rf-monitor.sh\n#!/bin/bash\n# RF Anomaly Monitor — compares current scan against baseline\n\nBASELINE=~/sdr-projects/spectrum/baseline.csv\nSCAN_DIR=~/sdr-projects/spectrum/scans\nLOG=~/sdr-projects/spectrum/anomalies.log\nTHRESHOLD=15  # dB above baseline to trigger alert\n\nmkdir -p "$SCAN_DIR"\n\necho "[$(date)] Starting RF monitor scan..."\n\n# Take a new scan\nSCAN="$SCAN_DIR/scan-$(date +%Y%m%d-%H%M%S).csv"\nrtl_power -f 24M:1700M:500k -g 40 -i 30 -e 300 "$SCAN"\n\n# Compare against baseline (simplified)\npython3 -c "\nimport csv, sys\n\ndef load_scan(path):\n    data = {}\n    with open(path) as f:\n        for row in csv.reader(f):\n            if len(row) >= 7:\n                try:\n                    freq = float(row[2])\n                    power = max(float(x) for x in row[6:])\n                    if freq not in data or power > data[freq]:\n                        data[freq] = power\n                except: pass\n    return data\n\nbaseline = load_scan(\"$BASELINE\")\ncurrent = load_scan(\"$SCAN\")\n\nanomalies = []\nfor freq, power in current.items():\n    base_power = baseline.get(freq, -60)\n    if power - base_power > $THRESHOLD:\n        anomalies.append((freq/1e6, power, power - base_power))\n\nif anomalies:\n    print(f\"ALERT: {len(anomalies)} anomalies detected!\")\n    for freq, power, delta in sorted(anomalies):\n        print(f\"  {freq:.3f} MHz: {power:.1f} dB (+{delta:.1f} above baseline)\")\nelse:\n    print(\"No anomalies detected.\")\n" | tee -a "$LOG"\n\necho "[$(date)] Monitor scan complete." >> "$LOG"\nMONEOF\nchmod +x ~/sdr-projects/spectrum/rf-monitor.sh\n\n# Run it\nbash ~/sdr-projects/spectrum/rf-monitor.sh\n\n# Schedule periodic monitoring (every 30 minutes)\n# (crontab -l; echo "*/30 * * * * ~/sdr-projects/spectrum/rf-monitor.sh") | crontab -',
                language: 'Bash',
                tip: '<strong>What triggers anomalies:</strong> A new transmitter appears (someone set up a rogue access point or radio device). An existing signal gets significantly stronger (interference, equipment malfunction). A signal appears at an unexpected time (a transmitter that should only be active during business hours is active at 3 AM). These are the same patterns that RF security monitoring detects in classified facilities.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Full spectrum scan completes: CSV file with data from 24&ndash;1700 MHz</li>' +
                 '<li>Heatmap generated: PNG image shows visible signal peaks</li>' +
                 '<li>FM stations identifiable at 88&ndash;108 MHz</li>' +
                 '<li>Cell tower signals visible at 700&ndash;900 MHz</li>' +
                 '<li>Signal identification: can name at least 3 signal types from the scan</li>' +
                 '<li>Monitor script runs and compares against baseline</li>' +
                 '<li>sigidwiki.com bookmarked and used to identify an unknown signal</li>' +
                 '</ul>' +
                 '<p>You now have a complete RF spectrum analysis capability. You can scan, visualize, identify, and monitor radio activity across 24 MHz to 1.7 GHz. This is the same fundamental capability used by spectrum management agencies, military SIGINT, and commercial RF security monitoring &mdash; just at a smaller scale.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>rtl_power scan takes very long or hangs:</strong> Reduce the scan range or increase the step size. A full 24-1700 MHz scan at 25 kHz resolution produces millions of data points. Start with <code>-f 24M:1700M:1M</code> (1 MHz steps) for a quick overview, then do focused scans on interesting bands at finer resolution.</li>' +
                         '<li><strong>Heatmap script fails with ImportError for matplotlib:</strong> Install the dependency: <code>pip3 install matplotlib numpy</code>. On Raspberry Pi, use the system package: <code>sudo apt install python3-matplotlib python3-numpy -y</code>. If running headless, ensure the <code>Agg</code> backend is set in the script.</li>' +
                         '<li><strong>Monitor script reports false positives constantly:</strong> The baseline scan was taken during unusual conditions (e.g., a transmitter was temporarily active). Recapture the baseline during a quiet period. Increase the threshold value (e.g., from 15 dB to 20 dB) to reduce sensitivity. Environmental RF noise varies with time of day and weather.</li>' +
                         '<li><strong>CSV file is very large (hundreds of MB):</strong> Long scans at fine resolution produce enormous files. Use coarser resolution for monitoring (<code>500k</code> step) and fine resolution only for targeted analysis. Compress old scan files: <code>gzip scan-*.csv</code>.</li>' +
                         '<li><strong>Scan results show a strong spike at a single frequency across all times:</strong> This is likely a local oscillator leak from the RTL-SDR itself or interference from the USB bus. These spurs are consistent artifacts. Note them in your baseline and exclude them from anomaly detection.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Before-and-After Analysis</strong> &mdash; Take a spectrum scan, then turn on a specific wireless device (WiFi router, Bluetooth speaker, baby monitor, LoRa module). Take another scan. Subtract the baseline from the new scan to isolate the device signature. Document the exact frequency, bandwidth, and power level of the device emission.</p>' +
                    '<p><strong>Challenge 2: 24-Hour RF Heatmap</strong> &mdash; Run a continuous scan of one specific band (e.g., FM 87-108 MHz or ISM 430-440 MHz) for a full 24 hours. Generate a time-vs-frequency heatmap that shows activity patterns over the day. Identify which signals are constant, which are periodic, and which are sporadic.</p>' +
                    '<p><strong>Challenge 3: Rogue Transmitter Detection</strong> &mdash; Place a known transmitter (a cheap FM transmitter or LoRa module) somewhere in your building. Using only the RF monitor and a directional antenna, locate the transmitter by measuring signal strength from different positions. Document your SIGINT process and how long it took to localize the source.</p>',

        commonMistakes: [
            {
                title: 'Confusing dBm with dBFS in RTL-SDR Measurements',
                correct: 'Understand that rtl_power reports relative power levels (dBFS &mdash; decibels relative to full scale), not calibrated absolute power (dBm). Values are relative to the ADC full scale and vary with gain setting.',
                incorrect: 'Treating rtl_power output as calibrated dBm values and making absolute power comparisons between scans taken at different gain settings.',
                consequence: 'Incorrect conclusions about signal strength. A signal at -30 dBFS at gain 40 is not the same absolute power as -30 dBFS at gain 20. Always use the same gain setting when comparing scans.'
            },
            {
                title: 'Baseline Captured During Unusual Activity',
                correct: 'Capture the baseline scan during a representative quiet period. Run multiple baseline scans and average them. Exclude known temporary signals.',
                incorrect: 'Taking a single baseline scan while a neighbor is operating a ham radio or while temporary construction equipment is generating RF interference.',
                consequence: 'The baseline includes anomalous signals as normal. Future scans without those signals may fail to detect them as anomalies, or normal signals may trigger false alerts when compared against the skewed baseline.'
            }
        ]
    },

    // ========================================================================
    // SG-58 through SG-62: Stubs with essential structure
    // Remaining SDR projects — full content to be built in next session
    // ========================================================================

    'sg-58': {
        intro: '<p>Amateur radio digital modes (FT8, PSK31, RTTY) are weak-signal communication protocols that allow ham radio operators to make contacts across continents using very low power. With your RTL-SDR, you can receive these signals and decode them with WSJT-X software &mdash; watching contacts happen between operators thousands of miles apart in real time.</p>' +
               '<p>FT8 is the most popular digital mode in amateur radio today. Each transmission lasts exactly 15 seconds, carries a minimal message (callsigns, signal report, location), and can be decoded at signal levels far below the noise floor. The protocol was designed by Joe Taylor (K1JT), a Nobel Prize-winning physicist.</p>' +
               '<p>This project teaches digital signal processing concepts, propagation physics (how radio waves bounce off the ionosphere), and the decoding of signals that are literally invisible on a waterfall display.</p>',
        wiring: '    RTL-SDR + HF upconverter (optional) -> WSJT-X -> decoded contacts',
        wiringNotes: '<p><strong>HF reception:</strong> FT8 operates on HF bands (20m at 14.074 MHz, 40m at 7.074 MHz). The RTL-SDR natively receives 24+ MHz. To receive HF, you need an upconverter (~$50) that shifts HF signals to a higher frequency the dongle can receive. Alternatively, use the 10m band (28.074 MHz) or 6m band (50.313 MHz) which are within native RTL-SDR range.</p>',
        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg58-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg58-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-58 HAM DIGITAL MODES (FT8)</text>' +

            '<!-- Ionosphere illustration -->' +
            '<g>' +
            '<rect x="30" y="45" width="660" height="70" rx="8" fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.15)" stroke-width="0.5"/>' +
            '<text x="360" y="62" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="600">IONOSPHERE (F-layer ~300 km)</text>' +
            '<!-- Ionospheric skip path -->' +
            '<path d="M 100,105 Q 250,55 400,105" fill="none" stroke="#a78bfa" stroke-width="1.2" stroke-dasharray="4,3"><animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/></path>' +
            '<path d="M 400,105 Q 550,55 680,105" fill="none" stroke="#a78bfa" stroke-width="1" stroke-dasharray="4,3" opacity="0.5"><animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="3s" begin="0.5s" repeatCount="indefinite"/></path>' +
            '<text x="250" y="78" text-anchor="middle" fill="#a78bfa" font-size="5">HF skip propagation</text>' +
            '<text x="540" y="78" text-anchor="middle" fill="#a78bfa" font-size="5">multi-hop = DX</text>' +
            '</g>' +

            '<!-- Remote TX Station -->' +
            '<g>' +
            '<rect x="30" y="120" width="100" height="70" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<rect x="30" y="120" width="100" height="18" rx="8" fill="rgba(34,197,94,0.1)"/>' +
            '<text x="80" y="133" text-anchor="middle" fill="#4ade80" font-size="6" font-weight="600">TX STATION</text>' +
            '<text x="80" y="150" text-anchor="middle" fill="#8b949e" font-size="5">K1ABC FN42</text>' +
            '<text x="80" y="162" text-anchor="middle" fill="#8b949e" font-size="5">FT8 @ 28.074 MHz</text>' +
            '<text x="80" y="174" text-anchor="middle" fill="#555" font-size="4">15-sec TX cycle</text>' +
            '<!-- Antenna -->' +
            '<line x1="55" y1="120" x2="55" y2="107" stroke="#22c55e" stroke-width="1"/>' +
            '<line x1="45" y1="107" x2="65" y2="107" stroke="#22c55e" stroke-width="1"/>' +
            '</g>' +

            '<!-- HF Upconverter (optional) -->' +
            '<g>' +
            '<rect x="200" y="130" width="130" height="70" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="200" y="130" width="130" height="18" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="265" y="143" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="600">HF UPCONVERTER</text>' +
            '<text x="265" y="160" text-anchor="middle" fill="#8b949e" font-size="5">Shifts HF &#8594; 100+ MHz</text>' +
            '<text x="265" y="173" text-anchor="middle" fill="#8b949e" font-size="5">125 MHz local oscillator</text>' +
            '<text x="265" y="186" text-anchor="middle" fill="#555" font-size="5">Required for 20m/40m bands</text>' +
            '<text x="265" y="196" text-anchor="middle" fill="#a855f7" font-size="5">~$50 &bull; Optional for 10m/6m</text>' +
            '</g>' +

            '<!-- RF in to upconverter -->' +
            '<line x1="130" y1="155" x2="200" y2="165" stroke="#22c55e" stroke-width="1.2" stroke-dasharray="4,3"/>' +
            '<text x="165" y="152" text-anchor="middle" fill="#22c55e" font-size="5">HF signal</text>' +

            '<!-- RTL-SDR -->' +
            '<g>' +
            '<rect x="380" y="130" width="130" height="70" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="380" y="130" width="130" height="18" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="445" y="143" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="700">RTL-SDR V4</text>' +
            '<text x="445" y="162" text-anchor="middle" fill="#8b949e" font-size="6">28.074 MHz (10m)</text>' +
            '<text x="445" y="175" text-anchor="middle" fill="#8b949e" font-size="6">USB demod, 48 kHz</text>' +
            '<text x="445" y="188" text-anchor="middle" fill="#555" font-size="5">or upconverted HF freq</text>' +
            '</g>' +

            '<!-- Upconverter to RTL-SDR -->' +
            '<line x1="330" y1="165" x2="380" y2="165" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="355" y="158" text-anchor="middle" fill="#eab308" font-size="5">SMA</text>' +

            '<!-- USB to Computer -->' +
            '<line x1="445" y1="200" x2="445" y2="228" stroke="#555" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            '<text x="460" y="218" fill="#555" font-size="5">USB</text>' +

            '<!-- Computer + WSJT-X -->' +
            '<g>' +
            '<rect x="360" y="230" width="170" height="90" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="360" y="230" width="170" height="20" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="445" y="245" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">WSJT-X DECODER</text>' +
            '<text x="445" y="264" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">FT8 Mode</text>' +
            '<text x="445" y="280" text-anchor="middle" fill="#8b949e" font-size="6">15-sec decode cycles</text>' +
            '<text x="445" y="293" text-anchor="middle" fill="#8b949e" font-size="6">SNR down to -24 dB</text>' +
            '<text x="445" y="306" text-anchor="middle" fill="#555" font-size="5">Callsign &bull; Grid &bull; Signal report</text>' +
            '</g>' +

            '<!-- PulseAudio virtual sink note -->' +
            '<rect x="360" y="328" width="170" height="28" rx="4" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.15)" stroke-width="0.5"/>' +
            '<text x="445" y="340" text-anchor="middle" fill="#a78bfa" font-size="5">PulseAudio virtual sink</text>' +
            '<text x="445" y="350" text-anchor="middle" fill="#555" font-size="4">rtl_fm &#8594; paplay &#8594; WSJT-X</text>' +

            '<!-- Decoded Output -->' +
            '<line x1="530" y1="275" x2="570" y2="275" stroke="#22c55e" stroke-width="1.5"/>' +
            '<polygon points="570,270 570,280 578,275" fill="#22c55e"/>' +
            '<g>' +
            '<rect x="580" y="230" width="120" height="90" rx="8" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.25)" stroke-width="1"/>' +
            '<text x="640" y="248" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">DECODED</text>' +
            '<text x="590" y="264" fill="#8b949e" font-size="5">CQ K1ABC FN42</text>' +
            '<text x="590" y="277" fill="#8b949e" font-size="5">K1ABC W2XYZ -07</text>' +
            '<text x="590" y="290" fill="#8b949e" font-size="5">W2XYZ K1ABC R-12</text>' +
            '<text x="590" y="303" fill="#555" font-size="4">SNR: -14 dB (below noise!)</text>' +
            '<text x="640" y="316" text-anchor="middle" fill="#22c55e" font-size="5">pskreporter.info map</text>' +
            '</g>' +

            '<!-- FT8 Timing Visual -->' +
            '<g>' +
            '<rect x="30" y="225" width="280" height="50" rx="6" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="242" fill="#eab308" font-size="7" font-weight="600">FT8 TIMING</text>' +
            '<!-- 15-second blocks -->' +
            '<rect x="40" y="248" width="55" height="14" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<text x="68" y="258" text-anchor="middle" fill="#22c55e" font-size="5">TX 15s</text>' +
            '<rect x="100" y="248" width="55" height="14" rx="2" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<text x="128" y="258" text-anchor="middle" fill="#60a5fa" font-size="5">RX 15s</text>' +
            '<rect x="160" y="248" width="55" height="14" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<text x="188" y="258" text-anchor="middle" fill="#22c55e" font-size="5">TX 15s</text>' +
            '<rect x="220" y="248" width="55" height="14" rx="2" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<text x="248" y="258" text-anchor="middle" fill="#60a5fa" font-size="5">RX 15s</text>' +
            '<text x="170" y="272" text-anchor="middle" fill="#555" font-size="4">NTP time sync required (&#177;1 sec)</text>' +
            '</g>' +

            '<!-- Band Info -->' +
            '<rect x="30" y="295" width="280" height="75" rx="6" fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="312" fill="#a78bfa" font-size="7" font-weight="600">FT8 BANDS</text>' +
            '<text x="40" y="327" fill="#22c55e" font-size="5.5">10m: 28.074 MHz &#8212; native RTL-SDR range</text>' +
            '<text x="40" y="340" fill="#60a5fa" font-size="5.5">6m: 50.313 MHz &#8212; native RTL-SDR range</text>' +
            '<text x="40" y="353" fill="#eab308" font-size="5.5">20m: 14.074 MHz &#8212; needs upconverter</text>' +
            '<text x="40" y="366" fill="#f97316" font-size="5.5">40m: 7.074 MHz &#8212; needs upconverter</text>' +

            '<!-- Nobel Prize callout -->' +
            '<rect x="580" y="340" width="120" height="40" rx="4" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="640" y="355" text-anchor="middle" fill="#eab308" font-size="5" font-weight="600">Designed by Joe Taylor</text>' +
            '<text x="640" y="367" text-anchor="middle" fill="#555" font-size="4">K1JT &bull; Nobel Prize Physics</text>' +
            '<text x="640" y="377" text-anchor="middle" fill="#555" font-size="4">Solar Cycle 25 peak: 2024-2026</text>' +

            '</svg>' +
            '</div>',
        steps: [
            { title: 'Install WSJT-X Decoder', content: '<p>WSJT-X is the standard decoder for FT8, FT4, JT65, and other weak-signal modes. Install it from the official source.</p>', code: '# Install WSJT-X\nsudo apt install wsjtx -y\n\n# Or download from: https://wsjt.sourceforge.io/wsjtx.html\n# The package includes the decoder and a built-in waterfall display\n\n# Install virtual audio cable to pipe rtl_fm audio to WSJT-X\nsudo apt install pulseaudio pavucontrol -y', language: 'Bash', tip: '<strong>No transmitter needed:</strong> You are receive-only. WSJT-X will decode transmissions from other operators. You cannot transmit without a ham radio license and proper equipment &mdash; but you can listen to the entire world.' },
            { title: 'Configure Audio Pipeline', content: '<p>Create an audio pipeline from rtl_fm to WSJT-X using PulseAudio virtual sinks.</p>', code: '# Create a virtual audio sink\npactl load-module module-null-sink sink_name=sdr_audio sink_properties=device.description="SDR_Audio"\n\n# Start receiving 20m FT8 (14.074 MHz — needs upconverter)\n# Or use 10m FT8 (28.074 MHz — native RTL-SDR range)\nrtl_fm -f 28.074M -M usb -s 48000 -g 40 | \\\n  paplay --device=sdr_audio --rate=48000 --channels=1 --format=s16le &\n\n# In WSJT-X: Settings > Audio > Input = Monitor of SDR_Audio\n# Set frequency to 28.074 MHz, Mode: FT8', language: 'Bash', tip: null },
            { title: 'Decode FT8 Contacts', content: '<p>WSJT-X decodes FT8 transmissions every 15 seconds. Each decoded message shows the calling station, the responding station, their signal reports, and grid locators (location codes).</p>', code: '# WSJT-X decodes automatically when configured correctly\n# You will see lines like:\n# 173015  -14  0.3 1014 ~  CQ K1ABC FN42\n# 173015   -7  0.1  873 ~  K1ABC W2XYZ FN31\n# 173045  -12  0.3 1014 ~  W2XYZ K1ABC -07\n#\n# Format: time, SNR (dB), DT, freq, message\n# SNR of -14 means the signal is 14 dB below the noise floor\n# Yet it is decoded perfectly — that is the power of FT8\n\n# Map decoded stations:\n# pskreporter.info shows your decoded stations on a world map\n# (requires creating a free account and configuring WSJT-X to report)', language: 'Bash', tip: '<strong>Below the noise floor:</strong> FT8 signals at -20 dB SNR are completely inaudible and invisible on a waterfall. The DSP algorithm extracts them from pure noise. This is the same mathematical principle behind GPS (which also operates below the noise floor) and spread-spectrum military communications.' },
            { title: 'Analyze Propagation', content: '<p>Track which stations you can receive over time. HF propagation changes with solar conditions, time of day, and season. During good conditions on 10m or 6m, you may decode stations from other continents.</p>', code: '# WSJT-X logs all decoded messages to:\n# ~/.local/share/WSJT-X/ALL.TXT\n\n# Count unique callsigns decoded:\nawk \"{print \\$7}\" ~/.local/share/WSJT-X/ALL.TXT | sort -u | wc -l\n\n# Count by grid square (first 4 chars = rough location):\nawk \"{print substr(\\$NF,1,4)}\" ~/.local/share/WSJT-X/ALL.TXT | sort | uniq -c | sort -rn | head -20\n\n# Furthest station received:\n# Compare grid squares to estimate distance\n# Or check pskreporter.info for a visual map', language: 'Bash', tip: '<strong>Solar cycles matter:</strong> HF propagation depends on the ionosphere, which is ionized by solar radiation. During solar maximum (2024-2026), the 10m and 6m bands open for long-distance contacts that are impossible during solar minimum. You are building this project at the peak of Solar Cycle 25 &mdash; the best time in 11 years for HF reception.' }
        ],
        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>WSJT-X installed and running</li>' +
                 '<li>Audio pipeline configured: rtl_fm audio reaches WSJT-X</li>' +
                 '<li>FT8 messages decoding in the WSJT-X window</li>' +
                 '<li>Multiple unique callsigns decoded</li>' +
                 '<li>Can identify the sending station location from the grid locator</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>WSJT-X shows no decoded messages:</strong> Check the audio pipeline. Open PulseAudio Volume Control (<code>pavucontrol</code>) and verify that the Monitor of SDR_Audio sink is active and audio levels are visible. WSJT-X must have its input set to this source. If levels show zero, rtl_fm is not running or the virtual sink was not created.</li>' +
                         '<li><strong>Audio pipeline has no signal:</strong> Verify rtl_fm is tuned to the correct frequency. For 10m FT8 (no upconverter needed), use 28.074 MHz. For 20m FT8, you need an HF upconverter &mdash; without one, the RTL-SDR cannot receive below 24 MHz natively.</li>' +
                         '<li><strong>WSJT-X decodes garbled callsigns:</strong> The frequency offset may be wrong. FT8 signals must be within the 0-5000 Hz audio passband displayed in WSJT-X. Adjust the rtl_fm tuning frequency in small steps (1-2 kHz) until the FT8 signals appear in the waterfall at the expected audio frequencies.</li>' +
                         '<li><strong>No signals on 10m band (28 MHz):</strong> HF propagation depends on solar conditions. The 10m band may be closed (no ionospheric skip) at your time of day. Check propagation forecasts at <code>dxheat.com</code> or <code>pskreporter.info</code>. Try again during daylight hours when 10m is most likely open.</li>' +
                         '<li><strong>PulseAudio virtual sink disappears after reboot:</strong> The <code>pactl load-module</code> command is not persistent. Add it to your PulseAudio configuration or create a startup script that recreates the virtual sink on boot.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Propagation Logging</strong> &mdash; Run WSJT-X for one full week, decoding continuously. Parse the ALL.TXT log and plot the number of decoded stations per hour over 7 days. Identify the daily propagation pattern on your target band. Correlate sudden changes with solar events using spaceweather.com data.</p>' +
                    '<p><strong>Challenge 2: Grid Square Map</strong> &mdash; Extract all unique grid squares from decoded FT8 messages. Plot them on a world map using Python and matplotlib. Calculate the furthest station received and the total geographic coverage of your reception.</p>' +
                    '<p><strong>Challenge 3: Multi-Band Comparison</strong> &mdash; If you have an upconverter, decode FT8 on 20m (14.074 MHz) and 10m (28.074 MHz) simultaneously using two RTL-SDR dongles. Compare which bands are open at different times of day and which reaches further. This demonstrates ionospheric propagation physics.</p>',

        commonMistakes: [
            {
                title: 'Expecting HF Reception Without an Upconverter',
                correct: 'The RTL-SDR natively receives 24 MHz and above. For HF bands below 24 MHz (20m at 14 MHz, 40m at 7 MHz), an HF upconverter is required to shift the signal into the receivable range.',
                incorrect: 'Tuning the RTL-SDR directly to 14.074 MHz and expecting to receive FT8 signals.',
                consequence: 'No signals are received. The RTL-SDR hardware cannot tune below approximately 24 MHz. The 10m band (28.074 MHz) and 6m band (50.313 MHz) are the only FT8 bands within native RTL-SDR range.'
            },
            {
                title: 'Computer Clock Not Synchronized',
                correct: 'FT8 requires accurate time synchronization to within 1-2 seconds. Enable NTP on your system: <code>sudo timedatectl set-ntp true</code>.',
                incorrect: 'Running WSJT-X with a computer clock that is off by more than 2 seconds, or on a system without network time synchronization.',
                consequence: 'WSJT-X cannot properly align to the 15-second FT8 transmission windows. Decoding fails or produces very few results even when signals are present. Time accuracy is critical for FT8 synchronization.'
            }
        ]
    },

    'sg-59': {
        intro: '<p>The International Space Station (ISS) carries an amateur radio digipeater and occasionally transmits SSTV (Slow Scan Television) images. You can receive APRS packets and decode SSTV images from the ISS using your RTL-SDR as it passes overhead at 145.800 MHz (voice/SSTV) and 145.825 MHz (APRS packet digipeater).</p>',
        wiring: '    RTL-SDR + 2m antenna (51.7cm elements) -> ISS at 145.8 MHz',
        wiringNotes: '<p><strong>ISS passes:</strong> The ISS orbits at ~420 km altitude and is visible for 5&ndash;10 minutes per pass. Use n2yo.com or the ISS Detector app to predict passes. The APRS digipeater is active most of the time; SSTV events are scheduled and announced on ariss.org.</p>',
        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg59-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg59-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-59 ISS RECEPTION (APRS &amp; SSTV)</text>' +

            '<!-- ISS Orbit Path -->' +
            '<g>' +
            '<!-- Orbital arc -->' +
            '<path d="M 80,90 Q 360,30 640,90" fill="none" stroke="rgba(234,179,8,0.2)" stroke-width="1" stroke-dasharray="6,4"/>' +
            '<!-- ISS icon -->' +
            '<g>' +
            '<rect x="325" y="48" width="70" height="35" rx="4" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="360" y="62" text-anchor="middle" fill="#fbbf24" font-size="6" font-weight="700">ISS</text>' +
            '<text x="360" y="74" text-anchor="middle" fill="#8b949e" font-size="4">420 km &bull; 27,600 km/h</text>' +
            '<!-- Solar panels -->' +
            '<rect x="300" y="55" width="24" height="18" rx="2" fill="rgba(59,130,246,0.12)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<rect x="396" y="55" width="24" height="18" rx="2" fill="rgba(59,130,246,0.12)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<!-- ISS movement animation -->' +
            '<animateTransform attributeName="transform" type="translate" values="-20,0;20,0;-20,0" dur="12s" repeatCount="indefinite"/>' +
            '</g>' +
            '</g>' +

            '<!-- Signal paths from ISS -->' +
            '<g>' +
            '<!-- APRS path -->' +
            '<line x1="340" y1="85" x2="200" y2="170" stroke="#22c55e" stroke-width="1" stroke-dasharray="4,3"><animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite"/></line>' +
            '<text x="260" y="125" fill="#22c55e" font-size="5" transform="rotate(-30,260,125)">145.825 MHz APRS</text>' +
            '<!-- SSTV path -->' +
            '<line x1="380" y1="85" x2="520" y2="170" stroke="#f97316" stroke-width="1" stroke-dasharray="4,3"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite"/></line>' +
            '<text x="460" y="125" fill="#f97316" font-size="5" transform="rotate(30,460,125)">145.800 MHz SSTV</text>' +
            '</g>' +

            '<!-- Ground Station -->' +
            '<g>' +
            '<!-- RTL-SDR + Antenna -->' +
            '<rect x="120" y="170" width="160" height="90" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="120" y="170" width="160" height="20" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="200" y="185" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="700">RTL-SDR V4</text>' +
            '<!-- 2m Antenna -->' +
            '<line x1="140" y1="170" x2="140" y2="148" stroke="#22c55e" stroke-width="2"/>' +
            '<line x1="128" y1="148" x2="152" y2="148" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="140" y="143" text-anchor="middle" fill="#22c55e" font-size="5">2m dipole</text>' +
            '<text x="200" y="205" text-anchor="middle" fill="#8b949e" font-size="6">51.7 cm elements</text>' +
            '<text x="200" y="220" text-anchor="middle" fill="#8b949e" font-size="6">Gain: 48 dB (max)</text>' +
            '<text x="200" y="235" text-anchor="middle" fill="#555" font-size="5">Doppler: &#177;3.5 kHz</text>' +
            '<text x="200" y="248" text-anchor="middle" fill="#555" font-size="5">5-10 min pass window</text>' +
            '</g>' +

            '<!-- USB connection -->' +
            '<line x1="200" y1="262" x2="200" y2="285" stroke="#555" stroke-width="1.5" stroke-dasharray="6,3"/>' +

            '<!-- Raspberry Pi -->' +
            '<g>' +
            '<rect x="120" y="288" width="160" height="80" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="120" y="288" width="160" height="20" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="200" y="303" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">RASPBERRY PI</text>' +
            '<text x="200" y="322" text-anchor="middle" fill="#22c55e" font-size="6">APRS: multimon-ng -a AFSK1200</text>' +
            '<text x="200" y="338" text-anchor="middle" fill="#f97316" font-size="6">SSTV: qsstv / sstv decoder</text>' +
            '<text x="200" y="354" text-anchor="middle" fill="#a78bfa" font-size="6">Tracking: gpredict</text>' +
            '</g>' +

            '<!-- APRS Decoded Output -->' +
            '<g>' +
            '<rect x="340" y="170" width="180" height="80" rx="8" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.25)" stroke-width="1"/>' +
            '<text x="430" y="188" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">APRS PACKETS</text>' +
            '<text x="350" y="205" fill="#8b949e" font-size="5">fm K1ABC to APRS via RS0ISS:</text>' +
            '<text x="350" y="218" fill="#8b949e" font-size="5">@092345z4220.00N/07105.00W</text>' +
            '<text x="350" y="231" fill="#555" font-size="5">Callsign &bull; Position &bull; Status</text>' +
            '<text x="350" y="244" fill="#555" font-size="5">Digipeated via ISS &#8594; ground</text>' +
            '</g>' +

            '<!-- SSTV Image Output -->' +
            '<g>' +
            '<rect x="540" y="170" width="150" height="80" rx="8" fill="rgba(249,115,22,0.05)" stroke="rgba(249,115,22,0.25)" stroke-width="1"/>' +
            '<text x="615" y="188" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="600">SSTV IMAGES</text>' +
            '<!-- Image placeholder -->' +
            '<rect x="555" y="198" width="50" height="38" rx="3" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
            '<text x="580" y="220" text-anchor="middle" fill="#f97316" font-size="6">IMG</text>' +
            '<text x="640" y="210" fill="#8b949e" font-size="5">PD120 mode</text>' +
            '<text x="640" y="222" fill="#8b949e" font-size="5">2-3 min/image</text>' +
            '<text x="615" y="243" text-anchor="middle" fill="#555" font-size="5">Scheduled events only (ariss.org)</text>' +
            '</g>' +

            '<!-- Frequency Reference -->' +
            '<rect x="340" y="265" width="180" height="55" rx="6" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="350" y="282" fill="#eab308" font-size="7" font-weight="600">ISS FREQUENCIES</text>' +
            '<text x="350" y="296" fill="#22c55e" font-size="6">145.825 MHz &#8212; APRS digipeater</text>' +
            '<text x="350" y="309" fill="#f97316" font-size="6">145.800 MHz &#8212; Voice &amp; SSTV</text>' +

            '<!-- Doppler diagram -->' +
            '<g>' +
            '<rect x="540" y="265" width="150" height="55" rx="6" fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.15)" stroke-width="0.5"/>' +
            '<text x="615" y="282" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="600">DOPPLER SHIFT</text>' +
            '<!-- Doppler curve -->' +
            '<path d="M 555,305 Q 575,290 615,300 Q 655,310 675,305" fill="none" stroke="#a78bfa" stroke-width="1"/>' +
            '<text x="565" y="300" fill="#22c55e" font-size="4">+3.5kHz</text>' +
            '<text x="660" y="300" fill="#ef4444" font-size="4">-3.5kHz</text>' +
            '</g>' +

            '<!-- Pass prediction -->' +
            '<rect x="340" y="330" width="350" height="48" rx="6" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="350" y="347" fill="#60a5fa" font-size="7" font-weight="600">PASS TRACKING</text>' +
            '<text x="350" y="362" fill="#8b949e" font-size="5.5">n2yo.com (ISS #25544) &bull; gpredict &bull; ISS Detector app</text>' +
            '<text x="350" y="375" fill="#555" font-size="5">Best passes: elevation &gt;30&#176; &bull; Update TLEs from celestrak.org before each session</text>' +

            '</svg>' +
            '</div>',
        steps: [
            { title: 'Track ISS Passes', content: '<p>Predict when the ISS will be overhead at your location.</p>', code: '# Install gpredict for ISS tracking\nsudo apt install gpredict -y\n\n# Or check online:\n# https://www.n2yo.com/?s=25544\n# https://spotthestation.nasa.gov/\n\n# ISS frequencies:\n# 145.800 MHz — Voice and SSTV downlink\n# 145.825 MHz — APRS digipeater (packet radio)\n# Set dipole elements to 51.7 cm for 2m band', language: 'Bash', tip: null },
            { title: 'Receive APRS Packets', content: '<p>APRS (Automatic Packet Reporting System) packets are short digital bursts containing callsign, position, and status. The ISS digipeater retransmits packets from ground stations.</p>', code: '# Decode APRS from the ISS digipeater\nrtl_fm -f 145.825M -M fm -s 22050 -g 48 - | \\\n  multimon-ng -a AFSK1200 -t raw -\n\n# Output shows decoded APRS packets:\n# AFSK1200: fm K1ABC to APRS via RS0ISS:\n#   @092345z4220.00N/07105.00W-PHG2360\n\n# Run this during a predicted ISS pass\n# You will see ground stations being digipeated through the ISS', language: 'Bash', tip: '<strong>Doppler shift:</strong> The ISS moves at 27,600 km/h. This causes a Doppler shift of about +/- 3.5 kHz as it approaches and recedes. rtl_fm handles this within its filter bandwidth, but if you lose the signal mid-pass, try tuning +/- 5 kHz.' },
            { title: 'Decode SSTV Images', content: '<p>During SSTV events, the ISS transmits images on 145.800 MHz using PD120 or PD180 SSTV modes. Each image takes 2&ndash;3 minutes to transmit.</p>', code: '# Install SSTV decoder\nsudo apt install qsstv -y\n# Or use: pip3 install sstv\n\n# Record the ISS pass audio\nrtl_fm -f 145.800M -M fm -s 48000 -g 48 - | \\\n  sox -t raw -r 48000 -e s -b 16 -c 1 - iss-sstv-$(date +%Y%m%d).wav &\n\n# Wait for the pass, then stop recording (Ctrl+C)\n# Decode the image:\nqsstv  # GUI — load the WAV file and decode\n# Or headless: python3 -m sstv -d iss-sstv-*.wav -o iss-image.png', language: 'Bash', tip: '<strong>SSTV events:</strong> The ISS does not transmit SSTV continuously. Events are scheduled for holidays, anniversaries, and special occasions (Cosmonautics Day, ARISS school contacts). Check ariss.org and amsat.org for announcements. When an event is active, the images are often commemorative certificates or photos from the ISS.' },
            { title: 'Log and Document Contacts', content: '<p>Keep a log of every ISS reception — timestamps, decoded packets, SSTV images. Some ham radio organizations offer QSL cards and awards for confirmed ISS contacts.</p>', code: '# Create an ISS reception log\nmkdir -p ~/sdr-projects/iss\n\ncat << \'LOGEOF\' >> ~/sdr-projects/iss/reception-log.txt\n=== ISS Reception Log ===\nDate: $(date +%Y-%m-%d)\nPass time: [fill in from prediction]\nMax elevation: [degrees]\nFrequency: 145.825 MHz (APRS) / 145.800 MHz (SSTV)\nPackets decoded: [count]\nNotable callsigns: [list]\nSSTV image: [yes/no — filename if yes]\nNotes: [signal quality, Doppler, weather conditions]\nLOGEOF\n\necho "Log updated. Check ~/sdr-projects/iss/"', language: 'Bash', tip: null }
        ],
        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>ISS pass predicted and tracked</li>' +
                 '<li>APRS packets decoded from the ISS digipeater</li>' +
                 '<li>Audio recording captured during a pass</li>' +
                 '<li>SSTV image decoded (during a scheduled event)</li>' +
                 '<li>Reception log maintained with timestamps and details</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>No APRS packets decoded during a predicted pass:</strong> The ISS APRS digipeater is on 145.825 MHz, not 145.800 MHz. Verify you are on the correct frequency. Also check that the pass has sufficient elevation &mdash; passes below 20 degrees may be too weak. The digipeater is occasionally turned off for crew activities.</li>' +
                         '<li><strong>Signal heard but no decoding:</strong> APRS uses 1200 baud AFSK. Make sure multimon-ng has <code>-a AFSK1200</code> enabled, not POCSAG. The audio sample rate from rtl_fm must be 22050 Hz to match multimon-ng expectations.</li>' +
                         '<li><strong>Doppler shift causing signal loss mid-pass:</strong> The ISS moves at 27,600 km/h, causing +/- 3.5 kHz Doppler shift. rtl_fm handles this within its filter bandwidth for APRS. If using GQRX, manually track the frequency shift during the pass or use Gpredict Doppler correction.</li>' +
                         '<li><strong>SSTV image is mostly noise or blank:</strong> SSTV events are scheduled, not continuous. The ISS only transmits SSTV during announced events (typically a few days per year). Check ariss.org and amsat.org for current event schedules before attempting SSTV capture.</li>' +
                         '<li><strong>gpredict shows incorrect pass predictions:</strong> TLE data may be outdated. The ISS orbit is frequently adjusted. Update TLEs from celestrak.org before each session: <code>wget -O weather.tle "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle"</code>.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Full Pass Recording</strong> &mdash; Record audio for every ISS pass over your location for 48 hours. Decode all APRS packets. Map the ground stations whose packets were digipeated through the ISS. Calculate the ISS footprint diameter from the station locations.</p>' +
                    '<p><strong>Challenge 2: Doppler Curve Measurement</strong> &mdash; Record the raw signal from an ISS pass and measure the frequency offset at 30-second intervals. Plot the Doppler curve (frequency vs time). Compare your measured curve to the theoretical prediction based on the ISS orbital velocity and geometry.</p>' +
                    '<p><strong>Challenge 3: SSTV Event Capture</strong> &mdash; Monitor ARISS announcements for the next SSTV event. Set up an automated recording triggered by pass predictions. Decode and collect all transmitted images during the event. Some events transmit unique commemorative images &mdash; collecting a complete set is a rewarding challenge.</p>',

        commonMistakes: [
            {
                title: 'Confusing APRS and SSTV Frequencies',
                correct: 'APRS digipeater: 145.825 MHz. Voice and SSTV downlink: 145.800 MHz. These are two separate systems on different frequencies.',
                incorrect: 'Listening on 145.800 MHz for APRS packets, or on 145.825 MHz for SSTV images.',
                consequence: 'You receive nothing on the wrong frequency. The APRS digipeater and voice/SSTV downlink are separate transmitters with different functions. Always verify which one you are targeting.'
            },
            {
                title: 'Attempting SSTV During Non-Event Periods',
                correct: 'SSTV from the ISS is only active during announced events. Check ariss.org for the schedule before setting up to receive.',
                incorrect: 'Setting up SSTV decoding during a random ISS pass and expecting to receive images.',
                consequence: 'No SSTV signal is present. The ISS transmits SSTV only during scheduled events, typically a few times per year for special occasions. Outside these events, 145.800 MHz may carry occasional voice contacts or be silent.'
            },
            {
                title: 'Antenna Elements Wrong Length for 2m Band',
                correct: 'Set dipole elements to 51.7 cm each for the 145 MHz (2-meter) band.',
                incorrect: 'Using the dipole at a previous length setting (6.9 cm for ADS-B, 75 cm for FM, etc.) without adjusting for the ISS frequency.',
                consequence: 'Significantly reduced signal reception. The ISS signal is already weak due to the 420 km distance. A mistuned antenna may miss the signal entirely on low-elevation passes.'
            }
        ]
    },

    'sg-60': {
        intro: '<p>LoRa (Long Range) is a radio modulation designed for IoT devices that need to communicate over kilometers using milliwatts of power. With two ESP32 boards equipped with LoRa modules, you can build a point-to-point messaging system that works over 1&ndash;10+ km line-of-sight &mdash; no WiFi, no cellular, no internet required.</p>' +
               '<p>LoRa is used in smart agriculture, asset tracking, environmental monitoring, and emergency communications. The Meshtastic project turns LoRa devices into a mesh network for off-grid text messaging. This project builds both a custom LoRa link and a Meshtastic mesh node.</p>',
        wiring: '    ESP32 + LoRa #1 (TX)       ESP32 + LoRa #2 (RX)\n' +
                '    +----------------+          +----------------+\n' +
                '    | TTGO T-Beam    |)))))))))) | Heltec LoRa32  |\n' +
                '    | or Heltec      |  LoRa    | or TTGO        |\n' +
                '    | 868/915 MHz    |  1-10km  | 868/915 MHz    |\n' +
                '    +----------------+          +----------------+',
        wiringNotes: '<p><strong>Frequency:</strong> Use 915 MHz in the Americas (FCC ISM band) or 868 MHz in Europe (ETSI). These are license-free ISM frequencies for low-power devices.</p>' +
                     '<p><strong>Range:</strong> LoRa range depends on spreading factor, bandwidth, antenna height, and terrain. In urban areas expect 1&ndash;3 km. In open rural terrain with elevated antennas, 10&ndash;20+ km is achievable.</p>',
        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg60-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg60-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-60 LORA MESH NETWORK (MESHTASTIC)</text>' +

            '<!-- Node Alpha (TTGO T-Beam) -->' +
            '<g>' +
            '<rect x="30" y="80" width="170" height="130" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="30" y="80" width="170" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="115" y="96" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">NODE ALPHA</text>' +
            '<!-- Board -->' +
            '<rect x="55" y="110" width="120" height="50" rx="4" fill="#2a2a3a" stroke="#3b82f6" stroke-width="0.8"/>' +
            '<text x="115" y="128" text-anchor="middle" fill="#60a5fa" font-size="6" font-weight="600">TTGO T-Beam</text>' +
            '<text x="115" y="140" text-anchor="middle" fill="#8b949e" font-size="5">ESP32 + SX1276 LoRa</text>' +
            '<text x="115" y="152" text-anchor="middle" fill="#8b949e" font-size="5">GPS module &bull; 18650 battery</text>' +
            '<!-- Antenna -->' +
            '<line x1="50" y1="110" x2="50" y2="85" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="42" y1="85" x2="58" y2="85" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="50" y="80" text-anchor="middle" fill="#22c55e" font-size="4">915 MHz</text>' +
            '<!-- Meshtastic -->' +
            '<text x="115" y="175" text-anchor="middle" fill="#eab308" font-size="6" font-weight="600">Meshtastic FW</text>' +
            '<text x="115" y="188" text-anchor="middle" fill="#555" font-size="5">Bluetooth &#8594; phone app</text>' +
            '<text x="115" y="200" text-anchor="middle" fill="#555" font-size="5">GPS position sharing</text>' +
            '</g>' +

            '<!-- LoRa link Alpha to Beta -->' +
            '<g>' +
            '<line x1="200" y1="145" x2="300" y2="145" stroke="#f97316" stroke-width="2" stroke-dasharray="8,4"><animate attributeName="stroke-dashoffset" values="0;-24" dur="2s" repeatCount="indefinite"/></line>' +
            '<!-- LoRa wave symbols -->' +
            '<path d="M 225,130 Q 230,125 235,130 Q 240,135 245,130" fill="none" stroke="#f97316" stroke-width="0.8" opacity="0.6"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/></path>' +
            '<path d="M 255,130 Q 260,125 265,130 Q 270,135 275,130" fill="none" stroke="#f97316" stroke-width="0.8" opacity="0.4"><animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.5s" begin="0.3s" repeatCount="indefinite"/></path>' +
            '<text x="250" y="125" text-anchor="middle" fill="#f97316" font-size="6" font-weight="600">LoRa 915 MHz</text>' +
            '<text x="250" y="160" text-anchor="middle" fill="#555" font-size="5">1-10+ km range</text>' +
            '</g>' +

            '<!-- Node Beta (Heltec LoRa32) -->' +
            '<g>' +
            '<rect x="300" y="80" width="170" height="130" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="300" y="80" width="170" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="385" y="96" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">NODE BETA</text>' +
            '<rect x="325" y="110" width="120" height="50" rx="4" fill="#2a2a3a" stroke="#22c55e" stroke-width="0.8"/>' +
            '<text x="385" y="128" text-anchor="middle" fill="#4ade80" font-size="6" font-weight="600">Heltec LoRa32</text>' +
            '<text x="385" y="140" text-anchor="middle" fill="#8b949e" font-size="5">ESP32 + SX1276 LoRa</text>' +
            '<text x="385" y="152" text-anchor="middle" fill="#8b949e" font-size="5">OLED display &bull; USB-C</text>' +
            '<!-- Antenna -->' +
            '<line x1="320" y1="110" x2="320" y2="85" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="312" y1="85" x2="328" y2="85" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="320" y="80" text-anchor="middle" fill="#22c55e" font-size="4">915 MHz</text>' +
            '<text x="385" y="175" text-anchor="middle" fill="#eab308" font-size="6" font-weight="600">Meshtastic FW</text>' +
            '<text x="385" y="188" text-anchor="middle" fill="#555" font-size="5">Relay/repeater node</text>' +
            '<text x="385" y="200" text-anchor="middle" fill="#555" font-size="5">Store &amp; forward msgs</text>' +
            '</g>' +

            '<!-- LoRa link Beta to Charlie -->' +
            '<g>' +
            '<line x1="470" y1="145" x2="540" y2="145" stroke="#f97316" stroke-width="2" stroke-dasharray="8,4"><animate attributeName="stroke-dashoffset" values="0;-24" dur="2s" begin="0.5s" repeatCount="indefinite"/></line>' +
            '<text x="505" y="138" text-anchor="middle" fill="#f97316" font-size="5">mesh hop</text>' +
            '</g>' +

            '<!-- Node Charlie -->' +
            '<g>' +
            '<rect x="540" y="80" width="150" height="130" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="540" y="80" width="150" height="22" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="615" y="96" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="600">NODE CHARLIE</text>' +
            '<rect x="560" y="110" width="110" height="50" rx="4" fill="#2a2a3a" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="615" y="128" text-anchor="middle" fill="#c084fc" font-size="6" font-weight="600">RAK WisBlock</text>' +
            '<text x="615" y="140" text-anchor="middle" fill="#8b949e" font-size="5">nRF52 + SX1262</text>' +
            '<text x="615" y="152" text-anchor="middle" fill="#8b949e" font-size="5">Solar powered</text>' +
            '<line x1="555" y1="110" x2="555" y2="85" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="547" y1="85" x2="563" y2="85" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="615" y="175" text-anchor="middle" fill="#eab308" font-size="6" font-weight="600">Meshtastic FW</text>' +
            '<text x="615" y="188" text-anchor="middle" fill="#555" font-size="5">Extended coverage</text>' +
            '<text x="615" y="200" text-anchor="middle" fill="#555" font-size="5">hilltop / rooftop</text>' +
            '</g>' +

            '<!-- Mesh routing diagram -->' +
            '<rect x="30" y="230" width="300" height="55" rx="8" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="248" fill="#f97316" font-size="7" font-weight="600">MESH ROUTING</text>' +
            '<text x="40" y="264" fill="#8b949e" font-size="5.5">Alpha &#8596; Beta &#8596; Charlie (auto-routing)</text>' +
            '<text x="40" y="277" fill="#555" font-size="5">Messages hop between nodes to extend range beyond single link</text>' +

            '<!-- LoRa Specs -->' +
            '<rect x="30" y="300" width="300" height="75" rx="8" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="318" fill="#4ade80" font-size="7" font-weight="600">LORA PARAMETERS</text>' +
            '<text x="40" y="334" fill="#8b949e" font-size="5.5">Frequency: 915 MHz (US) / 868 MHz (EU)</text>' +
            '<text x="40" y="348" fill="#8b949e" font-size="5.5">Spreading Factor: SF7-SF12 (higher = longer range)</text>' +
            '<text x="40" y="362" fill="#8b949e" font-size="5.5">Bandwidth: 125/250/500 kHz &bull; TX: ~100 mW</text>' +
            '<text x="40" y="375" fill="#555" font-size="5">Community record: 200+ km with directional antennas</text>' +

            '<!-- Use Cases -->' +
            '<rect x="370" y="240" width="320" height="135" rx="8" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="380" y="258" fill="#eab308" font-size="7" font-weight="600">OFF-GRID COMMS</text>' +
            '<text x="380" y="275" fill="#22c55e" font-size="5.5">No WiFi, no cellular, no internet required</text>' +
            '<text x="380" y="290" fill="#8b949e" font-size="5.5">&bull; Disaster response / hurricane comms</text>' +
            '<text x="380" y="305" fill="#8b949e" font-size="5.5">&bull; Backcountry hiking / SAR operations</text>' +
            '<text x="380" y="320" fill="#8b949e" font-size="5.5">&bull; Smart agriculture / remote sensors</text>' +
            '<text x="380" y="335" fill="#8b949e" font-size="5.5">&bull; Campus/neighborhood mesh coverage</text>' +
            '<text x="380" y="355" fill="#ef4444" font-size="6" font-weight="600">CRITICAL: connect antenna before power!</text>' +
            '<text x="380" y="368" fill="#555" font-size="5">TX without antenna damages LoRa chip permanently</text>' +

            '</svg>' +
            '</div>',
        steps: [
            { title: 'Flash Meshtastic Firmware', content: '<p>The easiest way to start with LoRa is Meshtastic &mdash; open-source mesh networking firmware for ESP32+LoRa boards.</p>', code: '# Install Meshtastic flasher\npip3 install meshtastic\n\n# Flash your first board (plug in via USB)\nmeshtastic --firmware-update\n# Follow the prompts to select your board type\n\n# Flash the second board the same way\n\n# Verify both boards are running:\nmeshtastic --info\n# Shows: firmware version, hardware model, region setting', language: 'Bash', tip: '<strong>Board compatibility:</strong> Meshtastic supports TTGO T-Beam (best — has GPS), Heltec LoRa32, TTGO LoRa32, and RAK WisBlock. The T-Beam is recommended because it includes a GPS module for location sharing.' },
            { title: 'Configure and Test', content: '<p>Set the region, channel, and device name. Then test communication between the two boards.</p>', code: '# Configure region (must match your country)\n# Board 1:\nmeshtastic --set lora.region US\nmeshtastic --set-owner "Node-Alpha"\n\n# Board 2 (plug in second board):\nmeshtastic --set lora.region US\nmeshtastic --set-owner "Node-Beta"\n\n# Send a message from Board 1:\nmeshtastic --sendtext "Hello from Alpha"\n\n# On Board 2, check received messages:\nmeshtastic --info\n# Or use the Meshtastic phone app (Android/iOS) via Bluetooth\n\n# Check signal quality:\nmeshtastic --nodes\n# Shows: node name, SNR (signal-to-noise ratio), last heard time', language: 'Bash', tip: null },
            { title: 'Range Test', content: '<p>Take one board and walk/drive away from the other. The Meshtastic app shows signal strength and distance in real time.</p>', code: '# Enable range test mode on Board 1:\nmeshtastic --set range_test.enabled true\nmeshtastic --set range_test.sender 30\n# Sends a test message every 30 seconds\n\n# On Board 2, monitor reception:\n# Meshtastic app shows:\n#   - Last message received\n#   - SNR (higher = better, -20 is weak, +10 is strong)\n#   - Distance (if GPS enabled)\n#   - Packet loss percentage\n\n# Walk away from Board 1 with Board 2\n# Record distance when messages stop being received\n# That is your maximum range for current settings\n\n# To increase range:\n# - Use higher spreading factor: meshtastic --set lora.spreading_factor 12\n# - Use narrower bandwidth: meshtastic --set lora.bandwidth 125\n# - Elevate the antenna (rooftop vs ground level = 2-3x range)\n# - Use a directional antenna (Yagi) pointed at the other node', language: 'Bash', tip: '<strong>World record:</strong> The Meshtastic community has achieved 200+ km links with directional antennas on hilltops. The theoretical limit of LoRa is governed by the link budget equation: transmit power + antenna gain - path loss = received signal. Every 6 dB of improvement doubles the range.' },
            { title: 'Build a Mesh Network', content: '<p>Add a third node and configure mesh routing. Messages hop between nodes to extend range beyond what any single link can achieve.</p>', code: '# With 3+ nodes, Meshtastic automatically meshes:\n# Node A <-> Node B <-> Node C\n# A message from A to C routes through B if A cannot reach C directly\n\n# Check the mesh topology:\nmeshtastic --nodes\n# Shows all discovered nodes, their hop count, and last seen time\n\n# Send a message to a specific node:\nmeshtastic --dest "!abcd1234" --sendtext "Direct to you"\n# !abcd1234 is the node ID shown in --nodes output\n\n# Enable store-and-forward:\n# If Node B receives a message for Node C but C is offline,\n# B stores it and delivers when C comes back online\nmeshtastic --set store_forward.enabled true', language: 'Bash', tip: '<strong>Emergency use:</strong> Meshtastic mesh networks work without any infrastructure. No cell towers, no internet, no power grid. This makes them useful for disaster response, backcountry hiking, and any scenario where normal communications fail. Some communities maintain permanent Meshtastic mesh networks on hilltops for exactly this purpose.' }
        ],
        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Both boards flashed with Meshtastic firmware</li>' +
                 '<li>Region configured correctly for your country</li>' +
                 '<li>Messages successfully sent and received between boards</li>' +
                 '<li>Range test completed: know your maximum range</li>' +
                 '<li>Phone app connected via Bluetooth (optional but recommended)</li>' +
                 '<li>Mesh routing verified with 3+ nodes (if available)</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Meshtastic firmware flash fails:</strong> Ensure the board is in bootloader mode. For Heltec LoRa32, hold the BOOT button while pressing RESET. For TTGO T-Beam, hold the middle button while connecting USB. If the flasher cannot detect the board, install the CP210x or CH340 USB serial driver for your OS.</li>' +
                         '<li><strong>Nodes cannot see each other:</strong> Verify both boards are configured for the same region (US, EU, etc.). Region determines the frequency and regulatory parameters. Mismatched regions mean the radios transmit on different frequencies. Also check that both are on the same channel (default channel 0 is "LongFast").</li>' +
                         '<li><strong>Messages sent but never received:</strong> Check the SNR (signal-to-noise ratio) in <code>meshtastic --nodes</code>. If SNR is below -15, the signal is too weak. Reduce the distance, elevate the antenna, or increase spreading factor. Also verify that the antenna is properly connected &mdash; transmitting without an antenna can damage the LoRa module.</li>' +
                         '<li><strong>Bluetooth pairing fails with phone app:</strong> Reset Bluetooth on the board: <code>meshtastic --set bluetooth.enabled true --set bluetooth.mode RANDOM_PIN</code>. Remove old pairings from your phone. Some boards require firmware reflash to reset Bluetooth state.</li>' +
                         '<li><strong>Very short range (under 500m):</strong> Check the antenna connection. LoRa modules without an antenna have essentially zero range. Ensure the antenna matches the frequency band (915 MHz for US, 868 MHz for EU). Elevating both nodes even slightly (table vs ground) dramatically improves range.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Maximum Range Test</strong> &mdash; Take one Meshtastic node to the highest accessible point in your area (hilltop, parking garage roof, tall building). Leave the other node at your base location. Walk or drive away with the mobile node, recording the distance when messages stop being received. Compare your result to the Meshtastic community range records.</p>' +
                    '<p><strong>Challenge 2: Mesh Coverage Map</strong> &mdash; Deploy 3+ nodes across your neighborhood or campus. Walk around with the phone app and record where you can send messages via the mesh. Create a coverage map showing areas with direct connectivity vs mesh-relayed connectivity vs no coverage.</p>' +
                    '<p><strong>Challenge 3: Emergency Comms Drill</strong> &mdash; Simulate a communications blackout (no WiFi, no cellular). Using only Meshtastic, coordinate a group of 3+ people to accomplish a task (e.g., search and meet at a specific location). Document the experience: message latency, reliability, and practical limitations for emergency use.</p>',

        commonMistakes: [
            {
                title: 'Transmitting Without an Antenna Connected',
                correct: 'Always connect the antenna before powering the board. Verify the SMA or U.FL connector is fully seated.',
                incorrect: 'Powering on and transmitting with the LoRa module while no antenna is attached, or with a loose connector.',
                consequence: 'The RF power reflects back into the LoRa chip and can permanently damage the transmitter output stage. Unlike RTL-SDR (receive-only), LoRa boards transmit and require a proper antenna load. Replace a damaged module at full cost.'
            },
            {
                title: 'Mismatched Region Settings Between Nodes',
                correct: 'All nodes in the mesh must use the same region setting (<code>meshtastic --set lora.region US</code>). This controls the frequency band and duty cycle parameters.',
                incorrect: 'Setting one node to US region and another to EU region, or leaving one on the default setting.',
                consequence: 'Nodes transmit on different frequency bands and will never communicate. US uses 902-928 MHz, EU uses 863-870 MHz. There is no frequency overlap between regions, so mismatched nodes are completely invisible to each other.'
            },
            {
                title: 'Using Wrong Antenna Frequency Band',
                correct: 'Use a 915 MHz antenna for US region or 868 MHz antenna for EU region. Antenna must match the LoRa operating frequency.',
                incorrect: 'Connecting a 2.4 GHz WiFi antenna or a 433 MHz antenna to a 915 MHz LoRa module.',
                consequence: 'Severe range reduction. A 2.4 GHz antenna at 915 MHz provides 10+ dB less gain than a properly tuned antenna. The mismatch also increases return loss, potentially reducing range to a fraction of what is achievable.'
            }
        ]
    },

    'sg-61': {
        intro: '<p>Car key fobs transmit on 315 MHz (US) or 433 MHz (Europe/Asia) using simple on-off keying (OOK) or frequency-shift keying (FSK). With your RTL-SDR, you can capture these transmissions and analyze their structure &mdash; learning the difference between fixed-code systems (vulnerable to replay attacks) and rolling-code systems (resistant to replay).</p>' +
               '<p>This project is purely receive-and-analyze. You will capture your own key fob signal, examine its modulation, and understand why modern rolling codes cannot be replayed. This is essential knowledge for automotive security research.</p>',
        wiring: '    Your own car key fob -> 315/433 MHz -> RTL-SDR (17cm dipole elements)',
        wiringNotes: '<p><strong>Only your own key fob.</strong> Capturing other people\'s key fob signals without consent may violate wiretapping laws. Use your own vehicle and your own key fob for this exercise.</p>',
        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg61-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg61-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-61 KEY FOB &amp; ISM BAND ANALYSIS</text>' +

            '<!-- Key Fob -->' +
            '<g>' +
            '<rect x="40" y="70" width="130" height="130" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="40" y="70" width="130" height="22" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="105" y="86" text-anchor="middle" fill="#fb923c" font-size="8" font-weight="600">CAR KEY FOB</text>' +
            '<!-- Fob body -->' +
            '<rect x="65" y="100" width="80" height="50" rx="8" fill="#2a2a3a" stroke="#f97316" stroke-width="1"/>' +
            '<!-- Buttons -->' +
            '<circle cx="90" cy="120" r="6" fill="rgba(249,115,22,0.2)" stroke="#f97316" stroke-width="0.8"/>' +
            '<text x="90" y="123" text-anchor="middle" fill="#f97316" font-size="4">LOCK</text>' +
            '<circle cx="120" cy="120" r="6" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="0.8"/>' +
            '<text x="120" y="123" text-anchor="middle" fill="#22c55e" font-size="4">UNLK</text>' +
            '<text x="105" y="162" text-anchor="middle" fill="#8b949e" font-size="6">OOK / FSK modulation</text>' +
            '<text x="105" y="175" text-anchor="middle" fill="#8b949e" font-size="6">&lt;1 mW TX power</text>' +
            '<text x="105" y="188" text-anchor="middle" fill="#555" font-size="5">Fixed or Rolling code</text>' +
            '</g>' +

            '<!-- RF transmission -->' +
            '<g>' +
            '<path d="M 172,120 Q 190,115 200,120" fill="none" stroke="rgba(249,115,22,0.6)" stroke-width="1"><animate attributeName="stroke-opacity" values="0;0.8;0" dur="1s" repeatCount="indefinite"/></path>' +
            '<path d="M 175,115 Q 195,108 208,115" fill="none" stroke="rgba(249,115,22,0.4)" stroke-width="0.8"><animate attributeName="stroke-opacity" values="0;0.6;0" dur="1s" begin="0.2s" repeatCount="indefinite"/></path>' +
            '<path d="M 178,110 Q 200,100 215,110" fill="none" stroke="rgba(249,115,22,0.3)" stroke-width="0.6"><animate attributeName="stroke-opacity" values="0;0.5;0" dur="1s" begin="0.4s" repeatCount="indefinite"/></path>' +
            '</g>' +

            '<!-- Frequency labels -->' +
            '<g>' +
            '<rect x="195" y="70" width="110" height="48" rx="6" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
            '<text x="250" y="86" text-anchor="middle" fill="#f97316" font-size="7" font-weight="600">ISM BANDS</text>' +
            '<text x="250" y="100" text-anchor="middle" fill="#eab308" font-size="6">US: 315 MHz</text>' +
            '<text x="250" y="113" text-anchor="middle" fill="#22c55e" font-size="6">EU/Asia: 433.92 MHz</text>' +
            '</g>' +

            '<!-- RTL-SDR -->' +
            '<g>' +
            '<rect x="230" y="135" width="140" height="80" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="230" y="135" width="140" height="20" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="300" y="150" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="700">RTL-SDR V4</text>' +
            '<!-- Antenna -->' +
            '<line x1="245" y1="135" x2="245" y2="115" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="237" y1="115" x2="253" y2="115" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="245" y="130" fill="#22c55e" font-size="4">17cm</text>' +
            '<text x="300" y="170" text-anchor="middle" fill="#8b949e" font-size="6">rtl_433 decoder</text>' +
            '<text x="300" y="185" text-anchor="middle" fill="#8b949e" font-size="6">Multi-protocol ISM</text>' +
            '<text x="300" y="198" text-anchor="middle" fill="#555" font-size="5">OOK &bull; FSK &bull; ASK detection</text>' +
            '</g>' +

            '<!-- Arrow to analysis -->' +
            '<line x1="370" y1="175" x2="410" y2="175" stroke="#22c55e" stroke-width="1.5"/>' +
            '<polygon points="410,170 410,180 418,175" fill="#22c55e"/>' +

            '<!-- Analysis Output -->' +
            '<g>' +
            '<rect x="420" y="70" width="270" height="145" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="420" y="70" width="270" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="555" y="86" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">SIGNAL ANALYSIS</text>' +
            '<!-- Decoded data -->' +
            '<text x="432" y="108" fill="#8b949e" font-size="5.5">model: Generic Remote</text>' +
            '<text x="432" y="122" fill="#8b949e" font-size="5.5">modulation: OOK (On-Off Keying)</text>' +
            '<text x="432" y="136" fill="#8b949e" font-size="5.5">pulse_width: 400us / gap: 800us</text>' +
            '<text x="432" y="150" fill="#8b949e" font-size="5.5">bits: 24</text>' +
            '<!-- Fixed vs Rolling comparison -->' +
            '<rect x="432" y="158" width="120" height="18" rx="3" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="492" y="170" text-anchor="middle" fill="#ef4444" font-size="5.5">Press 1: 0xA1B2C3</text>' +
            '<rect x="560" y="158" width="120" height="18" rx="3" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="620" y="170" text-anchor="middle" fill="#ef4444" font-size="5.5">Press 2: 0xA1B2C3</text>' +
            '<text x="555" y="190" text-anchor="middle" fill="#ef4444" font-size="5.5">Same code = FIXED (vulnerable to replay)</text>' +
            '<rect x="432" y="195" width="248" height="14" rx="3" fill="rgba(34,197,94,0.08)"/>' +
            '<text x="555" y="205" text-anchor="middle" fill="#22c55e" font-size="5.5">Different code each press = ROLLING (secure)</text>' +
            '</g>' +

            '<!-- Security Analysis -->' +
            '<g>' +
            '<rect x="30" y="230" width="310" height="145" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.2)" stroke-width="1"/>' +
            '<text x="40" y="248" fill="#ef4444" font-size="7" font-weight="600">AUTOMOTIVE SECURITY ANALYSIS</text>' +
            '<!-- Fixed code -->' +
            '<rect x="42" y="258" width="135" height="60" rx="4" fill="rgba(239,68,68,0.06)"/>' +
            '<text x="110" y="273" text-anchor="middle" fill="#ef4444" font-size="6" font-weight="600">FIXED CODE</text>' +
            '<text x="110" y="287" text-anchor="middle" fill="#8b949e" font-size="5">Same data every press</text>' +
            '<text x="110" y="300" text-anchor="middle" fill="#8b949e" font-size="5">Replay attack: trivial</text>' +
            '<text x="110" y="313" text-anchor="middle" fill="#555" font-size="4">Old garages, cheap remotes</text>' +
            '<!-- Rolling code -->' +
            '<rect x="185" y="258" width="148" height="60" rx="4" fill="rgba(34,197,94,0.06)"/>' +
            '<text x="259" y="273" text-anchor="middle" fill="#22c55e" font-size="6" font-weight="600">ROLLING CODE</text>' +
            '<text x="259" y="287" text-anchor="middle" fill="#8b949e" font-size="5">KeeLoq / AUT64 cipher</text>' +
            '<text x="259" y="300" text-anchor="middle" fill="#8b949e" font-size="5">Counter + shared secret</text>' +
            '<text x="259" y="313" text-anchor="middle" fill="#555" font-size="4">Modern cars (2000+)</text>' +
            '<text x="185" y="345" fill="#eab308" font-size="5.5">Known attacks: RollJam (jam+capture), relay</text>' +
            '<text x="185" y="360" fill="#555" font-size="5">Defense: Faraday pouch for keys when idle</text>' +
            '</g>' +

            '<!-- Other ISM devices -->' +
            '<rect x="370" y="240" width="320" height="135" rx="8" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="380" y="258" fill="#eab308" font-size="7" font-weight="600">ALSO ON ISM BANDS (rtl_433)</text>' +
            '<text x="380" y="276" fill="#22c55e" font-size="5.5">&bull; TPMS tire pressure (315/433 MHz)</text>' +
            '<text x="380" y="291" fill="#60a5fa" font-size="5.5">&bull; Weather stations (433 MHz)</text>' +
            '<text x="380" y="306" fill="#f97316" font-size="5.5">&bull; Garage door openers (300-400 MHz)</text>' +
            '<text x="380" y="321" fill="#a78bfa" font-size="5.5">&bull; Wireless doorbells (433 MHz)</text>' +
            '<text x="380" y="336" fill="#38bdf8" font-size="5.5">&bull; Wireless thermometers, soil sensors</text>' +
            '<text x="380" y="356" fill="#ef4444" font-size="6" font-weight="600">RECEIVE ONLY &#8212; do not transmit/replay</text>' +
            '<text x="380" y="370" fill="#555" font-size="5">FCC Part 15 &bull; CFAA compliance &bull; Your own devices only</text>' +

            '</svg>' +
            '</div>',
        steps: [
            { title: 'Capture Key Fob Signal', content: '<p>Use rtl_433 to decode OOK/FSK signals on the ISM bands.</p>', code: '# Install rtl_433 (multi-protocol ISM band decoder)\nsudo apt install rtl-433 -y\n# Or build from source: https://github.com/merbanan/rtl_433\n\n# Start listening on 433 MHz (or 315 MHz for US)\nrtl_433 -f 433920000 -R 0\n# -f 433920000  = 433.92 MHz (common ISM frequency)\n# -R 0          = try all protocols\n\n# Press your key fob button — you should see output like:\n# time: 2026-03-24 05:30:00\n# model: Generic Remote\n# type: Button press\n# data: a1b2c3d4\n\n# Record raw IQ data for deeper analysis:\nrtl_sdr -f 433920000 -s 250000 -g 40 keyfob-capture.bin &\n# Press the key fob button\n# Press Ctrl+C to stop recording', language: 'Bash', tip: null },
            { title: 'Analyze Signal Structure', content: '<p>Examine the captured signal to understand the modulation and coding scheme.</p>', code: '# Decode and display signal details\nrtl_433 -f 433920000 -A\n# -A = analyze mode: shows pulse width, gap, modulation type\n\n# You will see:\n# Pulse width: 400us (OOK short pulse)\n# Gap: 800us (OOK long gap)\n# Modulation: OOK (On-Off Keying)\n# Bit count: 24 or 32 bits\n\n# Fixed code keys: same data every press (VULNERABLE)\n# Rolling code keys: different data every press (SECURE)\n# Press your fob multiple times and compare the data field:\n# If data changes each time -> rolling code (KeeLoq, AUT64)\n# If data is identical -> fixed code (vulnerable to replay)', language: 'Bash', tip: '<strong>Rolling codes:</strong> Modern cars use rolling code systems (KeeLoq by Microchip, AUT64 by VW). Each button press sends a different encrypted code derived from a synchronized counter. Replaying a captured code does not work because the car expects the NEXT code in the sequence, not a previous one.' },
            { title: 'Understand Attack and Defense', content: '<p>Study why fixed-code systems are vulnerable and how rolling codes defend against replay.</p>', code: '# === SECURITY ANALYSIS ===\n#\n# Fixed Code (old garage doors, cheap remotes):\n#   - Same code every time\n#   - Capture once, replay forever\n#   - Defense: upgrade to rolling code\n#\n# Rolling Code (modern cars, quality garage doors):\n#   - New code each press, derived from shared secret + counter\n#   - Replay does not work (code already used)\n#   - Known attacks:\n#     * RollJam: jam + capture two codes, replay first\n#       (requires TX capability — out of scope for SDR receive-only)\n#     * Relay attack: extend range, not replay\n#       (requires two devices near car and near key)\n#\n# Best defense: Faraday pouch for keys when not in use\n#   Blocks relay attacks by preventing key from responding\n\necho "Key takeaway: rolling codes are secure against simple replay."\necho "The real-world attacks (RollJam, relay) require TX capability"\necho "and are beyond receive-only SDR. But understanding the protocol"\necho "is essential for automotive security research."', language: 'Bash', tip: null }
        ],
        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>rtl_433 installed and detecting ISM band signals</li>' +
                 '<li>Key fob transmission captured and decoded</li>' +
                 '<li>Modulation type identified (OOK or FSK)</li>' +
                 '<li>Fixed vs rolling code determined by comparing multiple captures</li>' +
                 '<li>Can explain why replay attacks fail against rolling codes</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>rtl_433 shows no output when pressing key fob:</strong> Check the frequency. US key fobs typically use 315 MHz, while European and Asian fobs use 433.92 MHz. Try both: <code>rtl_433 -f 315000000</code> and <code>rtl_433 -f 433920000</code>. Some modern cars use 902 MHz or other frequencies.</li>' +
                         '<li><strong>rtl_433 decodes other devices but not the key fob:</strong> The key fob may use a protocol not in rtl_433&rsquo;s database. Try <code>-A</code> (analyze mode) to see raw pulse data even for unknown protocols. The output shows pulse widths and gaps which identify the modulation type.</li>' +
                         '<li><strong>Signal is detected but data field is always the same:</strong> This is expected for fixed-code systems (older garage doors, some older cars). Press the button multiple times and compare. If the data is identical each time, you have confirmed a fixed-code system.</li>' +
                         '<li><strong>Very weak or intermittent reception:</strong> Key fobs are low-power transmitters (typically under 1 mW). You need to be within a few meters of the fob when pressing. Set dipole elements to 17.3 cm for 433 MHz or 23.8 cm for 315 MHz. Hold the antenna near the key fob during transmission.</li>' +
                         '<li><strong>rtl_433 not found or install fails:</strong> On some distributions, rtl_433 is not in the default repositories. Build from source: <code>git clone https://github.com/merbanan/rtl_433 && cd rtl_433 && mkdir build && cd build && cmake .. && make && sudo make install</code>.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: ISM Band Survey</strong> &mdash; Run <code>rtl_433</code> for 24 hours and log every ISM band device detected: weather stations, tire pressure monitors (TPMS), garage doors, wireless doorbells, and key fobs. Count unique devices and categorize by protocol type and fixed vs rolling code.</p>' +
                    '<p><strong>Challenge 2: TPMS Analysis</strong> &mdash; Your car tires broadcast tire pressure monitoring (TPMS) data on 315 MHz (US) or 433 MHz (EU). Capture your own TPMS readings with <code>rtl_433</code>. Each sensor has a unique ID. Document what data is transmitted and discuss the privacy implications of vehicles broadcasting unique identifiers.</p>' +
                    '<p><strong>Challenge 3: Rolling Code Research</strong> &mdash; Research the KeeLoq algorithm used in most rolling code key fobs. Write a summary explaining how the counter synchronization works, what the "resynchronization window" is, and why the RollJam attack (jamming + capture) is effective even against rolling codes. Include a diagram of the attack flow.</p>',

        commonMistakes: [
            {
                title: 'Testing on Wrong ISM Band Frequency',
                correct: 'Determine the correct ISM band for your region: 315 MHz for most US vehicles, 433.92 MHz for European and Asian vehicles. Some systems use 868 MHz or 902 MHz.',
                incorrect: 'Assuming all key fobs use 433 MHz regardless of vehicle origin and region.',
                consequence: 'No signal detected even with the fob pressed right next to the antenna. A US-market Honda key fob at 315 MHz will not appear on a 433 MHz scan. Check your vehicle manual or FCC ID database for the correct frequency.'
            },
            {
                title: 'Attempting to Transmit or Replay Signals',
                correct: 'This project is receive-only analysis using an RTL-SDR. Do not transmit, replay, or jam key fob signals.',
                incorrect: 'Using a HackRF or other transmit-capable SDR to replay captured key fob signals, even against your own vehicle.',
                consequence: 'Transmitting on ISM bands without proper authorization or type-approved equipment may violate FCC Part 15 regulations. Replaying key fob signals against vehicles you do not own is a federal crime under the CFAA. Keep this exercise strictly receive-only.'
            }
        ]
    },

    'sg-62': {
        intro: '<p>Turn your RTL-SDR into an emergency radio scanner that monitors public safety frequencies &mdash; police, fire, EMS, and other emergency services. In many areas, these communications are transmitted on VHF/UHF frequencies in the clear or on digital trunked systems (P25) that can be decoded with open-source software.</p>' +
               '<p>Scanner listening is legal in most US states (some restrict use in vehicles). It provides real-time awareness of emergency activity in your area and teaches trunked radio system architecture &mdash; a technology used by every major public safety agency.</p>',
        wiring: '    RTL-SDR + wideband antenna -> VHF/UHF public safety bands',
        wiringNotes: '<p><strong>Frequencies:</strong> Public safety frequencies vary by region. Check RadioReference.com for your county/city. Common ranges: VHF low (30&ndash;50 MHz), VHF high (150&ndash;174 MHz), UHF (450&ndash;470 MHz), 700/800 MHz (trunked systems).</p>',
        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg62-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg62-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-62 EMERGENCY RADIO SCANNER</text>' +

            '<!-- Public Safety Agencies -->' +
            '<g>' +
            '<!-- Police -->' +
            '<rect x="30" y="50" width="100" height="65" rx="6" fill="#1e2736" stroke="#3b82f6" stroke-width="1.2"/>' +
            '<rect x="30" y="50" width="100" height="16" rx="6" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="80" y="62" text-anchor="middle" fill="#60a5fa" font-size="6" font-weight="600">POLICE</text>' +
            '<text x="80" y="78" text-anchor="middle" fill="#8b949e" font-size="5">Dispatch</text>' +
            '<text x="80" y="90" text-anchor="middle" fill="#8b949e" font-size="5">Tactical</text>' +
            '<text x="80" y="102" text-anchor="middle" fill="#555" font-size="4">VHF/UHF/800</text>' +
            '<!-- Fire -->' +
            '<rect x="140" y="50" width="100" height="65" rx="6" fill="#1e2736" stroke="#ef4444" stroke-width="1.2"/>' +
            '<rect x="140" y="50" width="100" height="16" rx="6" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="190" y="62" text-anchor="middle" fill="#fca5a5" font-size="6" font-weight="600">FIRE</text>' +
            '<text x="190" y="78" text-anchor="middle" fill="#8b949e" font-size="5">Dispatch</text>' +
            '<text x="190" y="90" text-anchor="middle" fill="#8b949e" font-size="5">Fireground</text>' +
            '<text x="190" y="102" text-anchor="middle" fill="#555" font-size="4">VHF/UHF/800</text>' +
            '<!-- EMS -->' +
            '<rect x="250" y="50" width="100" height="65" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.2"/>' +
            '<rect x="250" y="50" width="100" height="16" rx="6" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="300" y="62" text-anchor="middle" fill="#4ade80" font-size="6" font-weight="600">EMS</text>' +
            '<text x="300" y="78" text-anchor="middle" fill="#8b949e" font-size="5">Medical dispatch</text>' +
            '<text x="300" y="90" text-anchor="middle" fill="#8b949e" font-size="5">Hospital notify</text>' +
            '<text x="300" y="102" text-anchor="middle" fill="#555" font-size="4">VHF/UHF/800</text>' +
            '</g>' +

            '<!-- Trunked Radio Tower -->' +
            '<g>' +
            '<rect x="390" y="45" width="140" height="80" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="390" y="45" width="140" height="20" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="460" y="60" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="600">P25 TRUNKED</text>' +
            '<!-- Tower -->' +
            '<line x1="460" y1="72" x2="460" y2="95" stroke="#f97316" stroke-width="2"/>' +
            '<line x1="445" y1="95" x2="475" y2="95" stroke="#f97316" stroke-width="1.5"/>' +
            '<line x1="450" y1="88" x2="470" y2="88" stroke="#f97316" stroke-width="1"/>' +
            '<circle cx="460" cy="70" r="4" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1"><animate attributeName="fill-opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite"/></circle>' +
            '<text x="460" y="110" text-anchor="middle" fill="#8b949e" font-size="5">Control channel + voice pool</text>' +
            '<text x="460" y="122" text-anchor="middle" fill="#555" font-size="5">IMBE/AMBE voice codecs</text>' +
            '</g>' +

            '<!-- Connections from agencies to tower -->' +
            '<line x1="130" y1="82" x2="390" y2="82" stroke="#555" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<line x1="240" y1="82" x2="390" y2="82" stroke="#555" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<line x1="350" y1="82" x2="390" y2="82" stroke="#555" stroke-width="1" stroke-dasharray="4,3"/>' +

            '<!-- RF waves from tower to SDR -->' +
            '<g>' +
            '<path d="M 532,75 Q 555,65 575,75" fill="none" stroke="rgba(249,115,22,0.5)" stroke-width="1"><animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite"/></path>' +
            '<path d="M 535,68 Q 560,55 580,68" fill="none" stroke="rgba(249,115,22,0.3)" stroke-width="0.8"><animate attributeName="stroke-opacity" values="0.1;0.6;0.1" dur="1.5s" begin="0.4s" repeatCount="indefinite"/></path>' +
            '</g>' +

            '<!-- RTL-SDR Dongle -->' +
            '<g>' +
            '<rect x="570" y="50" width="120" height="80" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="2"/>' +
            '<rect x="570" y="50" width="120" height="20" rx="8" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="630" y="65" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="700">RTL-SDR V4</text>' +
            '<!-- Wideband antenna -->' +
            '<line x1="585" y1="50" x2="585" y2="35" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="577" y1="35" x2="593" y2="35" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="585" y="32" text-anchor="middle" fill="#22c55e" font-size="4">wideband</text>' +
            '<text x="630" y="85" text-anchor="middle" fill="#8b949e" font-size="6">VHF + UHF + 800 MHz</text>' +
            '<text x="630" y="98" text-anchor="middle" fill="#8b949e" font-size="6">TCXO for P25 decode</text>' +
            '<text x="630" y="115" text-anchor="middle" fill="#555" font-size="5">Frequency accuracy critical</text>' +
            '</g>' +

            '<!-- USB to Computer -->' +
            '<line x1="630" y1="132" x2="630" y2="155" stroke="#555" stroke-width="1.5" stroke-dasharray="6,3"/>' +

            '<!-- SDRTrunk -->' +
            '<g>' +
            '<rect x="540" y="155" width="150" height="95" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="540" y="155" width="150" height="20" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="615" y="170" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="600">SDRTrunk</text>' +
            '<text x="615" y="190" text-anchor="middle" fill="#8b949e" font-size="6">P25 Phase 1 &amp; 2 decoder</text>' +
            '<text x="615" y="205" text-anchor="middle" fill="#8b949e" font-size="6">Trunking control channel</text>' +
            '<text x="615" y="220" text-anchor="middle" fill="#8b949e" font-size="6">Auto-follow conversations</text>' +
            '<text x="615" y="235" text-anchor="middle" fill="#555" font-size="5">Java-based &bull; GUI &bull; aliases</text>' +
            '</g>' +

            '<!-- Talkgroup Output -->' +
            '<line x1="615" y1="252" x2="615" y2="275" stroke="#22c55e" stroke-width="1.5"/>' +
            '<polygon points="610,275 620,275 615,283" fill="#22c55e"/>' +
            '<g>' +
            '<rect x="510" y="285" width="190" height="85" rx="8" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.25)" stroke-width="1"/>' +
            '<text x="605" y="303" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">TALKGROUPS</text>' +
            '<rect x="522" y="310" width="80" height="14" rx="2" fill="rgba(59,130,246,0.1)"/>' +
            '<text x="562" y="320" text-anchor="middle" fill="#60a5fa" font-size="5">PD Dispatch</text>' +
            '<rect x="610" y="310" width="80" height="14" rx="2" fill="rgba(239,68,68,0.1)"/>' +
            '<text x="650" y="320" text-anchor="middle" fill="#fca5a5" font-size="5">Fire Dispatch</text>' +
            '<rect x="522" y="330" width="80" height="14" rx="2" fill="rgba(34,197,94,0.1)"/>' +
            '<text x="562" y="340" text-anchor="middle" fill="#4ade80" font-size="5">EMS</text>' +
            '<rect x="610" y="330" width="80" height="14" rx="2" fill="rgba(234,179,8,0.1)"/>' +
            '<text x="650" y="340" text-anchor="middle" fill="#eab308" font-size="5">Tactical</text>' +
            '<rect x="522" y="350" width="168" height="14" rx="2" fill="rgba(239,68,68,0.06)"/>' +
            '<text x="606" y="360" text-anchor="middle" fill="#ef4444" font-size="5">AES-256 encrypted TGs = garbled audio</text>' +
            '</g>' +

            '<!-- Frequency Bands Reference -->' +
            '<g>' +
            '<rect x="30" y="140" width="240" height="100" rx="8" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="158" fill="#eab308" font-size="7" font-weight="600">PUBLIC SAFETY BANDS</text>' +
            '<text x="40" y="175" fill="#60a5fa" font-size="5.5">VHF Low: 30-50 MHz</text>' +
            '<text x="40" y="189" fill="#3b82f6" font-size="5.5">VHF High: 150-174 MHz (most common)</text>' +
            '<text x="40" y="203" fill="#22c55e" font-size="5.5">UHF: 450-470 MHz</text>' +
            '<text x="40" y="217" fill="#f97316" font-size="5.5">700/800 MHz: P25 trunked systems</text>' +
            '<text x="40" y="231" fill="#555" font-size="5">Check RadioReference.com for your area</text>' +
            '</g>' +

            '<!-- Analog vs Digital -->' +
            '<g>' +
            '<rect x="30" y="255" width="240" height="65" rx="8" fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="273" fill="#a78bfa" font-size="7" font-weight="600">SYSTEM TYPES</text>' +
            '<text x="40" y="290" fill="#22c55e" font-size="5.5">Analog FM: rtl_fm direct (simple)</text>' +
            '<text x="40" y="304" fill="#f97316" font-size="5.5">P25 Digital: SDRTrunk / OP25 (decoder)</text>' +
            '<text x="40" y="318" fill="#ef4444" font-size="5.5">Encrypted: visible but no audio decode</text>' +
            '</g>' +

            '<!-- Legal / Broadcastify -->' +
            '<rect x="30" y="335" width="460" height="45" rx="6" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="40" y="353" fill="#60a5fa" font-size="7" font-weight="600">LEGAL: Receiving legal in most US states</text>' +
            '<text x="40" y="368" fill="#555" font-size="5">Some states restrict mobile use &bull; Do not interfere with ops &bull; Broadcastify.com for public feed sharing</text>' +

            '</svg>' +
            '</div>',
        steps: [
            { title: 'Find Local Frequencies', content: '<p>RadioReference.com is the definitive database of public safety radio systems in the US and Canada.</p>', code: '# Go to https://www.radioreference.com/\n# Search your county or city\n# Note:\n#   - Frequency (MHz)\n#   - Mode (FM, P25, DMR)\n#   - PL/DPL tone (if analog)\n#   - Talkgroup IDs (if trunked)\n\n# Example — scan common public safety frequencies:\n# Fire dispatch: varies (check RadioReference)\n# EMS: varies\n# Police: varies\n\n# Quick listen to a known frequency:\nrtl_fm -f 155.475M -M fm -s 12000 -g 40 -l 10 | \\\n  play -r 12000 -t raw -e s -b 16 -c 1 -V1 -', language: 'Bash', tip: '<strong>RadioReference.com</strong> has the frequencies for virtually every public safety agency in North America. Create a free account, search your location, and note the frequencies, modes, and talkgroup IDs. This is your frequency programming guide.' },
            { title: 'Install SDRTrunk for Trunked Systems', content: '<p>Most modern public safety radio systems are trunked &mdash; multiple agencies share a pool of frequencies managed by a control channel. SDRTrunk is an open-source Java application that follows trunked conversations.</p>', code: '# Install Java runtime\nsudo apt install default-jre -y\n\n# Download SDRTrunk\n# https://github.com/DSheirer/sdrtrunk/releases\nwget https://github.com/DSheirer/sdrtrunk/releases/latest/download/sdr-trunk-linux-aarch64.zip\nunzip sdr-trunk-*.zip -d ~/sdrtrunk\n\n# Run SDRTrunk\ncd ~/sdrtrunk && ./bin/sdr-trunk\n\n# Configure:\n# 1. Add your RTL-SDR as a tuner\n# 2. Create a new system (P25 Phase 1 or Phase 2)\n# 3. Enter the control channel frequency from RadioReference\n# 4. Add talkgroup aliases (Fire Dispatch, EMS, etc.)\n# 5. Click Play — SDRTrunk follows conversations automatically', language: 'Bash', tip: '<strong>P25 decoding:</strong> SDRTrunk decodes P25 Phase 1 (IMBE voice codec) and Phase 2 (AMBE voice codec) in real time. Some systems are encrypted (AES-256) &mdash; encrypted talkgroups will show as active but audio will be garbled. Unencrypted talkgroups play clear audio.' },
            { title: 'Monitor and Log Activity', content: '<p>Leave the scanner running and log activity to understand emergency response patterns in your area.</p>', code: '# SDRTrunk logs all activity automatically:\n# - Call history with timestamps\n# - Talkgroup usage statistics\n# - Audio recordings (optional)\n\n# For analog scanning without SDRTrunk:\n# Scan a range and stop on active signals:\nrtl_fm -f 154.000M:156.000M:12.5k -M fm -s 12000 -g 40 -l 15 | \\\n  play -r 12000 -t raw -e s -b 16 -c 1 -V1 -\n\n# This scans 154-156 MHz in 12.5 kHz steps\n# Pauses on active signals (squelch level 15)\n# Resumes scanning when the signal drops\n\n# Legal reminders:\n# - Receiving is legal in most US states\n# - Some states restrict scanner use in vehicles\n# - Do not interfere with emergency operations\n# - Do not use intercepted information to commit crimes\n# - Check your state/country laws', language: 'Bash', tip: '<strong>Broadcastify:</strong> If you want to share your scanner feed with others, Broadcastify.com accepts volunteer scanner feeds. Your RTL-SDR becomes a public service &mdash; providing live audio of emergency communications to anyone who wants to listen. Many Broadcastify feeds are run by hobbyists with RTL-SDR dongles.' }
        ],
        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Local frequencies found on RadioReference.com</li>' +
                 '<li>Analog FM reception working on at least one public safety frequency</li>' +
                 '<li>SDRTrunk installed and configured (if trunked system available)</li>' +
                 '<li>P25 voice decoding working (if applicable)</li>' +
                 '<li>Can identify different talkgroups (fire, EMS, police dispatch)</li>' +
                 '<li>Legal requirements reviewed for your jurisdiction</li>' +
                 '</ul>' +
                 '<p>You have a working public safety scanner built from a $25 SDR dongle. You can monitor emergency communications, understand trunked radio architecture, and observe how public safety agencies coordinate responses in real time.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>SDRTrunk does not detect the RTL-SDR:</strong> Close any other SDR applications first. SDRTrunk needs exclusive access to the dongle. Also verify Java is installed: <code>java -version</code>. SDRTrunk requires Java 17 or newer on recent versions.</li>' +
                         '<li><strong>P25 audio is garbled or robotic:</strong> The system may use P25 Phase 2 (TDMA) which requires accurate clock recovery. Ensure your RTL-SDR V4 has the TCXO crystal for better frequency accuracy. Generic dongles without TCXO may have enough frequency drift to corrupt P25 decoding.</li>' +
                         '<li><strong>Talkgroups show activity but no audio plays:</strong> The talkgroup may be encrypted (AES-256 or DES-OFB). SDRTrunk shows encrypted talkgroups as active but cannot decode the audio. Check RadioReference.com &mdash; many agencies now encrypt some or all talkgroups.</li>' +
                         '<li><strong>Control channel not locking:</strong> Verify the control channel frequency from RadioReference.com. Trunked systems may have multiple control channels and rotate between them. Enter all listed control channels in SDRTrunk so it can find the active one.</li>' +
                         '<li><strong>Analog scanner picks up no traffic on listed frequencies:</strong> Many agencies have migrated from analog to P25 digital. Check RadioReference.com for the current mode. If the system is P25, you need SDRTrunk or OP25 &mdash; analog FM decoding will produce only digital noise.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: System Architecture Map</strong> &mdash; Using RadioReference.com data and your own monitoring, create a complete map of the public safety radio system in your county: control channel frequencies, talkgroup assignments, which agencies use which talkgroups, encrypted vs unencrypted, and system type (P25 Phase 1, Phase 2, conventional). Present this as a diagram.</p>' +
                    '<p><strong>Challenge 2: Incident Correlation</strong> &mdash; Monitor public safety radio for one week while simultaneously tracking local news. Correlate scanner traffic (talkgroup activity, dispatch calls) with news reports of incidents. Document the time delay between scanner activity and news reporting. Note information that appears on the scanner but never makes the news.</p>' +
                    '<p><strong>Challenge 3: Broadcastify Feed Setup</strong> &mdash; Set up a Broadcastify feed using your RTL-SDR. Configure a dedicated scanning receiver for one talkgroup or frequency, stream the audio to Broadcastify, and maintain it for at least 48 hours. Document the setup process, bandwidth requirements, and any reliability issues.</p>',

        commonMistakes: [
            {
                title: 'Using Analog FM for Digital Trunked Systems',
                correct: 'Identify the system type on RadioReference.com first. P25 and DMR systems require specialized decoders (SDRTrunk, OP25, DSD+). Analog FM decoding produces only noise on digital systems.',
                incorrect: 'Tuning rtl_fm to a P25 trunked system frequency and expecting to hear voice audio in NFM mode.',
                consequence: 'You hear harsh digital noise instead of voice. P25 uses IMBE or AMBE voice codecs that sound like buzzing or grinding when received as analog FM. The signal is present but the audio is not decodable without a P25 decoder.'
            },
            {
                title: 'Monitoring Only a Single Frequency on a Trunked System',
                correct: 'Use SDRTrunk or OP25 to follow trunked conversations across their frequency pool. Trunked systems dynamically assign frequencies &mdash; a conversation may hop between multiple frequencies.',
                incorrect: 'Tuning to one frequency from the trunked system and listening for a specific talkgroup, expecting the conversation to stay on that frequency.',
                consequence: 'You hear fragments of random conversations. On a trunked system, each transmission may use a different frequency assigned by the control channel. Without following the trunking protocol, you catch only disconnected snippets from many different conversations.'
            },
            {
                title: 'Ignoring Local Scanner Laws',
                correct: 'Check your state and local laws before scanner use. Some US states restrict scanner use in vehicles. Some countries prohibit monitoring of certain frequencies.',
                incorrect: 'Assuming scanner listening is universally legal because it is legal in most US states.',
                consequence: 'Potential legal issues. States like Florida, Indiana, Kentucky, and Minnesota have restrictions on mobile scanner use. New York and other states restrict scanners near crime scenes. International laws vary widely. Always verify local regulations.'
            }
        ]
    }
};