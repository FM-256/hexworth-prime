/* ============================================================
   ALA-L06: Field Assembly
   Advanced Linux Administration -- CTF Lab
   Build from source, checksum verification, checkinstall packaging
   ============================================================ */

const ALAL06Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Field Assembly',
    subtitle: 'Advanced Linux Administration -- Build from Source',
    description: 'Cell-034 is cut off from the grid armory. The network monitor tool needed to capture a hidden sector signature is only available as source code in a local archive. Verify the checksum, install build dependencies from the offline cache, compile gridmon, package it with checkinstall, and use it to capture the signature before the window closes.',
    difficulty: 'Hard',
    estimatedTime: 40,
    accent: '#22d3ee',
    storageKey: 'hexworth_lab_ala_l06',
    registryId: 'ala-l06-field-assembly',
    trackerKey: 'lab_ala_l06',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-034 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 link UP (local mesh only)',
            'Network: Grid Armory UNREACHABLE',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'operator'
    },

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Cell-034 lost its grid armory connection six hours ago. A sector-wide signature anomaly is active on UDP port 9001 -- the kind that precedes a coordinated grid disruption. You need gridmon to capture it. The armory is down. Grid Command left a local archive at /opt/archive/ before comms dropped. You have the source. You have offline dependencies. Build it.',
        scenario: 'The local archive contains gridmon 2.1.0 source, a SHA256 checksum, and three .deb packages for build dependencies. build-essential is pre-installed. The correct build procedure is: verify checksum, install deps with dpkg, extract, configure, make, package with checkinstall. After packaging, run the capture command on eth0 filtering for UDP port 9001.',
        outro: 'gridmon is installed and tracked in the package database. The sector signature was captured and transmitted to Grid Command. Sector integrity is verified. The field assembly protocol worked as designed -- even dark, Cell-034 can operate.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-034',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-034\nLast login: Thu Apr 10 07:12:00 2026 from 10.0.1.1\n\n*** WARNING: Grid Armory connection LOST ***\n*** apt package repository UNAVAILABLE ***\n*** Local archive mirror at /opt/archive/ ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',     label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',     label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',     label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED FILESYSTEM
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'operator': {
                            type: 'dir',
                            children: {
                                'MISSION.txt': {
                                    type: 'file',
                                    content: 'MISSION: Field Assembly\n\nCompile gridmon 2.1.0 from /opt/archive/.\nTool will capture a hidden signature in network traffic on UDP port 9001.\nChecksum MUST verify before you build.\n\nSteps:\n  1. sha256sum -c /opt/archive/gridmon-2.1.0.tar.gz.sha256\n  2. Install deps from /opt/archive/deps/ using dpkg\n  3. Install checkinstall from /opt/archive/packages/\n  4. tar -xzf /opt/archive/gridmon-2.1.0.tar.gz\n  5. cd gridmon-2.1.0 && ./configure --prefix=/usr/local --enable-grid-capture\n  6. make -j$(nproc)\n  7. sudo checkinstall --pkgname=gridmon --pkgversion=2.1.0 --backup=no --fstrans=no make install\n  8. /opt/verify/test-install.sh\n  9. gridmon --capture --interface eth0 --filter "udp port 9001" --output /tmp/capture.pcap\n  10. /opt/verify/run-capture.sh\n'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: 'Build notes:\n  ./configure --prefix=/usr/local --enable-grid-capture\n  Requires: libpcap-dev, libssl-dev (install from /opt/archive/deps/)\n  Use checkinstall instead of make install -- keeps it in the package DB.\n  checkinstall is in /opt/archive/packages/\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /opt/archive/\ncat MISSION.txt\n'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'archive': {
                            type: 'dir',
                            children: {
                                'gridmon-2.1.0.tar.gz': {
                                    type: 'file',
                                    content: '[binary tarball: gridmon-2.1.0 source archive, 312 KB]\n'
                                },
                                'gridmon-2.1.0.tar.gz.sha256': {
                                    type: 'file',
                                    content: 'a3f9e21c8b4d6f7a2e5c9b0d1f3a8e4c7b2d5f8a1e6c9b3d0f7a4e1c8b5d2f9a  gridmon-2.1.0.tar.gz\n'
                                },
                                'deps': {
                                    type: 'dir',
                                    children: {
                                        'libpcap-dev_1.10.1-4_amd64.deb': {
                                            type: 'file',
                                            content: '[binary deb: libpcap development library, 248 KB]\n'
                                        },
                                        'libpcap0.8-dev_1.10.1-4_amd64.deb': {
                                            type: 'file',
                                            content: '[binary deb: libpcap runtime library, 168 KB]\n'
                                        },
                                        'libssl-dev_3.0.2-0ubuntu1.13_amd64.deb': {
                                            type: 'file',
                                            content: '[binary deb: OpenSSL development library, 2.1 MB]\n'
                                        }
                                    }
                                },
                                'packages': {
                                    type: 'dir',
                                    children: {
                                        'checkinstall_1.6.2-4_amd64.deb': {
                                            type: 'file',
                                            content: '[binary deb: checkinstall package manager helper, 84 KB]\n'
                                        }
                                    }
                                }
                            }
                        },
                        'verify': {
                            type: 'dir',
                            children: {
                                'test-install.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verifies gridmon is installed correctly via checkinstall\n# Checks: binary exists at /usr/local/bin/gridmon, dpkg record present, --version works\nset -e\n\nBIN_OK=0\nPKG_OK=0\n\n[ -x /usr/local/bin/gridmon ] && BIN_OK=1\ndpkg -l gridmon 2>/dev/null | grep -q "^ii" && PKG_OK=1\n\nif [ $BIN_OK -eq 1 ] && [ $PKG_OK -eq 1 ]; then\n    echo "[PASS] /usr/local/bin/gridmon exists and is executable"\n    echo "[PASS] dpkg records gridmon as installed"\n    /usr/local/bin/gridmon --version\n    echo "FLAG: FLAG{gridmon_compiled_and_packaged_with_checkinstall}"\nelse\n    [ $BIN_OK -eq 0 ] && echo "[FAIL] /usr/local/bin/gridmon not found. Did you run make install or checkinstall?"\n    [ $PKG_OK -eq 0 ] && echo "[FAIL] dpkg has no record of gridmon. Use checkinstall instead of make install."\nfi\n'
                                },
                                'run-capture.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Simulates network traffic on UDP port 9001 and verifies gridmon captured the payload\n# The hidden signature is embedded in the pcap as ASCII text\nset -e\n\nPCAP=/tmp/capture.pcap\n\nif [ ! -f "$PCAP" ]; then\n    echo "[FAIL] /tmp/capture.pcap not found."\n    echo "Run: gridmon --capture --interface eth0 --filter \'udp port 9001\' --output /tmp/capture.pcap"\n    exit 1\nfi\n\nSIG=$(strings "$PCAP" | grep "SECTOR7_SIG")\nif [ -n "$SIG" ]; then\n    echo "[PASS] Sector signature captured in pcap."\n    echo "[PASS] Payload: $SIG"\n    echo "FLAG: FLAG{sector_signature_captured_on_udp_9001}"\nelse\n    echo "[FAIL] Sector signature not found in capture file. Was gridmon running when traffic was injected?"\nfi\n'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'local': {
                            type: 'dir',
                            children: {
                                'bin': {
                                    type: 'dir',
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'cell-ops': {
                                    type: 'dir',
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'cell-034\n'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/dpkg, /usr/bin/checkinstall, /usr/bin/make\n'
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE (BoxEngine reads these)
    // ═══════════════════════════════════════════════════════

    _state: {
        checksumVerified: false,        // sha256sum -c run and passed
        depsInstalled: false,           // libpcap-dev, libssl-dev installed via dpkg
        checkinstallInstalled: false,   // checkinstall .deb installed
        sourceExtracted: false,         // tar -xzf run on gridmon tarball
        configured: false,              // ./configure completed
        built: false,                   // make completed
        installed: false,               // checkinstall make install completed
        capturePcapCreated: false       // gridmon capture command run
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // sha256sum -- checksum verification
        'sha256sum': function(args, term, engine) {
            const cFlag = args.includes('-c');
            const target = args.find(a => !a.startsWith('-')) || '';

            if (cFlag) {
                // -c mode: read checksums from file and verify
                const checksumFile = target;
                if (checksumFile.includes('gridmon-2.1.0.tar.gz.sha256') ||
                    checksumFile === '/opt/archive/gridmon-2.1.0.tar.gz.sha256') {
                    engine._state.checksumVerified = true;
                    return `gridmon-2.1.0.tar.gz: OK`;
                }
                return `sha256sum: ${checksumFile}: No such file or directory`;
            }

            // Direct hash of the tarball
            if (target.includes('gridmon-2.1.0.tar.gz') && !target.includes('.sha256')) {
                return `a3f9e21c8b4d6f7a2e5c9b0d1f3a8e4c7b2d5f8a1e6c9b3d0f7a4e1c8b5d2f9a  ${target}`;
            }

            return `Usage: sha256sum [-c] [FILE]\nExample: sha256sum -c /opt/archive/gridmon-2.1.0.tar.gz.sha256`;
        },

        // dpkg -- install .deb packages from local archive
        'dpkg': function(args, term, engine) {
            const iFlag = args.includes('-i');
            const lFlag = args.includes('-l');
            const files = args.filter(a => a.endsWith('.deb'));

            if (lFlag) {
                const pkgArg = args.find(a => !a.startsWith('-') && !a.endsWith('.deb')) || '';
                if (pkgArg === 'gridmon' || pkgArg === 'gridmon*') {
                    if (engine._state.installed) {
                        return `Desired=Unknown/Install/Remove/Purge/Hold\n| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend\n|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)\n||/ Name         Version Architecture Description\n+++-============-============-============-==========================================\nii  gridmon      2.1.0        amd64        Grid Network Monitor -- field build`;
                    }
                    return `dpkg-query: no packages found matching gridmon`;
                }
                return `Use: dpkg -l [package-name] to query installed packages`;
            }

            if (iFlag && files.length > 0) {
                const hasPcap = files.some(f => f.includes('libpcap'));
                const hasSsl = files.some(f => f.includes('libssl'));
                const hasCheckinstall = files.some(f => f.includes('checkinstall'));

                const output = [];
                files.forEach(f => {
                    const short = f.split('/').pop();
                    output.push(`Selecting previously unselected package ${short.replace(/_.*/, '')}.`);
                    output.push(`Preparing to unpack .../.../${short} ...`);
                    output.push(`Unpacking ${short.replace(/_.*/, '')} ...`);
                    output.push(`Setting up ${short.replace(/_.*/, '')} ...`);
                });

                if (hasPcap && hasSsl) {
                    engine._state.depsInstalled = true;
                }
                if (hasCheckinstall) {
                    engine._state.checkinstallInstalled = true;
                }

                return output.join('\n');
            }

            if (iFlag && files.length === 0) {
                return `dpkg: error: --install needs at least one package archive file argument`;
            }

            return `Usage: dpkg -i <package.deb> [package2.deb ...]\n       dpkg -l [package-name]`;
        },

        // sudo -- elevate for dpkg, make, checkinstall
        'sudo': function(args, term, engine) {
            const cmd = args[0] || '';
            const rest = args.slice(1);

            if (cmd === 'dpkg') {
                return engine.commands['dpkg'].call(engine.commands, rest, term, engine);
            }

            if (cmd === 'checkinstall') {
                if (!engine._state.built) {
                    return `checkinstall: error: no Makefile found or make not run yet.\nRun make in the source directory first.`;
                }
                if (!engine._state.checkinstallInstalled) {
                    return `sudo: checkinstall: command not found\nInstall with: sudo dpkg -i /opt/archive/packages/checkinstall_1.6.2-4_amd64.deb`;
                }

                const pkgname = rest.find((a, i) => rest[i - 1] === '--pkgname') ||
                    (rest.find(a => a.startsWith('--pkgname=')) || '').split('=')[1] || 'gridmon';
                const pkgver = rest.find((a, i) => rest[i - 1] === '--pkgversion') ||
                    (rest.find(a => a.startsWith('--pkgversion=')) || '').split('=')[1] || '2.1.0';

                engine._state.installed = true;
                engine.filesystem['/'].children.usr.children.local.children.bin.children['gridmon'] = {
                    type: 'file',
                    content: '#!/bin/bash\n# gridmon 2.1.0 -- Grid Network Monitor\n# Built from source on cell-034\n'
                };
                return `checkinstall 1.6.2, Copyright 2002 Felipe Eduardo Sanchez Diaz Duran\n\nThe package documentation directory ./doc-pak does not exist.\nCreating default documentation directory and copying documentation files.\n\n**** debian package creation selected ***\n\nThis package will be built according to these values:\n0 -  Maintainer: [ operator@cell-034 ]\n1 -  Summary: [ Grid Network Monitor -- field build ]\n2 -  Name:    [ ${pkgname} ]\n3 -  Version: [ ${pkgver} ]\n4 -  Release: [ 1 ]\n5 -  License: [ GPL ]\n6 -  Group:   [ checkinstall ]\n7 -  Architecture: [ amd64 ]\n8 -  Source location: [ gridmon-2.1.0 ]\n9 -  Alternate source location: [  ]\n10 - Requires: [ libpcap-dev, libssl-dev ]\n11 - Provides: [ ${pkgname} ]\n12 - Conflicts: [  ]\n13 - Replaces:  [  ]\n\nEnter a number to change any of them or press ENTER to continue:\n\nInstalling with make install...\nDone. The new package has been installed and saved to\n\n /home/operator/gridmon_${pkgver}-1_amd64.deb\n\nYou can remove it from your system anytime using:\n\n      dpkg -r ${pkgname}`;
            }

            if (cmd === 'make') {
                if (!engine._state.configured) {
                    return `make: *** No targets specified and no makefile found. Stop.\nRun ./configure first.`;
                }
                engine._state.built = true;
                return `make[1]: Entering directory '/home/operator/gridmon-2.1.0'\nCC src/capture.c\nCC src/filter.c\nCC src/output.c\nCC src/main.c\nLINK gridmon\nmake[1]: Leaving directory '/home/operator/gridmon-2.1.0'\n`;
            }

            return `sudo: ${cmd}: command not found or not permitted`;
        },

        // tar -- extract source archive
        'tar': function(args, term, engine) {
            const xFlag = args.includes('-xzf') || (args.includes('-x') && args.includes('-z'));
            const cFlag = args.includes('-czf') || (args.includes('-c') && args.includes('-z'));
            const tFlag = args.includes('-tzf') || (args.includes('-t') && args.includes('-z'));
            const file = args.find(a => a.endsWith('.tar.gz') || a.endsWith('.tar')) || '';

            if (tFlag && file.includes('gridmon-2.1.0.tar.gz')) {
                return `gridmon-2.1.0/\ngridmon-2.1.0/configure\ngridmon-2.1.0/Makefile.in\ngridmon-2.1.0/src/\ngridmon-2.1.0/src/main.c\ngridmon-2.1.0/src/capture.c\ngridmon-2.1.0/src/filter.c\ngridmon-2.1.0/src/output.c\ngridmon-2.1.0/include/\ngridmon-2.1.0/include/gridmon.h\ngridmon-2.1.0/doc/\ngridmon-2.1.0/doc/README\n`;
            }

            if (xFlag && file.includes('gridmon-2.1.0.tar.gz')) {
                if (!engine._state.checksumVerified) {
                    return `Warning: checksum not verified. Run sha256sum -c /opt/archive/gridmon-2.1.0.tar.gz.sha256 first.\ngridmon-2.1.0/\ngridmon-2.1.0/configure\ngridmon-2.1.0/src/main.c\n[extracted -- but verify the checksum before proceeding]`;
                }
                engine._state.sourceExtracted = true;
                // Create the extracted source directory in the filesystem
                const cwd = engine.getCurrentDir ? engine.getCurrentDir() : '/home/operator';
                engine.filesystem['/'].children.home.children.operator.children['gridmon-2.1.0'] = {
                    type: 'dir',
                    children: {
                        'configure': { type: 'file', content: '#!/bin/bash\n# gridmon configure script\necho "checking for libpcap... yes"\necho "checking for libssl... yes"\necho "configure: creating ./Makefile"\n' },
                        'Makefile': { type: 'file', content: '# gridmon Makefile\n# Generated by configure\nCC=gcc\nCFLAGS=-O2 -Wall\nLDFLAGS=-lpcap -lssl -lcrypto\n\nall: gridmon\n\ngridmon: src/main.c src/capture.c src/filter.c src/output.c\n\t$(CC) $(CFLAGS) -o gridmon $^ $(LDFLAGS)\n\ninstall:\n\tinstall -m 755 gridmon /usr/local/bin/gridmon\n' },
                        'src': {
                            type: 'dir',
                            children: {
                                'main.c': { type: 'file', content: '/* gridmon 2.1.0 -- Grid Network Monitor */\n#include "gridmon.h"\nint main(int argc, char *argv[]) { /* ... */ }\n' },
                                'capture.c': { type: 'file', content: '/* packet capture engine -- libpcap interface */\n' },
                                'filter.c': { type: 'file', content: '/* BPF filter compiler */\n' },
                                'output.c': { type: 'file', content: '/* pcap output writer */\n' }
                            }
                        },
                        'include': {
                            type: 'dir',
                            children: {
                                'gridmon.h': { type: 'file', content: '#ifndef GRIDMON_H\n#define GRIDMON_H\n#include <pcap.h>\n#include <openssl/sha.h>\nvoid capture_packets(const char *iface, const char *filter, const char *output);\n#endif\n' }
                            }
                        }
                    }
                };
                return `gridmon-2.1.0/\ngridmon-2.1.0/configure\ngridmon-2.1.0/Makefile.in\ngridmon-2.1.0/src/main.c\ngridmon-2.1.0/src/capture.c\ngridmon-2.1.0/src/filter.c\ngridmon-2.1.0/src/output.c\ngridmon-2.1.0/include/gridmon.h\n`;
            }

            return `Usage: tar [-xzf|-tzf] <archive.tar.gz>\nExample: tar -xzf /opt/archive/gridmon-2.1.0.tar.gz`;
        },

        // ./configure -- runs build configuration for gridmon
        './configure': function(args, term, engine) {
            if (!engine._state.sourceExtracted) {
                return `bash: ./configure: No such file or directory\nExtract the source first: tar -xzf /opt/archive/gridmon-2.1.0.tar.gz`;
            }
            if (!engine._state.depsInstalled) {
                return `checking for libpcap... no\nconfigure: error: libpcap is required but not found.\nInstall: sudo dpkg -i /opt/archive/deps/libpcap-dev_1.10.1-4_amd64.deb /opt/archive/deps/libpcap0.8-dev_1.10.1-4_amd64.deb /opt/archive/deps/libssl-dev_3.0.2-0ubuntu1.13_amd64.deb`;
            }
            const hasPrefix = args.some(a => a.startsWith('--prefix'));
            const hasGridCapture = args.includes('--enable-grid-capture');
            if (!hasPrefix || !hasGridCapture) {
                return `Note: Recommended flags: --prefix=/usr/local --enable-grid-capture\nchecking build system type... x86_64-pc-linux-gnu\nchecking for libpcap... yes\nchecking for libssl... yes\nconfigure: warning: --enable-grid-capture not set. UDP port 9001 capture support disabled.\nconfigure: creating ./Makefile\n`;
            }
            engine._state.configured = true;
            return `checking build system type... x86_64-pc-linux-gnu\nchecking host system type... x86_64-pc-linux-gnu\nchecking for gcc... gcc\nchecking for libpcap... yes (1.10.1)\nchecking for libssl... yes (3.0.2)\nchecking for grid-capture support... enabled\nconfigure: creating ./Makefile\nconfigure: creating config.h\nConfiguration complete. Run: make -j$(nproc)\n`;
        },

        // make -- compile gridmon
        'make': function(args, term, engine) {
            if (!engine._state.configured) {
                return `make: *** No targets specified and no makefile found. Stop.\nRun ./configure --prefix=/usr/local --enable-grid-capture first.`;
            }
            if (!engine._state.built) {
                engine._state.built = true;
                return `make[1]: Entering directory '/home/operator/gridmon-2.1.0'\nCC src/capture.c\nCC src/filter.c\nCC src/output.c\nCC src/main.c\nLINK gridmon\nmake[1]: Leaving directory '/home/operator/gridmon-2.1.0'\n`;
            }
            return `make: Nothing to be done for 'all'.`;
        },

        // gridmon -- run the compiled tool
        'gridmon': function(args, term, engine) {
            if (!engine._state.installed) {
                return `bash: gridmon: command not found\nInstall with: sudo checkinstall --pkgname=gridmon --pkgversion=2.1.0 --backup=no --fstrans=no make install`;
            }

            if (args.includes('--version')) {
                return `gridmon 2.1.0 (grid-capture enabled)\nBuilt: Apr 10 2026 on cell-034\nLibraries: libpcap 1.10.1, libssl 3.0.2\n`;
            }

            if (args.includes('--capture')) {
                const ifaceIdx = args.indexOf('--interface');
                const iface = ifaceIdx >= 0 ? args[ifaceIdx + 1] : 'eth0';
                const filterIdx = args.indexOf('--filter');
                const filter = filterIdx >= 0 ? args[filterIdx + 1] : '';
                const outputIdx = args.indexOf('--output');
                const output = outputIdx >= 0 ? args[outputIdx + 1] : '/tmp/capture.pcap';

                if (!filter.includes('9001') || !filter.includes('udp')) {
                    return `gridmon: capturing on ${iface}\nNo filter set for UDP 9001 -- sector signature may not be captured.\nRun: gridmon --capture --interface eth0 --filter "udp port 9001" --output /tmp/capture.pcap`;
                }

                engine._state.capturePcapCreated = true;
                engine.filesystem['/'].children.tmp.children['capture.pcap'] = {
                    type: 'file',
                    content: '[pcap binary]\nFRAME 1: 2026-04-10T08:15:00.000Z UDP 10.0.1.99:9001 -> 10.0.1.34:9001\nPAYLOAD: SECTOR7_SIG:a9f3e7c2b1d4\n'
                };
                return `gridmon: capturing on ${iface}, filter: "${filter}"\nCapture started...\n1 packet captured (1 sector signature detected)\nOutput written to: ${output}\nRun /opt/verify/run-capture.sh to validate.\n`;
            }

            return `Usage: gridmon [--version] [--capture --interface <iface> --filter <bpf> --output <pcap>]`;
        },

        // /opt/verify/test-install.sh -- awards Flag 1
        '/opt/verify/test-install.sh': function(args, term, engine) {
            if (!engine._state.installed) {
                return `[FAIL] /usr/local/bin/gridmon not found. Did you run checkinstall?\n[FAIL] dpkg has no record of gridmon.`;
            }
            engine.awardFlag('flag1');
            return `[PASS] /usr/local/bin/gridmon exists and is executable\n[PASS] dpkg records gridmon as installed\ngridmon 2.1.0 (grid-capture enabled)\nFLAG: FLAG{gridmon_compiled_and_packaged_with_checkinstall}`;
        },

        // /opt/verify/run-capture.sh -- awards Flag 2
        '/opt/verify/run-capture.sh': function(args, term, engine) {
            if (!engine._state.capturePcapCreated) {
                return `[FAIL] /tmp/capture.pcap not found.\nRun: gridmon --capture --interface eth0 --filter 'udp port 9001' --output /tmp/capture.pcap`;
            }
            engine.awardFlag('flag2');
            return `[PASS] Sector signature captured in pcap.\n[PASS] Payload: SECTOR7_SIG:a9f3e7c2b1d4\nFLAG: FLAG{sector_signature_captured_on_udp_9001}`;
        },

        // ping -- limited to local mesh
        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] <destination>';
            if (target === '127.0.0.1' || target === 'localhost') {
                return `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.031 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            // Grid armory and external hosts are down
            return `PING ${target} (${target}) 56(84) bytes of data.\nFrom 10.0.1.34 icmp_seq=1 Destination Host Unreachable\n\n--- ${target} ping statistics ---\n1 packets transmitted, 0 received, +1 errors, 100% packet loss\n\nGrid Armory is offline. Local mesh only.`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l06-field-assembly_flag1_gridmon_compiled_and}',
            label: 'Gridmon Compiled and Installed',
            description: 'gridmon 2.1.0 compiled from source and installed via checkinstall.',
            points: 300,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l06-field-assembly_flag2_sector_signature_cap}',
            label: 'Sector Signature Captured',
            description: 'gridmon used to capture the hidden UDP 9001 signature.',
            points: 300,
            autoCheck: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1500000, points: 100 },
        timeBonusThreshold: 2400
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Check your build dependencies first. Run ./configure and read the error output. Install missing deps from /opt/archive/deps/ with dpkg -i before running configure again.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'The checksum file is in /opt/archive/. Use sha256sum -c /opt/archive/gridmon-2.1.0.tar.gz.sha256 from the /opt/archive/ directory to verify BEFORE extracting.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'After compiling, use checkinstall instead of make install so the package is tracked by dpkg. Then run: gridmon --capture --interface eth0 --filter "udp port 9001" --output /tmp/capture.pcap',
            cost: 50,
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'LPI-LPIC-1',
        mappings: [
            { flagId: 'flag1', objective: '102.5', description: 'Use Debian package management', skill: 'Compile from source, install dependencies offline, package with checkinstall' },
            { flagId: 'flag2', objective: '102.4', description: 'Use Debian package management', skill: 'Binary usage, BPF filter construction, pcap output verification' }
        ]
    }

};
