/* ============================================================
   PIS-L06: Vault Seal Operations
   Principles of Information Security -- CTF Lab
   Cryptographic operations: AES encryption, RSA decryption,
   file integrity verification via hashing
   SY0-701: 1.4
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
            { name: "openssl", purpose: "Symmetric and asymmetric crypto operations: enc, dgst, rsa decrypt, etc.", sample: "openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -in specimen-7719.dat -out specimen-7719.dat.enc -pass file:vault-aes-key.bin" },
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
                                    content: 'VAULT OPERATIONS NOTES\n======================\nOperation 1: ENCRYPT\n  File: /vault/specimen-7719.dat\n  Required algorithm: AES-256-CBC\n  Passphrase file: vault-aes-key.bin (in /vault/keys/)\n  Command pattern:\n    openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -in <input> -out <output> -pass file:<keyfile>\n  Output: /vault/specimen-7719.dat.enc\n\nOperation 2: DECRYPT\n  File: /vault/intercepted-comms.enc\n  Key: vault-rsa-private.pem (in /vault/keys/)\n  Command pattern:\n    openssl rsautl -decrypt -inkey <keyfile> -in <input> -out <output>\n  Output: /vault/intercepted-comms.dec\n\nOperation 3: INTEGRITY CHECK\n  Reference hashes: /vault/manifest-hashes.txt\n  Files to check: /vault/manifest/\n  Command: sha256sum <file>  or  sha256sum -c <hashfile>\n  One file in the manifest has been tampered with.\n  Identify it using: verify-integrity\n\nAdditional commands:\n  openssl      Simulate openssl cryptographic operations\n  gpg          Simulate GPG operations\n  sha256sum    Compute/verify SHA-256 hashes\n  md5sum       Compute/verify MD5 hashes (legacy)\n  verify-integrity  Run automated manifest integrity check\n'
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
                            content: '# HEXWORTH CONTAINMENT -- SPECIMEN MANIFEST REFERENCE HASHES\n# Generated: 2026-04-09T00:00:00Z by vault-integrity-daemon\n# Algorithm: SHA-256\n# WARNING: These hashes are the TRUSTED reference. Compare against actual files.\n\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  specimen-catalog.db\n7b502a71ab73b8c0be0d5e8ae57e5a85b45ee4b3820b3e2e7b0e21ecbe90ab8c  clearance-matrix.csv\n9a4bfca6d27a4b8ac9b3e621f77c1b5f0eb3a8d47fca2e9b3d76c5e4f1a2b893  transfer-log.json\n8f3e4d2a916b5c7e0d8a4f9b3c2e1f0a6d5b8e7c9a4f3b1e2d6c0a5f8b9e3c2d  specimen-7718-profile.txt\n2c624232cdd221771294dfbb310acbc27fbccd7b7b07dab4c44c59e0e5478d5b  incident-report-0408.pdf\n'
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
                                    content: 'Specimen ID: SPX-7718\nClass: Rootkit\nContainment level: BSL-1\nTransfer destination: BSL-1\nAuthorization: TA-2026-0409-7718\nSHA-256: f1d2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2\n'
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
                                    content: 'VAULT KEY STORE (READ ONLY)\n==============================\nvault-aes-key.bin\n  Type: passphrase file (one line: 64 hex characters of random data)\n  Use for: AES-256-CBC encryption/decryption of specimen files\n  Usage: -pass file:/vault/keys/vault-aes-key.bin -pbkdf2 -iter 100000\n  How enc uses it: -pass file: reads the FIRST LINE of the file as a passphrase.\n    openssl enc derives the 256-bit key and the IV from that passphrase plus a\n    random 8-byte salt. -pbkdf2 -iter makes that derivation slow to brute-force.\n    (A raw key would be given directly instead: -K <64 hex> -iv <32 hex>.)\n\nvault-rsa-private.pem\n  Type: RSA-2048 private key (PEM format)\n  Use for: Decrypting RSA-encrypted communications\n  Corresponding public key is published on the containment certificate authority\n  Usage: -inkey /vault/keys/vault-rsa-private.pem\n\nKey custody: Director-signed (KC-2026-001)\nRotation schedule: 90 days\nNext rotation: 2026-07-09\n'
                                },
                                'vault-aes-key.bin': {
                                    type: 'file',
                                    content: 'a7f3d9e2b8c1f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0\n'
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
                return 'OpenSSL 3.2.1 (simulated)\nUsage:\n  openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -in <input> -out <output> -pass file:<keyfile>\n  openssl rsautl -decrypt -inkey <keyfile> -in <input> -out <output>\n  openssl genrsa -out <keyfile> 2048\n  openssl rsa -in <keyfile> -pubout -out <pubkey>';
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
                // OpenSSL enc: -iter implies PBKDF2; -pbkdf2 alone uses 10000 iterations.
                // Without either, OpenSSL 3 falls back to EVP_BytesToKey and prints a warning.
                const iterIdx = args.indexOf('-iter');
                const iterCount = iterIdx >= 0 && /^[0-9]+$/.test(args[iterIdx + 1] || '') ? args[iterIdx + 1] : '10000';
                const usePbkdf2 = args.includes('-pbkdf2') || iterIdx >= 0;

                if (!algFlag) {
                    return 'Error: Must specify an algorithm.\nRequired for vault operations: -aes-256-cbc\nExample: openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -in /vault/specimen-7719.dat -out /vault/specimen-7719.dat.enc -pass file:/vault/keys/vault-aes-key.bin';
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
                term.fs['/'].children.vault.children['specimen-7719.dat.enc'] = {
                    type: 'file',
                    content: '[openssl enc output: "Salted__" magic, 8-byte salt, then AES-256-CBC ciphertext]\nSalted__ 3f9a1c7e5b2d8a64\n5f3c9a2e1b8d7f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1\n0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9\n'
                };

                let output = (usePbkdf2 ? '' : '*** WARNING : deprecated key derivation used.\nUsing -iter or -pbkdf2 would be better.\n\n') + 'openssl enc -aes-256-cbc\n\nEncrypting: /vault/specimen-7719.dat\nAlgorithm:  AES-256-CBC\nPassphrase: first line of vault-aes-key.bin (-pass file:)\nOutput:     /vault/specimen-7719.dat.enc\n\n' + (usePbkdf2 ? 'Key derivation: PBKDF2 with HMAC-SHA256, ' + iterCount + ' iterations, random 8-byte salt\n' : 'Key derivation: legacy EVP_BytesToKey (SHA-256, 1 iteration), random 8-byte salt\n  Fast to brute-force. Re-run with -pbkdf2 -iter 100000.\n') + 'Key and IV: both derived from the passphrase and the salt (the IV is not stored)\nFile header: "Salted__" followed by the 8-byte salt, then the ciphertext\n\nDone. Encrypted file written: /vault/specimen-7719.dat.enc\n\nSECURITY NOTE: AES-256-CBC is symmetric encryption.\n  The same passphrase and options decrypt it:\n  openssl enc -d -aes-256-cbc -pbkdf2 -iter <same count> -pass file:<same file>\n  The key file must reach BSL-4 through a separate secure channel.\n';

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
                term.fs['/'].children.vault.children['intercepted-comms.dec'] = {
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

                return 'Verifying manifest integrity against /vault/manifest-hashes.txt...\n\n/vault/manifest/specimen-catalog.db: OK\n/vault/manifest/clearance-matrix.csv: OK\n/vault/manifest/transfer-log.json: OK\n/vault/manifest/specimen-7718-profile.txt: FAILED\n/vault/manifest/incident-report-0408.pdf: OK\n\nsha256sum: WARNING: 1 computed checksum did NOT match\n\nFailed file: /vault/manifest/specimen-7718-profile.txt\nExpected: 8f3e4d2a916b5c7e0d8a4f9b3c2e1f0a6d5b8e7c9a4f3b1e2d6c0a5f8b9e3c2d\nActual:   f1d2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2\n\nThis file has been modified since the reference hash was generated.';
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

            let output = 'MANIFEST INTEGRITY CHECK -- VAULT OPERATIONS\n' + '='.repeat(50) + '\nRunning SHA-256 verification against manifest-hashes.txt...\n\nChecking 5 files:\n  specimen-catalog.db          [SHA-256] OK\n  clearance-matrix.csv         [SHA-256] OK\n  transfer-log.json            [SHA-256] OK\n  specimen-7718-profile.txt    [SHA-256] MISMATCH -- TAMPERED\n  incident-report-0408.pdf     [SHA-256] OK\n\nRESULT: 1 FILE FAILED INTEGRITY CHECK\n\nTampered file: /vault/manifest/specimen-7718-profile.txt\n\nEvidence:\n  Reference hash:  8f3e4d2a916b5c7e0d8a4f9b3c2e1f0a6d5b8e7c9a4f3b1e2d6c0a5f8b9e3c2d\n  Computed hash:   f1d2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2\n  Hash mismatch: file has been modified since reference was generated\n\nContent analysis of tampered file:\n  Transfer destination changed: BSL-4 --> BSL-1 (downgrade)\n  Authorization codes modified\n  Clearance level downgraded\n\nThis is a high-severity finding. SPX-7718 is a BSL-4 specimen.\nIf transferred to BSL-1 per the tampered record, it would escape\nhigh-containment protocols.\n\nFILE QUARANTINED. Original record being restored from backup.\nIncident logged: INC-2026-0409-INTEGRITY-001\n';

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
            label: 'Specimen Encrypted with AES-256',
            description: 'Successfully encrypted specimen-7719.dat using AES-256-CBC and the vault key.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            label: 'Intercepted Comms Decrypted',
            description: 'Successfully decrypted intercepted-comms.enc using the RSA private key.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
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
        minScore: 0,
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
            text: 'For AES encryption: read ~/notes.txt for the exact command pattern. You need the algorithm (-aes-256-cbc), the input file (-in), the output file (-out), and the passphrase file (-pass file:...). Add -pbkdf2 -iter 100000 so the key is derived with PBKDF2 instead of the legacy one-pass method. The key file is in /vault/keys/.',
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
            { flagId: 'flag2', objective: '1.4', description: 'Explain the importance of using appropriate cryptographic solutions', skill: 'Applying RSA asymmetric encryption for secure communications: public key encrypts, private key decrypts' },
            { flagId: 'flag3', objective: '1.4', description: 'Explain the importance of using appropriate cryptographic solutions', skill: 'Using cryptographic hash functions (SHA-256) for file integrity verification and tampering detection' }
        ]
    },

    resetState: function() {
        this._state = {
        specimenEncrypted: false,
        commsDecrypted: false,
        integrityVerified: false,
        tamperedFileIdentified: null
    };
        this._flag1Awarded = false;
        this._flag2Awarded = false;
        this._flag3Awarded = false;
    }


};


// Auto-reset state on script load (BOX-006 backfill 2026-05-23)
if (typeof PISL06Config !== 'undefined') PISL06Config.resetState();


/* Reload safety (2026-11-02). BoxEngine saves and restores engine.state (localStorage), never
   this config object. Progress kept only on the config was lost on a reload while the earned
   flags survived, so a finished step could lock the next one. Every command now runs between
   bind() and store():
     bind():  on the first command after a page load, adopt the progress saved in
              engine.state._pisProgress, then set each _flagNAwarded that
              engine.state.flagsFound (persisted by BoxEngine) already holds. A save made
              before this block existed has no _pisProgress; legacy() then rebuilds only
              the progress that an earned flag proves.
     store(): copy the progress keys into engine.state._pisProgress and save (solo mode).
   No gate changed: with no earned flag and no saved progress, a locked step stays locked. */
(function (cfg, keys, legacy) {
    function bind(engine) {
        var st = engine && engine.state;
        if (!st) return;
        if (cfg._pisBoundState !== st) {
            var first = !cfg._pisBoundState;
            cfg._pisBoundState = st;
            var saved = st._pisProgress;
            if (first && saved && typeof saved === 'object') {
                keys.forEach(function (k) {
                    var v = saved[k];
                    if (v && typeof v === 'object') {
                        cfg[k] = Array.isArray(v) ? v.slice() : Object.assign({}, cfg[k], v);
                    }
                });
            } else if (first && legacy) {
                legacy(cfg, st.flagsFound || []);
            }
        }
        (st.flagsFound || []).forEach(function (id) {
            if (('_' + id + 'Awarded') in cfg) cfg['_' + id + 'Awarded'] = true;
        });
    }
    function store(engine) {
        var st = engine && engine.state;
        if (!st) return;
        var p = {};
        keys.forEach(function (k) { p[k] = cfg[k]; });
        st._pisProgress = p;
        if (!engine._coOpMode && typeof engine.save === 'function') engine.save();
    }
    Object.keys(cfg.commands).forEach(function (cmd) {
        var run = cfg.commands[cmd];
        cfg.commands[cmd] = function (args, term, engine) {
            bind(engine);
            var out = run.apply(this, arguments);
            if (out && typeof out.then === 'function') {
                return out.then(function (r) { store(engine); return r; });
            }
            store(engine);
            return out;
        };
    });
})(PISL06Config, ['_state'], function (cfg, found) {
    var s = cfg._state;
    if (found.indexOf('flag1') >= 0) s.specimenEncrypted = true;
    if (found.indexOf('flag2') >= 0) s.commsDecrypted = true;
    if (found.indexOf('flag3') >= 0) { s.integrityVerified = true; s.tamperedFileIdentified = 'specimen-7718-profile.txt'; }
});
