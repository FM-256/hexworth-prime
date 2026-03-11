/* ================================================================
   CRYPTO-01: Dead Drop — Config
   ================================================================
   Cryptography mission. Navigate a crypto lab visiting stations:
   base64 encoding, hash vault, cipher desk (ROT13), keystore,
   dead drop (encrypted message), hex bench, and verify post.
   Commands: examine, decode, hash, crack, verify.
   ================================================================ */

var CRYPTO_01_CONFIG = {
    id: 'crypto-01',
    missionTitle: 'CRYPTO-01',
    title: 'Dead Drop',
    subtitle: 'Decode, decrypt, and verify a covert dead drop message.',
    category: 'crypto',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'crypto@lab:~$ ',
    promptLabel: 'OPERATOR TERMINAL',

    briefing: [
        'A covert dead drop message has been intercepted.',
        'Decode encodings, crack hashes, decrypt the intel,',
        'and verify the signature to confirm authenticity.'
    ],

    customState: {
        base64Decoded: false,
        hashCracked: false,
        dropDecrypted: false,
        signatureVerified: false,
        nodesExamined: []
    },

    statusFields: [
        { key: 'base64Decoded',     label: 'Base64',    trueText: 'DECODED', falseText: 'PENDING' },
        { key: 'hashCracked',       label: 'Hash',      trueText: 'CRACKED', falseText: 'PENDING' },
        { key: 'dropDecrypted',     label: 'Dead Drop',  trueText: 'DECRYPTED', falseText: 'LOCKED' },
        { key: 'signatureVerified', label: 'Signature',  trueText: 'VERIFIED', falseText: 'PENDING' }
    ],

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['terminal',    'empty',       'base64-node', 'hash-vault',  'wall'],
            ['empty',       'cipher-desk', 'empty',       'keystore',    'dead-drop'],
            ['wall',        'hex-bench',   'empty',       'empty',       'wall'],
            ['wall',        'wall',        'verify-post', 'wall',        'wall']
        ]
    },

    nodes: {
        'terminal':    { label: 'TERMINAL',    abbr: 'TRM', ip: 'localhost', os: 'Kali Linux 2024.1', ports: [], desc: 'Crypto analysis workstation' },
        'base64-node': { label: 'BASE64-STN',  abbr: 'B64', ip: '\u2014',   os: 'Custom',            ports: [], desc: 'Encoding/decoding station' },
        'hash-vault':  { label: 'HASH-VAULT',  abbr: 'HSH', ip: '\u2014',   os: 'HashDB 3.2',        ports: [], desc: 'Cryptographic hash database' },
        'cipher-desk': { label: 'CIPHER-DESK', abbr: 'CPH', ip: '\u2014',   os: 'Custom',            ports: [], desc: 'Classical cipher workspace' },
        'keystore':    { label: 'KEYSTORE',    abbr: 'KEY', ip: '\u2014',   os: 'GnuPG 2.4',         ports: [], desc: 'Key management system' },
        'dead-drop':   { label: 'DEAD-DROP',   abbr: 'DRP', ip: '\u2014',   os: 'Unknown',           ports: [], desc: 'Encrypted message drop point' },
        'hex-bench':   { label: 'HEX-BENCH',   abbr: 'HEX', ip: '\u2014',   os: 'Custom',            ports: [], desc: 'Hexadecimal analysis bench' },
        'verify-post': { label: 'VERIFY-POST', abbr: 'VFY', ip: '\u2014',   os: 'OpenSSL 3.1',       ports: [], desc: 'Signature verification station' }
    },

    /* Known hash for the crack objective */
    knownHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    knownHashPlaintext: 'password',

    /* The mission base64 string and its decoded result */
    missionBase64: 'VGhlIHBhc3NwaHJhc2UgaXM6IHNoYWRvd3BoZW5peA==',
    missionBase64Decoded: 'The passphrase is: shadowphenix',
    passphrase: 'shadowphenix',

    traps: [],
    gates: {},

    objectives: [
        { id: 'b64',    label: 'BASE64 DECODED -- passphrase recovered',          check: 'base64Decoded' },
        { id: 'hash',   label: 'HASH CRACKED -- password retrieved',              check: 'hashCracked' },
        { id: 'drop',   label: 'DEAD DROP DECRYPTED -- intel secured',            check: 'dropDecrypted' },
        { id: 'verify', label: 'SIGNATURE VERIFIED -- authenticity confirmed',    check: 'signatureVerified' }
    ],

    integrity: 3,

    completion: {
        title: 'DEAD DROP',
        subtitle: 'Message decrypted. Identity verified.',
        storageKey: 'hexworth_operator_crypto01'
    },

    /* ----------------------------------------------------------------
       Terminal Commands
       ---------------------------------------------------------------- */
    terminalCommands: {
        'examine': {
            help: 'Inspect the current node',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var type = c.grid.cells[s.position.row][s.position.col];
                if (type === 'empty' || type === 'wall') { e.printLine('Nothing to examine.', 'error'); return; }
                if (s.nodesExamined.indexOf(type) === -1) s.nodesExamined.push(type);
                e.printLine('', 'system');
                e.printLine('Examining ' + c.nodes[type].label + '...', 'heading');
                e.printLine('', 'system');
                if (type === 'terminal') {
                    e.printLine('System: Kali Linux 2024.1 | Tools: openssl, hashcat, gpg', 'node-info');
                } else if (type === 'base64-node') {
                    e.printLine('--- Encoded Drop ---', 'node-info');
                    e.printLine(c.missionBase64, 'warning');
                    e.printLine('Use: decode base64 ' + c.missionBase64, 'info');
                } else if (type === 'hash-vault') {
                    e.printLine('--- Hash Vault #0041 ---', 'node-info');
                    e.printLine('SHA-256: ' + c.knownHash, 'warning');
                    e.printLine('Use: crack ' + c.knownHash, 'info');
                } else if (type === 'cipher-desk') {
                    e.printLine('--- Cipher Text ---', 'node-info');
                    e.printLine('Gur qrnq qebc vf ng pbbeqvangrf (4,1)', 'warning');
                    e.printLine('Cipher: ROT13', 'system');
                    e.printLine('Use: decode rot13 Gur qrnq qebc vf ng pbbeqvangrf (4,1)', 'info');
                } else if (type === 'keystore') {
                    e.printLine('--- Key Ring ---', 'node-info');
                    e.printLine('pub  rsa4096 SHADOW PHOENIX <sp@dead-drop.null>', 'node-info');
                    e.printLine('Private key available for decryption.', 'info');
                } else if (type === 'dead-drop') {
                    if (!s.hashCracked) {
                        e.printLine('--- Dead Drop: LOCKED ---', 'warning');
                        e.printLine('Password hash in HASH-VAULT must be cracked first.', 'info');
                    } else {
                        e.printLine('--- Dead Drop: DECRYPTING ---', 'node-info');
                        e.printLine('Password accepted. Passphrase: ' + c.passphrase, 'success');
                        e.printLine('', 'system');
                        e.printLine('--- DECRYPTED INTEL ---', 'heading');
                        e.printLine('TO: HANDLER-7 | FROM: ASSET-SIGMA | DATE: 2024-11-30', 'node-info');
                        e.printLine('The extraction window opens at 0300. Grid ref KILO-NOVEMBER-7.', 'info');
                        e.printLine('', 'system');
                        e.printLine('Signature loaded. Proceed to VERIFY-POST.', 'info');
                        if (!s.dropDecrypted) { s.dropDecrypted = true; e.checkObjectives(); }
                    }
                } else if (type === 'hex-bench') {
                    e.printLine('--- Hex Analyzer ---', 'node-info');
                    e.printLine('48 65 78 77 6f 72 74 68', 'warning');
                    e.printLine('Use: decode hex 4865787776f727468', 'info');
                } else if (type === 'verify-post') {
                    if (!s.dropDecrypted) {
                        e.printLine('No signature loaded. Decrypt dead drop first.', 'warning');
                    } else {
                        e.printLine('--- Verify Post: READY ---', 'node-info');
                        e.printLine('Signer: SHADOW PHOENIX', 'system');
                        e.printLine('Use "verify" to confirm.', 'info');
                    }
                }
                e.saveState();
            }
        },

        'decode': {
            help: 'Decode data (base64, hex, rot13)',
            syntax: 'decode <type> <data>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (args.length < 2) { e.printLine('Usage: decode <type> <data>', 'error'); return; }
                var type = args[0].toLowerCase(), payload = args.slice(1).join(' ');
                if (type === 'base64') {
                    if (payload === c.missionBase64) {
                        e.printLine('', 'system');
                        e.printLine('Decoding Base64...', 'system');
                        e.printLine('Result: ' + c.missionBase64Decoded, 'success');
                        e.printLine('[RECOVERED] Passphrase: ' + c.passphrase, 'heading');
                        if (!s.base64Decoded) { s.base64Decoded = true; e.checkObjectives(); }
                    } else {
                        try { e.printLine('Result: ' + atob(payload), 'node-info'); } catch(ex) { e.printLine('Invalid Base64.', 'error'); }
                    }
                } else if (type === 'rot13') {
                    var result = payload.replace(/[a-zA-Z]/g, function(ch) { var b = ch <= 'Z' ? 65 : 97; return String.fromCharCode(((ch.charCodeAt(0) - b + 13) % 26) + b); });
                    e.printLine('', 'system');
                    e.printLine('Result: ' + result, 'success');
                } else if (type === 'hex') {
                    var hex = payload.replace(/\s+/g, '');
                    if (/^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0) {
                        var r = '';
                        for (var i = 0; i < hex.length; i += 2) r += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                        e.printLine('Result: ' + r, 'success');
                    } else {
                        e.printLine('Invalid hex.', 'error');
                    }
                } else {
                    e.printLine('Types: base64, hex, rot13', 'error');
                }
                e.saveState();
            }
        },

        'hash': {
            help: 'Hash a string (educational)',
            syntax: 'hash <algo> <text>',
            handler: function(args, ctx) {
                ctx.engine.printLine('Educational: hash <algo> <text>', 'system');
            }
        },

        'crack': {
            help: 'Crack a hash against wordlist',
            syntax: 'crack <hash>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: crack <hash>', 'error'); return; }
                var hash = args[0];
                if (hash === c.knownHash || hash.indexOf('5e884898') === 0) {
                    e.printLine('', 'system');
                    e.printLine('Running hashcat against wordlist...', 'system');
                    e.printLine('Match found!', 'success');
                    e.printLine('Hash: ' + c.knownHash.substring(0, 16) + '...', 'node-info');
                    e.printLine('Plaintext: ' + c.knownHashPlaintext, 'success');
                    if (!s.hashCracked) { s.hashCracked = true; e.checkObjectives(); }
                } else {
                    e.printLine('No match found in wordlist.', 'system');
                }
                e.saveState();
            }
        },

        'verify': {
            help: 'Verify signature at VERIFY-POST',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var type = c.grid.cells[s.position.row][s.position.col];
                if (type !== 'verify-post') { e.printLine('Must be at VERIFY-POST station.', 'error'); return; }
                if (!s.dropDecrypted) { e.printLine('No signature loaded. Decrypt dead drop first.', 'error'); return; }
                e.printLine('', 'system');
                e.printLine('Verifying RSA-SHA256 signature...', 'system');
                e.printLine('Signer: SHADOW PHOENIX <sp@dead-drop.null>', 'node-info');
                e.printLine('Result: SIGNATURE VALID', 'success');
                if (!s.signatureVerified) { s.signatureVerified = true; e.checkObjectives(); }
                e.saveState();
            }
        }
    }
};
