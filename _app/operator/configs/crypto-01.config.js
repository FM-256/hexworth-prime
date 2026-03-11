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
    title: 'CRYPTO-01 / DEAD DROP',
    subtitle: 'Decode, decrypt, and verify a covert dead drop message.',
    category: 'crypto',
    difficulty: 2,
    inputMode: 'terminal',
    prompt: 'crypto@lab:~$',

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
    }
};
