// ============================================================================
// Signal PCB Design — Build Guides (sg-73 through sg-82)
// Custom PCB design projects for cybersecurity students
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-73: KiCad Introduction
    // ========================================================================
    'sg-73': {
        intro: '<p>KiCad is a free, open-source electronics design automation (EDA) suite used by hobbyists, startups, and even CERN. It handles the full PCB design workflow: schematic capture, symbol and footprint management, PCB layout, design rule checking, and manufacturing file export. Unlike Eagle or Altium, KiCad has no board-size limits, no layer restrictions, and no license fees.</p>' +
               '<p>For cybersecurity hardware projects, KiCad is your gateway to building custom implants, hardware security keys, badge readers, RF sniffers, and sensor boards. Every hardware hacking tool you admire &mdash; from the Flipper Zero to the USB Rubber Ducky &mdash; started as a schematic in an EDA tool like this one.</p>' +
               '<p>In this first project, you will install KiCad, create a new project, build a simple schematic with an LED and resistor, assign footprints, and run an electrical rules check. This is the foundation for every PCB project that follows.</p>',

        wiring: '    KiCad EDA Workflow\n' +
                '    \n' +
                '    Schematic Editor          Footprint Assignment       PCB Editor\n' +
                '    +----------------+        +------------------+      +----------------+\n' +
                '    | Place symbols  |------->| Map symbols to   |----->| Place footprints|\n' +
                '    | Wire nets      |        | physical packages|      | Route traces    |\n' +
                '    | Add power flags|        | (e.g. 0805, DIP) |      | Copper zones    |\n' +
                '    +-------+--------+        +------------------+      +-------+--------+\n' +
                '            |                                                   |\n' +
                '    +-------+--------+                                  +-------+--------+\n' +
                '    | ERC (Electrical|                                  | DRC (Design     |\n' +
                '    |  Rules Check)  |                                  |  Rules Check)   |\n' +
                '    +----------------+                                  +-------+--------+\n' +
                '                                                                |\n' +
                '                                                        +-------+--------+\n' +
                '                                                        | Export Gerbers  |\n' +
                '                                                        | Order from fab  |\n' +
                '                                                        +----------------+',

        wiringNotes: '<p><strong>KiCad version:</strong> This guide targets KiCad 8.x (2024+). The interface changed significantly from KiCad 5/6. If you are on an older version, upgrade before starting. Ubuntu/Debian users should use the official PPA for the latest release rather than the distro repository, which is often outdated.</p>' +
                     '<p><strong>Schematic vs. PCB:</strong> These are two separate editors with different jobs. The schematic editor captures <em>logical</em> connections (what connects to what). The PCB editor handles <em>physical</em> layout (where things go on the board, how traces are routed). Changes in one must be synchronized to the other via "Update PCB from Schematic."</p>' +
                     '<p><strong>Libraries:</strong> KiCad ships with extensive symbol and footprint libraries. For common components (resistors, LEDs, capacitors, headers), the built-in libraries are sufficient. For specialized ICs, you may need to download footprints from SnapEDA or Ultra Librarian.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 340" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg73-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="340" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="320" fill="url(#sg73-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-73 KICAD SCHEMATIC &mdash; LED CIRCUIT</text>' +

            '<!-- Power rail VCC -->' +
            '<line x1="100" y1="80" x2="550" y2="80" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="80" y="84" text-anchor="end" fill="#ef4444" font-size="9" font-weight="600">VCC (5V)</text>' +

            '<!-- Resistor R1 -->' +
            '<rect x="180" y="100" width="60" height="24" rx="4" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="210" y="116" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">R1</text>' +
            '<text x="210" y="140" text-anchor="middle" fill="#8b949e" font-size="7">330&#x2126;</text>' +
            '<line x1="210" y1="80" x2="210" y2="100" stroke="#eab308" stroke-width="1"/>' +
            '<circle cx="210" cy="80" r="3" fill="#ef4444"/>' +

            '<!-- Wire from R1 to LED -->' +
            '<line x1="210" y1="124" x2="210" y2="170" stroke="#eab308" stroke-width="1"/>' +

            '<!-- LED D1 -->' +
            '<polygon points="190,170 230,170 210,200" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="190" y1="200" x2="230" y2="200" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="245" y="190" fill="#22c55e" font-size="8" font-weight="600">D1</text>' +
            '<text x="245" y="204" fill="#8b949e" font-size="7">LED Green</text>' +

            '<!-- Wire from LED to GND -->' +
            '<line x1="210" y1="200" x2="210" y2="240" stroke="#22c55e" stroke-width="1"/>' +

            '<!-- GND rail -->' +
            '<line x1="100" y1="240" x2="550" y2="240" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="80" y="244" text-anchor="end" fill="#3b82f6" font-size="9" font-weight="600">GND</text>' +
            '<circle cx="210" cy="240" r="3" fill="#3b82f6"/>' +

            '<!-- KiCad workflow boxes -->' +
            '<rect x="380" y="100" width="140" height="40" rx="6" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
            '<text x="450" y="118" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">1. Place Symbols</text>' +
            '<text x="450" y="132" text-anchor="middle" fill="#8b949e" font-size="6">R1 (Resistor), D1 (LED)</text>' +

            '<rect x="380" y="150" width="140" height="40" rx="6" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="450" y="168" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">2. Wire Nets</text>' +
            '<text x="450" y="182" text-anchor="middle" fill="#8b949e" font-size="6">VCC &rarr; R1 &rarr; D1 &rarr; GND</text>' +

            '<rect x="380" y="200" width="140" height="40" rx="6" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>' +
            '<text x="450" y="218" text-anchor="middle" fill="#3b82f6" font-size="7" font-weight="600">3. Assign Footprints</text>' +
            '<text x="450" y="232" text-anchor="middle" fill="#8b949e" font-size="6">0805, LED_D3.0mm</text>' +

            '<rect x="380" y="250" width="140" height="40" rx="6" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>' +
            '<text x="450" y="268" text-anchor="middle" fill="#a78bfa" font-size="7" font-weight="600">4. Run ERC</text>' +
            '<text x="450" y="282" text-anchor="middle" fill="#8b949e" font-size="6">0 errors, 0 warnings</text>' +

            '<!-- Arrows between steps -->' +
            '<line x1="450" y1="140" x2="450" y2="150" stroke="#555" stroke-width="0.8"/>' +
            '<line x1="450" y1="190" x2="450" y2="200" stroke="#555" stroke-width="0.8"/>' +
            '<line x1="450" y1="240" x2="450" y2="250" stroke="#555" stroke-width="0.8"/>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install KiCad and Create a Project',
                content: '<p>Install KiCad from the official PPA to get the latest stable version. The distro packages on Ubuntu/Debian are often a major version behind. Then create your first project with the proper directory structure.</p>',
                code: '# Install KiCad 8.x on Ubuntu/Debian\nsudo add-apt-repository ppa:kicad/kicad-8.0-releases -y\nsudo apt update\nsudo apt install kicad kicad-libraries -y\n\n# Verify installation\nkicad-cli version\n# Should output: 8.x.x\n\n# On Fedora:\n# sudo dnf install kicad kicad-packages3d\n\n# On macOS:\n# brew install --cask kicad\n\n# Create a project directory\nmkdir -p ~/pcb-projects/sg73-led-circuit\ncd ~/pcb-projects/sg73-led-circuit\n\n# Launch KiCad project manager\nkicad &\n\n# In KiCad Project Manager:\n# File > New Project > navigate to ~/pcb-projects/sg73-led-circuit\n# Name: sg73-led-circuit\n# This creates:\n#   sg73-led-circuit.kicad_pro   (project file)\n#   sg73-led-circuit.kicad_sch   (schematic)\n#   sg73-led-circuit.kicad_pcb   (PCB layout)',
                language: 'Bash',
                tip: '<strong>Project structure:</strong> KiCad creates three core files per project. The <code>.kicad_pro</code> file stores project settings (library paths, DRC rules). The <code>.kicad_sch</code> file is the schematic. The <code>.kicad_pcb</code> file is the board layout. All three are human-readable text files &mdash; you can version-control them with Git.'
            },
            {
                title: 'Place Components in the Schematic Editor',
                content: '<p>Open the Schematic Editor by double-clicking the <code>.kicad_sch</code> file. You will place a resistor symbol, an LED symbol, and power symbols for VCC and GND. Each symbol represents a logical component &mdash; not a physical part yet.</p>',
                code: '# Keyboard shortcuts in KiCad Schematic Editor:\n#\n# A         Place symbol (opens library browser)\n# W         Draw wire\n# P         Place power port (VCC, GND, etc.)\n# M         Move component\n# R         Rotate component\n# E         Edit component properties\n# C         Copy component\n# Delete    Delete selected item\n# Ctrl+Z    Undo\n# Ctrl+S    Save\n\n# Step-by-step in the Schematic Editor:\n#\n# 1. Press A to add a symbol\n#    Search: "R" > select "Device:R" > click to place\n#    This is your 330-ohm resistor (R1)\n#\n# 2. Press A again\n#    Search: "LED" > select "Device:LED" > click to place below R1\n#    Press R to rotate if needed so the anode faces up\n#\n# 3. Press P to place a power port\n#    Search: "VCC" > place above R1\n#    Search: "GND" > place below the LED\n#\n# 4. Press W to draw wires:\n#    - Wire from VCC down to pin 1 of R1\n#    - Wire from pin 2 of R1 down to the anode (triangle) of LED\n#    - Wire from cathode (line) of LED down to GND\n#\n# 5. Double-click R1 to set its value:\n#    Value field: 330\n#\n# 6. Double-click D1 to set its value:\n#    Value field: Green',
                language: 'Bash',
                tip: '<strong>Green dots = connected.</strong> When wires properly connect to component pins, you see a filled green dot at the junction. If you see a small square or no dot, the wire is not connected &mdash; it just passes near the pin. Zoom in and verify every connection has a green junction dot.'
            },
            {
                title: 'Assign Footprints to Components',
                content: '<p>Symbols are abstract &mdash; they represent a resistor or LED but say nothing about physical size or package type. Footprints define the real-world copper pads and silkscreen outlines on the PCB. You must assign a footprint to every symbol before moving to the PCB editor.</p>',
                code: '# Footprint assignment in KiCad:\n#\n# In the Schematic Editor:\n# Tools > Assign Footprints   (or press Ctrl+Shift+F)\n#\n# This opens the Footprint Assignment Tool with three columns:\n#   Left:   Footprint libraries\n#   Center: Your schematic symbols (R1, D1)\n#   Right:  Matching footprints\n#\n# Assign these footprints:\n#\n# R1 (330 ohm resistor):\n#   Library: Resistor_SMD\n#   Footprint: R_0805_2012Metric\n#   (0805 = 2.0mm x 1.25mm, good size for hand soldering)\n#\n# D1 (Green LED):\n#   Library: LED_THT\n#   Footprint: LED_D3.0mm\n#   (Standard 3mm through-hole LED)\n#\n# Alternative through-hole resistor:\n#   Library: Resistor_THT\n#   Footprint: R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal\n#\n# Click "Apply, Save Schematic & Continue"\n# Then close the footprint assignment tool\n\n# Common footprint sizes for reference:\n# 0402 = 1.0mm x 0.5mm  (tiny, needs reflow oven)\n# 0603 = 1.6mm x 0.8mm  (small, tweezers + steady hand)\n# 0805 = 2.0mm x 1.25mm (beginner-friendly SMD)\n# 1206 = 3.2mm x 1.6mm  (easy hand soldering)\n# THT  = through-hole    (easiest, but larger)',
                language: 'Bash',
                tip: '<strong>0805 is the sweet spot</strong> for hand-soldered SMD projects. Large enough to solder with a regular iron and tweezers, small enough to keep your board compact. If this is your first PCB, use 0805 for passives and through-hole for ICs and connectors until you are comfortable with surface mount.'
            },
            {
                title: 'Run Electrical Rules Check (ERC)',
                content: '<p>The Electrical Rules Check scans your schematic for common errors: unconnected pins, missing power flags, conflicting net names, and shorted outputs. Always run ERC before moving to PCB layout. Fixing errors in the schematic is easy; finding them after routing traces is painful.</p>',
                code: '# In the Schematic Editor:\n# Inspect > Electrical Rules Checker\n# Click "Run ERC"\n#\n# Common ERC errors and fixes:\n#\n# ERROR: "Pin unconnected"\n#   A component pin has no wire attached.\n#   Fix: Draw a wire to it, or place a "No Connect" flag (X symbol)\n#   Shortcut: Q to place No Connect flag\n#\n# ERROR: "Power pin not driven"\n#   VCC or 3.3V is used but nothing supplies power.\n#   Fix: Add a PWR_FLAG symbol connected to VCC and another to GND\n#   Press A > search "PWR_FLAG" > place on VCC and GND nets\n#\n# WARNING: "Pin connected to other pins but not driven"\n#   Input pins have no output driving them.\n#   Usually means you need a PWR_FLAG on power nets.\n#\n# Target: 0 errors, 0 warnings\n#\n# Once ERC passes, save your schematic (Ctrl+S)\n\n# You can also run ERC from the command line:\nkicad-cli sch erc ~/pcb-projects/sg73-led-circuit/sg73-led-circuit.kicad_sch\n# Output shows errors/warnings count',
                language: 'Bash',
                tip: '<strong>PWR_FLAG is confusing but necessary.</strong> KiCad requires every power net to be explicitly "driven" by something. In a real circuit, a voltage regulator or battery drives VCC. In a simple schematic without a regulator symbol, KiCad does not know where power comes from. The PWR_FLAG symbol tells KiCad "trust me, this net has power." Place one on VCC and one on GND to clear the warnings.'
            },
            {
                title: 'Export the Netlist and Prepare for PCB Layout',
                content: '<p>The netlist is a text file that describes every component and every connection in your schematic. The PCB editor reads this netlist to know which footprints to place and which pads must be connected by copper traces. In KiCad 8, this synchronization is handled by "Update PCB from Schematic" rather than a manual netlist export.</p>',
                code: '# In the Schematic Editor:\n# Tools > Update PCB from Schematic (F8)\n#\n# This opens a dialog showing:\n#   - New footprints to add (R1, D1)\n#   - Net connections to create\n#   - Any changes since last sync\n#\n# Click "Update PCB" to push changes to the PCB editor\n# The PCB editor opens with your footprints clustered together,\n# connected by thin lines called "ratsnest" (unrouted connections)\n#\n# Alternatively, export a netlist file (older workflow):\n# File > Export > Netlist > KiCad format > Export\n# This creates sg73-led-circuit.net\n\n# You can also generate a Bill of Materials:\n# Tools > Generate Bill of Materials\n# Or from the command line:\nkicad-cli sch export bom \\\n  ~/pcb-projects/sg73-led-circuit/sg73-led-circuit.kicad_sch \\\n  -o ~/pcb-projects/sg73-led-circuit/bom.csv\n\n# View the BOM:\n# cat ~/pcb-projects/sg73-led-circuit/bom.csv\n# Reference, Value, Footprint, Quantity\n# R1, 330, Resistor_SMD:R_0805_2012Metric, 1\n# D1, Green, LED_THT:LED_D3.0mm, 1\n\n# Your schematic is complete. Next project (SG-74) covers\n# the PCB layout: placing footprints, routing traces, and DRC.',
                language: 'Bash',
                tip: '<strong>F8 is your best friend.</strong> Every time you change the schematic, press F8 to push updates to the PCB editor. KiCad tracks what changed and only updates the diff. Never manually edit the PCB to match schematic changes &mdash; always synchronize with F8. This keeps the schematic as the single source of truth.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>KiCad 8.x installed: <code>kicad-cli version</code> returns 8.x.x</li>' +
                 '<li>Project created with three files: <code>.kicad_pro</code>, <code>.kicad_sch</code>, <code>.kicad_pcb</code></li>' +
                 '<li>Schematic contains R1 (330&#x2126;), D1 (LED), VCC, and GND symbols</li>' +
                 '<li>All pins wired: VCC &rarr; R1 pin 1 &rarr; R1 pin 2 &rarr; D1 anode &rarr; D1 cathode &rarr; GND</li>' +
                 '<li>Footprints assigned: R1 = R_0805_2012Metric, D1 = LED_D3.0mm</li>' +
                 '<li>PWR_FLAG placed on VCC and GND nets</li>' +
                 '<li>ERC passes with 0 errors and 0 warnings</li>' +
                 '<li>F8 successfully pushes schematic to PCB editor with both footprints visible</li>' +
                 '</ul>' +
                 '<p>You now have a complete, verified schematic ready for PCB layout. The workflow &mdash; place symbols, wire nets, assign footprints, run ERC, update PCB &mdash; is the same for every project, whether it has 2 components or 200.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>KiCad will not install or launch on Linux:</strong> The distro repository often ships KiCad 5.x or 6.x. Add the official PPA: <code>sudo add-apt-repository ppa:kicad/kicad-8.0-releases &amp;&amp; sudo apt update &amp;&amp; sudo apt install kicad</code>. On Arch, use <code>sudo pacman -S kicad kicad-library</code>. Flatpak and Snap versions exist but can have library path issues &mdash; prefer the PPA.</li>' +
                         '<li><strong>ERC error "Power pin not driven":</strong> You forgot to place <code>PWR_FLAG</code> symbols on your VCC and GND nets. KiCad requires explicit power flags to confirm that power nets are intentionally connected. Place a PWR_FLAG from the Power Symbols library and wire it to each power rail.</li>' +
                         '<li><strong>Footprint assignment dialog is empty:</strong> KiCad libraries are not installed or the library path is misconfigured. Go to Preferences &gt; Manage Footprint Libraries and verify the Global Libraries table points to the correct install path. Re-run the installer with the libraries checkbox selected if needed.</li>' +
                         '<li><strong>"Update PCB from Schematic" produces no footprints:</strong> Footprints were never assigned. Go back to the schematic editor, open the Footprint Assignment Tool (Tools &gt; Assign Footprints), and assign a physical package to every symbol before updating the PCB.</li>' +
                         '<li><strong>Symbol search returns no results:</strong> The search box in the symbol chooser is case-sensitive for library names. Type the component value (e.g., "LED") rather than the library name. Also check that the default KiCad symbol libraries are enabled under Preferences &gt; Manage Symbol Libraries.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Multi-LED Array</strong> &mdash; Expand the schematic to 5 LEDs in parallel, each with its own current-limiting resistor. Practice wiring multiple identical sub-circuits and assigning unique reference designators (D1&ndash;D5, R1&ndash;R5).</p>' +
                    '<p><strong>Challenge 2: Hierarchical Sheet</strong> &mdash; Move the LED sub-circuit into a hierarchical sheet and instantiate it three times. This is how professional schematics manage repeated blocks without cluttering the main sheet.</p>' +
                    '<p><strong>Challenge 3: Custom Symbol</strong> &mdash; Create a custom schematic symbol for a component not in the default library (e.g., a specific sensor IC). Define pins, pin types, and a graphical body in the Symbol Editor, then use it in a new schematic.</p>',

        commonMistakes: [
            {
                title: 'Wiring to Pin Tips Instead of Pin Ends',
                correct: 'Zoom in and snap each wire to the small circle at the end of each pin. Verify the green junction dot appears at every connection point.',
                incorrect: 'Drawing wires that visually touch the symbol body but do not snap to the pin endpoint.',
                consequence: 'No electrical connection is created. The schematic looks correct visually but ERC will report unconnected pins, and the netlist will be missing those connections entirely.'
            },
            {
                title: 'Forgetting PWR_FLAG on Power Nets',
                correct: 'Place one PWR_FLAG symbol on VCC and one on GND to explicitly tell KiCad these nets are intentionally driven.',
                incorrect: 'Omitting PWR_FLAG symbols from power nets, assuming KiCad infers them automatically.',
                consequence: 'ERC reports errors for every component on the VCC and GND nets, flooding the report with false positives and hiding real wiring problems.'
            },
            {
                title: 'Using the Wrong Footprint Package Size',
                correct: 'Use 0805 or larger for passives and DIP/SOIC for ICs when hand-soldering. Reserve 0402 and 0201 for reflow-only production boards.',
                incorrect: 'Assigning an 0402 footprint to a component intended for hand assembly.',
                consequence: 'Hand-soldering 0402 parts is extremely difficult without magnification and fine-tip tools. Components shift, bridge, or tombstone during soldering, leading to rework or scrapped boards.'
            }
        ]
    },

    // ========================================================================
    // SG-74: PCB Layout Fundamentals
    // ========================================================================
    'sg-74': {
        intro: '<p>The schematic says <em>what</em> connects to <em>what</em>. The PCB layout says <em>where</em> everything goes physically. This is where abstract circuits become real objects &mdash; copper traces on fiberglass, pads for soldering, silkscreen labels for assembly. PCB layout is part engineering, part spatial puzzle, and part art.</p>' +
               '<p>In this project, you will take the LED circuit from SG-73, define a board outline, place the footprints, route copper traces between pads, pour a ground plane, and run a Design Rules Check (DRC). The result is a PCB file ready for manufacturing.</p>' +
               '<p>These fundamentals apply to every board you will ever design. Whether it is a two-component LED board or a twelve-layer server motherboard, the process is the same: define the outline, place components, route traces, pour copper fills, verify with DRC, and export for fabrication.</p>',

        wiring: '    PCB Layout Process\n' +
                '    \n' +
                '    +--Board Outline (Edge.Cuts)----+\n' +
                '    |                               |\n' +
                '    |  [R1]----trace----[D1]        |\n' +
                '    |   |                |          |\n' +
                '    |   +---GND plane----+          |\n' +
                '    |                               |\n' +
                '    |  Layer Stack:                  |\n' +
                '    |  - F.Cu (front copper)         |\n' +
                '    |  - F.Silkscreen (labels)       |\n' +
                '    |  - F.Mask (solder mask)        |\n' +
                '    |  - B.Cu (back copper / GND)    |\n' +
                '    |  - B.Mask (solder mask)        |\n' +
                '    |  - Edge.Cuts (board outline)   |\n' +
                '    +-------------------------------+',

        wiringNotes: '<p><strong>2-layer vs 4-layer:</strong> Most hobby projects use 2-layer boards (front copper and back copper). This is the cheapest option from any fab house (~$2 for 5 boards). Use the front layer for signal traces and the back layer as a ground plane for clean return paths and noise reduction.</p>' +
                     '<p><strong>Trace width:</strong> For signal traces carrying under 100mA, 0.25mm (10 mil) width is standard. For power traces, use wider traces: 0.5mm for 500mA, 1.0mm for 1A. KiCad\'s DRC will catch traces that are too narrow for your design rules.</p>' +
                     '<p><strong>Clearance:</strong> The gap between traces, pads, and copper fills. Standard clearance for hobby boards is 0.2mm (8 mil). JLCPCB and PCBWay both support 0.127mm (5 mil) minimum, but wider is more reliable.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 340" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg74-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<pattern id="sg74-copper" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="rgba(34,197,94,0.06)"/><line x1="0" y1="6" x2="6" y2="0" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="340" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="320" fill="url(#sg74-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-74 PCB LAYOUT &mdash; ROUTED BOARD</text>' +

            '<!-- PCB board outline -->' +
            '<rect x="80" y="55" width="280" height="230" rx="6" fill="rgba(34,197,94,0.03)" stroke="#eab308" stroke-width="2"/>' +
            '<text x="220" y="48" text-anchor="middle" fill="#eab308" font-size="7">Edge.Cuts (Board Outline) &mdash; 30mm x 25mm</text>' +

            '<!-- Ground plane fill (back copper) -->' +
            '<rect x="84" y="59" width="272" height="222" rx="4" fill="url(#sg74-copper)"/>' +
            '<text x="220" y="272" text-anchor="middle" fill="rgba(34,197,94,0.3)" font-size="6">B.Cu Ground Plane</text>' +

            '<!-- Resistor R1 footprint -->' +
            '<rect x="140" y="120" width="28" height="14" rx="2" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="136" y="123" width="8" height="8" rx="1" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="0.8"/>' +
            '<rect x="164" y="123" width="8" height="8" rx="1" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="0.8"/>' +
            '<text x="154" y="112" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">R1</text>' +
            '<text x="154" y="148" text-anchor="middle" fill="#8b949e" font-size="6">330&#x2126; 0805</text>' +

            '<!-- LED D1 footprint -->' +
            '<circle cx="280" cy="127" r="10" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="272" y="115" width="4" height="24" rx="1" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.8"/>' +
            '<rect x="284" y="115" width="4" height="24" rx="1" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.8"/>' +
            '<text x="280" y="105" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">D1</text>' +
            '<text x="280" y="148" text-anchor="middle" fill="#8b949e" font-size="6">LED 3mm</text>' +

            '<!-- Trace from R1 to D1 (F.Cu) -->' +
            '<line x1="172" y1="127" x2="272" y2="127" stroke="#ef4444" stroke-width="2.5"/>' +
            '<text x="222" y="122" text-anchor="middle" fill="#ef4444" font-size="5">F.Cu trace (0.25mm)</text>' +

            '<!-- Via from R1 pad 1 to ground plane -->' +
            '<circle cx="140" cy="127" r="4" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<circle cx="140" cy="127" r="1.5" fill="#3b82f6"/>' +
            '<text x="132" y="140" text-anchor="end" fill="#3b82f6" font-size="5">VCC via</text>' +

            '<!-- Layer legend -->' +
            '<rect x="420" y="55" width="260" height="230" rx="8" fill="rgba(234,179,8,0.03)" stroke="rgba(234,179,8,0.1)" stroke-width="0.5"/>' +
            '<text x="550" y="75" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">PCB LAYER STACK</text>' +

            '<rect x="440" y="90" width="20" height="14" rx="2" fill="#ef4444" opacity="0.6"/>' +
            '<text x="470" y="101" fill="#ef4444" font-size="7">F.Cu &mdash; Front Copper (signals)</text>' +

            '<rect x="440" y="112" width="20" height="14" rx="2" fill="#22c55e" opacity="0.6"/>' +
            '<text x="470" y="123" fill="#22c55e" font-size="7">B.Cu &mdash; Back Copper (ground)</text>' +

            '<rect x="440" y="134" width="20" height="14" rx="2" fill="#eab308" opacity="0.6"/>' +
            '<text x="470" y="145" fill="#eab308" font-size="7">Edge.Cuts &mdash; Board Outline</text>' +

            '<rect x="440" y="156" width="20" height="14" rx="2" fill="#a78bfa" opacity="0.6"/>' +
            '<text x="470" y="167" fill="#a78bfa" font-size="7">F.Silkscreen &mdash; Labels</text>' +

            '<rect x="440" y="178" width="20" height="14" rx="2" fill="#38bdf8" opacity="0.6"/>' +
            '<text x="470" y="189" fill="#38bdf8" font-size="7">F.Mask &mdash; Solder Mask</text>' +

            '<!-- DRC status -->' +
            '<rect x="440" y="215" width="220" height="55" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="1"/>' +
            '<text x="550" y="233" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">DRC PASSED</text>' +
            '<text x="550" y="248" text-anchor="middle" fill="#8b949e" font-size="6">0 errors &bull; 0 warnings &bull; 0 unrouted</text>' +
            '<text x="550" y="262" text-anchor="middle" fill="#555" font-size="5">Min clearance: 0.2mm &bull; Min trace: 0.25mm</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Define the Board Outline and Setup',
                content: '<p>Open the PCB editor. Before placing any components, define the physical board dimensions and set your design rules. The board outline lives on the Edge.Cuts layer and defines where the fab house will cut the board from the panel.</p>',
                code: '# In the PCB Editor (opened via F8 from schematic):\n#\n# 1. Set Design Rules:\n#    File > Board Setup > Design Rules > Constraints\n#    Minimum clearance:     0.2 mm\n#    Minimum track width:   0.25 mm\n#    Minimum via diameter:  0.6 mm\n#    Minimum via drill:     0.3 mm\n#    Copper to edge:        0.3 mm\n#\n# 2. Draw the board outline:\n#    Select layer: Edge.Cuts (yellow, in layer dropdown)\n#    Place > Rectangle (or press Shift+Ctrl+R)\n#    Draw a rectangle: 30mm wide x 25mm tall\n#    Or use exact coordinates:\n#      Start: (100, 100)\n#      End:   (130, 125)\n#\n# 3. Alternatively, draw with exact dimensions:\n#    Place > Line on Edge.Cuts layer\n#    Type coordinates in the bottom status bar:\n#    (100,100) > (130,100) > (130,125) > (100,125) > (100,100)\n#\n# 4. Set the grid:\n#    View > Grid Settings (or right-click grid selector)\n#    Grid: 0.5mm for placement, 0.25mm for fine routing\n#\n# Keyboard shortcuts:\n# X     Route single track\n# V     Place via (while routing)\n# D     Drag track\n# U     Select connected track\n# B     Fill all zones (pour copper)\n# N     Toggle ratsnest visibility',
                language: 'Bash',
                tip: '<strong>Board size affects cost.</strong> Most budget fabs (JLCPCB, PCBWay) offer 5 boards for ~$2 when the board is under 100mm x 100mm. Go over that and the price jumps. For simple projects, 30x25mm to 50x50mm is typical. Keep it small and square when possible.'
            },
            {
                title: 'Place Components on the Board',
                content: '<p>After F8 syncs the schematic, your footprints appear clustered outside the board outline, connected by thin white lines (the ratsnest). The ratsnest shows which pads need to be connected &mdash; your job is to place the footprints inside the board outline and then route copper traces along those ratsnest lines.</p>',
                code: '# Component placement strategy:\n#\n# 1. Select a footprint (click on it)\n# 2. Press M to move it\n# 3. Press R to rotate 90 degrees\n# 4. Place it inside the board outline\n#\n# Placement tips:\n# - Keep components that connect to each other close together\n# - R1 and D1 should be near each other (they are in series)\n# - Align components on the grid for clean routing\n# - Leave space around pads for traces to enter/exit\n#\n# Suggested layout for this simple circuit:\n# - R1 on the left side, horizontal orientation\n# - D1 on the right side, 5mm away from R1\n# - Both centered vertically on the board\n#\n# After placement, check the ratsnest:\n# - White lines show unrouted connections\n# - Shorter ratsnest lines = easier routing\n# - If ratsnest lines cross a lot, try flipping placement\n#\n# Lock footprints in place after you are satisfied:\n# Right-click > Properties > Lock\n# This prevents accidental moves during routing',
                language: 'Bash',
                tip: '<strong>Placement is 80% of layout.</strong> Good placement makes routing trivial; bad placement makes it impossible. Professional PCB designers spend most of their time on placement, not routing. For this two-component board, there is only one sensible arrangement, but on complex boards, the placement puzzle is where the real skill lies.'
            },
            {
                title: 'Route Traces Between Pads',
                content: '<p>Routing is drawing copper traces between pads that the ratsnest says must connect. Press X to start routing from any pad. KiCad\'s interactive router will push existing traces out of the way and snap to pads automatically. Route on the front copper layer (F.Cu, shown in red).</p>',
                code: '# Interactive routing:\n#\n# 1. Press X to start routing\n# 2. Click on R1 pad 2 (right pad)\n# 3. Move mouse toward D1 anode pad\n# 4. Click to place corners (45-degree bends)\n# 5. Click on D1 anode pad to complete the trace\n#\n# The trace appears in red (F.Cu layer)\n# Width: 0.25mm (set in the dropdown or press W during routing)\n#\n# Router modes (press / to toggle):\n#   - Highlight collisions: shows DRC violations in real time\n#   - Push and shove: moves existing traces out of the way\n#   - Walk around: routes around obstacles without moving them\n#\n# For the VCC connection:\n# Route from R1 pad 1 to the edge of the board\n# (will connect to VCC via a pad or connector in a real design)\n#\n# For the GND connection:\n# Route from D1 cathode pad to the board edge\n#\n# Set trace width for power vs signal:\n#   Signal: 0.25mm (default)\n#   Power:  0.5mm  (select in width dropdown before routing)\n\n# After routing, check for remaining ratsnest:\n# Inspect > Design Rules Checker > Unrouted Items\n# Should show 0 unrouted connections',
                language: 'Bash',
                tip: '<strong>45-degree bends, never 90.</strong> Route traces with 45-degree angles, not right angles. Right-angle traces create acid traps during manufacturing (etchant pools in the corner) and cause impedance discontinuities at high frequencies. KiCad defaults to 45-degree routing. If you see a right angle, you are doing it wrong.'
            },
            {
                title: 'Pour a Ground Plane',
                content: '<p>A ground plane is a large copper fill connected to GND that covers an entire layer. It provides a low-impedance return path for signals, reduces electromagnetic interference, and acts as a heat sink. On a 2-layer board, the back copper (B.Cu) is typically a ground plane.</p>',
                code: '# Create a ground plane on B.Cu:\n#\n# 1. Select layer: B.Cu (back copper, shown in blue)\n# 2. Place > Add Filled Zone (or press Ctrl+Shift+Z)\n# 3. In the dialog:\n#    - Net: GND\n#    - Layer: B.Cu\n#    - Clearance: 0.3mm\n#    - Min width: 0.2mm\n# 4. Click OK\n# 5. Draw the zone outline around the entire board:\n#    Click the four corners of the board, then double-click to close\n# 6. Press B to fill all zones\n#\n# The entire back layer fills with copper connected to GND\n# KiCad automatically cuts clearance gaps around non-GND pads\n#\n# You can also add a ground plane on F.Cu:\n# Same process but select F.Cu layer\n# This creates a 2-layer ground plane (common for RF and sensitive circuits)\n#\n# Zone properties you may need to adjust:\n# - Thermal relief: connects pads to the plane with thin spokes\n#   (makes hand soldering easier by not wicking heat into the plane)\n# - Solid connection: connects pads directly to the plane\n#   (better electrically but harder to solder by hand)\n#\n# Refill zones after any changes:\n# Press B (or Edit > Fill All Zones)',
                language: 'Bash',
                tip: '<strong>Always pour a ground plane.</strong> Even on the simplest board, a ground plane dramatically improves signal integrity and noise performance. Without one, return currents flow through whatever random path they can find, creating antennas. With a ground plane, return currents flow directly under the signal trace &mdash; minimal loop area, minimal noise.'
            },
            {
                title: 'Run Design Rules Check (DRC)',
                content: '<p>DRC is the PCB equivalent of a compiler. It checks every trace, pad, via, and copper zone against your design rules. No clearance violations, no unrouted nets, no traces too close to the board edge. If DRC passes, the fab house can manufacture your board. If it fails, fix the violations before exporting.</p>',
                code: '# Run DRC in the PCB Editor:\n# Inspect > Design Rules Checker\n# Click "Run DRC"\n#\n# DRC checks:\n# - Clearance: no copper closer than 0.2mm to other copper\n# - Track width: no trace narrower than 0.25mm\n# - Via size: no via smaller than 0.6mm\n# - Copper to edge: no copper within 0.3mm of Edge.Cuts\n# - Unrouted items: all ratsnest connections have traces\n# - Drill size: all drills within fab capability\n# - Silkscreen over pads: labels not covering solder pads\n#\n# Common DRC errors:\n#\n# "Clearance violation" (trace too close to pad/trace)\n#   Fix: Move the trace or increase the gap\n#   Select trace > press D to drag\n#\n# "Unrouted items" (missing connections)\n#   Fix: Route the remaining ratsnest lines\n#\n# "Track width too small"\n#   Fix: Select trace > Edit > change width to 0.25mm+\n#\n# Target: 0 errors, 0 warnings, 0 unrouted\n# Save: Ctrl+S\n\n# Command-line DRC:\nkicad-cli pcb drc \\\n  ~/pcb-projects/sg73-led-circuit/sg73-led-circuit.kicad_pcb \\\n  -o ~/pcb-projects/sg73-led-circuit/drc-report.json \\\n  --format json',
                language: 'Bash',
                tip: '<strong>DRC is not optional.</strong> Submitting a board with DRC violations to a fab house is like compiling code with errors and deploying anyway. Sometimes the fab will catch it and reject your order. Sometimes they will manufacture it with the defect and you get boards that do not work. Always run DRC. Always fix every error. Warnings are worth investigating too.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Board outline drawn on Edge.Cuts layer with correct dimensions (30mm x 25mm)</li>' +
                 '<li>Design rules configured: 0.2mm clearance, 0.25mm min track, 0.6mm min via</li>' +
                 '<li>R1 and D1 footprints placed inside the board outline on F.Cu</li>' +
                 '<li>All ratsnest lines routed with copper traces on F.Cu</li>' +
                 '<li>Traces use 45-degree bends (no right angles)</li>' +
                 '<li>Ground plane poured on B.Cu connected to GND net</li>' +
                 '<li>Zones filled (press B) with correct clearance gaps around non-GND pads</li>' +
                 '<li>DRC passes: 0 errors, 0 warnings, 0 unrouted items</li>' +
                 '<li>3D viewer (View > 3D Viewer) shows the board with correct component placement</li>' +
                 '</ul>' +
                 '<p>Your PCB layout is complete and manufacturing-ready. The next step (SG-75) covers exporting Gerber files and ordering the physical boards from a fabrication house.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Ratsnest lines remain after routing:</strong> You have unrouted connections. Press <code>X</code> to start interactive routing and click each ratsnest line endpoint to complete the trace. If the ratsnest line persists after routing, the trace may be on the wrong layer or not actually connecting to the pad &mdash; zoom in and verify the trace terminates inside the pad.</li>' +
                         '<li><strong>DRC reports "Clearance violation":</strong> Two copper features (traces, pads, or zones) are closer than your minimum clearance rule. Select the offending trace, press <code>D</code> to drag it, and move it away from the neighboring copper. If the board is too tight, consider making the board slightly larger or moving components apart.</li>' +
                         '<li><strong>Ground zone does not fill:</strong> Press <code>B</code> to fill all zones. If the zone still appears empty, check that the zone net is set to GND (double-click the zone outline to edit properties). Also verify the zone priority is correct if you have overlapping zones.</li>' +
                         '<li><strong>3D viewer shows components floating above the board:</strong> The footprint 3D model offset is wrong. Edit the footprint, go to the 3D Models tab, and adjust the Z offset. This is cosmetic and does not affect manufacturing, but it indicates the footprint may need updating from the KiCad library.</li>' +
                         '<li><strong>Traces snap to wrong grid:</strong> Change the grid size with the dropdown in the toolbar. For trace routing, 0.25mm or 0.5mm grids work well. A grid that is too coarse prevents precise pad connections; too fine makes alignment tedious.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Four-Layer Board</strong> &mdash; Add two inner layers (In1.Cu, In2.Cu) and route power on the inner layers while keeping signals on F.Cu and B.Cu. This is the standard 4-layer stack-up used in professional designs.</p>' +
                    '<p><strong>Challenge 2: Curved Traces</strong> &mdash; Route traces using the curved routing mode (press <code>/</code> during routing to cycle modes). Practice creating smooth, organic trace paths that reduce signal reflections at high frequencies.</p>',

        commonMistakes: [
            {
                title: 'Right-Angle Trace Bends',
                correct: 'Use 45-degree bends or curved traces for all routing. Keep KiCad in its default 45-degree routing mode.',
                incorrect: 'Routing traces with 90-degree (right-angle) bends or overriding KiCad to "free angle" mode without reason.',
                consequence: 'Right-angle bends create acid traps during etching that can thin or break traces, and introduce impedance discontinuities that degrade signal integrity at higher frequencies.'
            },
            {
                title: 'Traces Under Components',
                correct: 'Route traces around component bodies when possible. If routing under a component is unavoidable, use the opposite copper layer with adequate clearance from through-hole pads.',
                incorrect: 'Routing signal traces directly under component bodies on the same layer.',
                consequence: 'Traces hidden under components make debugging and rework extremely difficult. Probing the trace requires desoldering the component, and rework heat can damage adjacent connections.'
            },
            {
                title: 'Forgetting to Fill Zones Before DRC',
                correct: 'Always press B to fill all zones before running DRC. Make zone filling a mandatory step in your pre-DRC checklist.',
                incorrect: 'Running DRC with unfilled zone outlines, assuming KiCad will automatically compute zone fills.',
                consequence: 'DRC reports false missing-connection errors for every net that should be connected through the zone. The real DRC issues get buried under dozens of spurious warnings.'
            }
        ]
    },

    // ========================================================================
    // SG-75: Order Your First PCB
    // ========================================================================
    'sg-75': {
        intro: '<p>You have a completed PCB layout that passes DRC. Now it is time to turn that digital design into physical circuit boards. The manufacturing files are called Gerbers &mdash; a set of files that describe each layer of your board (copper, silkscreen, solder mask, drill locations). You upload these to a fabrication house, and a few days later, real PCBs arrive in the mail.</p>' +
               '<p>The PCB fabrication industry has been revolutionized by Chinese manufacturers like JLCPCB and PCBWay who offer 5 boards for as little as $2 with 3-5 day turnaround. This makes iteration fast and cheap &mdash; you can afford to prototype, make mistakes, and refine. The most expensive part is often the shipping, not the boards.</p>' +
               '<p>In this project, you will export Gerber files from KiCad, inspect them with a Gerber viewer, upload to a fab house, configure order settings, and place your first order. By the end, you will have physical PCBs on the way.</p>',

        wiring: '    Gerber Export Pipeline\n' +
                '    \n' +
                '    KiCad PCB Editor\n' +
                '    +-------------------+\n' +
                '    | File > Fabrication|      Gerber Files (.gbr)\n' +
                '    | Outputs > Gerbers |----->  F.Cu.gbr        (front copper)\n' +
                '    |                   |----->  B.Cu.gbr        (back copper)\n' +
                '    | File > Fabrication|----->  F.Silkscreen.gbr (front labels)\n' +
                '    | Outputs > Drill   |----->  F.Mask.gbr      (front solder mask)\n' +
                '    |                   |----->  B.Mask.gbr      (back solder mask)\n' +
                '    +-------------------+----->  Edge.Cuts.gbr   (board outline)\n' +
                '                         ----->  drill.drl       (drill file)\n' +
                '                         \n' +
                '                         ZIP all files\n' +
                '                              |\n' +
                '                              v\n' +
                '                    Upload to JLCPCB / PCBWay\n' +
                '                    Configure: layers, color, finish\n' +
                '                    Order: ~$2 for 5 boards + shipping',

        wiringNotes: '<p><strong>Gerber format:</strong> Gerbers are the industry-standard file format for PCB manufacturing, used since the 1960s. Each file describes one layer as a set of draw commands (lines, arcs, flashes for pads). The fab house\'s CAM software reads these files to generate the photomasks, etch patterns, and drill programs for your board.</p>' +
                     '<p><strong>Which fab house:</strong> JLCPCB (jlcpcb.com) is the most popular for hobbyists &mdash; cheapest prices, fast turnaround, good quality. PCBWay (pcbway.com) is slightly more expensive but has better customer support and more options (flex PCB, aluminum substrate, heavy copper). OSH Park (oshpark.com) is US-based with distinctive purple boards and higher prices.</p>' +
                     '<p><strong>Lead time:</strong> JLCPCB standard is 3-5 business days for fabrication plus shipping (5-20 days depending on method). DHL express shipping adds ~$15 but arrives in 3-5 days. Total time from order to mailbox: 1-3 weeks.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 340" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg75-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="340" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="320" fill="url(#sg75-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-75 GERBER EXPORT &amp; ORDER FLOW</text>' +

            '<!-- KiCad box -->' +
            '<rect x="30" y="55" width="160" height="110" rx="8" fill="#1e2736" stroke="#a78bfa" stroke-width="1.5"/>' +
            '<text x="110" y="75" text-anchor="middle" fill="#a78bfa" font-size="9" font-weight="700">KiCad PCB</text>' +
            '<text x="110" y="95" text-anchor="middle" fill="#8b949e" font-size="6">Export Gerbers</text>' +
            '<text x="110" y="110" text-anchor="middle" fill="#8b949e" font-size="6">Export Drills</text>' +
            '<text x="110" y="125" text-anchor="middle" fill="#8b949e" font-size="6">ZIP archive</text>' +
            '<rect x="60" y="135" width="100" height="18" rx="3" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.3)" stroke-width="0.5"/>' +
            '<text x="110" y="148" text-anchor="middle" fill="#a78bfa" font-size="7">gerbers.zip</text>' +

            '<!-- Arrow to Gerber viewer -->' +
            '<line x1="190" y1="110" x2="240" y2="110" stroke="#555" stroke-width="1.5" marker-end="url(#sg75-arrow)"/>' +
            '<defs><marker id="sg75-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#555"/></marker></defs>' +

            '<!-- Gerber viewer box -->' +
            '<rect x="245" y="55" width="160" height="110" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="325" y="75" text-anchor="middle" fill="#eab308" font-size="9" font-weight="700">Gerber Viewer</text>' +
            '<text x="325" y="95" text-anchor="middle" fill="#8b949e" font-size="6">Verify layers</text>' +
            '<text x="325" y="110" text-anchor="middle" fill="#8b949e" font-size="6">Check drill holes</text>' +
            '<text x="325" y="125" text-anchor="middle" fill="#8b949e" font-size="6">Confirm outline</text>' +
            '<rect x="270" y="135" width="110" height="18" rx="3" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="325" y="148" text-anchor="middle" fill="#eab308" font-size="7">Looks correct</text>' +

            '<!-- Arrow to fab house -->' +
            '<line x1="405" y1="110" x2="455" y2="110" stroke="#555" stroke-width="1.5" marker-end="url(#sg75-arrow)"/>' +

            '<!-- Fab house box -->' +
            '<rect x="460" y="55" width="220" height="110" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="570" y="75" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="700">JLCPCB / PCBWay</text>' +
            '<text x="570" y="95" text-anchor="middle" fill="#8b949e" font-size="6">Upload ZIP &bull; Auto-detect layers</text>' +
            '<text x="570" y="110" text-anchor="middle" fill="#8b949e" font-size="6">2 layers &bull; 1.6mm &bull; Green mask</text>' +
            '<text x="570" y="125" text-anchor="middle" fill="#8b949e" font-size="6">HASL finish &bull; Qty: 5</text>' +
            '<rect x="500" y="135" width="140" height="18" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="570" y="148" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">$2.00 + shipping</text>' +

            '<!-- Gerber file list -->' +
            '<rect x="30" y="190" width="650" height="120" rx="8" fill="rgba(167,139,250,0.03)" stroke="rgba(167,139,250,0.1)" stroke-width="0.5"/>' +
            '<text x="355" y="210" text-anchor="middle" fill="#a78bfa" font-size="8" font-weight="600">GERBER FILES IN ZIP</text>' +

            '<text x="100" y="230" text-anchor="middle" fill="#ef4444" font-size="6">F.Cu.gbr</text>' +
            '<rect x="60" y="233" width="80" height="10" rx="2" fill="rgba(239,68,68,0.15)"/>' +
            '<text x="100" y="241" text-anchor="middle" fill="#ef4444" font-size="5">Front copper</text>' +

            '<text x="225" y="230" text-anchor="middle" fill="#22c55e" font-size="6">B.Cu.gbr</text>' +
            '<rect x="185" y="233" width="80" height="10" rx="2" fill="rgba(34,197,94,0.15)"/>' +
            '<text x="225" y="241" text-anchor="middle" fill="#22c55e" font-size="5">Back copper</text>' +

            '<text x="350" y="230" text-anchor="middle" fill="#a78bfa" font-size="6">F.Silkscreen.gbr</text>' +
            '<rect x="300" y="233" width="100" height="10" rx="2" fill="rgba(167,139,250,0.15)"/>' +
            '<text x="350" y="241" text-anchor="middle" fill="#a78bfa" font-size="5">Front labels</text>' +

            '<text x="475" y="230" text-anchor="middle" fill="#eab308" font-size="6">Edge.Cuts.gbr</text>' +
            '<rect x="430" y="233" width="90" height="10" rx="2" fill="rgba(234,179,8,0.15)"/>' +
            '<text x="475" y="241" text-anchor="middle" fill="#eab308" font-size="5">Board outline</text>' +

            '<text x="600" y="230" text-anchor="middle" fill="#38bdf8" font-size="6">drill.drl</text>' +
            '<rect x="560" y="233" width="80" height="10" rx="2" fill="rgba(56,189,248,0.15)"/>' +
            '<text x="600" y="241" text-anchor="middle" fill="#38bdf8" font-size="5">Drill locations</text>' +

            '<text x="100" y="275" text-anchor="middle" fill="#38bdf8" font-size="6">F.Mask.gbr</text>' +
            '<rect x="60" y="278" width="80" height="10" rx="2" fill="rgba(56,189,248,0.15)"/>' +
            '<text x="100" y="286" text-anchor="middle" fill="#38bdf8" font-size="5">Front solder mask</text>' +

            '<text x="225" y="275" text-anchor="middle" fill="#38bdf8" font-size="6">B.Mask.gbr</text>' +
            '<rect x="185" y="278" width="80" height="10" rx="2" fill="rgba(56,189,248,0.15)"/>' +
            '<text x="225" y="286" text-anchor="middle" fill="#38bdf8" font-size="5">Back solder mask</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Export Gerber Files from KiCad',
                content: '<p>Gerber export produces one file per layer. You need at minimum: front copper, back copper, front silkscreen, front and back solder masks, and the board outline. KiCad also exports a separate drill file for through-hole and via locations.</p>',
                code: '# In the PCB Editor:\n# File > Fabrication Outputs > Gerbers (.gbr)\n#\n# Settings:\n#   Output directory: ./gerbers/\n#   Layers to export (check all of these):\n#     [x] F.Cu          (front copper)\n#     [x] B.Cu          (back copper)\n#     [x] F.Silkscreen  (front component labels)\n#     [x] B.Silkscreen  (back labels, if any)\n#     [x] F.Mask        (front solder mask)\n#     [x] B.Mask        (back solder mask)\n#     [x] Edge.Cuts     (board outline)\n#     [x] F.Paste       (stencil for SMD solder paste)\n#\n#   General options:\n#     [x] Use Protel filename extensions\n#     [x] Generate Gerber job file\n#     Coordinate format: 4.6 (unit mm)\n#     Subtract soldermask from silkscreen: yes\n#\n# Click "Plot" to generate the Gerber files\n#\n# Then export drill files:\n# File > Fabrication Outputs > Drill Files (.drl)\n#   Output directory: ./gerbers/\n#   Drill file format: Excellon\n#   Drill units: mm\n#   Zeros format: Decimal format\n#   Map file format: PostScript\n# Click "Generate Drill File"\n\n# Or from the command line:\nmkdir -p ~/pcb-projects/sg73-led-circuit/gerbers\nkicad-cli pcb export gerbers \\\n  ~/pcb-projects/sg73-led-circuit/sg73-led-circuit.kicad_pcb \\\n  -o ~/pcb-projects/sg73-led-circuit/gerbers/ \\\n  -l F.Cu,B.Cu,F.Silkscreen,B.Silkscreen,F.Mask,B.Mask,Edge.Cuts,F.Paste\n\nkicad-cli pcb export drill \\\n  ~/pcb-projects/sg73-led-circuit/sg73-led-circuit.kicad_pcb \\\n  -o ~/pcb-projects/sg73-led-circuit/gerbers/ \\\n  --format excellon --excellon-units mm',
                language: 'Bash',
                tip: '<strong>Use Protel filename extensions.</strong> This option renames files from KiCad\'s default naming to the Protel/Altium convention that every fab house recognizes automatically. Without it, you may need to manually map layers during upload. With it, JLCPCB and PCBWay auto-detect every layer correctly.'
            },
            {
                title: 'Inspect Gerbers Before Ordering',
                content: '<p>Never order boards without visually inspecting the Gerber files. Open them in a Gerber viewer and verify every layer looks correct. Check that traces are where you expect, pads align with drill holes, silkscreen text is readable, and the board outline is correct.</p>',
                code: '# KiCad has a built-in Gerber viewer:\n# In KiCad project manager: Tools > Gerber Viewer\n# Or launch directly:\ngerbview &\n\n# Load all Gerber files:\n# File > Open Gerber file(s) > select all .gbr files\n# File > Open Excellon Drill file > select .drl file\n#\n# Inspection checklist:\n# 1. Toggle each layer on/off to see it individually\n# 2. F.Cu: traces connect correct pads, correct widths\n# 3. B.Cu: ground plane fills correctly, no missing areas\n# 4. F.Mask: openings over every pad (green = mask, gap = exposed copper)\n# 5. Silkscreen: text readable, not overlapping pads\n# 6. Edge.Cuts: board outline is correct shape and size\n# 7. Drill: holes align with through-hole pads and vias\n# 8. All layers aligned (pads on F.Cu match pads on B.Cu)\n\n# Online Gerber viewers (no install needed):\n# - https://www.pcbway.com/project/OnlineGerberViewer.html\n# - https://gerber-viewer.ucamco.com/\n# - JLCPCB auto-previews when you upload\n\n# Zip the gerbers for upload:\ncd ~/pcb-projects/sg73-led-circuit/gerbers\nzip ../sg73-gerbers.zip *.gbr *.drl\nls -la ../sg73-gerbers.zip',
                language: 'Bash',
                tip: '<strong>Check the drill file alignment.</strong> The most common manufacturing defect in hobbyist boards is misaligned drill holes. In the Gerber viewer, overlay the drill file on top of F.Cu. Every through-hole pad should have a drill hole centered perfectly in the pad. If drills are offset, your coordinate origin or units setting is wrong &mdash; re-export with matching settings.'
            },
            {
                title: 'Upload to JLCPCB and Configure Order',
                content: '<p>JLCPCB is the most popular fab house for hobbyist PCBs. Upload your Gerber ZIP, configure the board specifications, and place the order. The auto-detection usually gets everything right, but verify each setting.</p>',
                code: '# 1. Go to https://cart.jlcpcb.com/quote\n# 2. Click "Add Gerber file" and upload your ZIP\n# 3. JLCPCB auto-detects:\n#    - Board dimensions (30mm x 25mm)\n#    - Number of layers (2)\n#    - Drill holes\n#\n# 4. Configure these settings:\n#    Base Material:       FR-4 (standard fiberglass)\n#    Layers:              2\n#    Dimensions:          auto-detected\n#    PCB Qty:             5   (minimum order)\n#    PCB Thickness:       1.6mm (standard)\n#    PCB Color:           Green (cheapest, fastest)\n#    Surface Finish:      HASL (lead-free)\n#    Copper Weight:       1 oz (standard)\n#    Remove Order Number: Yes ($1 extra, cleaner board)\n#\n# 5. Price breakdown (typical):\n#    PCB fabrication:     $2.00\n#    Remove order number: $1.00 (optional)\n#    Shipping (economy):  $3-5\n#    Shipping (DHL):      $15-20\n#    Total:               $5-25 depending on shipping\n#\n# 6. Click "Save to Cart" > "Checkout"\n# 7. Select shipping method and pay\n#\n# Turnaround times:\n#    Fabrication: 1-3 days (standard), 24 hours (rush +$)\n#    Economy shipping: 10-20 days\n#    DHL express: 3-5 days',
                language: 'Bash',
                tip: '<strong>Green is cheapest and fastest.</strong> JLCPCB keeps green solder mask in stock at all times, so green boards have the fastest turnaround. Other colors (black, white, blue, red, yellow, purple) cost the same but may add 1-2 days to fabrication. For prototypes where speed matters, choose green. Save the fancy colors for final production runs.'
            },
            {
                title: 'Alternative: PCBWay and OSH Park',
                content: '<p>JLCPCB is not the only option. PCBWay offers similar pricing with more advanced options. OSH Park is US-based with a distinctive purple solder mask and no minimum order quantity (you pay per square inch). Knowing multiple fabs gives you flexibility.</p>',
                code: '# PCBWay (https://www.pcbway.com):\n# Upload: "Instant Quote" > upload Gerber ZIP\n# Pricing: 5 boards from $5 + shipping\n# Advantages:\n#   - Better customer support (email + live chat)\n#   - More finish options (ENIG gold, immersion silver)\n#   - Flex PCB, aluminum substrate, heavy copper\n#   - Assembly service (they solder components for you)\n# Turnaround: 3-5 days fab + shipping\n\n# OSH Park (https://oshpark.com):\n# Upload: drag and drop .kicad_pcb file directly (no Gerber needed)\n# Pricing: $5/sq inch for 3 boards (minimum)\n# Advantages:\n#   - Accepts KiCad files directly\n#   - US-based (no customs, faster for US customers)\n#   - Purple solder mask + gold ENIG finish (looks premium)\n#   - No minimum order quantity\n# Disadvantages:\n#   - More expensive per board\n#   - Slower (5-12 business days for super swift)\n#   - Fewer customization options\n\n# Price comparison for our 30mm x 25mm board:\n# JLCPCB:   5 boards for $2 + $5 shipping  = ~$7\n# PCBWay:   5 boards for $5 + $5 shipping  = ~$10\n# OSH Park: 3 boards for ~$3.50 (free ship) = ~$3.50\n\n# For prototyping: JLCPCB (cheapest, fastest)\n# For quality/support: PCBWay\n# For US-based/small runs: OSH Park',
                language: 'Bash',
                tip: '<strong>OSH Park accepts .kicad_pcb files directly.</strong> No need to export Gerbers. Just upload the KiCad PCB file and OSH Park renders the board and shows you a preview. This is the easiest path from design to order, but you pay a premium for the convenience and US-based manufacturing.'
            },
            {
                title: 'Verify Your Order and Track Delivery',
                content: '<p>After placing your order, the fab house runs their own checks and begins manufacturing. Track the process from your account dashboard. When the boards arrive, inspect them against your design.</p>',
                code: '# After ordering, monitor fabrication status:\n# JLCPCB: My Orders > order number > Track\n#\n# Fabrication stages:\n# 1. Order review      (1-2 hours)\n# 2. Panel production  (fabrication starts)\n# 3. Drilling          (holes and vias)\n# 4. Plating           (copper on hole walls)\n# 5. Outer layer       (traces and pads)\n# 6. Solder mask       (green coating)\n# 7. Silkscreen        (white text/labels)\n# 8. Surface finish    (HASL or ENIG)\n# 9. Electrical test   (continuity check)\n# 10. Quality control  (visual inspection)\n# 11. Packaging        (vacuum sealed)\n# 12. Shipped          (tracking number provided)\n\n# When boards arrive, inspect:\n# - Board dimensions match your design\n# - All traces are present and correct\n# - Silkscreen text is readable\n# - Drill holes are centered in pads\n# - No copper bridges between traces\n# - Solder mask covers all non-pad areas\n# - No scratches or delamination\n# - Use a multimeter to check continuity:\n#   Traces that should connect: 0 ohms\n#   Traces that should not connect: OL (open)\n\n# If there is a manufacturing defect:\n# JLCPCB: submit a ticket with photos\n# They will typically reship for free',
                language: 'Bash',
                tip: '<strong>Continuity test every first board.</strong> Even with fab house quality control, occasionally a trace is broken or a bridge shorts two nets. Before soldering components, use a multimeter in continuity mode. Touch the probes to pads that should be connected and verify you get a beep (0 ohms). Check adjacent traces for shorts. This takes 2 minutes and saves hours of debugging a board that was defective from the factory.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Gerber files exported: F.Cu, B.Cu, F.Silkscreen, F.Mask, B.Mask, Edge.Cuts, F.Paste</li>' +
                 '<li>Drill file exported in Excellon format with mm units</li>' +
                 '<li>All Gerber files inspected in viewer: layers align, traces correct, drills centered</li>' +
                 '<li>Gerbers zipped into a single archive for upload</li>' +
                 '<li>Fab house auto-detects board dimensions and layer count correctly</li>' +
                 '<li>Order configured: 2-layer, 1.6mm, FR-4, green mask, HASL finish</li>' +
                 '<li>Order placed and tracking number received</li>' +
                 '<li>Boards received, visually inspected, and continuity tested</li>' +
                 '</ul>' +
                 '<p>You have taken a digital design from KiCad to a physical PCB in your hands. This workflow &mdash; design, export, verify, order, inspect &mdash; is the same whether you are making a simple LED board or a complex microcontroller system. The next projects use this exact pipeline to build increasingly sophisticated boards.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Gerber export produces empty files:</strong> Make sure you selected the correct layers in the export dialog. At minimum: F.Cu, B.Cu, F.Silkscreen, F.Mask, B.Mask, Edge.Cuts, and F.Paste. If a layer has no content it will export as an empty file &mdash; this is normal for unused layers but suspicious for copper layers that should have traces.</li>' +
                         '<li><strong>Fab house rejects the order with "board outline not detected":</strong> The Edge.Cuts layer must form a completely closed polygon. Open the Gerber in a viewer and verify the outline is a continuous, closed shape with no gaps at corners. Even a 0.01mm gap will cause detection failure.</li>' +
                         '<li><strong>Drill file has wrong units:</strong> JLCPCB expects Excellon drill files in millimeters. In KiCad, verify the drill export settings specify "Millimeters" as the unit. Inch-based drill files will place all holes in the wrong positions.</li>' +
                         '<li><strong>Boards arrive with reversed silkscreen:</strong> You may have placed silkscreen text on B.Silkscreen instead of F.Silkscreen, or mirrored the board outline. Always verify layer assignments in the Gerber viewer before ordering &mdash; the viewer shows exactly what the fab house will manufacture.</li>' +
                         '<li><strong>JLCPCB preview shows different colors than expected:</strong> The online preview auto-renders with default colors. Your actual solder mask color depends on your order settings. Verify the mask color in the order form, not the auto-preview.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Panel Multiple Boards</strong> &mdash; Use KiCad\'s panelization features or the <a href="https://github.com/yaqwsx/KiKit" style="color:#ff6b35">KiKit</a> plugin to arrange multiple copies of your board in a single panel with V-score or mouse-bite tabs. This reduces per-board cost at the fab house.</p>' +
                    '<p><strong>Challenge 2: Compare Fab Houses</strong> &mdash; Order the same design from JLCPCB, PCBWay, and OSH Park. Compare price, turnaround time, board quality, silkscreen clarity, and drill accuracy. Document your findings for future reference.</p>',

        commonMistakes: [
            {
                title: 'Zipping the Wrong Files',
                correct: 'Create a dedicated output folder for Gerber export and zip only the .gbr and .drl manufacturing files.',
                incorrect: 'Including the KiCad project file, 3D models, or other non-manufacturing files in the Gerber zip.',
                consequence: 'The fab house automated upload parser may fail or misinterpret the extra files, causing order rejection or incorrect board fabrication.'
            },
            {
                title: 'Not Inspecting Gerbers Before Ordering',
                correct: 'View exported Gerbers in a standalone viewer (gerbv, KiCad Gerber Viewer, or the fab house online viewer) before placing an order. Five minutes of inspection prevents costly mistakes.',
                incorrect: 'Ordering boards directly after export without verifying the Gerber files visually.',
                consequence: 'The export process can produce artifacts not visible in the PCB editor. You wait a week for boards to arrive only to discover missing traces, incorrect drill holes, or corrupted layers.'
            },
            {
                title: 'Choosing ENIG Finish for a Learning Board',
                correct: 'Select HASL (tin-lead) surface finish for practice and learning boards. Reserve ENIG for boards with fine-pitch components or BGA pads that require flat surfaces.',
                incorrect: 'Choosing ENIG (gold) surface finish on prototype or learning boards where it provides no benefit.',
                consequence: 'ENIG costs 3-5x more than HASL with no functional advantage for standard through-hole or 0805+ SMD work. The extra cost adds up quickly across multiple prototype iterations.'
            }
        ]
    },

    // ========================================================================
    // SG-76: Arduino Shield Design
    // ========================================================================
    'sg-76': {
        intro: '<p>An Arduino shield is a custom PCB that plugs directly onto an Arduino Uno using its standard header layout. The shield format is one of the most practical entry points into PCB design because the mechanical constraints are well-defined (header positions, board outline), the electrical interface is simple (5V logic, digital and analog pins), and you can test your design immediately by stacking it on a real Arduino.</p>' +
               '<p>In this project, you will design a shield with three LEDs, two push buttons, and a potentiometer &mdash; a simple I/O expansion board that demonstrates every key PCB design concept: multi-pin connectors, pull-up/pull-down resistors, decoupling capacitors, and mixed through-hole/SMD design.</p>' +
               '<p>Shields are also a gateway to commercial products. The entire Arduino ecosystem &mdash; motor drivers, Ethernet adapters, GPS modules, relay boards &mdash; started as custom shield PCBs designed in exactly this way. Once you can design one shield, you can design any shield.</p>',

        wiring: '    Arduino Uno Shield Pinout\n' +
                '    \n' +
                '    +--Shield PCB (sits on top of Arduino)--+\n' +
                '    |                                       |\n' +
                '    |  [LED1]--R1--D13     D12--R4--[BTN1]  |\n' +
                '    |  [LED2]--R2--D11     D10--R5--[BTN2]  |\n' +
                '    |  [LED3]--R3--D9                       |\n' +
                '    |                      A0--[POT]        |\n' +
                '    |                                       |\n' +
                '    |  Header J1 (D8-D13)  Header J2 (D0-D7)|\n' +
                '    |  Header J3 (Power)   Header J4 (A0-A5)|\n' +
                '    +---------------------------------------+\n' +
                '                    |\n' +
                '          Arduino Uno (below)\n' +
                '          +---[USB]---[DC Jack]---+',

        wiringNotes: '<p><strong>Header spacing:</strong> The Arduino Uno has an infamous 0.05" offset between the digital and analog headers. The left header row is not exactly 0.1" grid-aligned with the right row. KiCad\'s Arduino Uno shield template accounts for this, but if you are placing headers manually, use the exact coordinates from the Arduino Uno R3 mechanical drawing.</p>' +
                     '<p><strong>Pin selection:</strong> We use D13, D11, D9 for LEDs (PWM-capable pins for potential dimming), D12, D10 for buttons (adjacent to LED pins for clean layout), and A0 for the potentiometer (analog input). Avoid D0 and D1 (used for Serial), and D13 already has a built-in LED on the Arduino &mdash; our shield LED parallels it.</p>' +
                     '<p><strong>Decoupling:</strong> Add a 100nF capacitor between VCC and GND near the headers. This filters noise from the Arduino\'s 5V rail and prevents the LEDs from introducing ripple that affects the potentiometer\'s analog reading.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg76-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg76-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-76 ARDUINO SHIELD PCB DESIGN</text>' +

            '<!-- Shield board outline -->' +
            '<rect x="120" y="50" width="280" height="200" rx="6" fill="rgba(34,197,94,0.03)" stroke="#22c55e" stroke-width="2"/>' +
            '<text x="260" y="44" text-anchor="middle" fill="#22c55e" font-size="7">Shield PCB &mdash; 68.6mm x 53.3mm</text>' +

            '<!-- Headers (bottom edge) -->' +
            '<rect x="140" y="225" width="100" height="12" rx="2" fill="#1e2736" stroke="#eab308" stroke-width="1"/>' +
            '<text x="190" y="233" text-anchor="middle" fill="#eab308" font-size="5">J1: D8-D13, GND, AREF</text>' +
            '<rect x="280" y="225" width="100" height="12" rx="2" fill="#1e2736" stroke="#eab308" stroke-width="1"/>' +
            '<text x="330" y="233" text-anchor="middle" fill="#eab308" font-size="5">J2: D0-D7</text>' +

            '<!-- Headers (top edge) -->' +
            '<rect x="140" y="58" width="100" height="12" rx="2" fill="#1e2736" stroke="#a78bfa" stroke-width="1"/>' +
            '<text x="190" y="66" text-anchor="middle" fill="#a78bfa" font-size="5">J3: Power (5V, 3.3V, GND)</text>' +
            '<rect x="280" y="58" width="100" height="12" rx="2" fill="#1e2736" stroke="#a78bfa" stroke-width="1"/>' +
            '<text x="330" y="66" text-anchor="middle" fill="#a78bfa" font-size="5">J4: A0-A5</text>' +

            '<!-- LED section -->' +
            '<circle cx="170" cy="110" r="6" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="170" y="113" text-anchor="middle" fill="#ef4444" font-size="5">D1</text>' +
            '<text x="170" y="128" text-anchor="middle" fill="#8b949e" font-size="5">Red D13</text>' +

            '<circle cx="220" cy="110" r="6" fill="rgba(234,179,8,0.2)" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="220" y="113" text-anchor="middle" fill="#eab308" font-size="5">D2</text>' +
            '<text x="220" y="128" text-anchor="middle" fill="#8b949e" font-size="5">Ylw D11</text>' +

            '<circle cx="270" cy="110" r="6" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="270" y="113" text-anchor="middle" fill="#22c55e" font-size="5">D3</text>' +
            '<text x="270" y="128" text-anchor="middle" fill="#8b949e" font-size="5">Grn D9</text>' +

            '<!-- Resistors for LEDs -->' +
            '<rect x="155" y="135" width="30" height="10" rx="2" fill="#1e2736" stroke="#ef4444" stroke-width="0.8"/>' +
            '<text x="170" y="142" text-anchor="middle" fill="#ef4444" font-size="4">R1 330</text>' +
            '<rect x="205" y="135" width="30" height="10" rx="2" fill="#1e2736" stroke="#eab308" stroke-width="0.8"/>' +
            '<text x="220" y="142" text-anchor="middle" fill="#eab308" font-size="4">R2 330</text>' +
            '<rect x="255" y="135" width="30" height="10" rx="2" fill="#1e2736" stroke="#22c55e" stroke-width="0.8"/>' +
            '<text x="270" y="142" text-anchor="middle" fill="#22c55e" font-size="4">R3 330</text>' +

            '<!-- Button section -->' +
            '<rect x="320" y="100" width="20" height="20" rx="3" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="330" y="113" text-anchor="middle" fill="#3b82f6" font-size="5">S1</text>' +
            '<text x="330" y="132" text-anchor="middle" fill="#8b949e" font-size="5">BTN D12</text>' +

            '<rect x="360" y="100" width="20" height="20" rx="3" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="370" y="113" text-anchor="middle" fill="#3b82f6" font-size="5">S2</text>' +
            '<text x="370" y="132" text-anchor="middle" fill="#8b949e" font-size="5">BTN D10</text>' +

            '<!-- Potentiometer -->' +
            '<circle cx="350" cy="180" r="12" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" stroke-width="1.5"/>' +
            '<line x1="350" y1="168" x2="356" y2="175" stroke="#a78bfa" stroke-width="1.5"/>' +
            '<text x="350" y="183" text-anchor="middle" fill="#a78bfa" font-size="5">POT</text>' +
            '<text x="350" y="200" text-anchor="middle" fill="#8b949e" font-size="5">10K A0</text>' +

            '<!-- Decoupling cap -->' +
            '<rect x="145" y="170" width="16" height="10" rx="2" fill="#1e2736" stroke="#38bdf8" stroke-width="0.8"/>' +
            '<text x="153" y="177" text-anchor="middle" fill="#38bdf8" font-size="4">C1</text>' +
            '<text x="153" y="192" text-anchor="middle" fill="#8b949e" font-size="4">100nF</text>' +

            '<!-- Component list -->' +
            '<rect x="440" y="50" width="240" height="200" rx="8" fill="rgba(234,179,8,0.03)" stroke="rgba(234,179,8,0.1)" stroke-width="0.5"/>' +
            '<text x="560" y="70" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">BILL OF MATERIALS</text>' +

            '<text x="455" y="92" fill="#ef4444" font-size="6">3x LED (Red, Yellow, Green) 3mm THT</text>' +
            '<text x="455" y="108" fill="#eab308" font-size="6">3x Resistor 330&#x2126; 0805</text>' +
            '<text x="455" y="124" fill="#3b82f6" font-size="6">2x Tactile switch 6x6mm THT</text>' +
            '<text x="455" y="140" fill="#3b82f6" font-size="6">2x Resistor 10K&#x2126; 0805 (pull-down)</text>' +
            '<text x="455" y="156" fill="#a78bfa" font-size="6">1x Potentiometer 10K&#x2126; THT</text>' +
            '<text x="455" y="172" fill="#38bdf8" font-size="6">1x Capacitor 100nF 0805</text>' +
            '<text x="455" y="188" fill="#eab308" font-size="6">4x Pin header 1x8 female 2.54mm</text>' +
            '<text x="455" y="204" fill="#8b949e" font-size="6">1x PCB (order from SG-75 workflow)</text>' +

            '<!-- Arduino below -->' +
            '<rect x="120" y="265" width="280" height="80" rx="6" fill="#1e2736" stroke="#555" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<text x="260" y="290" text-anchor="middle" fill="#555" font-size="9">Arduino Uno R3 (below shield)</text>' +
            '<rect x="130" y="300" width="40" height="15" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<text x="150" y="310" text-anchor="middle" fill="#555" font-size="5">USB</text>' +
            '<rect x="340" y="300" width="40" height="15" rx="2" fill="rgba(255,255,255,0.05)" stroke="#555" stroke-width="0.5"/>' +
            '<text x="360" y="310" text-anchor="middle" fill="#555" font-size="5">DC Jack</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Create the Schematic with Headers, LEDs, Buttons, and Pot',
                content: '<p>The shield schematic connects Arduino header pins to LEDs (through current-limiting resistors), buttons (with pull-down resistors), and a potentiometer. Start by placing the four Arduino headers that define the shield interface.</p>',
                code: '# Create a new KiCad project:\nmkdir -p ~/pcb-projects/sg76-arduino-shield\nkicad &\n# File > New Project: sg76-arduino-shield\n\n# In the Schematic Editor:\n#\n# 1. Place Arduino headers (4 connectors):\n#    Press A > search "Conn_01x08" (Connector:Conn_01x08_Pin)\n#    Place 4 of them for J1-J4:\n#    J1: D8-D13, GND, AREF      (digital high)\n#    J2: D0-D7                   (digital low)\n#    J3: RST, 3.3V, 5V, GND x2, Vin (power)\n#    J4: A0-A5                   (analog)\n#    Label each pin with net labels (press L)\n#\n# 2. LED circuits (repeat 3 times):\n#    Press A > "R" for resistor (330 ohm)\n#    Press A > "LED" for LED\n#    Wire: D13 ---> R1 ---> LED1 anode ---> LED1 cathode ---> GND\n#    Wire: D11 ---> R2 ---> LED2 anode ---> LED2 cathode ---> GND\n#    Wire: D9  ---> R3 ---> LED3 anode ---> LED3 cathode ---> GND\n#\n# 3. Button circuits (repeat 2 times):\n#    Press A > "SW_Push" for tactile switch\n#    Press A > "R" for pull-down resistor (10K)\n#    Wire: 5V ---> BTN1 ---> D12 junction\n#    Wire: D12 junction ---> R4 (10K) ---> GND\n#    Wire: 5V ---> BTN2 ---> D10 junction\n#    Wire: D10 junction ---> R5 (10K) ---> GND\n#\n# 4. Potentiometer:\n#    Press A > "R_Potentiometer"\n#    Wire: 5V ---> pot pin 3, GND ---> pot pin 1\n#    Wire: pot wiper (pin 2) ---> A0\n#\n# 5. Decoupling capacitor:\n#    Press A > "C" (100nF)\n#    Wire: 5V ---> C1 ---> GND\n#    Place near the power header\n#\n# 6. Add PWR_FLAG on 5V and GND nets\n# 7. Run ERC: Inspect > Electrical Rules Checker',
                language: 'Bash',
                tip: '<strong>Use net labels instead of long wires.</strong> Press L to place a net label like "D13" on a wire. Any wire with the same net label is electrically connected, even if there is no visible wire between them. This keeps the schematic clean &mdash; you do not need wires running across the entire sheet from headers to components.'
            },
            {
                title: 'Assign Footprints and Import the Shield Outline',
                content: '<p>Assign physical footprints to every component, then import the Arduino Uno shield board outline. KiCad has an Arduino shield template, or you can use the exact dimensions from the Arduino mechanical specification.</p>',
                code: '# Assign footprints (Tools > Assign Footprints):\n#\n# J1-J4 headers:\n#   Connector_PinSocket_2.54mm:PinSocket_1x08_P2.54mm_Vertical\n#   (female headers that plug onto Arduino male pins)\n#\n# R1, R2, R3 (330 ohm LED resistors):\n#   Resistor_SMD:R_0805_2012Metric\n#\n# R4, R5 (10K pull-down resistors):\n#   Resistor_SMD:R_0805_2012Metric\n#\n# D1, D2, D3 (LEDs):\n#   LED_THT:LED_D3.0mm\n#\n# SW1, SW2 (tactile switches):\n#   Button_Switch_THT:SW_PUSH_6mm_H5mm\n#\n# RV1 (potentiometer):\n#   Potentiometer_THT:Potentiometer_Bourns_3386P_Vertical\n#\n# C1 (100nF decoupling cap):\n#   Capacitor_SMD:C_0805_2012Metric\n\n# Arduino Uno shield dimensions (from official spec):\n# Board width:  68.6 mm\n# Board height: 53.3 mm\n# Mounting holes: 4 locations at standard Arduino positions\n# Header J1 (digital high): pins at (50.8, 2.54) to (68.58, 2.54)\n# Header J3 (power):        pins at (18.54, 50.8) to (45.72, 50.8)\n# Note: the 0.05" (1.27mm) offset between J1/J2 and J3/J4\n\n# After footprint assignment:\n# F8 to update PCB from schematic',
                language: 'Bash',
                tip: '<strong>Use the KiCad Arduino template or footprint.</strong> Search the KiCad footprint library for "Arduino" &mdash; there is an Arduino_UNO_R3 board outline footprint that includes the exact header positions and mounting holes. Import this as a reference in the PCB editor. It saves you from manually measuring and placing each header at the exact Arduino coordinates.'
            },
            {
                title: 'Place Components and Route the Shield PCB',
                content: '<p>Place components logically: LEDs and their resistors on one side, buttons and their pull-downs on the other, potentiometer in a convenient location for finger access. Route traces on F.Cu and pour a ground plane on B.Cu.</p>',
                code: '# Component placement strategy:\n#\n# 1. Headers first (they are fixed positions):\n#    J1 (digital high) and J2 (digital low) along the bottom edge\n#    J3 (power) and J4 (analog) along the top edge\n#    These positions are dictated by the Arduino Uno layout\n#\n# 2. LEDs in a row (left side of board):\n#    D1 (red) near D13, D2 (yellow) near D11, D3 (green) near D9\n#    Space them 8mm apart for visual clarity\n#    Corresponding resistors (R1-R3) between LEDs and header\n#\n# 3. Buttons on the right side:\n#    SW1 near D12, SW2 near D10\n#    Pull-down resistors (R4, R5) near each button\n#    Leave clearance for finger access (8mm+ between buttons)\n#\n# 4. Potentiometer near A0 header pin:\n#    Oriented with the adjustment screw facing up\n#\n# 5. Decoupling cap C1 near the power header\n#\n# Routing:\n# - X to route, start from header pad to component pad\n# - Route all LED circuits first (simple straight runs)\n# - Route button pull-down resistors\n# - Route potentiometer (3 connections)\n# - GND plane on B.Cu (Ctrl+Shift+Z > GND > B.Cu)\n# - Press B to fill zones\n#\n# Add mounting holes:\n# Place > Footprint > search "MountingHole"\n# Use MountingHole:MountingHole_3.2mm_M3\n# Place at the 4 Arduino mounting hole positions',
                language: 'Bash',
                tip: '<strong>Route signal traces on F.Cu, pour ground on B.Cu.</strong> This is the standard 2-layer strategy. Signal traces on top where you can see them, continuous ground plane on the bottom for return current. Use vias only when you absolutely must cross traces. For this shield, all routing should fit on F.Cu without any crossings if you place components well.'
            },
            {
                title: 'Add Silkscreen Labels and Polish the Design',
                content: '<p>Silkscreen is the white text and graphics printed on the PCB. Good silkscreen turns a bare board into a professional product. Label every component, add pin function labels, include your project name, and mark pin 1 / polarity indicators.</p>',
                code: '# Silkscreen best practices in KiCad PCB Editor:\n#\n# 1. Component references (auto-placed):\n#    R1, R2, R3, D1, D2, D3, SW1, SW2, RV1, C1\n#    Reposition: click the reference text > M to move\n#    Resize: Edit text > set size to 0.8mm height\n#    Keep references near their components but out of pad areas\n#\n# 2. Add functional labels:\n#    Place > Text on F.Silkscreen layer\n#    Near D1: "RED D13"\n#    Near D2: "YLW D11"\n#    Near D3: "GRN D9"\n#    Near SW1: "BTN1 D12"\n#    Near SW2: "BTN2 D10"\n#    Near RV1: "POT A0"\n#    Font size: 1.0mm height, 0.15mm line width\n#\n# 3. Add project title:\n#    Place > Text on F.Silkscreen\n#    "SG-76 ARDUINO SHIELD"\n#    Place at the top or bottom edge\n#    Font size: 1.2mm height\n#\n# 4. Mark polarity:\n#    LED cathode (flat side) marked with "-"\n#    Capacitor positive side marked with "+"\n#    Pin 1 of headers marked with small dot or triangle\n#\n# 5. Add a small graphic (optional):\n#    Place > Image on F.Silkscreen\n#    Or draw with lines on F.Silkscreen layer\n#\n# Rules:\n# - Silkscreen text must NOT overlap solder pads\n# - Minimum text height: 0.8mm (for readability after printing)\n# - Minimum line width: 0.15mm\n# - DRC will warn about silkscreen on pads\n\n# Run DRC one final time after all changes:\n# Inspect > Design Rules Checker > Run DRC\n# Target: 0 errors, 0 warnings',
                language: 'Bash',
                tip: '<strong>Silkscreen is documentation.</strong> Six months from now, when you pick up this board and cannot remember which LED is which pin, the silkscreen labels save you. Label generously. Future you will appreciate it. Professional boards label every component, every connector pin, every test point, and include a revision number.'
            },
            {
                title: 'Export Gerbers and Order the Shield',
                content: '<p>Follow the same Gerber export and ordering workflow from SG-75. The shield is a 2-layer board that fits well within the 100x100mm budget pricing tier at JLCPCB.</p>',
                code: '# Export Gerbers (same as SG-75):\nmkdir -p ~/pcb-projects/sg76-arduino-shield/gerbers\n\nkicad-cli pcb export gerbers \\\n  ~/pcb-projects/sg76-arduino-shield/sg76-arduino-shield.kicad_pcb \\\n  -o ~/pcb-projects/sg76-arduino-shield/gerbers/ \\\n  -l F.Cu,B.Cu,F.Silkscreen,B.Silkscreen,F.Mask,B.Mask,Edge.Cuts,F.Paste\n\nkicad-cli pcb export drill \\\n  ~/pcb-projects/sg76-arduino-shield/sg76-arduino-shield.kicad_pcb \\\n  -o ~/pcb-projects/sg76-arduino-shield/gerbers/ \\\n  --format excellon --excellon-units mm\n\n# Zip and inspect:\ncd ~/pcb-projects/sg76-arduino-shield/gerbers\nzip ../sg76-shield-gerbers.zip *.gbr *.drl\n\n# Open Gerber viewer to inspect:\ngerbview &\n\n# Upload to JLCPCB:\n# Board size: ~69mm x 53mm (within 100x100mm budget tier)\n# 2 layers, 1.6mm, green, HASL\n# ~$2 for 5 boards\n\n# Test sketch for Arduino IDE (write after boards arrive):\n# const int LED1 = 13, LED2 = 11, LED3 = 9;\n# const int BTN1 = 12, BTN2 = 10;\n# const int POT = A0;\n# void setup() {\n#   pinMode(LED1, OUTPUT); pinMode(LED2, OUTPUT); pinMode(LED3, OUTPUT);\n#   pinMode(BTN1, INPUT);  pinMode(BTN2, INPUT);\n# }\n# void loop() {\n#   if (digitalRead(BTN1)) digitalWrite(LED1, HIGH);\n#   else digitalWrite(LED1, LOW);\n#   int val = analogRead(POT);\n#   analogWrite(LED3, val / 4);\n# }',
                language: 'Bash',
                tip: '<strong>Order extra boards.</strong> At $2 for 5, there is no reason to order the minimum. You will inevitably want to give one to a friend, solder one badly and need a spare, or use one for a different experiment. Five boards is already the minimum at JLCPCB, but consider ordering 10 if you plan to iterate on the soldering.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Schematic has 4 headers (J1-J4), 3 LEDs, 3 LED resistors, 2 buttons, 2 pull-down resistors, 1 potentiometer, 1 decoupling cap</li>' +
                 '<li>ERC passes with 0 errors (PWR_FLAG on 5V and GND)</li>' +
                 '<li>Header footprints are female pin sockets at Arduino Uno R3 positions (including the 0.05" offset)</li>' +
                 '<li>All components placed inside the shield outline with no overlaps</li>' +
                 '<li>Traces routed on F.Cu with 45-degree bends, ground plane on B.Cu</li>' +
                 '<li>Silkscreen labels on all components and pin functions</li>' +
                 '<li>DRC passes: 0 errors, 0 unrouted</li>' +
                 '<li>Shield plugs onto Arduino Uno without mechanical interference</li>' +
                 '<li>After soldering: LEDs light from digitalRead, buttons read correctly, potentiometer returns 0-1023 on A0</li>' +
                 '</ul>' +
                 '<p>You have designed a complete Arduino shield from scratch. This same workflow scales to any shield: motor drivers, wireless modules, sensor arrays, display interfaces. The header positions are fixed, the power rails are known, and the design process is identical.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Shield does not seat on Arduino headers:</strong> The Arduino Uno R3 has a notorious 0.05" (1.27mm) offset between the digital and analog header rows. If your footprint uses a uniform 2.54mm grid, the analog header will be misaligned. Use the official Arduino Uno R3 board outline KiCad template or manually offset the analog connector by 1.27mm.</li>' +
                         '<li><strong>Buttons read erratically or always HIGH/LOW:</strong> Missing or incorrect pull-up/pull-down resistors. Without a defined idle state, the GPIO floats and reads random values. Wire a 10k pull-down resistor from the button pin to GND, with the button connecting the pin to 5V when pressed. Alternatively, use the Arduino\'s internal pull-up with <code>pinMode(pin, INPUT_PULLUP)</code> and wire the button to GND.</li>' +
                         '<li><strong>LEDs light dimly or not at all:</strong> Check resistor value &mdash; a 10k resistor limits current to ~0.3mA which is too low for most LEDs. Use 220&ndash;330 ohm for standard 20mA LEDs at 5V. Also verify LED polarity: anode to the resistor/pin side, cathode to GND.</li>' +
                         '<li><strong>Potentiometer reads only 0 or 1023:</strong> The wiper (center pin) must connect to the analog input. The outer pins connect to 5V and GND. If you swap the wiper with an outer pin, you get a fixed voltage instead of a variable one.</li>' +
                         '<li><strong>ERC error on connector pins:</strong> KiCad may flag header pins as unconnected if they are intentionally unused. Add "no connect" flags (X symbols) to unused header pins to tell ERC they are deliberately open.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Motor Driver Shield</strong> &mdash; Replace the LEDs and buttons with an L293D or L298N motor driver IC. Design a shield that can drive two DC motors with direction and speed control via PWM pins D5 and D6.</p>' +
                    '<p><strong>Challenge 2: Stacking Headers</strong> &mdash; Use extra-tall stacking headers instead of standard female headers so that a second shield can be stacked on top. Verify that component heights do not interfere with the shield above.</p>',

        commonMistakes: [
            {
                title: 'Ignoring the 0.05-inch Header Offset',
                correct: 'Use the Arduino Uno R3 mechanical drawing or KiCad shield template to place headers with the correct 0.05-inch (1.27mm) offset on the analog header row.',
                incorrect: 'Placing all headers on a uniform 0.1-inch grid, ignoring the well-known offset quirk from the original Arduino layout.',
                consequence: 'The shield will not physically seat on the Arduino. The misaligned header pins will not enter the sockets, and the board must be redesigned and re-fabricated.'
            },
            {
                title: 'Routing Traces Between Header Pads',
                correct: 'Route traces away from header areas on a different layer or use wider spacing around connector zones. Keep the area between header pads clear.',
                incorrect: 'Routing signal traces between the 2.54mm-pitch header pads with standard clearance rules.',
                consequence: 'The tight spacing between header pads leaves almost no room for traces. Traces may violate clearance rules, become fragile during manufacturing, or short to adjacent pads during soldering.'
            },
            {
                title: 'No Decoupling Capacitor on the Shield',
                correct: 'Place a 100nF ceramic capacitor between 5V and GND on the shield, close to the power header pins, to filter voltage spikes from switching loads.',
                incorrect: 'Omitting decoupling capacitors on the shield, relying on the Arduino board alone for power filtering.',
                consequence: 'Switching loads (motors, relays, buzzers) cause voltage spikes on the power rail that can reset the Arduino or corrupt serial communication and analog readings.'
            }
        ]
    },

    // ========================================================================
    // SG-77: Conference Badge Design
    // ========================================================================
    'sg-77': {
        intro: '<p>Electronic conference badges are custom PCBs that double as wearable art and functional circuits. They are a staple of hacker conferences like DEF CON, BSides, and CCC. A good badge has LEDs that blink in patterns, a microcontroller for interactivity, a battery holder for portability, and a creative board shape that makes people stop and ask "where did you get that?"</p>' +
               '<p>In this project, you will design a badge PCB with an ATtiny85 microcontroller, six charlieplexed LEDs (controlled by only 3 I/O pins), a CR2032 coin cell battery holder, and a custom board outline shaped like a shield or logo. The badge is wearable via a lanyard hole and programmable via a pogo-pin header.</p>' +
               '<p>Badge design pushes your PCB skills further than previous projects: non-rectangular board shapes, battery-powered design considerations, charlieplexing (a clever LED multiplexing technique), and creative silkscreen artwork. This is where engineering meets art.</p>',

        wiring: '    Conference Badge Circuit\n' +
                '    \n' +
                '    CR2032 (3V)          ATtiny85\n' +
                '    +--------+       +----------+\n' +
                '    | +  BAT | ----->| VCC  PB0 |---+---[LED1]---+\n' +
                '    |        |       |      PB1 |---+---[LED2]---+---[LED3]---+\n' +
                '    | -      | ----->| GND  PB2 |---+---[LED4]---+---[LED5]---+---[LED6]\n' +
                '    +--------+       |          |\n' +
                '                     | RST  PB3 |---> Programming header\n' +
                '                     | PB4  PB5 |---> (ISP / pogo pins)\n' +
                '                     +----------+\n' +
                '    \n' +
                '    Charlieplexing: 3 pins control 6 LEDs\n' +
                '    Each LED is between two pins, forward or reverse biased\n' +
                '    Only one LED lit at a time, persistence of vision = all appear lit',

        wiringNotes: '<p><strong>Charlieplexing:</strong> With N pins, you can control N*(N-1) LEDs. Three pins give 6 LEDs (3*2), four pins give 12 LEDs (4*3). Each LED sits between two pins. To light a specific LED, set one pin HIGH, one pin LOW, and the third to INPUT (high impedance / disconnected). The ATtiny85 switches between LEDs so fast that persistence of vision makes them all appear to glow simultaneously.</p>' +
                     '<p><strong>ATtiny85:</strong> An 8-pin AVR microcontroller with 8KB flash, 512B RAM, and 5 I/O pins (6 if you disable RESET). It runs on 1.8V-5.5V, perfect for a 3V coin cell. Program it with an Arduino Uno as ISP programmer or a USB programmer like the USBasp. It is Arduino-compatible via the ATTinyCore board package.</p>' +
                     '<p><strong>Battery life:</strong> A CR2032 coin cell provides ~220mAh at 3V. An ATtiny85 running at 1MHz draws ~300uA active, ~0.1uA in power-down sleep. With charlieplexed LEDs (one at a time, ~10mA peak), you get 20+ hours of continuous blinking or months with sleep/wake patterns. Use <code>sleep_mode()</code> in your firmware to extend battery life.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg77-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg77-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-77 ELECTRONIC CONFERENCE BADGE</text>' +

            '<!-- Badge outline (shield shape) -->' +
            '<path d="M 200,50 L 350,50 L 370,70 L 370,240 L 285,290 L 200,240 L 180,70 Z" fill="rgba(167,139,250,0.04)" stroke="#a78bfa" stroke-width="2"/>' +
            '<text x="275" y="44" text-anchor="middle" fill="#a78bfa" font-size="7">Custom Badge Outline (Edge.Cuts)</text>' +

            '<!-- Lanyard hole -->' +
            '<circle cx="275" cy="62" r="5" fill="none" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="275" y="65" text-anchor="middle" fill="#eab308" font-size="4">hole</text>' +

            '<!-- ATtiny85 -->' +
            '<rect x="240" y="120" width="70" height="50" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<circle cx="252" cy="132" r="3" fill="rgba(34,197,94,0.3)"/>' +
            '<text x="275" y="142" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700">ATtiny85</text>' +
            '<text x="275" y="158" text-anchor="middle" fill="#8b949e" font-size="5">8KB Flash &bull; 5 I/O</text>' +

            '<!-- Pin labels -->' +
            '<text x="235" y="130" text-anchor="end" fill="#8b949e" font-size="5">RST</text>' +
            '<text x="235" y="142" text-anchor="end" fill="#ef4444" font-size="5">PB3</text>' +
            '<text x="235" y="154" text-anchor="end" fill="#3b82f6" font-size="5">PB4</text>' +
            '<text x="235" y="166" text-anchor="end" fill="#555" font-size="5">GND</text>' +
            '<text x="315" y="130" fill="#ef4444" font-size="5">VCC</text>' +
            '<text x="315" y="142" fill="#eab308" font-size="5">PB2</text>' +
            '<text x="315" y="154" fill="#22c55e" font-size="5">PB1</text>' +
            '<text x="315" y="166" fill="#a78bfa" font-size="5">PB0</text>' +

            '<!-- LEDs in a ring pattern -->' +
            '<circle cx="220" cy="95" r="5" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1"><animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/></circle>' +
            '<text x="220" y="88" text-anchor="middle" fill="#ef4444" font-size="5">D1</text>' +

            '<circle cx="260" cy="85" r="5" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1"><animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.17s" repeatCount="indefinite"/></circle>' +
            '<text x="260" y="78" text-anchor="middle" fill="#eab308" font-size="5">D2</text>' +

            '<circle cx="300" cy="85" r="5" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="1"><animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.33s" repeatCount="indefinite"/></circle>' +
            '<text x="300" y="78" text-anchor="middle" fill="#22c55e" font-size="5">D3</text>' +

            '<circle cx="340" cy="95" r="5" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="1"><animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.5s" repeatCount="indefinite"/></circle>' +
            '<text x="340" y="88" text-anchor="middle" fill="#3b82f6" font-size="5">D4</text>' +

            '<circle cx="345" cy="200" r="5" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="1"><animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.67s" repeatCount="indefinite"/></circle>' +
            '<text x="355" y="200" fill="#a78bfa" font-size="5">D5</text>' +

            '<circle cx="215" cy="200" r="5" fill="rgba(236,72,153,0.3)" stroke="#ec4899" stroke-width="1"><animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.83s" repeatCount="indefinite"/></circle>' +
            '<text x="205" y="200" text-anchor="end" fill="#ec4899" font-size="5">D6</text>' +

            '<!-- Battery holder -->' +
            '<circle cx="275" cy="240" r="18" fill="rgba(234,179,8,0.06)" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="275" y="237" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">CR2032</text>' +
            '<text x="275" y="250" text-anchor="middle" fill="#8b949e" font-size="5">3V coin cell</text>' +

            '<!-- Programming header -->' +
            '<rect x="230" y="270" width="50" height="12" rx="2" fill="#1e2736" stroke="#38bdf8" stroke-width="1"/>' +
            '<text x="255" y="278" text-anchor="middle" fill="#38bdf8" font-size="5">ISP Pogo Pads</text>' +

            '<!-- Charlieplex diagram -->' +
            '<rect x="420" y="50" width="260" height="180" rx="8" fill="rgba(234,179,8,0.03)" stroke="rgba(234,179,8,0.1)" stroke-width="0.5"/>' +
            '<text x="550" y="70" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">CHARLIEPLEX MATRIX</text>' +
            '<text x="550" y="85" text-anchor="middle" fill="#8b949e" font-size="6">3 pins &rarr; 6 LEDs</text>' +

            '<text x="440" y="108" fill="#a78bfa" font-size="6">PB0=H PB1=L PB2=Z &rarr; D1 ON</text>' +
            '<text x="440" y="123" fill="#eab308" font-size="6">PB0=L PB1=H PB2=Z &rarr; D2 ON</text>' +
            '<text x="440" y="138" fill="#22c55e" font-size="6">PB0=Z PB1=H PB2=L &rarr; D3 ON</text>' +
            '<text x="440" y="153" fill="#3b82f6" font-size="6">PB0=Z PB1=L PB2=H &rarr; D4 ON</text>' +
            '<text x="440" y="168" fill="#a78bfa" font-size="6">PB0=H PB1=Z PB2=L &rarr; D5 ON</text>' +
            '<text x="440" y="183" fill="#ec4899" font-size="6">PB0=L PB1=Z PB2=H &rarr; D6 ON</text>' +

            '<text x="550" y="210" text-anchor="middle" fill="#555" font-size="5">H=HIGH(3V) L=LOW(0V) Z=INPUT(disconnected)</text>' +

            '<!-- Power budget -->' +
            '<rect x="420" y="245" width="260" height="100" rx="8" fill="rgba(34,197,94,0.03)" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
            '<text x="550" y="265" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">POWER BUDGET</text>' +
            '<text x="440" y="285" fill="#8b949e" font-size="6">CR2032: 220mAh @ 3V</text>' +
            '<text x="440" y="300" fill="#8b949e" font-size="6">ATtiny85 @ 1MHz: ~300uA</text>' +
            '<text x="440" y="315" fill="#8b949e" font-size="6">1 LED @ 10mA peak (charlieplexed)</text>' +
            '<text x="440" y="330" fill="#22c55e" font-size="6" font-weight="600">Battery life: 20+ hours continuous</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Design the Charlieplexed LED Schematic',
                content: '<p>Charlieplexing connects each LED between a unique pair of I/O pins. With 3 pins (PB0, PB1, PB2), you get 6 LEDs. Each LED is oriented so current flows from pin A to pin B &mdash; reversing the pin states lights the LED between B and A instead. No resistors are needed because the ATtiny85 output pins have enough impedance at 3V to limit LED current to safe levels, but adding 100-ohm resistors is good practice.</p>',
                code: '# Create project:\nmkdir -p ~/pcb-projects/sg77-conference-badge\nkicad &\n# New Project: sg77-conference-badge\n\n# Schematic: Charlieplex LED matrix\n#\n# ATtiny85 pinout (DIP-8 / SOIC-8):\n# Pin 1: RST (PB5)   Pin 8: VCC\n# Pin 2: PB3         Pin 7: PB2 (SCK)\n# Pin 3: PB4         Pin 6: PB1 (MISO)\n# Pin 4: GND         Pin 5: PB0 (MOSI)\n#\n# Place ATtiny85:\n# Press A > search "ATtiny85" > select "MCU_Microchip_ATtiny:ATtiny85V-10SU"\n# (SOIC-8 package for surface mount badge)\n\n# Charlieplex connections (6 LEDs between 3 pins):\n# D1: PB0 (+) ---|>|--- PB1 (-) through R1 (100 ohm)\n# D2: PB1 (+) ---|>|--- PB0 (-) through R1 (shared)\n# D3: PB1 (+) ---|>|--- PB2 (-) through R2 (100 ohm)\n# D4: PB2 (+) ---|>|--- PB1 (-) through R2 (shared)\n# D5: PB0 (+) ---|>|--- PB2 (-) through R3 (100 ohm)\n# D6: PB2 (+) ---|>|--- PB0 (-) through R3 (shared)\n#\n# Wire each LED between pin pairs with anti-parallel orientation:\n# Between PB0 and PB1: D1 points one way, D2 points the other\n# Between PB1 and PB2: D3 points one way, D4 points the other\n# Between PB0 and PB2: D5 points one way, D6 points the other\n#\n# Add 100-ohm resistors in series with each pin:\n# PB0 --- R1 (100) --- junction to D1, D2, D5, D6\n# PB1 --- R2 (100) --- junction to D1, D2, D3, D4\n# PB2 --- R3 (100) --- junction to D3, D4, D5, D6',
                language: 'Bash',
                tip: '<strong>Anti-parallel LED pairs.</strong> Between each pair of pins, two LEDs face opposite directions. When pin A is HIGH and pin B is LOW, current flows through LED1 (forward biased) and LED2 is reverse biased (dark). Swap the pin states and LED2 lights while LED1 is dark. This is the core charlieplexing trick &mdash; directionality of the diode selects which LED in the pair lights up.'
            },
            {
                title: 'Add Battery, Programming Header, and Bypass Cap',
                content: '<p>The badge runs on a CR2032 coin cell. Add the battery holder, a decoupling capacitor, an on/off switch (optional but extends battery life), and pogo-pin pads for ISP programming without soldering a permanent header.</p>',
                code: '# Battery circuit:\n# Place A > search "Battery_Cell" or "BT" symbol\n# Connect: BAT+ to VCC, BAT- to GND\n#\n# Footprint for CR2032:\n# Battery:BatteryHolder_Keystone_3034_1x20mm\n# (surface mount coin cell holder)\n\n# Decoupling capacitor:\n# Place A > "C" (100nF ceramic)\n# Wire: VCC --- C1 --- GND\n# Place close to ATtiny85 VCC/GND pins\n# Footprint: C_0805_2012Metric\n\n# Optional on/off switch:\n# Place A > "SW_SPDT" (single pole double throw)\n# Wire between BAT+ and VCC\n# Footprint: SW_SPDT_CK-JS102011SAQN\n# (small SMD slide switch)\n\n# Programming pads (ISP via pogo pins):\n# You need 6 pads for AVR ISP programming:\n#   VCC, GND, MOSI (PB0), MISO (PB1), SCK (PB2), RST\n#\n# Instead of a pin header (too bulky for a badge), use:\n# - Exposed copper pads on the PCB\n# - Program with a pogo-pin adapter or test clips\n#\n# Place 6 individual pads:\n# Place A > search "TestPoint" > Connector:TestPoint\n# Place 6 in a row, 2.54mm spacing\n# Label: VCC, GND, MOSI, MISO, SCK, RST\n# Footprint: TestPoint:TestPoint_Pad_1.5x1.5mm\n\n# Run ERC after completing the schematic\n# Add PWR_FLAG on VCC and GND',
                language: 'Bash',
                tip: '<strong>Pogo-pin programming is a badge tradition.</strong> Conference badges are meant to be thin and wearable. A protruding pin header ruins the aesthetics and catches on lanyards. Instead, use flat test pads and program with a pogo-pin jig (spring-loaded pins that press against the pads). You can build a jig from pogo pins and a 3D-printed cradle, or just hold bare pogo pins against the pads for the few seconds it takes to flash firmware.'
            },
            {
                title: 'Create a Custom Board Outline',
                content: '<p>Conference badges are defined by their shape. A rectangular badge is boring &mdash; a shield, logo, skull, or circuit board shaped like a state outline is memorable. KiCad lets you draw any shape on the Edge.Cuts layer, or import a DXF outline from a vector graphics program.</p>',
                code: '# Method 1: Draw directly in KiCad PCB Editor\n#\n# Select layer: Edge.Cuts\n# Place > Line or Place > Arc\n# Draw your badge shape point by point\n# Close the outline (first point = last point)\n#\n# Simple shield shape example (coordinates in mm):\n# Start at (100, 90)\n# Line to (140, 90)     (top edge)\n# Line to (145, 95)     (top right chamfer)\n# Line to (145, 140)    (right edge)\n# Line to (120, 155)    (bottom right angle to point)\n# Line to (95, 140)     (bottom left angle from point)\n# Line to (95, 95)      (left edge)\n# Line to (100, 90)     (close, top left chamfer)\n\n# Method 2: Import DXF from Inkscape\n#\n# 1. Design your shape in Inkscape (free vector editor)\n#    - Draw the outline as a single closed path\n#    - Size it to your target dimensions (e.g., 60mm x 70mm)\n#    - Save as DXF: File > Save As > DXF\n#\n# 2. In KiCad PCB Editor:\n#    File > Import > Graphics\n#    Select your .dxf file\n#    Import layer: Edge.Cuts\n#    Scale: 1.0 (if drawn at 1:1 in Inkscape)\n#    Click OK\n#\n# Add a lanyard hole:\n# Place > Footprint > MountingHole:MountingHole_3.2mm_M3\n# Position at the top center of the badge\n# Or draw a circle on Edge.Cuts layer (3mm diameter)\n\n# Board constraints:\n# Minimum width: keep any narrow sections > 5mm\n# Avoid sharp internal corners (stress concentrators)\n# Lanyard hole should be > 3mm from any copper\n# Typical badge size: 50-80mm in largest dimension',
                language: 'Bash',
                tip: '<strong>The Inkscape-to-DXF pipeline is powerful.</strong> Draw any shape in Inkscape, trace a logo, or convert a PNG to vector with Path > Trace Bitmap. Export as DXF and import into KiCad. This lets you use professional vector tools for the creative outline work and KiCad for the electrical design. Many conference badges start as hand-drawn sketches that get vectorized in Inkscape.'
            },
            {
                title: 'Place Components and Route on a Custom Outline',
                content: '<p>Placing components on a non-rectangular board requires more planning. Components must fit within the custom outline, traces must avoid narrow areas, and the visual layout matters because the badge is a wearable display piece.</p>',
                code: '# Placement strategy for badges:\n#\n# 1. ATtiny85 (SOIC-8) in the center of the badge\n#    This is the largest IC and routes to everything\n#\n# 2. LEDs around the perimeter for visual impact:\n#    Arrange in a ring, arc, or pattern that matches the badge shape\n#    Space evenly for aesthetic balance\n#    Use 0805 or 1206 SMD LEDs (low profile)\n#    Footprint: LED_SMD:LED_0805_2012Metric\n#\n# 3. Battery holder on the back (B.Cu side):\n#    The CR2032 holder is the heaviest component\n#    Center it for balance when wearing\n#    Footprint: BatteryHolder_Keystone_3034_1x20mm\n#\n# 4. Programming pads at the bottom edge:\n#    Easy to access with pogo pins\n#\n# 5. Switch on the edge (if included)\n\n# Routing tips for custom outlines:\n# - Keep traces 0.5mm+ from Edge.Cuts\n# - Pour GND on B.Cu but exclude under the battery holder\n# - Use vias to jump from F.Cu to B.Cu when traces cross\n# - LED current paths should be similar length for uniform brightness\n#\n# Silkscreen artwork:\n# Add your conference name, year, logo, or artwork on F.Silkscreen\n# Use Place > Text for text\n# Use Place > Image for bitmap art (converts to silkscreen dots)\n# Or draw vector art with lines on F.Silkscreen\n\n# DRC: verify no copper within 0.3mm of Edge.Cuts\n# Verify all charlieplex connections routed\n# Verify programming pads are accessible',
                language: 'Bash',
                tip: '<strong>Put the battery on the back.</strong> Mount the CR2032 holder on B.Cu (bottom side). When the badge hangs from a lanyard, the battery weight keeps it flat against your chest. If the battery is on top, the badge flips around. Also, the battery holder is ugly &mdash; hide it behind the pretty silkscreen side.'
            },
            {
                title: 'Write Badge Firmware and Program via ISP',
                content: '<p>The badge firmware runs on the ATtiny85 and controls the charlieplexed LED patterns. Program it using an Arduino Uno as an ISP (In-System Programming) adapter, connected to the badge\'s programming pads.</p>',
                code: '# Install ATtiny support in Arduino IDE:\n# File > Preferences > Additional Boards Manager URLs:\n# http://drazzy.com/package_drazzy.com_index.json\n# Tools > Board > Boards Manager > search "ATTinyCore" > Install\n\n# Badge firmware (save as badge_blink.ino):\n# -----------------------------------------------\n# // SG-77 Conference Badge - Charlieplex 6 LEDs\n# // ATtiny85 @ 1MHz internal oscillator, 3V\n#\n# const byte pins[] = {0, 1, 2};  // PB0, PB1, PB2\n# // LED connections: {anode_pin_index, cathode_pin_index}\n# const byte leds[6][2] = {\n#   {0, 1}, {1, 0},  // D1: PB0->PB1, D2: PB1->PB0\n#   {1, 2}, {2, 1},  // D3: PB1->PB2, D4: PB2->PB1\n#   {0, 2}, {2, 0}   // D5: PB0->PB2, D6: PB2->PB0\n# };\n#\n# void lightLED(byte n) {\n#   for (byte i = 0; i < 3; i++) pinMode(pins[i], INPUT);\n#   pinMode(pins[leds[n][0]], OUTPUT);\n#   pinMode(pins[leds[n][1]], OUTPUT);\n#   digitalWrite(pins[leds[n][0]], HIGH);\n#   digitalWrite(pins[leds[n][1]], LOW);\n# }\n#\n# void setup() {}\n# void loop() {\n#   for (byte i = 0; i < 6; i++) {\n#     lightLED(i); delay(100);\n#   }\n# }\n# -----------------------------------------------\n\n# Program the badge using Arduino as ISP:\n# 1. Upload ArduinoISP sketch to your Arduino Uno:\n#    File > Examples > 11.ArduinoISP > ArduinoISP\n#    Upload to Uno\n#\n# 2. Connect Arduino Uno to badge programming pads:\n#    Uno D13 (SCK)  --> Badge SCK pad\n#    Uno D12 (MISO) --> Badge MISO pad\n#    Uno D11 (MOSI) --> Badge MOSI pad\n#    Uno D10        --> Badge RST pad\n#    Uno 5V         --> Badge VCC pad\n#    Uno GND        --> Badge GND pad\n#\n# 3. In Arduino IDE:\n#    Board: ATtiny85 (No bootloader)\n#    Clock: 1 MHz internal\n#    Programmer: Arduino as ISP\n#    Upload with: Sketch > Upload Using Programmer (Ctrl+Shift+U)',
                language: 'Bash',
                tip: '<strong>1 MHz, not 8 MHz.</strong> The ATtiny85 defaults to 1 MHz internal oscillator (8 MHz with a /8 prescaler). At 3V from a coin cell, 1 MHz draws ~300uA vs ~3mA at 8 MHz. For LED blinking patterns, 1 MHz is more than fast enough. Only increase the clock speed if you need faster computation (e.g., WS2812 addressable LED timing requires 8 MHz minimum).'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Schematic: ATtiny85 with 6 charlieplexed LEDs between PB0/PB1/PB2</li>' +
                 '<li>CR2032 battery holder connected to VCC/GND with 100nF bypass cap</li>' +
                 '<li>6 ISP programming test pads (VCC, GND, MOSI, MISO, SCK, RST)</li>' +
                 '<li>ERC passes with 0 errors</li>' +
                 '<li>Custom board outline on Edge.Cuts (shield shape or imported DXF)</li>' +
                 '<li>Lanyard hole at top of badge (3.2mm minimum diameter)</li>' +
                 '<li>All components fit within the custom outline with no overlap</li>' +
                 '<li>Battery holder on B.Cu (back side) for balanced wearing</li>' +
                 '<li>DRC passes: 0 errors, copper clearance from Edge.Cuts verified</li>' +
                 '<li>Silkscreen artwork and conference name on F.Silkscreen</li>' +
                 '<li>After fabrication and assembly: all 6 LEDs light individually</li>' +
                 '<li>Firmware programs successfully via pogo pins / ISP</li>' +
                 '<li>Badge runs 20+ hours on a fresh CR2032</li>' +
                 '</ul>' +
                 '<p>You have designed a wearable electronic badge from scratch &mdash; custom shape, microcontroller, charlieplexed LEDs, battery power, and pogo-pin programming. This is the kind of project that gets you noticed at hacker conferences and demonstrates real hardware design skill. The techniques here (custom outlines, battery management, multiplexed I/O, ISP programming) apply to any small embedded PCB project.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Charlieplexed LEDs light incorrectly or multiple LEDs turn on at once:</strong> Charlieplexing depends on setting pins to HIGH, LOW, or INPUT (high-impedance). If you set a pin to LOW instead of INPUT, it creates an unintended current path through other LEDs. Verify your firmware sets unused pins to INPUT (not LOW) when driving a specific LED pair.</li>' +
                         '<li><strong>ATtiny85 does not program via ISP:</strong> Check the ISP connections: MOSI (PB0), MISO (PB1), SCK (PB2), RST, VCC, GND. Ensure RST has a 10k pull-up to VCC. If using an Arduino as ISP, verify the ArduinoISP sketch is loaded and you selected "Arduino as ISP" (not "ArduinoISP") as the programmer in the IDE.</li>' +
                         '<li><strong>Battery life is far below 20 hours:</strong> Measure the total current draw with a multimeter in series with the battery. At 1 MHz with LEDs cycling, the ATtiny85 should draw under 5mA average. If current is high, check for shorted traces between charlieplex lines or LEDs that are always on due to firmware bugs. Add <code>sleep_mode()</code> between animation frames to extend battery life.</li>' +
                         '<li><strong>DXF import places the outline at the wrong scale:</strong> Inkscape may export in inches while KiCad expects millimeters. Set the DXF import scale factor to 25.4 to convert inches to mm, or ensure Inkscape\'s document units are set to millimeters before exporting.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Add-On Module</strong> &mdash; Design a small SAO (Shitty Add-On) connector on the badge using the standard 2x3 SAO header pinout. SAOs are the conference badge ecosystem\'s expansion port &mdash; they let attendees swap mini-boards between badges.</p>' +
                    '<p><strong>Challenge 2: Capacitive Touch</strong> &mdash; Replace the physical switch with a capacitive touch pad on the PCB copper. The ATtiny85 can sense capacitance changes using the ADC and a few lines of code. Design the touch pad as an exposed copper area on F.Cu with no solder mask.</p>' +
                    '<p><strong>Challenge 3: Edge-Lit Badge</strong> &mdash; Place LEDs at the board edge pointing inward. The FR-4 fiberglass acts as a light guide, creating an edge-lit glow effect. This works best with clear or white solder mask and side-firing LEDs.</p>',

        commonMistakes: [
            {
                title: 'Charlieplex Wiring Errors',
                correct: 'Draw out the full charlieplex truth table before routing. Verify each LED has the correct polarity for its specific pin pair (N pins support N*(N-1) LEDs).',
                incorrect: 'Swapping anode and cathode assignments when wiring charlieplexed LEDs between pin pairs.',
                consequence: 'The LED lights on the wrong pattern step. The firmware appears to malfunction because the physical wiring does not match the software truth table, requiring board rework or re-fabrication.'
            },
            {
                title: 'Lanyard Hole Too Close to Copper',
                correct: 'Place the mounting hole footprint first, maintain at least 2mm clearance between the lanyard hole edge and any copper feature, and route traces around it.',
                incorrect: 'Drilling a lanyard hole through or adjacent to copper traces without adequate clearance.',
                consequence: 'The drill breaks copper trace connections, creating open circuits that are invisible from the top side. The badge fails intermittently or completely depending on which traces are severed.'
            },
            {
                title: 'Badge Too Heavy for a Lanyard',
                correct: 'Keep the board under 60mm in the largest dimension and minimize component count. Test the weight with a prototype before ordering large quantities for a conference.',
                incorrect: 'Adding a large board, CR2032 holder, multiple ICs, and heavy connectors without considering total weight.',
                consequence: 'The badge becomes uncomfortably heavy on a lanyard, causing neck strain during a multi-day conference. Attendees remove it and the badge loses its purpose as wearable art.'
            }
        ]
    },

    // ========================================================================
    // SG-78: USB Breakout Board
    // ========================================================================
    'sg-78': {
        intro: '<p>USB-C is the universal connector standard for modern devices, but prototyping with it directly on a breadboard is impossible &mdash; the connector pitch is too fine and the pins are hidden underneath. A USB-C breakout board exposes those pins to standard 2.54mm headers, giving you clean access to power, data, and configuration channels.</p>' +
               '<p>In this project you will design a USB-C breakout board with an onboard 3.3V voltage regulator. The board accepts 5V from USB-C, regulates it down to 3.3V for microcontroller projects, and breaks out the USB 2.0 data lines (D+/D&minus;) plus the CC configuration pins. This is a board you will use on every future project.</p>' +
               '<p>You will learn USB-C connector footprints, power regulation circuitry, decoupling capacitor placement, and how to properly handle the CC resistors that tell the host to deliver power.</p>',

        wiring: '    USB-C Breakout Board — Power Path\n' +
                '    \n' +
                '    USB-C Connector          Regulator              Output Headers\n' +
                '    +---------------+       +-----------+          +-------------+\n' +
                '    | VBUS (5V) ----+------>| VIN  VOUT |--------->| 3.3V        |\n' +
                '    | GND ---------+--+--->| GND       |--+------>| GND         |\n' +
                '    | D+ ----------+--|-----|-----------|--|------>| D+          |\n' +
                '    | D- ----------+--|-----|-----------|--|------>| D-          |\n' +
                '    | CC1 ---[5k1]-+--+    +-----------+  |      | VBUS (5V)   |\n' +
                '    | CC2 ---[5k1]-+--+     AMS1117-3.3   |      +-------------+\n' +
                '    +---------------+  |                   |\n' +
                '                       +---[100uF]---+----+\n' +
                '                       +---[100nF]---+',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg78-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg78-trace{0%{stroke-dashoffset:120}100%{stroke-dashoffset:0}}' +
            '.sg78-anim{animation:sg78-trace 2s ease-in-out infinite}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg78-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-78 USB-C BREAKOUT BOARD</text>' +

            '<!-- PCB board outline -->' +
            '<rect x="120" y="55" width="250" height="200" rx="6" fill="rgba(59,130,246,0.03)" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="245" y="48" text-anchor="middle" fill="#3b82f6" font-size="7">PCB &mdash; 25mm x 20mm</text>' +

            '<!-- USB-C connector -->' +
            '<rect x="100" y="110" width="36" height="56" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="108" y="118" width="20" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="118" y="125" text-anchor="middle" fill="#c084fc" font-size="5">USB-C</text>' +
            '<text x="118" y="144" text-anchor="middle" fill="#ef4444" font-size="5">VBUS</text>' +
            '<circle cx="136" cy="141" r="2" fill="#ef4444"/>' +
            '<text x="118" y="154" text-anchor="middle" fill="#8b949e" font-size="5">GND</text>' +
            '<circle cx="136" cy="151" r="2" fill="#3b82f6"/>' +
            '<text x="118" y="164" text-anchor="middle" fill="#f97316" font-size="5">D+</text>' +
            '<circle cx="136" cy="161" r="2" fill="#f97316"/>' +
            '<text x="118" y="174" text-anchor="middle" fill="#f97316" font-size="5">D&minus;</text>' +
            '<circle cx="136" cy="171" r="2" fill="#f97316"/>' +
            '<text x="118" y="184" text-anchor="middle" fill="#22c55e" font-size="5">CC1</text>' +
            '<circle cx="136" cy="181" r="2" fill="#22c55e"/>' +
            '<text x="118" y="194" text-anchor="middle" fill="#22c55e" font-size="5">CC2</text>' +
            '<circle cx="136" cy="191" r="2" fill="#22c55e"/>' +

            '<!-- CC pull-down resistors -->' +
            '<rect x="160" y="210" width="36" height="12" rx="2" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="178" y="219" text-anchor="middle" fill="#22c55e" font-size="5">5.1k R1</text>' +
            '<rect x="160" y="228" width="36" height="12" rx="2" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="178" y="237" text-anchor="middle" fill="#22c55e" font-size="5">5.1k R2</text>' +
            '<line x1="136" y1="181" x2="160" y2="216" stroke="#22c55e" stroke-width="1"/>' +
            '<line x1="136" y1="191" x2="160" y2="234" stroke="#22c55e" stroke-width="1"/>' +
            '<line x1="196" y1="216" x2="220" y2="245" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<line x1="196" y1="234" x2="220" y2="245" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<text x="225" y="248" fill="#8b949e" font-size="5">GND</text>' +

            '<!-- AMS1117-3.3 regulator -->' +
            '<rect x="210" y="105" width="70" height="40" rx="4" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="245" y="120" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">AMS1117</text>' +
            '<text x="245" y="132" text-anchor="middle" fill="#8b949e" font-size="6">3.3V LDO</text>' +
            '<text x="212" y="140" fill="#8b949e" font-size="5">VIN</text>' +
            '<text x="260" y="140" fill="#8b949e" font-size="5">VOUT</text>' +
            '<text x="238" y="152" fill="#8b949e" font-size="5">GND</text>' +

            '<!-- VBUS trace to VIN (animated) -->' +
            '<path d="M136,141 L210,125" stroke="#ef4444" stroke-width="2" stroke-dasharray="40,80" class="sg78-anim"/>' +

            '<!-- Capacitors -->' +
            '<rect x="190" y="160" width="24" height="10" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="202" y="168" text-anchor="middle" fill="#c084fc" font-size="4">100uF</text>' +
            '<rect x="220" y="160" width="18" height="10" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="229" y="168" text-anchor="middle" fill="#c084fc" font-size="4">100nF</text>' +
            '<rect x="270" y="160" width="24" height="10" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="282" y="168" text-anchor="middle" fill="#c084fc" font-size="4">100uF</text>' +
            '<rect x="300" y="160" width="18" height="10" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="309" y="168" text-anchor="middle" fill="#c084fc" font-size="4">100nF</text>' +
            '<text x="229" y="182" text-anchor="middle" fill="#8b949e" font-size="5">Input caps</text>' +
            '<text x="294" y="182" text-anchor="middle" fill="#8b949e" font-size="5">Output caps</text>' +

            '<!-- Output header -->' +
            '<rect x="340" y="100" width="24" height="100" rx="3" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="352" y="96" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">J2</text>' +
            '<circle cx="352" cy="115" r="3" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.8"/>' +
            '<text x="373" y="118" fill="#22c55e" font-size="5">3.3V</text>' +
            '<circle cx="352" cy="132" r="3" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="0.8"/>' +
            '<text x="373" y="135" fill="#ef4444" font-size="5">5V (VBUS)</text>' +
            '<circle cx="352" cy="149" r="3" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="0.8"/>' +
            '<text x="373" y="152" fill="#f97316" font-size="5">D+</text>' +
            '<circle cx="352" cy="166" r="3" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="0.8"/>' +
            '<text x="373" y="169" fill="#f97316" font-size="5">D&minus;</text>' +
            '<circle cx="352" cy="183" r="3" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="0.8"/>' +
            '<text x="373" y="186" fill="#3b82f6" font-size="5">GND</text>' +

            '<!-- VOUT to 3.3V header trace -->' +
            '<line x1="280" y1="125" x2="340" y2="115" stroke="#22c55e" stroke-width="1.5"/>' +
            '<!-- D+ passthrough -->' +
            '<line x1="136" y1="161" x2="340" y2="149" stroke="#f97316" stroke-width="1" stroke-dasharray="4,2"/>' +
            '<!-- D- passthrough -->' +
            '<line x1="136" y1="171" x2="340" y2="166" stroke="#f97316" stroke-width="1" stroke-dasharray="4,2"/>' +

            '<!-- Power path annotation -->' +
            '<rect x="430" y="55" width="260" height="100" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="560" y="73" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">POWER PATH</text>' +
            '<text x="440" y="90" fill="#8b949e" font-size="6">USB-C VBUS (5V) &rarr; AMS1117 VIN</text>' +
            '<text x="440" y="104" fill="#8b949e" font-size="6">AMS1117 VOUT &rarr; 3.3V header pin</text>' +
            '<text x="440" y="118" fill="#8b949e" font-size="6">VBUS also passed through to 5V header</text>' +
            '<text x="440" y="132" fill="#22c55e" font-size="6">CC1/CC2: 5.1k&#x2126; pull-downs to GND</text>' +
            '<text x="440" y="146" fill="#8b949e" font-size="6">(required for USB-C power negotiation)</text>' +

            '<!-- Component legend -->' +
            '<rect x="430" y="170" width="260" height="80" rx="8" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.15)" stroke-width="0.5"/>' +
            '<text x="560" y="188" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">CAPACITOR PLACEMENT</text>' +
            '<text x="440" y="205" fill="#8b949e" font-size="6">Input: 100&mu;F electrolytic + 100nF ceramic</text>' +
            '<text x="440" y="219" fill="#8b949e" font-size="6">Output: 100&mu;F electrolytic + 100nF ceramic</text>' +
            '<text x="440" y="233" fill="#8b949e" font-size="6">Bypass caps &lt;3mm from regulator pins</text>' +

            '<!-- Board specs -->' +
            '<rect x="430" y="265" width="260" height="55" rx="8" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="560" y="283" text-anchor="middle" fill="#3b82f6" font-size="8" font-weight="600">BOARD SPECS</text>' +
            '<text x="440" y="298" fill="#8b949e" font-size="6">Size: 25mm x 20mm &bull; 2-layer FR4</text>' +
            '<text x="440" y="312" fill="#8b949e" font-size="6">Power: 0.5mm traces &bull; Signal: 0.25mm</text>' +

            '</svg>' +
            '</div>',

        wiringNotes: '<p><strong>CC resistors are mandatory.</strong> USB-C requires 5.1k&#x2126; pull-down resistors on CC1 and CC2 to negotiate power delivery. Without them, most USB-C hosts will not provide any power at all. These are not optional &mdash; no CC resistors means no VBUS voltage.</p>' +
                     '<p><strong>Regulator choice:</strong> The AMS1117-3.3 is a linear dropout regulator (LDO) that converts 5V to 3.3V. It needs input and output capacitors for stability: 100&mu;F electrolytic on the input, 100&mu;F on the output, plus 100nF ceramic bypass caps on both sides. Place the bypass caps as close to the regulator pins as possible.</p>' +
                     '<p><strong>USB 2.0 only:</strong> This breakout targets USB 2.0 speeds. USB 3.x high-speed pairs (TX/RX) require controlled impedance routing and are beyond the scope of a simple breakout board.</p>',

        steps: [
            {
                title: 'Create the Schematic with USB-C Connector and Regulator',
                content: '<p>Start a new KiCad project and build the schematic. Place the USB-C receptacle, the AMS1117-3.3 voltage regulator, the CC pull-down resistors, decoupling capacitors, and output headers.</p>',
                code: '# Create project\nmkdir -p ~/pcb-projects/sg78-usb-breakout\ncd ~/pcb-projects/sg78-usb-breakout\n\n# In KiCad Schematic Editor:\n#\n# 1. Place USB-C receptacle:\n#    Press A > search "USB_C_Receptacle_USB2.0"\n#    Library: Connector > USB_C_Receptacle_USB2.0\n#    This gives you VBUS, GND, D+, D-, CC1, CC2, SBU1, SBU2, SHIELD\n#\n# 2. Place AMS1117-3.3 regulator:\n#    Press A > search "AMS1117-3.3"\n#    Library: Regulator_Linear > AMS1117-3.3\n#    Pins: VIN, VOUT, GND (+ tab = GND)\n#\n# 3. Place CC pull-down resistors (2x):\n#    Press A > "R" > Device:R\n#    Set value: 5.1k (both)\n#    Wire CC1 through R1 to GND\n#    Wire CC2 through R2 to GND\n#\n# 4. Place capacitors:\n#    C1: 100uF electrolytic — VIN to GND (regulator input)\n#    C2: 100nF ceramic — VIN to GND (bypass, close to regulator)\n#    C3: 100uF electrolytic — VOUT to GND (regulator output)\n#    C4: 100nF ceramic — VOUT to GND (bypass, close to regulator)\n#\n# 5. Place output header:\n#    Press A > search "Conn_01x06"\n#    Pins: 3.3V, 5V (VBUS), D+, D-, GND, GND\n#\n# 6. Wire everything:\n#    VBUS --> VIN (AMS1117) --> Pin 2 (5V out)\n#    VOUT --> Pin 1 (3.3V out)\n#    D+ --> Pin 3, D- --> Pin 4\n#    GND --> Pins 5 and 6',
                language: 'Bash',
                tip: '<strong>USB-C has two CC pins.</strong> Both CC1 and CC2 need their own individual 5.1k resistor to GND. Do not tie CC1 and CC2 together and share one resistor &mdash; the host uses them independently to detect cable orientation and negotiate power.'
            },
            {
                title: 'Assign Footprints and Update to PCB',
                content: '<p>Assign physical footprints to each component. The USB-C connector footprint must match the specific part you plan to solder. The regulator uses an SOT-223 package, which has a large tab pad for heat dissipation.</p>',
                code: '# Footprint assignments (Tools > Assign Footprints):\n#\n# USB_C_Receptacle_USB2.0:\n#   Connector_USB:USB_C_Receptacle_GCT_USB4085\n#   (16-pin mid-mount, common and easy to hand-solder)\n#   Alternative: USB_C_Receptacle_HRO_TYPE-C-31-M-12\n#\n# AMS1117-3.3:\n#   Package_TO_SOT_SMD:SOT-223-3_TabPin2\n#   (Tab is connected to VOUT for heat sinking)\n#\n# R1, R2 (5.1k CC resistors):\n#   Resistor_SMD:R_0805_2012Metric\n#\n# C1, C3 (100uF electrolytic):\n#   Capacitor_SMD:CP_Elec_5x5.3\n#   (SMD aluminum electrolytic, 5mm diameter)\n#\n# C2, C4 (100nF ceramic):\n#   Capacitor_SMD:C_0805_2012Metric\n#\n# J2 (output header 1x6):\n#   Connector_PinHeader_2.54mm:PinHeader_1x06_P2.54mm_Vertical\n#\n# After assigning:\n# Tools > Update PCB from Schematic (F8)\n# Click "Update PCB" to push all components to the board editor',
                language: 'Bash',
                tip: '<strong>SOT-223 tab pad:</strong> On the AMS1117, the large metal tab on the back is electrically connected to pin 2 (VOUT). This tab also acts as a heatsink. In the PCB layout, connect the tab pad to a copper pour or large copper area for thermal relief. Without adequate copper area, the regulator will overheat under load.'
            },
            {
                title: 'Layout the PCB and Route Traces',
                content: '<p>Arrange components logically: USB-C connector at the board edge, regulator near center with its capacitors close by, output header on the opposite edge. Route power traces wider than signal traces.</p>',
                code: '# PCB layout strategy:\n#\n# 1. Board outline:\n#    Place > Add Board Outline (Edge.Cuts)\n#    Recommended size: 25mm x 20mm\n#    The USB-C connector overhangs the board edge by ~1mm\n#\n# 2. Component placement:\n#    USB-C connector: centered on left edge, pins facing inward\n#    C2 (100nF): within 3mm of VIN pin\n#    AMS1117: center of board, tab facing right\n#    C4 (100nF): within 3mm of VOUT pin\n#    C1, C3 (electrolytics): near regulator, input and output sides\n#    J2 (header): right edge of board\n#\n# 3. Trace widths:\n#    Power traces (VBUS, 3.3V, GND): 0.5mm minimum (1.0mm preferred)\n#    Signal traces (D+, D-): 0.25mm\n#    CC resistor traces: 0.25mm\n#\n# 4. Ground pour:\n#    Add copper zone on B.Cu (back copper) connected to GND\n#    This provides a ground plane and thermal relief\n#    Place > Add Copper Zone > select GND net > draw around board outline\n#\n# 5. DRC:\n#    Inspect > Design Rules Check > Run DRC\n#    Fix all errors before exporting Gerbers\n#\n# 6. Export Gerbers:\n#    File > Fabrication Outputs > Gerbers\n#    Include all layers + drill file',
                language: 'Bash',
                tip: '<strong>Keep D+ and D- traces equal length.</strong> Even at USB 2.0 speeds (480 Mbps max), matched-length data pairs reduce signal integrity issues. Route D+ and D- as a parallel pair with the same length and keep them away from noisy power traces. For a breakout board this is less critical, but it builds good habits for future USB designs.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Schematic: USB-C receptacle with 5.1k pull-downs on CC1 and CC2</li>' +
                 '<li>AMS1117-3.3 with input/output electrolytics and bypass ceramics</li>' +
                 '<li>6-pin header breaking out 3.3V, 5V, D+, D&minus;, GND, GND</li>' +
                 '<li>ERC passes with 0 errors</li>' +
                 '<li>PCB fits within 25mm x 20mm, USB-C connector at board edge</li>' +
                 '<li>Power traces 0.5mm+ wide, ground pour on back copper</li>' +
                 '<li>Bypass caps within 3mm of regulator VIN and VOUT pins</li>' +
                 '<li>DRC passes with 0 errors</li>' +
                 '<li>After fabrication: plug into USB-C charger, measure 5V on VBUS header, 3.3V on regulated output</li>' +
                 '<li>Current draw with no load: &lt;5mA (regulator quiescent current)</li>' +
                 '</ul>' +
                 '<p>This breakout board is a workhorse &mdash; you will use it on nearly every microcontroller project. The techniques here (USB-C CC negotiation, LDO regulation, decoupling strategy, power trace sizing) apply to every powered PCB design.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>USB-C cable does not provide 5V:</strong> The 5.1k pull-down resistors on CC1 and CC2 are mandatory. Without them, a USB-C host will not enable VBUS power delivery. Verify the resistors are connected between each CC pin and GND. Measure the CC pins with a multimeter &mdash; they should read near 0V when the cable is disconnected and ~0.2&ndash;0.7V when connected to a host.</li>' +
                         '<li><strong>3.3V output is 0V or unstable:</strong> Check the AMS1117-3.3 orientation &mdash; the tab/heatsink side indicates pin 1. Swapping input and output produces 0V output. Also verify the input capacitor (10uF electrolytic) is present and correctly polarized. Missing input capacitance causes the LDO to oscillate.</li>' +
                         '<li><strong>USB-C connector pads delaminate during soldering:</strong> USB-C footprints have very fine-pitch pads. Use flux generously, a fine tip (conical or chisel &lt;1mm), and minimal solder. If a pad lifts, the board is likely unrecoverable &mdash; order a replacement. Practice on a scrap board first.</li>' +
                         '<li><strong>Short between VBUS and GND:</strong> USB-C connectors have many closely spaced pins. After soldering, inspect under magnification for solder bridges between adjacent pins. Use solder wick to remove bridges, then test continuity between VBUS and GND before applying power.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Add USB Data LEDs</strong> &mdash; Add two LEDs (one for D+, one for D&minus;) with 1k series resistors to visually indicate data activity. The LEDs will flicker when USB data is being transmitted, giving you a visual protocol analyzer.</p>' +
                    '<p><strong>Challenge 2: USB Power Meter</strong> &mdash; Add an INA219 current/voltage sensor IC in series with VBUS to measure power consumption of connected devices. Break out SDA/SCL to the header for I2C readout by a microcontroller.</p>',

        commonMistakes: [
            {
                title: 'Missing CC Pull-Down Resistors',
                correct: 'Place 5.1k resistors from CC1 and CC2 to GND. These are mandatory for USB-C power negotiation and must be present on every USB-C device board.',
                incorrect: 'Omitting the CC pull-down resistors, assuming the USB-C host will provide power automatically.',
                consequence: 'The host assumes nothing is connected and does not enable VBUS. The board receives zero power. This is the single most common USB-C breakout board failure.'
            },
            {
                title: 'Power Traces Too Narrow',
                correct: 'Use 1mm+ traces for VBUS and GND power paths. Use the KiCad trace width calculator (Inspect > Board Statistics) to determine minimum width for your current requirements.',
                incorrect: 'Using default 0.25mm signal traces for USB VBUS and GND power paths.',
                consequence: 'A 0.25mm trace handles only ~0.5A before overheating. USB VBUS can deliver up to 3A at 5V, causing the trace to overheat, discolor the PCB, or burn through entirely under load.'
            },
            {
                title: 'No Capacitor on LDO Input',
                correct: 'Place both input and output capacitors on the LDO: at minimum a 10uF electrolytic plus a 100nF ceramic bypass on the input, and equivalent capacitors on the output.',
                incorrect: 'Omitting the input electrolytic capacitor on a linear regulator like the AMS1117.',
                consequence: 'The regulator oscillates, producing noisy or unstable output voltage that can damage sensitive ICs downstream or cause erratic microcontroller behavior.'
            }
        ]
    },

    // ========================================================================
    // SG-79: SMD Soldering Skills
    // ========================================================================
    'sg-79': {
        intro: '<p>Surface mount device (SMD) soldering is the single most important fabrication skill for modern PCB work. Nearly every component manufactured today comes in an SMD package, and many parts &mdash; especially microcontrollers, sensors, and RF ICs &mdash; are only available in surface mount. If you cannot solder SMD, you cannot build modern hardware.</p>' +
               '<p>This guide covers the three primary SMD soldering techniques: hand soldering with a fine-tip iron, hot air rework, and solder paste reflow. You will learn when to use each method, what equipment you need, and how to practice on a dedicated skills board.</p>' +
               '<p>By the end of this project, you will be able to hand-solder 0805 and 0603 passives, use hot air for QFP and QFN packages, and run a full reflow cycle with solder paste and a stencil. These skills unlock every advanced PCB project in this course.</p>',

        wiring: '    SMD Soldering Methods Overview\n' +
                '    \n' +
                '    Method 1: Hand Soldering         Method 2: Hot Air         Method 3: Reflow\n' +
                '    +---------------------+         +------------------+      +-------------------+\n' +
                '    | Fine-tip iron       |         | Hot air station  |      | Solder paste      |\n' +
                '    | Flux pen            |         | Flux paste       |      | Stencil + squeegee|\n' +
                '    | Fine solder (0.5mm) |         | Kapton tape      |      | Reflow oven/plate |\n' +
                '    | Tweezers            |         | Tweezers         |      | Pick-and-place    |\n' +
                '    +---------------------+         +------------------+      +-------------------+\n' +
                '    Best for:                       Best for:                 Best for:\n' +
                '    - 0805, 1206 passives           - QFP, QFN, BGA          - Full board assembly\n' +
                '    - SOT-23, SOT-223               - Rework / removal       - Production runs\n' +
                '    - Pin headers, connectors       - Thermal pads            - Consistent quality',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg79-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg79-solder{0%{opacity:0.3;r:2}50%{opacity:1;r:4}100%{opacity:0.3;r:2}}' +
            '.sg79-blob{animation:sg79-solder 1.8s ease-in-out infinite}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg79-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-79 SMD SOLDERING SKILLS</text>' +

            '<!-- Method 1: Hand Soldering -->' +
            '<rect x="30" y="50" width="200" height="165" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.2)" stroke-width="1"/>' +
            '<text x="130" y="70" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">HAND SOLDERING</text>' +

            '<!-- Iron tip -->' +
            '<line x1="60" y1="100" x2="120" y2="130" stroke="#8b949e" stroke-width="3" stroke-linecap="round"/>' +
            '<line x1="120" y1="130" x2="135" y2="137" stroke="#eab308" stroke-width="1.5" stroke-linecap="round"/>' +
            '<circle cx="135" cy="137" r="3" fill="#eab308" class="sg79-blob"/>' +

            '<!-- 0805 component pads -->' +
            '<rect x="100" y="140" width="16" height="10" rx="1" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.8"/>' +
            '<rect x="122" y="140" width="16" height="10" rx="1" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.8"/>' +
            '<rect x="110" y="141" width="18" height="8" rx="1" fill="#1e2736" stroke="#8b949e" stroke-width="0.5"/>' +
            '<text x="119" y="148" text-anchor="middle" fill="#8b949e" font-size="4">0805</text>' +

            '<text x="130" y="170" text-anchor="middle" fill="#8b949e" font-size="6">Tack one pad &rarr; place &rarr; solder other</text>' +
            '<text x="130" y="184" text-anchor="middle" fill="#ef4444" font-size="6">Iron: 350&deg;C, 1&ndash;2s contact</text>' +
            '<text x="130" y="198" text-anchor="middle" fill="#8b949e" font-size="6">Best: 0805, 1206, SOT-223</text>' +

            '<!-- Method 2: Hot Air -->' +
            '<rect x="250" y="50" width="200" height="165" rx="8" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.2)" stroke-width="1"/>' +
            '<text x="350" y="70" text-anchor="middle" fill="#f97316" font-size="9" font-weight="600">HOT AIR REWORK</text>' +

            '<!-- Hot air nozzle -->' +
            '<rect x="330" y="88" width="20" height="30" rx="3" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<circle cx="340" cy="84" r="4" fill="none" stroke="#f97316" stroke-width="1"/>' +
            '<!-- Heat waves -->' +
            '<path d="M332,120 Q336,128 332,136" fill="none" stroke="rgba(249,115,22,0.4)" stroke-width="1"/>' +
            '<path d="M340,120 Q344,128 340,136" fill="none" stroke="rgba(249,115,22,0.3)" stroke-width="1"/>' +
            '<path d="M348,120 Q352,128 348,136" fill="none" stroke="rgba(249,115,22,0.2)" stroke-width="1"/>' +

            '<!-- QFP package -->' +
            '<rect x="315" y="140" width="30" height="30" rx="2" fill="#1e2736" stroke="#f97316" stroke-width="1"/>' +
            '<text x="330" y="158" text-anchor="middle" fill="#f97316" font-size="5">QFP</text>' +
            '<!-- QFP pins -->' +
            '<line x1="312" y1="148" x2="315" y2="148" stroke="#8b949e" stroke-width="0.8"/>' +
            '<line x1="312" y1="152" x2="315" y2="152" stroke="#8b949e" stroke-width="0.8"/>' +
            '<line x1="312" y1="156" x2="315" y2="156" stroke="#8b949e" stroke-width="0.8"/>' +
            '<line x1="312" y1="160" x2="315" y2="160" stroke="#8b949e" stroke-width="0.8"/>' +
            '<line x1="345" y1="148" x2="348" y2="148" stroke="#8b949e" stroke-width="0.8"/>' +
            '<line x1="345" y1="152" x2="348" y2="152" stroke="#8b949e" stroke-width="0.8"/>' +
            '<line x1="345" y1="156" x2="348" y2="156" stroke="#8b949e" stroke-width="0.8"/>' +
            '<line x1="345" y1="160" x2="348" y2="160" stroke="#8b949e" stroke-width="0.8"/>' +

            '<text x="350" y="188" text-anchor="middle" fill="#8b949e" font-size="6">Flux paste &rarr; heat &rarr; reflow</text>' +
            '<text x="350" y="200" text-anchor="middle" fill="#f97316" font-size="6">Air: 350&ndash;400&deg;C, 40&ndash;60%</text>' +

            '<!-- Method 3: Reflow -->' +
            '<rect x="470" y="50" width="220" height="165" rx="8" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.2)" stroke-width="1"/>' +
            '<text x="580" y="70" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="600">SOLDER PASTE REFLOW</text>' +

            '<!-- Stencil -->' +
            '<rect x="510" y="90" width="80" height="8" rx="1" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<rect x="528" y="91" width="8" height="6" rx="0.5" fill="none" stroke="#a855f7" stroke-width="0.5"/>' +
            '<rect x="544" y="91" width="8" height="6" rx="0.5" fill="none" stroke="#a855f7" stroke-width="0.5"/>' +
            '<rect x="560" y="91" width="8" height="6" rx="0.5" fill="none" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="600" y="97" fill="#a855f7" font-size="5">Stencil</text>' +

            '<!-- PCB with paste -->' +
            '<rect x="510" y="104" width="80" height="8" rx="1" fill="rgba(34,197,94,0.08)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<rect x="528" y="105" width="8" height="6" rx="0.5" fill="rgba(168,85,247,0.5)"/>' +
            '<rect x="544" y="105" width="8" height="6" rx="0.5" fill="rgba(168,85,247,0.5)"/>' +
            '<rect x="560" y="105" width="8" height="6" rx="0.5" fill="rgba(168,85,247,0.5)"/>' +
            '<text x="600" y="111" fill="#8b949e" font-size="5">Paste applied</text>' +

            '<!-- Reflow profile -->' +
            '<text x="580" y="130" text-anchor="middle" fill="#c084fc" font-size="6">Reflow Temperature Profile</text>' +
            '<polyline points="510,175 530,175 545,160 570,160 582,140 595,160 620,175 650,175" fill="none" stroke="#a855f7" stroke-width="1.5"/>' +
            '<text x="520" y="185" fill="#8b949e" font-size="4">Preheat</text>' +
            '<text x="555" y="155" fill="#8b949e" font-size="4">Soak</text>' +
            '<text x="582" y="135" fill="#ef4444" font-size="4">Reflow</text>' +
            '<text x="620" y="185" fill="#8b949e" font-size="4">Cool</text>' +

            '<text x="580" y="200" text-anchor="middle" fill="#8b949e" font-size="6">Full board assembly &bull; Production</text>' +

            '<!-- Component size comparison -->' +
            '<rect x="30" y="230" width="660" height="150" rx="8" fill="rgba(34,197,94,0.03)" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
            '<text x="360" y="250" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">SMD PACKAGE SIZE COMPARISON (to scale)</text>' +

            '<!-- 1206 -->' +
            '<rect x="80" y="275" width="48" height="24" rx="2" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="104" y="291" text-anchor="middle" fill="#3b82f6" font-size="7">1206</text>' +
            '<text x="104" y="315" text-anchor="middle" fill="#8b949e" font-size="5">3.2 x 1.6mm</text>' +
            '<text x="104" y="326" text-anchor="middle" fill="#22c55e" font-size="5">Easy hand</text>' +

            '<!-- 0805 -->' +
            '<rect x="190" y="279" width="30" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="205" y="291" text-anchor="middle" fill="#22c55e" font-size="7">0805</text>' +
            '<text x="205" y="315" text-anchor="middle" fill="#8b949e" font-size="5">2.0 x 1.25mm</text>' +
            '<text x="205" y="326" text-anchor="middle" fill="#22c55e" font-size="5">Beginner SMD</text>' +

            '<!-- 0603 -->' +
            '<rect x="295" y="281" width="24" height="12" rx="1" fill="rgba(249,115,22,0.15)" stroke="#f97316" stroke-width="1"/>' +
            '<text x="307" y="291" text-anchor="middle" fill="#f97316" font-size="6">0603</text>' +
            '<text x="307" y="315" text-anchor="middle" fill="#8b949e" font-size="5">1.6 x 0.8mm</text>' +
            '<text x="307" y="326" text-anchor="middle" fill="#f97316" font-size="5">Tweezers req</text>' +

            '<!-- 0402 -->' +
            '<rect x="395" y="283" width="16" height="8" rx="1" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="403" y="291" text-anchor="middle" fill="#ef4444" font-size="6">0402</text>' +
            '<text x="403" y="315" text-anchor="middle" fill="#8b949e" font-size="5">1.0 x 0.5mm</text>' +
            '<text x="403" y="326" text-anchor="middle" fill="#ef4444" font-size="5">Reflow only</text>' +

            '<!-- SOT-23 -->' +
            '<rect x="475" y="278" width="30" height="18" rx="2" fill="rgba(234,179,8,0.15)" stroke="#eab308" stroke-width="1"/>' +
            '<line x1="480" y1="296" x2="480" y2="302" stroke="#8b949e" stroke-width="0.6"/>' +
            '<line x1="490" y1="296" x2="490" y2="302" stroke="#8b949e" stroke-width="0.6"/>' +
            '<line x1="500" y1="296" x2="500" y2="302" stroke="#8b949e" stroke-width="0.6"/>' +
            '<text x="490" y="291" text-anchor="middle" fill="#eab308" font-size="6">SOT-23</text>' +
            '<text x="490" y="315" text-anchor="middle" fill="#8b949e" font-size="5">2.9 x 1.3mm</text>' +
            '<text x="490" y="326" text-anchor="middle" fill="#eab308" font-size="5">3-pin transistor</text>' +

            '<!-- QFP -->' +
            '<rect x="570" y="272" width="30" height="30" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="585" y="291" text-anchor="middle" fill="#a855f7" font-size="6">QFP</text>' +
            '<text x="585" y="315" text-anchor="middle" fill="#8b949e" font-size="5">0.5mm pitch</text>' +
            '<text x="585" y="326" text-anchor="middle" fill="#a855f7" font-size="5">Hot air / drag</text>' +

            '<!-- Solder joint callout -->' +
            '<text x="360" y="360" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">GOOD JOINT: smooth, concave fillet, shiny surface</text>' +
            '<text x="360" y="374" text-anchor="middle" fill="#ef4444" font-size="7">BAD JOINT: dull, grainy, balled up, or bridged &mdash; reflow with flux</text>' +

            '</svg>' +
            '</div>',

        wiringNotes: '<p><strong>Flux is not optional.</strong> Every SMD soldering technique requires flux. For hand soldering, use a flux pen or liquid flux. For hot air, use tacky flux paste. For reflow, the solder paste already contains flux. Without flux, solder will not flow properly, joints will be cold or bridged, and you will waste hours on rework.</p>' +
                     '<p><strong>Temperature matters.</strong> Lead-free solder (SAC305) melts at 217&deg;C; leaded solder (63/37 Sn/Pb) melts at 183&deg;C. Set your iron tip to 350&deg;C for hand soldering (brief contact) or 300&deg;C for extended work. Hot air should be 350&ndash;400&deg;C with medium airflow. Reflow ovens follow a specific temperature profile: preheat, soak, reflow, cool.</p>' +
                     '<p><strong>Practice boards exist for a reason.</strong> Do not learn SMD soldering on your expensive project board. Order dedicated SMD practice kits (search "SMD soldering practice board" on Amazon or AliExpress) that have rows of 0805, 0603, and 0402 pads with cheap components.</p>',

        steps: [
            {
                title: 'Set Up Your SMD Soldering Station',
                content: '<p>A proper SMD workstation requires more than just a soldering iron. You need magnification, good lighting, fine-tip tools, and flux. Invest in these tools once and they will serve you for years.</p>',
                code: '# Essential SMD soldering equipment:\n#\n# Soldering iron with fine tips:\n#   Recommended: Pinecil V2 ($26) or Hakko FX-888D ($100)\n#   Tips: conical 0.5mm (for fine pitch)\n#         chisel 1.5mm (for drag soldering)\n#         knife tip (for drag soldering QFP)\n#\n# Hot air station:\n#   Recommended: Quick 861DW ($80) or Hakko FR-810 ($350)\n#   Nozzles: 5mm, 8mm, 12mm round\n#\n# Consumables:\n#   Solder wire: 0.5mm diameter, 63/37 or SAC305\n#   Solder paste: Mechanic XG-50 (Sn63/Pb37) in syringe\n#   Flux pen: Kester #951 or MG Chemicals 8341\n#   Flux paste: Amtech NC-559-V2 (for hot air work)\n#   Solder wick: 2mm width for cleanup\n#   IPA (isopropyl alcohol 99%) + brush for flux cleanup\n#\n# Tools:\n#   ESD tweezers: straight and curved tip\n#   Magnification: USB microscope ($30+) or stereo microscope\n#   Helping hands or PCB holder (Omnifixo or Quadhands)\n#   Kapton tape (heat-resistant masking)\n#   Silicone soldering mat\n\n# Tip temperature guide:\n# Hand soldering: 350°C (quick touch) / 300°C (extended)\n# Hot air: 350-400°C, medium airflow (40-60%)\n# Reflow: follow paste datasheet profile',
                language: 'Bash',
                tip: '<strong>USB microscope is a game-changer.</strong> You cannot inspect SMD joints with the naked eye. A $30 USB microscope (Andonstar, Mustool) connected to your laptop lets you see solder bridges, cold joints, and tombstoned parts that are invisible otherwise. This single tool will save you more debugging time than anything else on this list.'
            },
            {
                title: 'Hand Solder 0805 and 0603 Components',
                content: '<p>Hand soldering SMD passives follows a specific sequence: tin one pad, place the component, solder the other pad, then reflow the first pad. This "tack and solder" technique works for all two-terminal SMD components.</p>',
                code: '# Hand soldering 0805/0603 step-by-step:\n#\n# 1. Apply flux to both pads with flux pen\n#\n# 2. Tin ONE pad (usually the left one):\n#    - Touch iron tip to pad\n#    - Feed a tiny amount of solder to the pad\n#    - Remove iron — you should have a small dome of solder\n#\n# 3. Place the component:\n#    - Hold component with tweezers in your non-dominant hand\n#    - Position it next to the tinned pad, aligned with both pads\n#    - Touch iron to the tinned pad while pushing component into place\n#    - Remove iron — component is now tacked in position\n#    - Verify alignment under magnification\n#\n# 4. Solder the OTHER pad:\n#    - Touch iron to the un-soldered pad and component end\n#    - Feed solder wire — it should flow onto both pad and component\n#    - Remove iron\n#\n# 5. Reflow the first pad:\n#    - Touch iron briefly to the first pad to reflow the joint\n#    - Add a tiny bit more solder if needed\n#\n# 6. Inspect under microscope:\n#    - Both ends should have smooth, concave fillets\n#    - No solder bridges between adjacent pads\n#    - Component should be flat on the board (not tombstoned)\n#\n# 7. Clean flux residue:\n#    - Brush IPA over the joints with a small brush\n#    - Let dry\n\n# Common defects and fixes:\n# Tombstone (component stands up): Too much solder on first pad, or\n#   heated only one end. Reflow both pads.\n# Solder bridge: Too much solder. Use solder wick to remove excess.\n# Cold joint (dull, grainy): Not enough heat. Reflow with flux.',
                language: 'Bash',
                tip: '<strong>The key to SMD hand soldering is time on pad.</strong> Touch the iron to the pad for 1&ndash;2 seconds, feed solder, remove. If you linger for 5+ seconds, you will damage the pad, lift the trace, or overheat nearby components. Fast, deliberate contact with proper flux produces the best joints.'
            },
            {
                title: 'Hot Air Soldering for QFP and Multi-Pin Packages',
                content: '<p>Hot air soldering heats the entire component and surrounding area simultaneously, allowing all pins to reflow at once. This is essential for QFP (quad flat pack) ICs with dozens of fine-pitch pins, and for QFN packages with hidden ground pads underneath.</p>',
                code: '# Hot air soldering a QFP IC:\n#\n# 1. Preparation:\n#    - Apply tacky flux paste to all pads (generous amount)\n#    - If pads are pre-tinned from manufacturing, no extra solder needed\n#    - If bare copper, apply thin solder paste with syringe or toothpick\n#    - Mask nearby components with Kapton tape if they might reflow\n#\n# 2. Place the IC:\n#    - Align pin 1 marking (dot/notch) with pin 1 pad on PCB\n#    - Use tweezers to position the IC — all pins should line up\n#    - Under magnification, verify pin alignment on all 4 sides\n#\n# 3. Hot air settings:\n#    - Temperature: 380-400°C\n#    - Airflow: 40-50% (too high blows components away)\n#    - Nozzle: match IC size (use round nozzle slightly larger)\n#\n# 4. Reflow:\n#    - Hold nozzle 2-3cm above the IC\n#    - Move in slow circular pattern covering all pins\n#    - Watch the solder — when it melts, the IC will visibly\n#      "snap" into alignment (surface tension self-centers it)\n#    - Total heat time: 30-60 seconds\n#    - Remove heat immediately once reflowed\n#\n# 5. Inspect under microscope:\n#    - Check each pin for proper wetting\n#    - Look for solder bridges between pins\n#    - Fix bridges: add flux, drag soldering iron tip across pins\n#\n# Hot air IC REMOVAL:\n#    - Apply flux around all pins\n#    - Heat from above at 400°C, 50% airflow\n#    - When solder melts, gently lift IC with tweezers\n#    - Clean pads with solder wick + flux before placing new IC',
                language: 'Bash',
                tip: '<strong>Watch for the "snap."</strong> When solder paste reflows under a well-aligned IC, surface tension pulls the chip into perfect alignment. If the IC does not snap into place, either the solder has not fully melted (more heat needed) or the IC is misaligned by more than half a pad width (reposition and try again).'
            },
            {
                title: 'Solder Paste Stencil and Reflow Soldering',
                content: '<p>For boards with many SMD components, solder paste with a stencil is the fastest and most consistent method. You apply paste to all pads at once using a laser-cut stencil, place all components, then reflow the entire board in one cycle. This is how professional PCB assembly works.</p>',
                code: '# Solder paste stencil workflow:\n#\n# 1. Order a stencil with your PCB:\n#    - JLCPCB, PCBWay, and OSH Stencils offer laser-cut stainless\n#      steel stencils for $5-15\n#    - When ordering Gerbers, add the F.Paste layer to generate\n#      the stencil file (solder paste apertures)\n#    - Stencil thickness: 0.12mm for fine-pitch, 0.15mm standard\n#\n# 2. Apply solder paste:\n#    - Tape PCB to flat surface with Kapton tape\n#    - Align stencil over PCB — apertures must line up with pads\n#    - Tape stencil in place (hinged on one side for repeatability)\n#    - Apply solder paste bead along one edge of stencil\n#    - Squeegee paste across stencil at 45° angle, firm pressure\n#    - ONE pass — do not go back and forth\n#    - Carefully lift stencil straight up\n#    - Inspect: each pad should have a clean rectangle of paste\n#\n# 3. Place components:\n#    - Use tweezers to place each component on its pads\n#    - Press gently into the paste — it is tacky and holds parts\n#    - Work from smallest (0402) to largest (ICs, connectors)\n#    - Do not bump placed components\n#\n# 4. Reflow:\n#    Option A — Hot plate (MHP30, $50):\n#      Set to 220°C (leaded) or 250°C (lead-free)\n#      Place board on plate, watch paste change from grey to shiny\n#      Remove when all joints have reflowed (~3-4 minutes)\n#\n#    Option B — Reflow oven (modified toaster oven):\n#      Follow paste temperature profile:\n#      Preheat: ramp to 150°C over 90 seconds\n#      Soak: hold 150-180°C for 60 seconds\n#      Reflow: ramp to 230°C (leaded) or 250°C (lead-free)\n#      Hold peak for 10-20 seconds\n#      Cool: open door, ramp down\n#\n# 5. Inspect and touch up:\n#    - Check all joints under microscope\n#    - Touch up cold joints or bridges with iron',
                language: 'Bash',
                tip: '<strong>Solder paste has a shelf life.</strong> Most solder paste expires 6 months after opening and must be refrigerated (not frozen). Expired paste has oxidized flux that will not flow properly, causing tombstones and cold joints. Write the open date on the syringe and replace it when it expires. Room-temperature paste degrades within days.'
            }
        ],

        testing: '<p><strong>Skills verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Hand solder: 10 consecutive 0805 resistors with proper fillets, no bridges, no tombstones</li>' +
                 '<li>Hand solder: 5 consecutive 0603 resistors cleanly</li>' +
                 '<li>Drag solder: one QFP (TQFP-32 or similar) with no bridges under microscope inspection</li>' +
                 '<li>Hot air: remove and replace one QFP IC without damaging the PCB</li>' +
                 '<li>Solder paste: apply paste through stencil with consistent pad coverage</li>' +
                 '<li>Reflow: complete board assembly via hot plate or oven with &gt;95% good joints</li>' +
                 '<li>All joints pass visual inspection: smooth, shiny, concave fillets</li>' +
                 '<li>No flux residue remaining after IPA cleanup</li>' +
                 '</ul>' +
                 '<p>SMD soldering is a manual skill that improves with practice. The first 50 joints will be rough. By 200 joints you will be competent. By 1000 joints you will be fast. Every hardware project from here on requires these skills &mdash; invest the practice time now.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Solder will not flow onto pads:</strong> The pads are oxidized or contaminated. Apply flux paste directly to the pads before soldering. If the pads still reject solder, gently scrub them with a fiberglass pen to remove the oxide layer, then apply flux and try again. Never use sandpaper &mdash; it can damage traces.</li>' +
                         '<li><strong>Tombstoning (component stands up on one end):</strong> Uneven solder paste or uneven heating causes one pad to wet before the other, and surface tension pulls the component vertical. Fix: apply equal solder to both pads, use a hot air gun to reflow both sides simultaneously, or tack one end first with a soldering iron then solder the other end.</li>' +
                         '<li><strong>Solder bridges between IC pins:</strong> Too much solder was applied. Add flux across the bridged pins and drag a clean iron tip across them from one end to the other. The flux helps solder flow to the pads and away from the gaps. For stubborn bridges, use solder wick pressed against the bridge with a hot iron.</li>' +
                         '<li><strong>Component moves during hot air rework:</strong> Hot air can blow lightweight components off their pads. Use a lower airflow setting, hold the component with tweezers, and heat from a wider distance. Alternatively, tack one end with a soldering iron first for stability.</li>' +
                         '<li><strong>Cold joints (dull, grainy appearance):</strong> The joint did not reach proper reflow temperature. Reheat with the iron tip and add a small amount of fresh solder (which contains flux). A good joint is smooth, shiny, and has a concave fillet shape.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: 0402 Component Race</strong> &mdash; Solder ten 0402 (1.0mm x 0.5mm) resistors in a row as fast as you can with clean fillets. Time yourself. Professional rework technicians can do one 0402 joint in under 5 seconds.</p>' +
                    '<p><strong>Challenge 2: QFN Soldering</strong> &mdash; Solder a QFN (Quad Flat No-leads) package. QFN has pads underneath the IC with no visible leads &mdash; it requires solder paste and hot air or a reflow oven. This is the most challenging common SMD package.</p>' +
                    '<p><strong>Challenge 3: BGA Inspection</strong> &mdash; Practice removing and reballing a BGA (Ball Grid Array) component. This requires a stencil, solder balls, and precise hot air technique. BGA rework is an advanced skill used in board-level repair.</p>',

        commonMistakes: [
            {
                title: 'Using a Tip That Is Too Large',
                correct: 'Use a conical tip (0.5mm) or fine chisel tip (1mm) for 0805 and smaller components. The tip should be narrower than the pad you are soldering to.',
                incorrect: 'Using a chisel tip designed for through-hole work on SMD pads.',
                consequence: 'The oversized tip contacts multiple pads simultaneously, creating solder bridges between adjacent pins and making precise placement impossible.'
            },
            {
                title: 'Insufficient Flux',
                correct: 'Apply liquid or paste flux before every SMD joint. When encountering bridges or cold joints, add more flux as the first troubleshooting step.',
                incorrect: 'Attempting SMD soldering without flux, or applying flux only once and expecting it to last through multiple joints.',
                consequence: 'Solder will not wet properly to oxidized pads, producing cold joints, solder bridges, and tombstoned components that require time-consuming rework.'
            },
            {
                title: 'Soldering Iron Temperature Too High',
                correct: 'Use 320-350 degrees Celsius for lead-free solder and 300-320 degrees Celsius for leaded. Let the flux do the work, not raw heat.',
                incorrect: 'Setting the iron to 400+ degrees Celsius thinking higher temperature means faster soldering.',
                consequence: 'Excessive heat burns flux instantly (eliminating its cleaning action), lifts copper pads from the substrate, and causes thermal damage to components, especially sensitive ICs and LEDs.'
            }
        ]
    },

    // ========================================================================
    // SG-80: Bench Power Supply
    // ========================================================================
    'sg-80': {
        intro: '<p>A variable bench power supply is one of the most useful tools on any electronics workbench. Commercial units cost $50&ndash;$300, but designing your own teaches fundamental power electronics: voltage regulation, current limiting, heat dissipation, and PCB layout for power circuits.</p>' +
               '<p>In this project you will design a variable voltage power supply PCB based on the LM317 adjustable voltage regulator. The LM317 outputs 1.25V to 37V depending on a resistor divider, and includes built-in current limiting and thermal shutdown. Your board will accept 12V DC input and output a user-adjustable voltage from 1.25V to ~10V, with a current capacity of up to 1.5A.</p>' +
               '<p>You will learn power PCB layout techniques: wide traces for high current, thermal relief pads, heatsink mounting, and proper grounding for low-noise output.</p>',

        wiring: '    LM317 Variable Power Supply Circuit\n' +
                '    \n' +
                '    DC Input (12V)     LM317 Regulator         Output\n' +
                '    +---------+       +---+------+---+       +--------+\n' +
                '    | DC Jack |------>|VIN|      |VOUT|----->| V+  OUT|\n' +
                '    |   12V   |   +---|   | ADJ  |   |---+  | Binding|\n' +
                '    +---------+   |   +---+--+---+---+   |  | Posts  |\n' +
                '                  |          |           |  +--------+\n' +
                '              [C1 470uF]  [R1 240]    [C3 100uF]\n' +
                '                  |          |           |\n' +
                '                  |     [R2 POT 5k]  [C4 100nF]\n' +
                '                  |          |           |\n' +
                '                  +----GND---+-----------+\n' +
                '    \n' +
                '    Vout = 1.25 * (1 + R2/R1)\n' +
                '    R1 = 240 ohm (fixed)\n' +
                '    R2 = 0-5k pot --> Vout = 1.25V to ~27V (limited by VIN)',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg80-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<pattern id="sg80-copper" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="rgba(34,197,94,0.06)"/><line x1="0" y1="6" x2="6" y2="0" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/></pattern>' +
            '<style>' +
            '@keyframes sg80-flow{0%{stroke-dashoffset:24}100%{stroke-dashoffset:0}}' +
            '.sg80-current{animation:sg80-flow 1.2s linear infinite}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg80-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-80 BENCH POWER SUPPLY</text>' +

            '<!-- PCB board outline -->' +
            '<rect x="40" y="55" width="380" height="230" rx="6" fill="rgba(59,130,246,0.02)" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="230" y="48" text-anchor="middle" fill="#3b82f6" font-size="7">PCB &mdash; 60mm x 40mm</text>' +

            '<!-- Ground plane fill -->' +
            '<rect x="44" y="59" width="372" height="222" rx="4" fill="url(#sg80-copper)"/>' +

            '<!-- DC jack J1 -->' +
            '<rect x="52" y="110" width="40" height="50" rx="4" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<circle cx="72" cy="135" r="8" fill="none" stroke="#ef4444" stroke-width="1"/>' +
            '<circle cx="72" cy="135" r="3" fill="#ef4444" opacity="0.4"/>' +
            '<text x="72" y="100" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">J1</text>' +
            '<text x="72" y="170" text-anchor="middle" fill="#8b949e" font-size="5">DC 12V IN</text>' +

            '<!-- Protection diode D2 -->' +
            '<polygon points="108,125 108,145 120,135" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1"/>' +
            '<line x1="120" y1="125" x2="120" y2="145" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="114" y="118" text-anchor="middle" fill="#8b949e" font-size="5">D2</text>' +

            '<!-- Input capacitors -->' +
            '<rect x="130" y="165" width="28" height="14" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="144" y="175" text-anchor="middle" fill="#c084fc" font-size="5">C1 470uF</text>' +
            '<rect x="164" y="165" width="20" height="14" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="174" y="175" text-anchor="middle" fill="#c084fc" font-size="4">C2 100nF</text>' +

            '<!-- LM317 regulator -->' +
            '<rect x="165" y="105" width="80" height="50" rx="4" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="205" y="122" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">LM317T</text>' +
            '<text x="205" y="135" text-anchor="middle" fill="#8b949e" font-size="6">TO-220</text>' +
            '<text x="170" y="150" fill="#8b949e" font-size="5">VIN</text>' +
            '<text x="224" y="150" fill="#8b949e" font-size="5">VOUT</text>' +
            '<text x="196" y="163" fill="#8b949e" font-size="5">ADJ</text>' +

            '<!-- Heatsink behind LM317 -->' +
            '<rect x="175" y="80" width="60" height="20" rx="2" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<line x1="180" y1="82" x2="180" y2="98" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<line x1="190" y1="82" x2="190" y2="98" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<line x1="200" y1="82" x2="200" y2="98" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<line x1="210" y1="82" x2="210" y2="98" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<line x1="220" y1="82" x2="220" y2="98" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<line x1="230" y1="82" x2="230" y2="98" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="205" y="74" text-anchor="middle" fill="rgba(239,68,68,0.4)" font-size="5">HEATSINK</text>' +

            '<!-- R1 fixed resistor -->' +
            '<rect x="260" y="140" width="36" height="12" rx="2" fill="#1e2736" stroke="#eab308" stroke-width="1"/>' +
            '<text x="278" y="149" text-anchor="middle" fill="#eab308" font-size="5">R1 240&#x2126;</text>' +

            '<!-- R2 potentiometer -->' +
            '<circle cx="278" cy="200" r="14" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<line x1="278" y1="190" x2="268" y2="200" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="278" y="204" text-anchor="middle" fill="#eab308" font-size="5">R2 5k</text>' +
            '<text x="278" y="224" text-anchor="middle" fill="#8b949e" font-size="5">POT (adjust)</text>' +

            '<!-- Output capacitors -->' +
            '<rect x="310" y="165" width="28" height="14" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="324" y="175" text-anchor="middle" fill="#c084fc" font-size="5">C3 100uF</text>' +
            '<rect x="344" y="165" width="20" height="14" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="354" y="175" text-anchor="middle" fill="#c084fc" font-size="4">C4 100nF</text>' +

            '<!-- Output screw terminal -->' +
            '<rect x="370" y="110" width="36" height="50" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="388" y="100" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">J2</text>' +
            '<circle cx="380" cy="125" r="4" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="0.8"/>' +
            '<text x="380" y="128" text-anchor="middle" fill="#22c55e" font-size="4">V+</text>' +
            '<circle cx="380" cy="145" r="4" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="0.8"/>' +
            '<text x="380" y="148" text-anchor="middle" fill="#3b82f6" font-size="4">V&minus;</text>' +
            '<text x="388" y="170" text-anchor="middle" fill="#8b949e" font-size="5">OUTPUT</text>' +

            '<!-- Power trace — animated current flow -->' +
            '<path d="M92,135 L108,135" stroke="#ef4444" stroke-width="3" stroke-dasharray="4,4" class="sg80-current"/>' +
            '<path d="M120,135 L165,125" stroke="#ef4444" stroke-width="3" stroke-dasharray="4,4" class="sg80-current"/>' +
            '<path d="M245,125 L260,146" stroke="#eab308" stroke-width="1.5"/>' +
            '<path d="M296,146 L370,125" stroke="#22c55e" stroke-width="2" stroke-dasharray="4,4" class="sg80-current"/>' +

            '<!-- ADJ to pot wiring -->' +
            '<line x1="205" y1="155" x2="260" y2="146" stroke="#eab308" stroke-width="1"/>' +
            '<line x1="278" y1="152" x2="278" y2="186" stroke="#eab308" stroke-width="1"/>' +

            '<!-- LED indicator -->' +
            '<polygon points="348,130 356,145 340,145" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="0.8"/>' +
            '<text x="348" y="124" text-anchor="middle" fill="#22c55e" font-size="4">LED</text>' +

            '<!-- Formula box -->' +
            '<rect x="450" y="55" width="240" height="75" rx="8" fill="rgba(234,179,8,0.05)" stroke="rgba(234,179,8,0.2)" stroke-width="1"/>' +
            '<text x="570" y="75" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">LM317 FORMULA</text>' +
            '<text x="570" y="95" text-anchor="middle" fill="#eab308" font-size="10">Vout = 1.25 &times; (1 + R2/R1)</text>' +
            '<text x="570" y="112" text-anchor="middle" fill="#8b949e" font-size="7">R1=240&#x2126;, R2=0&ndash;5k&#x2126; &rarr; Vout=1.25&ndash;27V</text>' +
            '<text x="570" y="124" text-anchor="middle" fill="#ef4444" font-size="6">VIN=12V, dropout=2V &rarr; max Vout &asymp; 10V</text>' +

            '<!-- Heat dissipation box -->' +
            '<rect x="450" y="145" width="240" height="65" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="570" y="163" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">THERMAL DESIGN</text>' +
            '<text x="460" y="180" fill="#8b949e" font-size="6">P = (VIN &minus; VOUT) &times; I<tspan font-size="4">load</tspan></text>' +
            '<text x="460" y="194" fill="#8b949e" font-size="6">Worst case: (12&minus;1.25) &times; 1A = 10.75W</text>' +
            '<text x="460" y="206" fill="#ef4444" font-size="6">TO-220 heatsink REQUIRED above 1W</text>' +

            '<!-- Trace width guide -->' +
            '<rect x="450" y="225" width="240" height="65" rx="8" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="570" y="243" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">TRACE WIDTHS</text>' +
            '<text x="460" y="258" fill="#ef4444" font-size="6">&#9632; Power (VIN, VOUT, GND): 1.0&ndash;1.5mm</text>' +
            '<text x="460" y="272" fill="#eab308" font-size="6">&#9632; Adjustment (R1, R2): 0.25mm</text>' +
            '<text x="460" y="286" fill="#22c55e" font-size="6">&#9632; LED indicator: 0.25mm</text>' +

            '<!-- Board specs -->' +
            '<rect x="450" y="305" width="240" height="50" rx="8" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="570" y="323" text-anchor="middle" fill="#3b82f6" font-size="8" font-weight="600">BOARD SPECS</text>' +
            '<text x="460" y="338" fill="#8b949e" font-size="6">60mm x 40mm &bull; 2-layer FR4 &bull; 1oz copper</text>' +
            '<text x="460" y="350" fill="#8b949e" font-size="6">B.Cu ground plane &bull; M3 heatsink mounts</text>' +

            '</svg>' +
            '</div>',

        wiringNotes: '<p><strong>The LM317 formula:</strong> V<sub>out</sub> = 1.25 &times; (1 + R2/R1). With R1 = 240&#x2126; and a 5k&#x2126; potentiometer for R2, the output ranges from 1.25V (pot at 0) to approximately 27V (pot at max). Since VIN is 12V and the LM317 needs ~2V headroom (dropout voltage), the practical maximum output is about 10V.</p>' +
                     '<p><strong>Heat dissipation is critical.</strong> The LM317 is a linear regulator &mdash; it dissipates excess voltage as heat. Power dissipation = (VIN &minus; VOUT) &times; I<sub>load</sub>. At worst case (12V in, 1.25V out, 1A load), the regulator dissipates 10.75 watts. That requires a substantial heatsink. Design your PCB with a heatsink mounting area and thermal relief pads.</p>' +
                     '<p><strong>Capacitor placement:</strong> Input capacitor (470&mu;F) prevents oscillation from long input wires. Output capacitor (100&mu;F) smooths transient response. The 100nF ceramic on the output filters high-frequency noise. An optional 1&mu;F on the ADJ pin improves ripple rejection by 15&ndash;20dB.</p>',

        steps: [
            {
                title: 'Design the Schematic with LM317 and Supporting Components',
                content: '<p>Create the schematic with the LM317 regulator, input protection diode, adjustment potentiometer, filter capacitors, and output binding posts. Include an LED power indicator and current-sense resistor for visual feedback.</p>',
                code: '# Create project\nmkdir -p ~/pcb-projects/sg80-bench-psu\ncd ~/pcb-projects/sg80-bench-psu\n\n# KiCad Schematic — Component list:\n#\n# U1: LM317T (TO-220 package)\n#   Library: Regulator_Linear > LM317_TO-220\n#   Pins: VIN (input), VOUT (output), ADJ (adjust)\n#\n# D1: 1N5822 (Schottky input protection diode)\n#   Forward across VIN to VOUT — prevents output-to-input\n#   reverse current if input is disconnected under load\n#\n# D2: 1N4007 (reverse polarity protection on input)\n#   In series with DC jack input\n#\n# R1: 240 ohm (1%, metal film) — sets minimum output voltage\n#   Connected from VOUT to ADJ\n#\n# R2: 5k linear potentiometer — adjusts output voltage\n#   Connected from ADJ to GND\n#   Library: Device > R_Potentiometer\n#   Footprint: Potentiometer_THT:Potentiometer_Bourns_3296W_Vertical\n#\n# C1: 470uF/25V electrolytic — input filter\n# C2: 100nF ceramic — input bypass\n# C3: 100uF/25V electrolytic — output filter\n# C4: 100nF ceramic — output bypass\n# C5: 1uF ceramic — ADJ pin ripple rejection (optional)\n#\n# LED1: Power indicator LED with R3: 1k series resistor\n#   Connected from VOUT through R3 through LED to GND\n#\n# J1: DC barrel jack (2.1mm) — 12V input\n# J2: 2-pin screw terminal — output binding posts\n#\n# Wire the circuit following the wiring diagram above\n# Run ERC — should pass with 0 errors',
                language: 'Bash',
                tip: '<strong>Protection diode D1 is critical.</strong> If the output capacitor is larger than the input capacitor (which it sometimes is), disconnecting the input while the output is loaded can cause current to flow backward through the LM317, destroying it. D1 (1N5822 Schottky across output to input) provides a safe discharge path.'
            },
            {
                title: 'PCB Layout for Power Circuits',
                content: '<p>Power PCB layout requires wider traces, thermal considerations, and careful grounding. The LM317 in TO-220 needs a heatsink mount area, and high-current paths must use wide traces or copper pours.</p>',
                code: '# PCB layout for power supply:\n#\n# Board size: 60mm x 40mm (generous for thermal management)\n#\n# 1. Component placement:\n#    J1 (DC jack): left edge\n#    D2 (protection diode): near J1\n#    C1 (input cap): near LM317 VIN pin\n#    U1 (LM317): center of board, oriented for heatsink mounting\n#    R1, R2 (pot): near ADJ pin\n#    C3, C4 (output caps): near VOUT pin\n#    J2 (output terminal): right edge\n#    LED1, R3: near output for visibility\n#\n# 2. Trace widths for current:\n#    1.0A on external layer (1oz copper):\n#    - Minimum trace width: 0.5mm (conservative: 1.0mm)\n#    1.5A paths: use 1.5mm traces or copper pours\n#    Signal traces (LED, pot): 0.25mm is fine\n#\n# 3. Heatsink mounting:\n#    - LM317 TO-220 tab is electrically connected to VOUT\n#    - Add large copper area under/behind TO-220 for thermal relief\n#    - Add mounting holes (M3, 3.2mm) for bolt-on heatsink\n#    - If using insulating pad, copper area can be on separate net\n#\n# 4. Ground plane:\n#    - Bottom copper (B.Cu): full ground pour\n#    - Use thermal relief connections to ground pour\n#    - Keep ground pour continuous under the signal path\n#\n# 5. Silkscreen:\n#    - Label input polarity (+ / -) at J1\n#    - Label output polarity at J2\n#    - Add voltage formula: Vout = 1.25*(1+R2/R1)\n#    - Label trim pot direction (CW = higher voltage)\n#\n# 6. DRC: 0 errors, clearance 0.2mm minimum\n# 7. Export Gerbers for fabrication',
                language: 'Bash',
                tip: '<strong>Use a trace width calculator.</strong> The IPC-2221 standard defines minimum trace widths for a given current and copper weight. For 1oz copper on external layers: 0.5mm carries ~1A, 1.0mm carries ~2A, 2.0mm carries ~4A. These are conservative estimates. Online calculators (Saturn PCB Toolkit, KiCad built-in calculator) give exact values for your stack-up.'
            },
            {
                title: 'Assemble, Test, and Calibrate the Power Supply',
                content: '<p>After fabrication, assemble the board, verify operation with a multimeter, and calibrate the output voltage range. Test under load to verify thermal performance and stability.</p>',
                code: '# Assembly and testing procedure:\n#\n# 1. Solder components in order of height:\n#    a. SMD components first (if any): C2, C4 (0805 ceramics)\n#    b. Resistors: R1 (240 ohm), R3 (1k)\n#    c. Diodes: D1, D2 (watch polarity — cathode band)\n#    d. Capacitors: C1, C3 (watch polarity — stripe = negative)\n#    e. LED1 (long leg = anode = positive)\n#    f. Potentiometer R2\n#    g. LM317 in TO-220 (bolt heatsink on first)\n#    h. Connectors: J1 (DC jack), J2 (screw terminal)\n#\n# 2. Visual inspection:\n#    - Check all solder joints under magnification\n#    - Verify no solder bridges\n#    - Confirm diode and capacitor polarity\n#\n# 3. Smoke test (no load):\n#    - Set multimeter to DC voltage\n#    - Connect 12V DC adapter to J1\n#    - LED should light up\n#    - Measure voltage at J2 output\n#    - Turn pot: voltage should sweep from ~1.25V to ~10V\n#    - If no output: check D2 polarity, LM317 pinout, R1 value\n#\n# 4. Load test:\n#    - Set output to 5V\n#    - Connect a 10-ohm 5W power resistor as load (0.5A draw)\n#    - Verify voltage stays at 5V (+/- 50mV)\n#    - Check LM317 temperature: warm is OK, too-hot-to-touch = add bigger heatsink\n#    - P_dissipated = (12V - 5V) * 0.5A = 3.5W (heatsink required)\n#\n# 5. Calibration:\n#    - Mark pot positions for common voltages (3.3V, 5V, 9V)\n#    - Or replace pot with a multi-turn trimmer for fine adjustment\n#    - Optionally add a voltage display module (0.36" LED voltmeter, $1)',
                language: 'Bash',
                tip: '<strong>Linear regulators waste power as heat.</strong> The LM317 is simple and robust, but inefficient. At 12V in and 3.3V out with 1A load, it dissipates 8.7 watts as pure heat. For high-current or battery-powered applications, a switching regulator (buck converter) is far more efficient (85&ndash;95% vs. 40&ndash;60% for linear). Use linear regulators when you need low noise, simplicity, or low current.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Schematic: LM317 with R1/R2 divider, protection diodes, input/output caps</li>' +
                 '<li>ERC passes with 0 errors</li>' +
                 '<li>PCB layout: power traces 1mm+, heatsink mounting area, ground pour on B.Cu</li>' +
                 '<li>Silkscreen: input/output polarity labels, voltage formula</li>' +
                 '<li>DRC passes with 0 errors</li>' +
                 '<li>After assembly: output adjustable from 1.25V to ~10V with pot</li>' +
                 '<li>Voltage stable within 50mV under 0.5A load</li>' +
                 '<li>LM317 temperature manageable with heatsink at 1A load</li>' +
                 '<li>LED power indicator lights when powered</li>' +
                 '<li>Reverse polarity protection (D2) prevents damage from wrong-polarity input</li>' +
                 '</ul>' +
                 '<p>You have designed a real bench tool from scratch. The power electronics skills here &mdash; linear regulation, thermal management, trace sizing, protection circuitry &mdash; apply to every powered PCB project. Keep this board on your bench; you will use it constantly.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>Output voltage is unstable or oscillates:</strong> Missing or inadequate output capacitor. The LM317 requires a minimum 1uF electrolytic on the output for stability. Use 10uF or larger. Place the capacitor as close to the LM317 output pin as possible. Also check for loose potentiometer connections &mdash; an intermittent wiper contact causes voltage fluctuations.</li>' +
                         '<li><strong>LM317 overheats and shuts down:</strong> The dropout voltage (input minus output) multiplied by load current equals heat dissipation. At 12V in, 3.3V out, 1A load: (12-3.3) x 1 = 8.7W of heat. You need a heatsink rated for at least 10W. Bolt the heatsink securely with thermal paste. If the heatsink is too small, reduce the input voltage or switch to a buck converter for high-current applications.</li>' +
                         '<li><strong>Reverse polarity protection diode blows:</strong> The protection diode must be rated for the full input current. A 1N4001 handles only 1A &mdash; use a 1N5819 Schottky (1A, lower voltage drop) or 1N5822 (3A) for higher current applications. Also verify the diode is oriented correctly: cathode stripe toward the positive input terminal.</li>' +
                         '<li><strong>Output voltage does not match the calculated value:</strong> The LM317 output formula is V_out = 1.25 x (1 + R2/R1). Verify R1 is 240 ohm (standard value). Measure the actual resistance of your potentiometer at its current setting. Component tolerances (5% resistors) can shift the output by several percent &mdash; use 1% resistors for precision applications.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Current Limiting</strong> &mdash; Add a current sense resistor (0.1 ohm) in series with the output and an LM358 op-amp comparator to implement adjustable current limiting. This turns your power supply into a proper bench supply with both voltage and current control (CC/CV mode).</p>' +
                    '<p><strong>Challenge 2: Digital Readout</strong> &mdash; Add an Arduino Nano with an INA219 current/voltage sensor and a 0.96" OLED display to show real-time voltage, current, and power. Mount the display on the front panel for a professional look.</p>',

        commonMistakes: [
            {
                title: 'Input Capacitor Too Small or Missing',
                correct: 'Place a 100nF ceramic and a 10uF electrolytic directly at the LM317 input pin. The ceramic handles high-frequency noise; the electrolytic handles bulk energy storage.',
                incorrect: 'Omitting the input capacitor or placing an undersized one far from the LM317 input pin, especially with long input leads.',
                consequence: 'The LM317 oscillates, producing unstable output voltage with ripple and noise that can damage downstream components or cause erratic circuit behavior.'
            },
            {
                title: 'Power Traces Too Narrow for Load Current',
                correct: 'Use 1mm+ traces for all power paths (input, output, ground) on a 1A supply. Use the KiCad trace width calculator or the IPC-2221 formula to determine minimum width for your expected current.',
                incorrect: 'Using default 0.25mm signal traces for power paths carrying 1A or more.',
                consequence: 'A 0.25mm trace handles only ~0.5A before overheating. Under full load the trace acts as a fuse, discoloring the PCB, delaminating copper, or burning through entirely.'
            },
            {
                title: 'No Heatsink Mounting Area in PCB Layout',
                correct: 'Leave open board area behind the LM317 TO-220 package for the heatsink footprint. Add mounting holes for heatsink clips or bolts during PCB layout.',
                incorrect: 'Placing components directly behind the regulator, blocking heatsink installation.',
                consequence: 'The LM317 TO-220 package needs a heatsink at any significant load. Without one, the regulator enters thermal shutdown or is permanently damaged, and the power supply fails under load.'
            }
        ]
    },

    // ========================================================================
    // SG-81: I2C Sensor Board
    // ========================================================================
    'sg-81': {
        intro: '<p>I2C (Inter-Integrated Circuit) is the most common bus for connecting sensors to microcontrollers. With just two wires (SDA and SCL) plus power, you can connect dozens of sensors to a single microcontroller. This project designs a multi-sensor breakout board that combines temperature, humidity, and barometric pressure sensors on one PCB with proper pull-up resistors and decoupling.</p>' +
               '<p>The board uses three popular I2C sensors: the BME280 (temperature, humidity, pressure), the BH1750 (ambient light), and the APDS-9960 (gesture, proximity, color). Each sensor has a unique I2C address, so all three share the same two-wire bus without conflict.</p>' +
               '<p>You will learn I2C bus layout rules, pull-up resistor sizing, address conflict resolution, and how to design a board that connects cleanly to any microcontroller via a standard 4-pin header (VCC, GND, SDA, SCL).</p>',

        wiring: '    I2C Multi-Sensor Bus Layout\n' +
                '    \n' +
                '    MCU Header                 I2C Bus (shared)\n' +
                '    +----------+     4.7k      +--------+--------+--------+\n' +
                '    | VCC (3.3V)+------+--------|VCC     |VCC     |VCC     |\n' +
                '    |          |      |   |    |        |        |        |\n' +
                '    | SDA -----+------+---|----+SDA     |SDA     |SDA     |\n' +
                '    |          |          |    |BME280  |BH1750  |APDS9960|\n' +
                '    | SCL -----+----------+---+SCL     |SCL     |SCL     |\n' +
                '    |          |               |0x76    |0x23    |0x39    |\n' +
                '    | GND -----+-----------+--+GND     |GND     |GND     |\n' +
                '    +----------+           |   +--------+--------+--------+\n' +
                '                           |        |        |        |\n' +
                '                           +--------+--------+--------+\n' +
                '                          [100nF]  [100nF]  [100nF]',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg81-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg81-data{0%{stroke-dashoffset:20}100%{stroke-dashoffset:0}}' +
            '.sg81-bus{animation:sg81-data 1s linear infinite}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg81-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-81 I2C MULTI-SENSOR BOARD</text>' +

            '<!-- PCB board outline -->' +
            '<rect x="30" y="50" width="430" height="230" rx="6" fill="rgba(59,130,246,0.02)" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="245" y="44" text-anchor="middle" fill="#3b82f6" font-size="7">PCB &mdash; 30mm x 25mm</text>' +

            '<!-- MCU header J1 -->' +
            '<rect x="42" y="90" width="28" height="120" rx="3" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="56" y="84" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">J1</text>' +
            '<circle cx="56" cy="105" r="3" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="0.8"/>' +
            '<text x="38" y="108" text-anchor="end" fill="#ef4444" font-size="5">VCC</text>' +
            '<circle cx="56" cy="125" r="3" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="0.8"/>' +
            '<text x="38" y="128" text-anchor="end" fill="#3b82f6" font-size="5">GND</text>' +
            '<circle cx="56" cy="145" r="3" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="0.8"/>' +
            '<text x="38" y="148" text-anchor="end" fill="#f97316" font-size="5">SDA</text>' +
            '<circle cx="56" cy="165" r="3" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="0.8"/>' +
            '<text x="38" y="168" text-anchor="end" fill="#eab308" font-size="5">SCL</text>' +
            '<circle cx="56" cy="185" r="3" fill="rgba(168,85,247,0.3)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="38" y="188" text-anchor="end" fill="#a855f7" font-size="5">INT</text>' +

            '<!-- Pull-up resistors -->' +
            '<rect x="90" y="100" width="30" height="10" rx="2" fill="#1e2736" stroke="#f97316" stroke-width="1"/>' +
            '<text x="105" y="108" text-anchor="middle" fill="#f97316" font-size="4">R1 4.7k</text>' +
            '<rect x="90" y="115" width="30" height="10" rx="2" fill="#1e2736" stroke="#eab308" stroke-width="1"/>' +
            '<text x="105" y="123" text-anchor="middle" fill="#eab308" font-size="4">R2 4.7k</text>' +
            '<text x="105" y="93" text-anchor="middle" fill="#8b949e" font-size="5">Pull-ups</text>' +
            '<!-- Pull-up to VCC -->' +
            '<line x1="105" y1="100" x2="105" y2="95" stroke="#ef4444" stroke-width="0.8" stroke-dasharray="2,1"/>' +
            '<line x1="120" y1="105" x2="130" y2="105" stroke="#f97316" stroke-width="0.8"/>' +
            '<line x1="120" y1="120" x2="130" y2="120" stroke="#eab308" stroke-width="0.8"/>' +

            '<!-- I2C bus backbone (SDA) -->' +
            '<line x1="70" y1="145" x2="130" y2="145" stroke="#f97316" stroke-width="1.5"/>' +
            '<path d="M130,145 L420,145" stroke="#f97316" stroke-width="2" stroke-dasharray="6,4" class="sg81-bus"/>' +

            '<!-- I2C bus backbone (SCL) -->' +
            '<line x1="70" y1="165" x2="130" y2="165" stroke="#eab308" stroke-width="1.5"/>' +
            '<path d="M130,165 L420,165" stroke="#eab308" stroke-width="2" stroke-dasharray="6,4" class="sg81-bus"/>' +

            '<!-- VCC rail -->' +
            '<line x1="70" y1="105" x2="420" y2="105" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,2" opacity="0.5"/>' +
            '<!-- GND rail -->' +
            '<line x1="70" y1="125" x2="420" y2="220" stroke="none"/>' +

            '<!-- BME280 sensor -->' +
            '<rect x="155" y="180" width="60" height="50" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="185" y="200" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">BME280</text>' +
            '<text x="185" y="213" text-anchor="middle" fill="#8b949e" font-size="5">Temp/Hum/Press</text>' +
            '<text x="185" y="225" text-anchor="middle" fill="#22c55e" font-size="5">0x76</text>' +
            '<!-- SDA/SCL taps -->' +
            '<line x1="185" y1="180" x2="185" y2="145" stroke="#f97316" stroke-width="1"/>' +
            '<circle cx="185" cy="145" r="2" fill="#f97316"/>' +
            '<line x1="175" y1="180" x2="175" y2="165" stroke="#eab308" stroke-width="1"/>' +
            '<circle cx="175" cy="165" r="2" fill="#eab308"/>' +
            '<!-- Bypass cap -->' +
            '<rect x="165" y="240" width="20" height="8" rx="1" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="175" y="246" text-anchor="middle" fill="#c084fc" font-size="4">100nF</text>' +

            '<!-- BH1750 sensor -->' +
            '<rect x="255" y="180" width="60" height="50" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="285" y="200" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">BH1750</text>' +
            '<text x="285" y="213" text-anchor="middle" fill="#8b949e" font-size="5">Ambient Light</text>' +
            '<text x="285" y="225" text-anchor="middle" fill="#22c55e" font-size="5">0x23</text>' +
            '<!-- SDA/SCL taps -->' +
            '<line x1="285" y1="180" x2="285" y2="145" stroke="#f97316" stroke-width="1"/>' +
            '<circle cx="285" cy="145" r="2" fill="#f97316"/>' +
            '<line x1="275" y1="180" x2="275" y2="165" stroke="#eab308" stroke-width="1"/>' +
            '<circle cx="275" cy="165" r="2" fill="#eab308"/>' +
            '<!-- Bypass cap -->' +
            '<rect x="265" y="240" width="20" height="8" rx="1" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="275" y="246" text-anchor="middle" fill="#c084fc" font-size="4">100nF</text>' +

            '<!-- APDS-9960 sensor -->' +
            '<rect x="355" y="180" width="60" height="50" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="385" y="200" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">APDS-9960</text>' +
            '<text x="385" y="213" text-anchor="middle" fill="#8b949e" font-size="5">Gesture/Prox</text>' +
            '<text x="385" y="225" text-anchor="middle" fill="#22c55e" font-size="5">0x39</text>' +
            '<!-- SDA/SCL taps -->' +
            '<line x1="385" y1="180" x2="385" y2="145" stroke="#f97316" stroke-width="1"/>' +
            '<circle cx="385" cy="145" r="2" fill="#f97316"/>' +
            '<line x1="375" y1="180" x2="375" y2="165" stroke="#eab308" stroke-width="1"/>' +
            '<circle cx="375" cy="165" r="2" fill="#eab308"/>' +
            '<!-- Bypass cap -->' +
            '<rect x="365" y="240" width="20" height="8" rx="1" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="375" y="246" text-anchor="middle" fill="#c084fc" font-size="4">100nF</text>' +

            '<!-- INT line from APDS-9960 -->' +
            '<line x1="395" y1="230" x2="395" y2="260" stroke="#a855f7" stroke-width="1"/>' +
            '<line x1="395" y1="260" x2="56" y2="260" stroke="#a855f7" stroke-width="1" stroke-dasharray="4,2"/>' +
            '<line x1="56" y1="260" x2="56" y2="188" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="225" y="256" text-anchor="middle" fill="#a855f7" font-size="5">INT (active LOW)</text>' +

            '<!-- Bus architecture box -->' +
            '<rect x="480" y="50" width="210" height="105" rx="8" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
            '<text x="585" y="68" text-anchor="middle" fill="#f97316" font-size="8" font-weight="600">I2C BUS ARCHITECTURE</text>' +
            '<text x="490" y="85" fill="#f97316" font-size="6">&#9632; SDA (data) &mdash; shared, open-drain</text>' +
            '<text x="490" y="99" fill="#eab308" font-size="6">&#9632; SCL (clock) &mdash; shared, open-drain</text>' +
            '<text x="490" y="113" fill="#ef4444" font-size="6">&#9632; VCC 3.3V &mdash; common power rail</text>' +
            '<text x="490" y="127" fill="#8b949e" font-size="6">1 set pull-ups on bus (not per device)</text>' +
            '<text x="490" y="141" fill="#8b949e" font-size="6">4.7k&#x2126; @ 100kHz / 2.2k&#x2126; @ 400kHz</text>' +

            '<!-- Address map -->' +
            '<rect x="480" y="170" width="210" height="80" rx="8" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="585" y="188" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">I2C ADDRESS MAP</text>' +
            '<text x="490" y="205" fill="#22c55e" font-size="6">BME280 &mdash; 0x76 (SDO&rarr;GND)</text>' +
            '<text x="490" y="219" fill="#22c55e" font-size="6">BH1750 &mdash; 0x23 (ADDR&rarr;GND)</text>' +
            '<text x="490" y="233" fill="#22c55e" font-size="6">APDS-9960 &mdash; 0x39 (fixed)</text>' +
            '<text x="490" y="247" fill="#8b949e" font-size="5">No conflicts &mdash; all unique addresses</text>' +

            '<!-- Decoupling note -->' +
            '<rect x="480" y="265" width="210" height="45" rx="8" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.15)" stroke-width="0.5"/>' +
            '<text x="585" y="283" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">DECOUPLING</text>' +
            '<text x="490" y="298" fill="#8b949e" font-size="6">100nF ceramic per sensor IC</text>' +
            '<text x="490" y="310" fill="#8b949e" font-size="6">Placed &lt;2mm from VCC pin</text>' +

            '<!-- Bus labels on diagram -->' +
            '<text x="250" y="140" text-anchor="middle" fill="#f97316" font-size="5">SDA</text>' +
            '<text x="250" y="175" text-anchor="middle" fill="#eab308" font-size="5">SCL</text>' +

            '</svg>' +
            '</div>',

        wiringNotes: '<p><strong>Pull-up resistors:</strong> I2C is an open-drain bus &mdash; the lines are actively pulled LOW by devices but rely on pull-up resistors to return HIGH. You need one set of pull-ups on the bus (not per device). For 3.3V I2C at standard speed (100kHz), 4.7k&#x2126; pull-ups on SDA and SCL are standard. For fast mode (400kHz), use 2.2k&#x2126;. Too high = slow rise times and communication errors. Too low = excessive current draw.</p>' +
                     '<p><strong>Address conflicts:</strong> Each I2C device has a 7-bit address. If two devices share the same address, the bus will malfunction. The BME280 uses 0x76 (or 0x77 via SDO pin), BH1750 uses 0x23 (or 0x5C via ADDR pin), and APDS-9960 is fixed at 0x39. Verify no conflicts before designing the board. If you need two sensors with the same address, use an I2C multiplexer (TCA9548A).</p>' +
                     '<p><strong>Decoupling per sensor:</strong> Each sensor IC needs its own 100nF ceramic bypass capacitor between VCC and GND, placed as close to the IC power pins as possible. Sensors are sensitive to power supply noise, and shared power traces without local decoupling cause measurement errors.</p>',

        steps: [
            {
                title: 'Create the Schematic with Three I2C Sensors',
                content: '<p>Place all three sensor ICs, their individual bypass capacitors, the shared I2C pull-up resistors, and the microcontroller connection header. Wire the I2C bus as a shared backbone with star-topology power connections.</p>',
                code: '# Create project\nmkdir -p ~/pcb-projects/sg81-i2c-sensors\ncd ~/pcb-projects/sg81-i2c-sensors\n\n# KiCad Schematic — Components:\n#\n# U1: BME280 (temperature, humidity, pressure)\n#   Library: Sensor > BME280\n#   Address: 0x76 (SDO -> GND) or 0x77 (SDO -> VCC)\n#   Pins: VCC, GND, SDA, SCL, SDO (address select), CSB (tie HIGH for I2C)\n#   Bypass: C1 = 100nF between VCC and GND\n#\n# U2: BH1750 (ambient light sensor)\n#   Library: Sensor_Optical > BH1750FVI\n#   Address: 0x23 (ADDR -> GND) or 0x5C (ADDR -> VCC)\n#   Pins: VCC, GND, SDA, SCL, ADDR, DVI (not connected)\n#   Bypass: C2 = 100nF\n#\n# U3: APDS-9960 (gesture/proximity/color)\n#   Library: Sensor > APDS-9960\n#   Address: 0x39 (fixed, no address select)\n#   Pins: VCC, GND, SDA, SCL, INT (interrupt output)\n#   Bypass: C3 = 100nF\n#\n# R1: 4.7k — SDA pull-up to VCC (ONE on the bus)\n# R2: 4.7k — SCL pull-up to VCC (ONE on the bus)\n#\n# J1: Conn_01x05 — MCU header\n#   Pin 1: VCC (3.3V)\n#   Pin 2: GND\n#   Pin 3: SDA\n#   Pin 4: SCL\n#   Pin 5: INT (from APDS-9960, active LOW with 10k pull-up)\n#\n# R3: 10k — INT pull-up to VCC\n#\n# Wiring:\n#   All VCC pins -> VCC net\n#   All GND pins -> GND net\n#   All SDA pins -> SDA net (shared bus)\n#   All SCL pins -> SCL net (shared bus)\n#   BME280 CSB -> VCC (selects I2C mode)\n#   BME280 SDO -> GND (selects address 0x76)\n#   BH1750 ADDR -> GND (selects address 0x23)\n#   APDS-9960 INT -> J1 pin 5 (active LOW interrupt)\n#\n# Run ERC — 0 errors',
                language: 'Bash',
                tip: '<strong>Only ONE set of pull-ups per bus.</strong> A common mistake is putting pull-up resistors on every I2C breakout board. When you connect three breakout boards, you end up with three parallel pull-ups (4.7k / 3 = 1.57k effective), which is too strong and causes signal issues. Since you are designing a combined board, you control this: put exactly one R on SDA and one on SCL.'
            },
            {
                title: 'Assign Footprints and Design the PCB Layout',
                content: '<p>The BME280 and APDS-9960 come in tiny LGA packages that require careful pad design. The BH1750 uses a small WSOF package. All three need specific footprints from the KiCad library or manufacturer datasheets.</p>',
                code: '# Footprint assignments:\n#\n# U1 (BME280):\n#   Package_LGA:Bosch_LGA-8_2.5x2.5mm_P0.65mm_ClockwisePinNumbering\n#   (2.5mm x 2.5mm, 8-pad LGA — requires solder paste and reflow)\n#\n# U2 (BH1750FVI):\n#   Package_SO:WSOF-6_1.4x1.5mm_P0.5mm\n#   (tiny optical sensor package)\n#\n# U3 (APDS-9960):\n#   Sensor:APDS-9960 (check KiCad library or download from SnapEDA)\n#   Typically a small LGA with optical window\n#\n# R1, R2, R3 (pull-ups): Resistor_SMD:R_0805_2012Metric\n# C1, C2, C3 (bypass caps): Capacitor_SMD:C_0805_2012Metric\n# J1 (5-pin header): Connector_PinHeader_2.54mm:PinHeader_1x05_P2.54mm_Vertical\n#\n# PCB Layout (30mm x 25mm board):\n#\n# 1. Place J1 (header) on left edge for easy breadboard connection\n# 2. Place R1, R2 (pull-ups) near J1\n# 3. Sensors spaced apart:\n#    - BME280 away from heat sources (regulator, MCU)\n#    - BH1750 with clear optical path (no silkscreen over sensor)\n#    - APDS-9960 near board edge (needs line-of-sight for gesture)\n# 4. Each sensor gets its own 100nF cap within 2mm of VCC pin\n# 5. Ground pour on B.Cu\n# 6. I2C bus routed as a backbone (SDA and SCL run parallel)\n# 7. Keep I2C traces short — under 30cm total bus length at 100kHz\n#\n# DRC: 0 errors\n# Export Gerbers',
                language: 'Bash',
                tip: '<strong>Do not put silkscreen over optical sensors.</strong> The BH1750 and APDS-9960 need a clear optical path to measure light and detect gestures. Keep the silkscreen, solder mask, and copper away from the sensor windows. In KiCad, you can create a solder mask opening over the sensor area using a rectangle on the F.Mask layer.'
            },
            {
                title: 'Test the I2C Bus with a Microcontroller',
                content: '<p>After fabrication and assembly, connect the board to a microcontroller and scan the I2C bus to verify all three sensors respond at their expected addresses. Then read sensor data to confirm correct operation.</p>',
                code: '# Connect the sensor board to a Raspberry Pi or Arduino:\n#\n# Raspberry Pi (3.3V I2C):\n#   J1 Pin 1 (VCC) --> Pi Pin 1 (3.3V)\n#   J1 Pin 2 (GND) --> Pi Pin 6 (GND)\n#   J1 Pin 3 (SDA) --> Pi Pin 3 (GPIO2 / SDA1)\n#   J1 Pin 4 (SCL) --> Pi Pin 5 (GPIO3 / SCL1)\n#   J1 Pin 5 (INT) --> Pi Pin 7 (GPIO4) [optional]\n\n# Scan the I2C bus:\nsudo apt install -y i2c-tools\ni2cdetect -y 1\n\n# Expected output:\n#      0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f\n# 00:          -- -- -- -- -- -- -- -- -- -- -- -- --\n# 10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n# 20: -- -- -- 23 -- -- -- -- -- -- -- -- -- -- -- --\n# 30: -- -- -- -- -- -- -- -- -- 39 -- -- -- -- -- --\n# 40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n# 50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n# 60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n# 70: -- -- -- -- -- -- 76 --\n#\n# 0x23 = BH1750  |  0x39 = APDS-9960  |  0x76 = BME280\n# If any address is missing, check wiring, bypass caps, and pull-ups\n\n# Read BME280 sensor data (Python):\npip install smbus2 bme280\npython3 -c "\nimport smbus2, bme280\nbus = smbus2.SMBus(1)\nbme280.load_calibration_params(bus, 0x76)\ndata = bme280.sample(bus, 0x76)\nprint(f\'Temp: {data.temperature:.1f}C\')\nprint(f\'Humidity: {data.humidity:.1f}%\')\nprint(f\'Pressure: {data.pressure:.1f} hPa\')\n"\n\n# Read BH1750 light level:\npython3 -c "\nimport smbus2, time\nbus = smbus2.SMBus(1)\nbus.write_byte(0x23, 0x10)  # Continuous high-res mode\ntime.sleep(0.2)\ndata = bus.read_i2c_block_data(0x23, 0x00, 2)\nlux = (data[0] << 8 | data[1]) / 1.2\nprint(f\'Light: {lux:.0f} lux\')\n"',
                language: 'Bash',
                tip: '<strong>If i2cdetect shows no devices:</strong> Check pull-up resistors first. Without pull-ups, the bus lines float and no communication occurs. Measure SDA and SCL with a multimeter &mdash; they should read close to VCC (3.3V) when idle. If they read 0V, the pull-ups are missing or wrong value. If they read ~1.5V, a device is holding the bus low (stuck I2C state &mdash; power cycle all devices).'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Schematic: three I2C sensors with unique addresses on shared SDA/SCL bus</li>' +
                 '<li>One set of 4.7k pull-ups on SDA and SCL (not per-sensor)</li>' +
                 '<li>100nF bypass cap per sensor within 2mm of VCC pin</li>' +
                 '<li>5-pin header: VCC, GND, SDA, SCL, INT</li>' +
                 '<li>ERC passes with 0 errors</li>' +
                 '<li>Optical sensors (BH1750, APDS-9960) have clear optical path &mdash; no silkscreen/mask over sensor window</li>' +
                 '<li>DRC passes with 0 errors</li>' +
                 '<li>i2cdetect shows all three devices: 0x76, 0x23, 0x39</li>' +
                 '<li>BME280 returns reasonable temperature/humidity/pressure readings</li>' +
                 '<li>BH1750 returns light levels that change with ambient lighting</li>' +
                 '<li>Board operates at 3.3V from MCU header without external power</li>' +
                 '</ul>' +
                 '<p>This sensor board demonstrates I2C bus design &mdash; shared data lines, pull-up sizing, address management, and per-device decoupling. These same principles apply whether you are connecting two sensors or twenty. The board you built plugs directly into any 3.3V microcontroller and gives you environmental awareness for IoT, security, or automation projects.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>i2cdetect shows no devices at all:</strong> Pull-up resistors are missing or wrong value. I2C requires pull-ups on SDA and SCL to VCC. Measure the idle voltage on SDA and SCL &mdash; they should read 3.3V. If they read 0V, the pull-ups are absent. If they read ~1.5V, a device is holding the bus low (power-cycle all devices to clear a stuck I2C state). Use 4.7k pull-ups for standard-mode (100kHz) I2C.</li>' +
                         '<li><strong>Only some sensors detected:</strong> Check for I2C address conflicts. The BME280 can be at 0x76 or 0x77 depending on the SDO pin level. Verify each sensor\'s address configuration matches your firmware expectations. Also check that each sensor has its own 100nF bypass capacitor close to its VCC pin.</li>' +
                         '<li><strong>Sensor readings are erratic or stuck:</strong> Noise on the I2C bus from long traces or nearby switching signals. Keep SDA and SCL traces short, route them as a parallel pair, and add a ground pour beneath them. If the bus length exceeds 30cm, reduce the pull-up value to 2.2k to sharpen the signal edges.</li>' +
                         '<li><strong>APDS-9960 gesture detection does not work:</strong> The sensor requires a clear optical path. If silkscreen or solder mask covers the sensor window, light cannot reach the photodiodes. In KiCad, add a solder mask opening (remove mask) and a silkscreen keepout over the APDS-9960 sensor area.</li>' +
                         '<li><strong>BME280 temperature reads 5-10 degrees too high:</strong> Self-heating from nearby components or the board itself. Place the BME280 at the board edge, away from voltage regulators and microcontrollers. Add thermal relief connections (spoke pattern) to ground pads to reduce heat conduction from the ground pour.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Address Expander</strong> &mdash; Add a TCA9548A I2C multiplexer to support multiple sensors with the same address. This lets you connect eight identical sensors on separate I2C sub-buses controlled by a single multiplexer.</p>' +
                    '<p><strong>Challenge 2: Sensor Fusion</strong> &mdash; Add an MPU-6050 accelerometer/gyroscope to the board and implement sensor fusion (combining accelerometer, gyro, temperature, humidity, and light into a unified environmental profile). Output the fused data as a JSON payload over UART.</p>',

        commonMistakes: [
            {
                title: 'Pull-Ups on Every Sensor Module',
                correct: 'Use only one set of pull-up resistors for the entire I2C bus. Cut or desolder the built-in pull-ups on individual breakout modules if they have them.',
                incorrect: 'Leaving built-in pull-up resistors enabled on every breakout module connected to the same I2C bus.',
                consequence: 'Three modules with 4.7k pull-ups each create an effective 1.57k pull-up that overdrives the bus, causing signal integrity issues, excessive current draw, and communication errors.'
            },
            {
                title: 'Mixing 3.3V and 5V I2C Devices',
                correct: 'Use a bidirectional level shifter (BSS138-based module or dedicated IC like TXB0102) between voltage domains. Verify voltage tolerance in the sensor datasheet before connecting.',
                incorrect: 'Connecting a 5V I2C device directly to a 3.3V bus without level shifting.',
                consequence: 'The 5V signals exceed the absolute maximum ratings of the 3.3V sensors, causing permanent damage to the sensor ICs or degraded performance over time.'
            },
            {
                title: 'Bypass Capacitors Too Far From Sensor VCC Pins',
                correct: 'Place one 100nF ceramic capacitor per sensor, physically within 2mm of its VCC power pin.',
                incorrect: 'Placing decoupling capacitors on the far side of the board or connecting them to the sensor through long traces.',
                consequence: 'Long traces add enough inductance to negate the capacitor filtering effect. Power supply noise reaches the sensor, causing measurement errors, I2C communication glitches, and unreliable readings.'
            }
        ]
    },

    // ========================================================================
    // SG-82: RF PCB Design
    // ========================================================================
    'sg-82': {
        intro: '<p>Radio frequency (RF) PCB design is where the rules of basic electronics stop working and electromagnetic physics takes over. At frequencies above ~100 MHz, traces become transmission lines, ground planes become waveguides, and a misplaced via can turn your antenna into a noise radiator. RF design is one of the hardest disciplines in PCB engineering &mdash; and one of the most important for cybersecurity hardware.</p>' +
               '<p>In this project you will design an RF PCB for a 2.4 GHz antenna matching network. You will learn impedance-controlled trace routing (50&#x2126; microstrip), ground plane continuity, controlled-impedance vias, and antenna matching with an L-network. These techniques apply to Wi-Fi, Bluetooth, Zigbee, LoRa, and any wireless design.</p>' +
               '<p>RF design errors are invisible at DC and low frequency &mdash; your circuit may work on the bench but fail in the field due to impedance mismatches, radiation pattern distortion, or interference. This guide teaches you to design it right the first time.</p>',

        wiring: '    2.4 GHz RF Signal Path\n' +
                '    \n' +
                '    RF IC            Matching Network         Antenna\n' +
                '    +--------+     +-----------------+     +---------+\n' +
                '    | TX/RX  |---->| 50 ohm microstrip|--->| L-match |---->| Antenna |\n' +
                '    | (CC2500)|     | (calculated     |     | L1  C1  |     | (chip or|\n' +
                '    |        |     |  trace width)    |     |         |     |  PCB)   |\n' +
                '    +--------+     +-----------------+     +---------+     +---------+\n' +
                '         |                                      |\n' +
                '    +----+----+                            +----+----+\n' +
                '    |Continuous|                           |Ground   |\n' +
                '    |ground   |                           |clearance|\n' +
                '    |plane    |                           |under    |\n' +
                '    |(no gaps)|                           |antenna  |\n' +
                '    +---------+                           +---------+\n' +
                '    \n' +
                '    Z0 = 50 ohm (industry standard RF impedance)\n' +
                '    Trace width depends on: substrate Er, thickness, copper weight',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg82-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<pattern id="sg82-gnd" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="rgba(59,130,246,0.06)"/><line x1="0" y1="6" x2="6" y2="0" stroke="rgba(59,130,246,0.08)" stroke-width="0.5"/></pattern>' +
            '<style>' +
            '@keyframes sg82-rf{0%{stroke-dashoffset:30}100%{stroke-dashoffset:0}}' +
            '@keyframes sg82-wave{0%{opacity:0.2;transform:scale(1)}50%{opacity:0.6;transform:scale(1.1)}100%{opacity:0.2;transform:scale(1)}}' +
            '.sg82-signal{animation:sg82-rf 0.8s linear infinite}' +
            '.sg82-radiate{animation:sg82-wave 1.5s ease-in-out infinite}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg82-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-82 RF PCB DESIGN &mdash; 2.4 GHz</text>' +

            '<!-- PCB board outline -->' +
            '<rect x="30" y="55" width="400" height="200" rx="6" fill="rgba(59,130,246,0.02)" stroke="#3b82f6" stroke-width="2"/>' +

            '<!-- Ground plane (B.Cu) -->' +
            '<rect x="34" y="59" width="340" height="192" rx="4" fill="url(#sg82-gnd)"/>' +
            '<text x="200" y="245" text-anchor="middle" fill="rgba(59,130,246,0.3)" font-size="6">B.Cu Continuous Ground Plane</text>' +

            '<!-- Antenna keepout zone (no ground) -->' +
            '<rect x="374" y="59" width="52" height="192" rx="4" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1" stroke-dasharray="4,2"/>' +
            '<text x="400" y="248" text-anchor="middle" fill="#ef4444" font-size="5">GND KEEPOUT</text>' +

            '<!-- RF IC (CC2500) -->' +
            '<rect x="60" y="110" width="70" height="50" rx="4" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="95" y="130" text-anchor="middle" fill="#3b82f6" font-size="8" font-weight="600">CC2500</text>' +
            '<text x="95" y="143" text-anchor="middle" fill="#8b949e" font-size="5">2.4 GHz RF IC</text>' +
            '<text x="95" y="155" text-anchor="middle" fill="#8b949e" font-size="5">TX/RX</text>' +
            '<!-- Bypass caps cluster -->' +
            '<rect x="60" y="170" width="14" height="6" rx="1" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<rect x="78" y="170" width="14" height="6" rx="1" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<rect x="96" y="170" width="14" height="6" rx="1" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="85" y="186" text-anchor="middle" fill="#c084fc" font-size="4">100pF 1nF 100nF</text>' +

            '<!-- 50-ohm microstrip trace -->' +
            '<rect x="130" y="128" width="120" height="8" rx="1" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.5"/>' +
            '<path d="M135,132 L245,132" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,4" class="sg82-signal"/>' +
            '<text x="190" y="124" text-anchor="middle" fill="#ef4444" font-size="6" font-weight="600">50&#x2126; MICROSTRIP</text>' +
            '<text x="190" y="146" text-anchor="middle" fill="#8b949e" font-size="5">w = 2.85mm (FR4 1.6mm, Er=4.5)</text>' +

            '<!-- Via stitching along RF trace -->' +
            '<circle cx="140" cy="120" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="155" cy="120" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="170" cy="120" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="185" cy="120" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="200" cy="120" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="215" cy="120" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="230" cy="120" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="245" cy="120" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="140" cy="144" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="155" cy="144" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="170" cy="144" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="185" cy="144" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="200" cy="144" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="215" cy="144" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="230" cy="144" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<circle cx="245" cy="144" r="2" fill="#3b82f6" opacity="0.5"/>' +
            '<text x="190" y="114" text-anchor="middle" fill="#3b82f6" font-size="4">via-stitch ground fence (&le;6mm spacing)</text>' +

            '<!-- Matching network -->' +
            '<rect x="255" y="105" width="70" height="55" rx="4" fill="rgba(168,85,247,0.06)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="290" y="120" text-anchor="middle" fill="#a855f7" font-size="7" font-weight="600">L-MATCH</text>' +
            '<!-- L1 inductor -->' +
            '<rect x="265" y="128" width="20" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="275" y="134" text-anchor="middle" fill="#c084fc" font-size="4">L1</text>' +
            '<text x="275" y="144" text-anchor="middle" fill="#8b949e" font-size="4">1.2nH</text>' +
            '<!-- C1 capacitor -->' +
            '<rect x="295" y="128" width="20" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.8"/>' +
            '<text x="305" y="134" text-anchor="middle" fill="#c084fc" font-size="4">C1</text>' +
            '<text x="305" y="144" text-anchor="middle" fill="#8b949e" font-size="4">1.0pF</text>' +
            '<text x="290" y="156" text-anchor="middle" fill="#a855f7" font-size="4">0402 C0G/NP0</text>' +

            '<!-- Antenna -->' +
            '<rect x="380" y="115" width="40" height="30" rx="3" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="400" y="134" text-anchor="middle" fill="#22c55e" font-size="6" font-weight="600">ANT</text>' +
            '<text x="400" y="104" text-anchor="middle" fill="#22c55e" font-size="5">2.4 GHz Chip</text>' +

            '<!-- RF signal from match to antenna -->' +
            '<line x1="325" y1="132" x2="380" y2="132" stroke="#ef4444" stroke-width="2"/>' +

            '<!-- Radiation waves -->' +
            '<path d="M420,115 Q435,130 420,145" fill="none" stroke="#22c55e" stroke-width="1" class="sg82-radiate"/>' +
            '<path d="M428,108 Q448,130 428,152" fill="none" stroke="#22c55e" stroke-width="0.8" class="sg82-radiate" style="animation-delay:0.3s"/>' +
            '<path d="M436,100 Q462,130 436,160" fill="none" stroke="#22c55e" stroke-width="0.6" class="sg82-radiate" style="animation-delay:0.6s"/>' +

            '<!-- Crystal -->' +
            '<rect x="60" y="80" width="24" height="10" rx="2" fill="#1e2736" stroke="#eab308" stroke-width="0.8"/>' +
            '<text x="72" y="88" text-anchor="middle" fill="#eab308" font-size="4">26MHz</text>' +

            '<!-- Impedance annotation -->' +
            '<rect x="480" y="55" width="210" height="95" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="585" y="73" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">IMPEDANCE CONTROL</text>' +
            '<text x="490" y="90" fill="#8b949e" font-size="6">Z<tspan font-size="4" dy="2">0</tspan><tspan dy="-2"> = 50&#x2126; (industry standard)</tspan></text>' +
            '<text x="490" y="104" fill="#8b949e" font-size="6">Trace width: 2.85mm on FR4</text>' +
            '<text x="490" y="118" fill="#8b949e" font-size="6">Er = 4.5, h = 1.6mm, t = 0.035mm</text>' +
            '<text x="490" y="132" fill="#ef4444" font-size="6">No 90&deg; bends &bull; No vias in RF path</text>' +
            '<text x="490" y="146" fill="#8b949e" font-size="6">Use Saturn PCB Toolkit to verify</text>' +

            '<!-- Ground plane rules -->' +
            '<rect x="480" y="165" width="210" height="70" rx="8" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="585" y="183" text-anchor="middle" fill="#3b82f6" font-size="8" font-weight="600">GROUND PLANE RULES</text>' +
            '<text x="490" y="198" fill="#8b949e" font-size="6">B.Cu: continuous pour under RF path</text>' +
            '<text x="490" y="212" fill="#8b949e" font-size="6">NO gaps, slots, or traces underneath</text>' +
            '<text x="490" y="226" fill="#3b82f6" font-size="6">Via-stitch: &le;6mm spacing (&#955;/20)</text>' +

            '<!-- Antenna placement -->' +
            '<rect x="480" y="250" width="210" height="55" rx="8" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="585" y="268" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">ANTENNA PLACEMENT</text>' +
            '<text x="490" y="283" fill="#8b949e" font-size="6">Board edge &bull; No GND under antenna</text>' +
            '<text x="490" y="297" fill="#8b949e" font-size="6">5&ndash;10mm keepout per datasheet</text>' +

            '<!-- Matching components -->' +
            '<rect x="480" y="320" width="210" height="45" rx="8" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.15)" stroke-width="0.5"/>' +
            '<text x="585" y="338" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="600">MATCHING NETWORK</text>' +
            '<text x="490" y="353" fill="#8b949e" font-size="6">0402 C0G/NP0 caps (NOT X7R)</text>' +
            '<text x="490" y="363" fill="#8b949e" font-size="6">L1, C1, C2 within 3mm of RF pin</text>' +

            '<!-- Signal path label -->' +
            '<text x="245" y="74" text-anchor="middle" fill="#555" font-size="6">RF SIGNAL PATH: IC &rarr; 50&#x2126; trace &rarr; matching network &rarr; antenna</text>' +

            '</svg>' +
            '</div>',

        wiringNotes: '<p><strong>50&#x2126; impedance is not a suggestion.</strong> The entire RF signal path &mdash; from the IC output pin through the PCB trace to the antenna &mdash; must maintain 50&#x2126; characteristic impedance. Any deviation creates a reflection that reduces transmitted power and increases noise. A 75&#x2126; mismatch on a 50&#x2126; line reflects 4% of the power. A 200&#x2126; mismatch reflects 44%.</p>' +
                     '<p><strong>Microstrip trace width:</strong> For standard 2-layer FR4 (Er = 4.5, 1.6mm thickness, 1oz copper), a 50&#x2126; microstrip trace is approximately 2.85mm wide. This is much wider than a typical signal trace. Use a microstrip impedance calculator (Saturn PCB Toolkit, KiCad Calculator) to compute the exact width for your specific stack-up. Even 0.1mm variation matters at 2.4 GHz.</p>' +
                     '<p><strong>Ground plane continuity is everything.</strong> The ground plane on the opposite side of the RF trace forms the return path for the RF signal. Any gap, slot, or via in the ground plane under an RF trace creates an impedance discontinuity. Route the ground plane as a continuous, unbroken copper pour under the entire RF path. Never route other signals across the RF trace on the ground plane layer.</p>',

        steps: [
            {
                title: 'Calculate Impedance and Design the RF Schematic',
                content: '<p>Before placing a single component, calculate the trace width needed for 50&#x2126; impedance on your specific PCB stack-up. Then design the schematic with the RF IC, matching network, and antenna connection.</p>',
                code: '# Microstrip impedance calculation:\n#\n# Parameters for standard 2-layer FR4:\n#   Dielectric constant (Er): 4.5 (FR4 typical at 2.4 GHz)\n#   Substrate height (h): 1.6mm (standard 2-layer)\n#   Copper thickness (t): 0.035mm (1oz copper)\n#   Target impedance (Z0): 50 ohm\n#\n# Use Saturn PCB Toolkit or KiCad Calculator:\n#   Tools > Calculator Tools > Transmission Line Calculator\n#   Select: Microstrip\n#   Enter: Er=4.5, h=1.6mm, t=0.035mm, Z0=50 ohm\n#   Result: trace width ~= 2.85mm\n#\n# IMPORTANT: This width is approximate. FR4 dielectric constant\n# varies with frequency and manufacturer. For production RF boards,\n# use controlled-impedance fab service (JLCPCB offers this).\n\n# KiCad Schematic — RF Components:\n#\n# U1: CC2500 (2.4 GHz RF transceiver) or nRF24L01+ or ESP32 RF front-end\n#   Library: RF_Transceiver > CC2500\n#   Key pins: RF_P, RF_N (differential RF), GND, VCC (1.8-3.6V)\n#\n# Matching network (values from IC datasheet):\n#   L1: 1.2nH inductor (0402 RF-rated, low ESR)\n#   C1: 1.0pF capacitor (0402 C0G/NP0 dielectric — NOT X7R)\n#   C2: 1.8pF capacitor (0402 C0G/NP0)\n#   These form an L-network that transforms the IC output impedance\n#   to match the 50-ohm antenna impedance.\n#\n# ANT1: 2.4 GHz chip antenna\n#   Library: RF_Antenna > Johanson_2450AT18x100\n#   Or PCB trace antenna (inverted-F or meander line)\n#\n# Bypass capacitors (critical for RF):\n#   100pF, 1nF, 100nF in parallel on VCC — filters noise across\n#   different frequency ranges\n#\n# Crystal: 26 MHz (if required by RF IC)\n#   With 15pF load capacitors\n\n# Run ERC — ensure all RF pins are properly connected',
                language: 'Bash',
                tip: '<strong>Use C0G/NP0 capacitors in the RF path.</strong> Standard X7R and X5R ceramic capacitors change capacitance with voltage, temperature, and frequency. At 2.4 GHz, an X7R "1.0pF" cap might actually be 0.5pF or 1.5pF, destroying your impedance match. C0G (also called NP0) capacitors have near-zero variation across voltage and temperature. They cost slightly more but are mandatory for RF matching networks.'
            },
            {
                title: 'Layout the RF PCB with Impedance-Controlled Routing',
                content: '<p>RF PCB layout follows strict rules that do not apply to digital designs. Trace width must be exact, ground plane must be continuous, components must be placed to minimize RF path length, and the antenna area must have a ground plane cutout.</p>',
                code: '# RF PCB layout rules:\n#\n# 1. Board stack-up:\n#    Top (F.Cu): RF traces, components\n#    Bottom (B.Cu): continuous ground plane (NO exceptions under RF path)\n#    Standard FR4, 1.6mm, 1oz copper\n#\n# 2. Set trace width for RF net:\n#    In KiCad: Edit > Net Classes\n#    Create net class "RF" with trace width = 2.85mm\n#    Assign RF_P net to "RF" class\n#\n# 3. Component placement:\n#    - RF IC (U1) centered on board\n#    - Matching network (L1, C1, C2) within 3mm of RF pin\n#      Place in direct line between IC and antenna\n#      Components in RF path: SMALLEST packages (0402 preferred)\n#    - Antenna at board edge, away from ground plane\n#    - Bypass caps (100pF/1nF/100nF) within 1mm of IC VCC pins\n#    - Crystal close to IC oscillator pins\n#\n# 4. RF trace routing:\n#    - Route RF trace from IC to matching network to antenna in\n#      a straight line (no bends if possible)\n#    - If bends needed: use 45-degree chamfered bends, NOT 90-degree\n#    - Trace width must be EXACTLY 2.85mm — no tapers or necking\n#    - No vias in the RF signal path\n#    - Maintain >=2x trace width clearance from other traces\n#\n# 5. Ground plane:\n#    - B.Cu: continuous copper pour on GND net\n#    - NO traces, no cuts, no slots under the RF path\n#    - Via-stitch ground: place ground vias every 2-3mm along both\n#      sides of the RF trace (grounding fence)\n#    - Under antenna: REMOVE ground plane (clearance area)\n#      Chip antennas need a ground-free zone per datasheet\n#\n# 6. Antenna placement:\n#    - Chip antenna at board EDGE (no copper extending beyond)\n#    - Ground plane keepout per antenna datasheet (typically 5-10mm)\n#    - No components or copper above/below the antenna\n#    - Do not place near metal enclosure walls or battery\n#\n# 7. DRC with custom RF rules:\n#    - RF trace width: exactly 2.85mm (+/- 0.05mm)\n#    - RF clearance: minimum 0.5mm from other nets\n#    - Via annular ring: 0.2mm minimum',
                language: 'Bash',
                tip: '<strong>Via-stitching is not decorative.</strong> Ground vias along both sides of an RF trace create a coplanar waveguide effect that reduces radiation loss and crosstalk. Space them at lambda/20 or less (at 2.4 GHz, lambda = 125mm, so vias every 6mm maximum). Closer is better. This "grounding fence" is standard practice in every professional RF design.'
            },
            {
                title: 'Verify the Design with RF Simulation and Testing',
                content: '<p>RF designs must be verified beyond standard DRC. Use an impedance calculator to confirm trace impedance, check the antenna datasheet for ground clearance requirements, and after fabrication, use a VNA (Vector Network Analyzer) to measure the actual impedance match.</p>',
                code: '# RF design verification checklist:\n#\n# 1. Re-verify microstrip impedance:\n#    Open KiCad Calculator > Transmission Line\n#    Enter actual trace width from your layout\n#    Confirm Z0 is within 50 +/- 5 ohm\n#    If not, adjust trace width and re-route\n#\n# 2. Check antenna clearance:\n#    Open chip antenna datasheet\n#    Verify ground plane keepout matches datasheet requirement\n#    Typical: 5mm minimum clear area beyond antenna edge\n#    No copper, no traces, no components in the keepout zone\n#\n# 3. Ground plane integrity:\n#    In KiCad PCB editor: switch to B.Cu layer\n#    Visually inspect for any gaps or slots under the RF path\n#    No other traces should cross under the RF microstrip\n#\n# 4. Via-stitch verification:\n#    Count ground vias along RF path\n#    Spacing should be <= 6mm (lambda/20 at 2.4 GHz)\n#    All ground vias connect to B.Cu ground pour\n#\n# 5. Order controlled-impedance PCB (if available):\n#    JLCPCB impedance control: specify 50 ohm microstrip\n#    They will adjust dielectric thickness to hit target Z0\n#    Costs ~$5-10 extra but guarantees impedance accuracy\n#\n# After fabrication — RF testing:\n#\n# 6. VNA (Vector Network Analyzer) measurement:\n#    Tool: NanoVNA V2 ($60) — measures S11, S21, VSWR\n#    Calibrate VNA with SMA cal kit\n#    Connect to antenna port via SMA connector / U.FL pigtail\n#    Measure S11 (return loss) at 2.4 GHz:\n#      S11 < -10 dB = good match (< 10% reflected power)\n#      S11 < -15 dB = excellent match (< 3% reflected)\n#      S11 > -6 dB = poor match, rework needed\n#\n# 7. Smith chart analysis:\n#    VNA shows impedance on Smith chart\n#    Target: center of chart (50 + j0 ohm) at 2.4 GHz\n#    If off-center: adjust matching network values (L1, C1, C2)\n#    Move clockwise = add series inductance\n#    Move counterclockwise = add series capacitance\n#\n# 8. Range test:\n#    Program two boards (TX and RX)\n#    Measure maximum communication distance\n#    Compare to datasheet expected range\n#    Poor range = impedance mismatch or ground plane issue',
                language: 'Bash',
                tip: '<strong>A NanoVNA is the most valuable RF tool you can own.</strong> At $60, the NanoVNA V2 measures impedance, return loss, VSWR, and Smith chart parameters up to 3 GHz. Without a VNA, you are guessing whether your antenna match is correct. With one, you can measure, adjust matching components, and verify &mdash; turning RF design from black magic into engineering. Every RF project in your future will use this tool.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Microstrip trace width calculated for 50&#x2126; on your specific stack-up</li>' +
                 '<li>RF trace routed with correct width, no 90&deg; bends, no vias in signal path</li>' +
                 '<li>Matching network (L1, C1, C2) uses 0402 C0G/NP0 components within 3mm of RF pin</li>' +
                 '<li>Ground plane continuous and unbroken under entire RF trace</li>' +
                 '<li>Via-stitching along RF path with &le;6mm spacing</li>' +
                 '<li>Antenna at board edge with correct ground clearance per datasheet</li>' +
                 '<li>Bypass capacitors (100pF + 1nF + 100nF) within 1mm of IC power pins</li>' +
                 '<li>ERC and DRC pass with 0 errors</li>' +
                 '<li>VNA measurement: S11 &lt; &minus;10 dB at 2.4 GHz (after fabrication)</li>' +
                 '<li>Smith chart impedance near 50 + j0 &#x2126; at target frequency</li>' +
                 '<li>Range test matches or exceeds IC datasheet specification</li>' +
                 '</ul>' +
                 '<p>RF PCB design is the summit of hardware engineering skill. The concepts you learned here &mdash; impedance matching, controlled-impedance routing, ground plane management, and antenna placement &mdash; apply to every wireless protocol from Bluetooth to 5G. When you can design an RF board that hits &minus;15 dB return loss on the first spin, you have joined a very small group of engineers who truly understand electromagnetic design.</p>',

        troubleshooting: '<ul>' +
                         '<li><strong>S11 is worse than &minus;6 dB (poor impedance match):</strong> The microstrip trace width is likely wrong for your PCB stack-up. Recalculate using the KiCad Transmission Line Calculator with the actual dielectric thickness and Er of your board material (FR-4 Er &asymp; 4.3&ndash;4.7). A 1.6mm FR-4 board at 2.4 GHz typically needs a ~2.8mm trace for 50&#x2126;. If the fabricated board is already made, adjust the matching network component values (L1, C1, C2) empirically using a NanoVNA.</li>' +
                         '<li><strong>NanoVNA shows impedance far from 50&#x2126;:</strong> Check ground plane continuity under the RF trace. Any slot, gap, or via break in the ground plane under the microstrip changes the characteristic impedance unpredictably. In KiCad, switch to the B.Cu layer and visually verify the ground pour is solid and continuous under the entire RF path from IC pin to antenna.</li>' +
                         '<li><strong>Communication range is far below datasheet spec:</strong> The antenna keepout zone may be violated. Chip antennas require a specific ground-free area beyond the antenna edge (typically 5&ndash;10mm specified in the datasheet). Copper, traces, or components in this zone detune the antenna. Also check for solder bridges on the matching network &mdash; a shorted capacitor or inductor changes the matching network impedance completely.</li>' +
                         '<li><strong>Board works on the bench but fails in an enclosure:</strong> Nearby metal surfaces (enclosure walls, battery, LCD frame) detune the antenna. Maintain at least 10mm clearance between the antenna and any metal surface. Position the antenna at the enclosure edge, ideally protruding through a plastic window. Re-measure S11 with the board inside the enclosure to quantify the detuning effect.</li>' +
                         '<li><strong>Matching network components have no measurable effect:</strong> Verify you are using C0G/NP0 dielectric capacitors and wirewound or thin-film inductors rated for the operating frequency. Standard X7R or Y5V ceramic capacitors lose most of their capacitance at GHz frequencies and are useless for RF matching. Check component datasheets for self-resonant frequency &mdash; it must be above your operating frequency.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Dual-Band Design</strong> &mdash; Extend the matching network to support both 2.4 GHz and 5 GHz bands using a diplexer circuit. This is how modern WiFi radios operate on both bands simultaneously with a single antenna port.</p>' +
                    '<p><strong>Challenge 2: PCB Antenna</strong> &mdash; Replace the chip antenna with a PCB trace antenna (inverted-F antenna or meander antenna). Design the antenna geometry in KiCad using the F.Cu layer. This eliminates the cost of a discrete antenna component but requires precise geometry calculation.</p>' +
                    '<p><strong>Challenge 3: RF Shielding</strong> &mdash; Add a solderable RF shield can footprint around the RF section of the board. Shield cans prevent the RF circuitry from radiating into or receiving interference from the digital section. Design the shield footprint with ground pads at regular intervals around the perimeter.</p>',

        commonMistakes: [
            {
                title: 'Using Standard Capacitors in the Matching Network',
                correct: 'Use C0G (NP0) dielectric capacitors in 0402 package from Murata or Johanson for RF matching networks. C0G maintains stable capacitance across frequency.',
                incorrect: 'Using X7R or Y5V ceramic capacitors in the RF matching network.',
                consequence: 'X7R and Y5V capacitors lose 50-90% of their rated capacitance at GHz frequencies, completely detuning the matching network and causing severe impedance mismatch and signal loss.'
            },
            {
                title: 'Routing Digital Signals Under the RF Trace',
                correct: 'Keep all digital routing away from the RF section. Maintain a physical separation zone of at least 5mm between digital and RF areas of the board.',
                incorrect: 'Routing digital signal traces under or across the RF microstrip path.',
                consequence: 'Digital signals inject switching noise directly into the antenna path and create slots in the ground plane that disrupt the RF return current, degrading receiver sensitivity and increasing spurious emissions.'
            },
            {
                title: 'Ground Via Spacing Too Wide Along RF Path',
                correct: 'Place ground vias in a continuous fence along both sides of the RF microstrip, spaced at lambda/20 or closer (approximately 6mm at 2.4 GHz).',
                incorrect: 'Spacing ground via-stitching too far apart along the RF trace path.',
                consequence: 'The ground plane between widely-spaced vias resonates and radiates at the operating frequency, degrading signal integrity, increasing insertion loss, and potentially causing the board to fail EMC testing.'
            }
        ]
    }

};
