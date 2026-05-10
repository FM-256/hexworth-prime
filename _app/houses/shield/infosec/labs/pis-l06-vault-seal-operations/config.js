/* ============================================================
   PIS-L06: Vault Seal Operations
   Principles of Information Security -- CTF Lab
   Cryptographic operations: AES encryption, RSA decryption,
   file integrity verification via hashing
   SY0-701: 1.4, 5.1
   ============================================================ */

const PISL06Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Vault Seal Operations',
    subtitle: 'Hexworth Containment -- Cryptographic Vault Operations',
    description: 'Three cryptographic operations are queued for the vault. Encrypt a classified specimen file with AES-256. Decrypt an intercepted communication using RSA. Verify the integrity of a specimen manifest using SHA-256 hashes and identify the tampered file.',
    difficulty: 'Intermediate',
    estimatedTime: 45,
    accent: '#ec4899',
    storageKey: 'hexworth_lab_pis_l06',
    registryId: 'pis-l06-vault-seal-operations',
    trackerKey: 'lab_pis_l06',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Vault Cryptography Terminal -- BSL-2 Clearance',
            'OpenSSL 3.2.1: LOADED',
            'GPG keyring: INITIALIZED',
            'Vault key store: CONNECTED',
            'HSM (simulated): ONLINE'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'Three operations are pending in the vault operations queue. First: a classified specimen profile must be encrypted before it can be transmitted to BSL-4 storage -- AES-256 is required. Second: a communication intercepted from a threat actor was encrypted with our RSA public key by a source asset -- decrypt it to read the intelligence. Third: the morning specimen manifest integrity check failed on one file -- find the tampered record using SHA-256 hashes.',
        scenario: 'Vault seal operations require precise cryptographic procedures. Wrong algorithm, wrong key, wrong operation -- the vault rejects it. The simulated openssl, gpg, sha256sum, and md5sum commands behave like their real counterparts. Study the vault key store for the correct keys and algorithms. The integrity check has reference hashes on file -- compare them against the actual files.',
        outro: 'All three vault operations complete. Specimen profile sealed in AES-256 vault. Intercepted communication decrypted -- intelligence forwarded to Field Command. Tampered specimen manifest identified and flagged for forensic review. Vault operations log updated.',

        goals: [
            "Apply AES-256-CBC for symmetric encryption of classified specimen data",
            "Use RSA private-key decryption to read intercepted communications encrypted under the public key",
            "Detect file tampering via SHA-256 hash comparison against the reference manifest",
            "Build muscle memory for openssl + gpg invocation patterns in real cryptographic operations",
            "Recognize that algorithm choice is not optional -- the vault rejects wrong-cipher operations, just like real systems"
        ],

        toolkit: [
            { name: "openssl", purpose: "Symmetric and asymmetric crypto operations: enc, dgst, rsa decrypt, etc.", sample: "openssl enc -aes-256-cbc -in specimen-7719.dat -out specimen-7719.enc" },
            { name: "gpg", purpose: "GnuPG operations: encrypt, decrypt, verify with the vault keyring", sample: "gpg --decrypt intercepted-comms.enc" },
            { name: "verify-integrity", purpose: "Run SHA-256 hash check against the reference manifest to find tampered files", sample: "verify-integrity manifest.sha256" },
            { name: "help", purpose: "Command reference", sample: "help" }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'analyst',
        hostname: 'vault-ws-01',
        startDir: '/home/analyst',
        welcome: 'Hexworth Containment -- Vault Cryptography Terminal\nBSL-2 Clearance Active\n\n*** 3 VAULT OPERATIONS PENDING ***\n  [1] Encrypt: specimen-7719.dat (AES-256 required)\n  [2] Decrypt: intercepted-comms.enc (RSA key on file)\n  [3] Integrity check: specimen manifest (1 file tampered)\n\nType "ls /vault/" to see available files.\nType "help" for command reference.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',    app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // Custom desktop-icon dispatch \u2014 invoked by BoxEngine's `default:` extension
    // hook (BoxEngine.js:1110-1115) for any icon whose `app` is not built-in.
    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
            // Re-summon \u2014 bypass skip-next-time storage; lab is already running
            // so the launch callback is a no-op.
            BriefingPage.show(this, function() {}, { force: true });
        }
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'VAULT OPERATIONS NOTES\n======================\nOperation 1: ENCRYPT\n  File: /vault/specimen-7719.dat\n  Required algorithm: AES-256-CBC\n  Key: vault-aes-key.bin (in /vault/keys/)\n  Command pattern:\n    openssl enc -aes-256-cbc -in <input> -out <output> -pass file:<keyfile>\n  Output: /vault/specimen-7719.dat.enc\n\nOperation 2: DECRYPT\n  File: /vault/intercepted-comms.enc\n  Key: vault-rsa-private.pem (in /vault/keys/)\n  Command pattern:\n    openssl rsautl -decrypt -inkey <keyfile> -in <input> -out <output>\n  Output: /vault/intercepted-comms.dec\n\nOperation 3: INTEGRITY CHECK\n  Reference hashes: /vault/manifest-hashes.txt\n  Files to check: /vault/manifest/\n  Command: sha256sum <file>  or  sha256sum -c <hashfile>\n  One file in the manifest has been tampered with.\n  Identify it using: verify-integrity\n\nAdditional commands:\n  openssl      Simulate openssl cryptographic operations\n  gpg          Simulate GPG operations\n  sha256sum    Compute/verify SHA-256 hashes\n  md5sum       Compute/verify MD5 hashes (legacy)\n  verify-integrity  Run automated manifest integrity check\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /vault/\ncat /vault/keys/README.txt\nsha256sum /vault/manifest/specimen-catalog.db\n'
                                }
                            }
                        }
                    }
                },
                'vault': {
                    type: 'dir',
                    children: {
                        'specimen-7719.dat': {
                            type: 'file',
                            content: '--- CLASSIFIED SPECIMEN PROFILE ---\nSpecimen ID: SPX-7719\nClass: Hostage Pathogen (Ransomware)\nCVSS: 9.8 (CRITICAL)\nCapture Date: 2026-04-08\nCapture Method: Honeypot FS7-HNY-01\n\nBehavior Summary:\n  Encryption: AES-256 (ironic -- uses strong encryption against victims)\n  Key exchange: RSA-2048 to attacker C2\n  Target extensions: 847 file types\n  Exfil: data extracted before encryption (double extortion)\n  C2: 45.142.212.100:443\n  Ransom demand: 10 BTC (~350,000 USD at capture date)\n\nContainment level: BSL-4\nTransfer authorization: Director Signed (TA-2026-0409-7719)\n\n[END SPECIMEN PROFILE -- ENCRYPT BEFORE TRANSMISSION]\n'
                        },
                        'intercepted-comms.enc': {
                            type: 'file',
                            content: '[RSA-ENCRYPTED BINARY -- run decrypt to read]\nEncrypted with: Hexworth vault-rsa-public.pem\nSource: ASSET SIGMA (field asset)\nTimestamp: 2026-04-09T01:30:00Z\nPriority: HIGH\n\n[Ciphertext representation -- 256 bytes RSA-2048 block]\n4f3a9d2e1b8c7f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1\n9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8\n7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6\nd5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c\n'
                        },
                        'manifest-hashes.txt': {
                            type: 'file',
                            content: '# HEXWORTH CONTAINMENT -- SPECIMEN MANIFEST REFERENCE HASHES\n# Generated: 2026-04-09T00:00:00Z by vault-integrity-daemon\n# Algorithm: SHA-256\n# WARNING: These hashes are the TRUSTED reference. Compare against actual files.\n\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  specimen-catalog.db\n7b502a71ab73b8c0be0d5e8ae57e5a85b45ee4b3820b3e2e7b0e21ecbe90ab8c  clearance-matrix.csv\n9a4bfca6d27a4b8ac9b3e621f77c1b5f0eb3a8d47fca2e9b3d76c5e4f1a2b893  transfer-log.json\nDAMAGED_HASH_PLACEHOLDER_WILL_NOT_MATCH  specimen-7718-profile.txt\n2c624232cdd221771294dfbb310acbc27fbccd7b7b07dab4c44c59e0e5478d5b  incident-report-0408.pdf\n'
                        },
                        'manifest': {
                            type: 'dir',
                            children: {
                                'specimen-catalog.db': {
                                    type: 'file',
                                    content: '[BINARY: Specimen Catalog Database]\nSHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nRecords: 7719 specimens\nLast modified: 2026-04-09T00:00:00Z\n'
                                },
                                'clearance-matrix.csv': {
                                    type: 'file',
                                    content: 'analyst_id,clearance_level,lab_access,expiry\nAN-001,BSL-2,1-2,2027-01-01\nAN-002,BSL-1,1,2026-12-01\nAN-003,BSL-3,1-2-3,2027-06-01\nSHA-256: 7b502a71ab73b8c0be0d5e8ae57e5a85b45ee4b3820b3e2e7b0e21ecbe90ab8c\n'
                                },
                                'transfer-log.json': {
                                    type: 'file',
                                    content: '{"transfers":[{"id":"TF-001","specimen":"SPX-001","from":"BSL-1","to":"BSL-2","date":"2026-04-09","auth":"TA-001"},{"id":"TF-002","specimen":"SPX-7719","from":"INTAKE","to":"BSL-4","date":"2026-04-09","auth":"TA-7719"}]}\nSHA-256: 9a4bfca6d27a4b8ac9b3e621f77c1b5f0eb3a8d47fca2e9b3d76c5e4f1a2b893\n'
                                },
                                'specimen-7718-profile.txt': {
                                    type: 'file',
                                    // This file has been tampered -- hash will not match reference
                                    content: '[TAMPERED]\nSpecimen ID: SPX-7718\nClass: Rootkit\n\n-- UNAUTHORIZED MODIFICATION --\nTransfer destination changed from BSL-4 to BSL-1 [TAMPERED]\nAuthorization codes modified [TAMPERED]\nClearance level downgraded to BSL-1 [TAMPERED]\n\nOriginal entry:\nSpecimen ID: SPX-7718 | Class: Advanced Rootkit | BSL-4 | Auth: TA-2026-0409-7718\n\nSHA-256-ACTUAL: f1d2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2\n'
                                },
                                'incident-report-0408.pdf': {
                                    type: 'file',
                                    content: '[BINARY: Incident Report PDF]\nDate: 2026-04-08\nIncident: Unauthorized access attempt -- Lab 3\nStatus: Closed\nSHA-256: 2c624232cdd221771294dfbb310acbc27fbccd7b7b07dab4c44c59e0e5478d5b\n'
                                }
                            }
                        },
                        'keys': {
                            type: 'dir',
                            children: {
                                'README.txt': {
                                    type: 'file',
                                    content: 'VAULT KEY STORE -- READ ONLY\n==============================\nvault-aes-key.bin\n  Type: AES-256 symmetric key (raw binary, 32 bytes)\n  Use for: AES-256-CBC encryption/decryption of specimen files\n  Usage: -pass file:/vault/keys/vault-aes-key.bin\n\nvault-rsa-private.pem\n  Type: RSA-2048 private key (PEM format)\n  Use for: Decrypting RSA-encrypted communications\n  Corresponding public key is published on the containment certificate authority\n  Usage: -inkey /vault/keys/vault-rsa-private.pem\n\nKey custody: Director-signed (KC-2026-001)\nRotation schedule: 90 days\nNext rotation: 2026-07-09\n'
                                },
                                'vault-aes-key.bin': {
                                    type: 'file',
                                    content: '[BINARY: AES-256 Key -- 32 bytes]\na7f3d9e2b8c1f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0\n'
                                },
                                'vault-rsa-private.pem': {
                                    type: 'file',
                                    content: '-----BEGIN RSA PRIVATE KEY-----\n[RSA-2048 Private Key -- vault use only]\nMIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4PAtEsHBJcQBTyKMWkBrOzLCTZm\nJkPKGQ8WRexNmCpRzMm3xrUMMgBzOtXF4tnlQyZXR5PsURN8hLJDzC6ZMvR4zJ0D\n[... 2048-bit key content truncated for display ...]\n-----END RSA PRIVATE KEY-----\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // =========================================================

    _state: {
        specimenEncrypted: false,
        commsDecrypted: false,
        integrityVerified: false,
        tamperedFileIdentified: null
    },

    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // openssl -- simulate openssl cryptographic operations
        'openssl': function(args, term, engine) {
            if (args.length === 0) {
                return 'OpenSSL 3.2.1 (simulated)\nUsage:\n  openssl enc -aes-256-cbc -in <input> -out <output> -pass file:<keyfile>\n  openssl rsautl -decrypt -inkey <keyfile> -in <input> -out <output>\n  openssl genrsa -out <keyfile> 2048\n  openssl rsa -in <keyfile> -pubout -out <pubkey>';
            }

            const sub = args[0];

            // AES encryption
            if (sub === 'enc') {
                const algFlag = args.includes('-aes-256-cbc') || args.includes('-aes256');
                const inFlag = args.indexOf('-in');
                const outFlag = args.indexOf('-out');
                const passFlag = args.indexOf('-pass');

                const inFile = inFlag >= 0 ? args[inFlag + 1] : null;
                const outFile = outFlag >= 0 ? args[outFlag + 1] : null;
                const passArg = passFlag >= 0 ? args[passFlag + 1] : null;

                if (!algFlag) {
                    return 'Error: Must specify an algorithm.\nRequired for vault operations: -aes-256-cbc\nExample: openssl enc -aes-256-cbc -in /vault/specimen-7719.dat -out /vault/specimen-7719.dat.enc -pass file:/vault/keys/vault-aes-key.bin';
                }

                if (!inFile || !inFile.includes('specimen-7719')) {
                    return 'Error: Input file not specified or wrong file.\nUse: -in /vault/specimen-7719.dat';
                }

                if (!outFile) {
                    return 'Error: Output file not specified.\nUse: -out /vault/specimen-7719.dat.enc';
                }

                if (!passArg || !passArg.includes('vault-aes-key')) {
                    return 'Error: Key file not specified or wrong key.\nVault requires: -pass file:/vault/keys/vault-aes-key.bin';
                }

                // Successful encryption
                engine.config._state.specimenEncrypted = true;

                // Add encrypted file to filesystem
                engine.filesystem['/'].children.vault.children['specimen-7719.dat.enc'] = {
                    type: 'file',
                    content: '[AES-256-CBC ENCRYPTED -- vault-aes-key.bin]\n[Binary ciphertext representation]\n5f3c9a2e1b8d7f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1\n0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9\n[256 bytes -- AES-256-CBC with PBKDF2 key derivation]\n'
                };

                let output = 'openssl enc -aes-256-cbc\n\nEncrypting: /vault/specimen-7719.dat\nAlgorithm:  AES-256-CBC\nKey:        vault-aes-key.bin (256-bit symmetric)\nOutput:     /vault/specimen-7719.dat.enc\n\nKey derivation: PBKDF2-SHA256, 10000 iterations\nIV: randomly generated and prepended to ciphertext\n\nDone. Encrypted file written: /vault/specimen-7719.dat.enc\n\nSECURITY NOTE: AES-256-CBC is symmetric encryption.\n  Same key encrypts and decrypts. Key must be securely\n  transmitted to BSL-4 via separate channel.\n';

                if (!engine.config._flag1Awarded) {
                    engine.config._flag1Awarded = true;
                    engine.awardFlag('flag1');
                    output += '\n[VAULT MILESTONE] Specimen encrypted with AES-256. Flag unlocked.';
                }

                return output;
            }

            // RSA decryption
            if (sub === 'rsautl' || sub === 'pkeyutl') {
                const decryptFlag = args.includes('-decrypt');
                const inkeyFlag = args.indexOf('-inkey');
                const inFlag = args.indexOf('-in');
                const outFlag = args.indexOf('-out');

                const keyFile = inkeyFlag >= 0 ? args[inkeyFlag + 1] : null;
                const inFile = inFlag >= 0 ? args[inFlag + 1] : null;
                const outFile = outFlag >= 0 ? args[outFlag + 1] : null;

                if (!decryptFlag) {
                    return 'Error: Must specify -decrypt for decryption.\nExample: openssl rsautl -decrypt -inkey /vault/keys/vault-rsa-private.pem -in /vault/intercepted-comms.enc -out /vault/intercepted-comms.dec';
                }

                if (!keyFile || !keyFile.includes('rsa-private')) {
                    return 'Error: Wrong key file or not specified.\nDecryption requires the RSA private key: -inkey /vault/keys/vault-rsa-private.pem\n(The public key encrypts. The private key decrypts. Asymmetric property.)';
                }

                if (!inFile || !inFile.includes('intercepted-comms')) {
                    return 'Error: Wrong input file.\nUse: -in /vault/intercepted-comms.enc';
                }

                if (!outFile) {
                    return 'Error: Output file not specified.\nUse: -out /vault/intercepted-comms.dec';
                }

                // Successful decryption
                engine.config._state.commsDecrypted = true;

                // Add decrypted file to filesystem
                engine.filesystem['/'].children.vault.children['intercepted-comms.dec'] = {
                    type: 'file',
                    content: '--- DECRYPTED INTELLIGENCE -- ASSET SIGMA ---\nTimestamp: 2026-04-09T01:28:00Z\nClassification: SECRET//NOFORN\n\nTARGET ACTOR UPDATE:\nHave confirmed the threat actor behind OUTBREAK-7719 is APT-33 variant.\nThey are targeting three financial sector facilities this week.\nKnown C2 infrastructure:\n  Primary: 45.142.212.100 (Netherlands VPS)\n  Fallback: 185.220.101.47 (TOR exit)\n  New: 91.108.4.123 (Germany VPS -- not in current feeds)\n\nRecommend: add 91.108.4.123 to all firewall blocklists immediately.\n\nNext contact: 2026-04-12T02:00Z\n-- SIGMA\n--- END INTELLIGENCE ---\n'
                };

                let output = 'openssl rsautl -decrypt\n\nDecrypting: /vault/intercepted-comms.enc\nKey:        vault-rsa-private.pem (RSA-2048)\nOutput:     /vault/intercepted-comms.dec\n\nDecryption successful.\n\nSECURITY NOTE: RSA is asymmetric encryption.\n  Public key (published): anyone can encrypt a message for us\n  Private key (secret): only we can decrypt\n  This is why ASSET SIGMA could encrypt for us without a shared secret.\n  RSA is too slow for large data -- used for key exchange and small payloads.\n\nDecrypted file written: /vault/intercepted-comms.dec\nUse: cat /vault/intercepted-comms.dec to read the intelligence.\n';

                if (!engine.config._flag2Awarded) {
                    engine.config._flag2Awarded = true;
                    engine.awardFlag('flag2');
                    output += '\n[VAULT MILESTONE] Intercepted communication decrypted. Flag unlocked.';
                }

                return output;
            }

            return `openssl: unknown command "${sub}"\nAvailable: enc, rsautl, pkeyutl, genrsa, rsa`;
        },

        // sha256sum -- compute or verify SHA-256 hashes
        'sha256sum': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage:\n  sha256sum <file>         Compute hash\n  sha256sum -c <hashfile>  Verify against hash file';
            }

            const checkFlag = args[0] === '-c';

            if (checkFlag) {
                // Verify mode -- run against manifest-hashes.txt
                const hashFile = args[1] || '';
                if (!hashFile.includes('manifest-hashes')) {
                    return 'Usage: sha256sum -c /vault/manifest-hashes.txt\nThis compares all files listed in the hash file against their recorded hashes.';
                }

                return 'Verifying manifest integrity against /vault/manifest-hashes.txt...\n\n/vault/manifest/specimen-catalog.db: OK\n/vault/manifest/clearance-matrix.csv: OK\n/vault/manifest/transfer-log.json: OK\n/vault/manifest/specimen-7718-profile.txt: FAILED\n/vault/manifest/incident-report-0408.pdf: OK\n\nsha256sum: WARNING: 1 computed checksum did NOT match\n\nFailed file: /vault/manifest/specimen-7718-profile.txt\nExpected: DAMAGED_HASH_PLACEHOLDER_WILL_NOT_MATCH\nActual:   f1d2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2\n\nThis file has been modified since the reference hash was generated.';
            }

            // Compute mode -- hash a single file
            const targetFile = args[0];
            const hashes = {
                '/vault/manifest/specimen-catalog.db': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  /vault/manifest/specimen-catalog.db',
                '/vault/manifest/clearance-matrix.csv': '7b502a71ab73b8c0be0d5e8ae57e5a85b45ee4b3820b3e2e7b0e21ecbe90ab8c  /vault/manifest/clearance-matrix.csv',
                '/vault/manifest/transfer-log.json': '9a4bfca6d27a4b8ac9b3e621f77c1b5f0eb3a8d47fca2e9b3d76c5e4f1a2b893  /vault/manifest/transfer-log.json',
                '/vault/manifest/specimen-7718-profile.txt': 'f1d2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2  /vault/manifest/specimen-7718-profile.txt',
                '/vault/manifest/incident-report-0408.pdf': '2c624232cdd221771294dfbb310acbc27fbccd7b7b07dab4c44c59e0e5478d5b  /vault/manifest/incident-report-0408.pdf'
            };

            const result = hashes[targetFile] || hashes[targetFile.replace('manifest/', 'manifest/')];
            if (result) return result;

            // Try partial match
            for (const [path, hash] of Object.entries(hashes)) {
                if (targetFile && path.includes(targetFile.split('/').pop())) {
                    return hash.replace(path, targetFile);
                }
            }

            return `sha256sum: ${targetFile}: No such file or directory`;
        },

        // md5sum -- compute MD5 hash (legacy, educational comparison)
        'md5sum': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: md5sum <file>\nNote: MD5 is cryptographically broken for integrity verification.\nUse sha256sum for all vault operations.';
            }

            const target = args[0];
            const md5s = {
                '/vault/manifest/specimen-catalog.db': 'd41d8cd98f00b204e9800998ecf8427e  /vault/manifest/specimen-catalog.db',
                '/vault/manifest/clearance-matrix.csv': 'b14a7b8059d9c055954c92674ce60032  /vault/manifest/clearance-matrix.csv',
                '/vault/manifest/specimen-7718-profile.txt': 'a87ff679a2f3e71d9181a67b7542122c  /vault/manifest/specimen-7718-profile.txt'
            };

            for (const [path, hash] of Object.entries(md5s)) {
                if (target && path.includes(target.split('/').pop())) {
                    return hash + '\n\nWARNING: MD5 is not suitable for security-critical integrity verification.\nMD5 collisions are computationally feasible. An attacker can craft a\nmalicious file that has the same MD5 hash as the original.\nAlways use SHA-256 or stronger for vault operations.';
                }
            }

            return `md5sum: ${target}: No such file or directory`;
        },

        // gpg -- simulate GPG operations (informational only for this lab)
        'gpg': function(args, term, engine) {
            if (args.length === 0) {
                return 'GnuPG 2.3.8 (simulated)\nNote: This vault uses OpenSSL for operations. GPG is available for key signing.\nUsage:\n  gpg --encrypt --recipient <key-id> <file>\n  gpg --decrypt <file.gpg>\n  gpg --verify <signature> <file>';
            }

            return 'GPG note: Vault operations use OpenSSL (enc, rsautl commands).\nGPG is used for message signing and key signing ceremonies.\nFor this operation, use the openssl commands documented in ~/notes.txt.';
        },

        // verify-integrity -- automated manifest integrity check (requires flag1 + flag2 first)
        'verify-integrity': function(args, term, engine) {
            // Gate: must complete encryption and decryption before integrity check
            if (!engine.config._state.specimenEncrypted) {
                return 'VAULT ERROR: Operation 1 (AES-256 encryption) must be completed before running integrity checks.\nEncrypt /vault/specimen-7719.dat first.';
            }
            if (!engine.config._state.commsDecrypted) {
                return 'VAULT ERROR: Operation 2 (RSA decryption) must be completed before running integrity checks.\nDecrypt /vault/intercepted-comms.enc first.';
            }

            engine.config._state.integrityVerified = true;
            engine.config._state.tamperedFileIdentified = 'specimen-7718-profile.txt';

            let output = 'MANIFEST INTEGRITY CHECK -- VAULT OPERATIONS\n' + '='.repeat(50) + '\nRunning SHA-256 verification against manifest-hashes.txt...\n\nChecking 5 files:\n  specimen-catalog.db          [SHA-256] OK\n  clearance-matrix.csv         [SHA-256] OK\n  transfer-log.json            [SHA-256] OK\n  specimen-7718-profile.txt    [SHA-256] MISMATCH -- TAMPERED\n  incident-report-0408.pdf     [SHA-256] OK\n\nRESULT: 1 FILE FAILED INTEGRITY CHECK\n\nTampered file: /vault/manifest/specimen-7718-profile.txt\n\nEvidence:\n  Reference hash:  DAMAGED_HASH_PLACEHOLDER_WILL_NOT_MATCH\n  Computed hash:   f1d2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2\n  Hash mismatch: file has been modified since reference was generated\n\nContent analysis of tampered file:\n  Transfer destination changed: BSL-4 --> BSL-1 (downgrade)\n  Authorization codes modified\n  Clearance level downgraded\n\nThis is a high-severity finding. SPX-7718 is a BSL-4 specimen.\nIf transferred to BSL-1 per the tampered record, it would escape\nhigh-containment protocols.\n\nFILE QUARANTINED. Original record being restored from backup.\nIncident logged: INC-2026-0409-INTEGRITY-001\n';

            if (!engine.config._flag3Awarded) {
                engine.config._flag3Awarded = true;
                engine.awardFlag('flag3');
                output += '\n[VAULT MILESTONE] Tampered file identified via hash comparison. Flag unlocked.';
            }

            return output;
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'VAULT CRYPTOGRAPHY TERMINAL -- COMMAND REFERENCE\n\n  openssl enc -aes-256-cbc ...   AES-256 encrypt/decrypt\n  openssl rsautl -decrypt ...    RSA decrypt\n  sha256sum <file>               Compute SHA-256 hash\n  sha256sum -c <hashfile>        Verify against hash file\n  md5sum <file>                  Compute MD5 (legacy)\n  gpg                            GPG operations (informational)\n  verify-integrity               Run automated manifest check\n  cat <file>                     Read a file\n  ls <path>                      List directory\n\nKey files:\n  /vault/keys/vault-aes-key.bin        AES-256 symmetric key\n  /vault/keys/vault-rsa-private.pem    RSA-2048 private key\n\nSee ~/notes.txt for operation details and command examples.';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l06-vault-seal-operations_flag1_specimen_encrypted_w}',
            label: 'Specimen Encrypted with AES-256',
            description: 'Successfully encrypted specimen-7719.dat using AES-256-CBC and the vault key.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l06-vault-seal-operations_flag2_intercepted_comms_de}',
            label: 'Intercepted Comms Decrypted',
            description: 'Successfully decrypted intercepted-comms.enc using the RSA private key.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-l06-vault-seal-operations_flag3_tampered_file_identi}',
            label: 'Tampered File Identified',
            description: 'Identified the tampered manifest file using SHA-256 hash comparison.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        maxScore: 750,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2700
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'For AES encryption: read ~/notes.txt for the exact command pattern. You need four flags: the algorithm (-aes-256-cbc), the input file (-in), the output file (-out), and the key (-pass file:...). The key file is in /vault/keys/.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For RSA decryption: RSA is asymmetric -- the public key encrypts, the private key decrypts. The message was encrypted with our public key by ASSET SIGMA. So you need the private key. It is at /vault/keys/vault-rsa-private.pem. Use: openssl rsautl -decrypt.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'For integrity verification: run sha256sum -c /vault/manifest-hashes.txt to compare all files at once. The one that fails the check has been tampered with. Then run verify-integrity to formally file the finding and complete the operation.',
            cost: 50,
            penalty: -50
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '1.4', description: 'Explain the importance of using appropriate cryptographic solutions', skill: 'Applying AES-256-CBC symmetric encryption for data-at-rest protection' },
            { flagId: 'flag2', objective: '5.1', description: 'Summarize elements of effective security governance', skill: 'Applying RSA asymmetric encryption for secure communications -- public key encrypts, private key decrypts' },
            { flagId: 'flag3', objective: '1.4', description: 'Explain the importance of using appropriate cryptographic solutions', skill: 'Using cryptographic hash functions (SHA-256) for file integrity verification and tampering detection' }
        ]
    }

};
