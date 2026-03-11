/* ================================================================
   CRYPTO-02: Key Escrow — Config
   ================================================================
   PKI investigation mission. Navigate certificate infrastructure
   to find a rogue intermediate CA, decode a hidden message, revoke
   the forged cert, and verify the TLS chain. Commands: examine,
   openssl, decode, diff, revoke, verify.
   ================================================================ */

var CRYPTO_02_CONFIG = {
    id: 'crypto-02',
    title: 'CRYPTO-02 / KEY ESCROW',
    subtitle: 'Investigate rogue CA issuance in the PKI.',
    category: 'crypto',
    difficulty: 3,
    inputMode: 'terminal',
    prompt: 'analyst@pki:~$',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['ca-root',      'intermediate-ca', 'empty',          'wall',        'wall'],
            ['empty',        'cert-store',      'empty',          'rogue-cert',  'wall'],
            ['wall',         'empty',           'revocation-list', 'empty',      'tls-endpoint'],
            ['wall',         'key-escrow',      'empty',          'signing-log', 'empty']
        ]
    },

    nodes: {
        'ca-root':         { label: 'CA-ROOT',         abbr: 'CAR', ip: 'pki-01',           os: 'HSM-Protected',     ports: [],                        desc: 'Root Certificate Authority -- offline signing key' },
        'intermediate-ca': { label: 'INTERMEDIATE-CA', abbr: 'ICA', ip: 'pki-01',           os: 'EJBCA Enterprise',  ports: ['443/HTTPS','8080/OCSP'], desc: 'Intermediate CA -- issues endpoint certificates' },
        'cert-store':      { label: 'CERT-STORE',      abbr: 'CST', ip: 'pki-01',           os: 'OpenLDAP 2.6',     ports: ['389/LDAP','636/LDAPS'],  desc: 'Certificate database -- issued and revoked certs' },
        'rogue-cert':      { label: 'ROGUE-CERT',      abbr: 'RGC', ip: 'pki-01',           os: 'Unknown Issuer',   ports: [],                        desc: 'Suspicious intermediate certificate -- unauthorized' },
        'revocation-list': { label: 'CRL/OCSP',        abbr: 'CRL', ip: 'pki-01',           os: 'OpenSSL CRL',      ports: ['80/HTTP','8080/OCSP'],   desc: 'Certificate Revocation List and OCSP responder' },
        'tls-endpoint':    { label: 'TLS-ENDPOINT',    abbr: 'TLS', ip: 'app.hexworth.com', os: 'Nginx 1.25',       ports: ['443/HTTPS'],             desc: 'Production web server -- TLS certificate chain' },
        'key-escrow':      { label: 'KEY-ESCROW',      abbr: 'ESC', ip: 'pki-01',           os: 'Vault by HashiCorp', ports: [],                      desc: 'Key escrow vault -- backed-up private keys' },
        'signing-log':     { label: 'SIGNING-LOG',     abbr: 'SGL', ip: 'pki-01',           os: 'CT-Log v2',        ports: [],                        desc: 'Certificate signing transparency log' }
    },

    /* Encoded flag hidden in key-escrow metadata */
    encodedMessage: 'aGV4d29ydGh7cjBndWVfY0FfZDN0M2N0ZWR9',
    decodedMessage: 'hexworth{r0gue_cA_d3t3cted}',

    /* OpenSSL target aliases for fuzzy command input */
    opensslAliases: {
        'ca-root': 'ca-root', 'caroot': 'ca-root', 'root': 'ca-root', 'car': 'ca-root',
        'intermediate': 'intermediate-ca', 'intermediate-ca': 'intermediate-ca', 'ica': 'intermediate-ca',
        'rogue': 'rogue-cert', 'rogue-cert': 'rogue-cert', 'rgc': 'rogue-cert',
        'tls': 'tls-endpoint', 'tls-endpoint': 'tls-endpoint', 'endpoint': 'tls-endpoint',
        'crl': 'revocation-list', 'revocation': 'revocation-list', 'ocsp': 'revocation-list'
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'rogue',   label: 'ROGUE CA IDENTIFIED -- forged intermediate certificate found',   check: 'rogueIdentified' },
        { id: 'decode',  label: 'MESSAGE DECODED -- hidden evidence extracted',                    check: 'messageDecoded' },
        { id: 'revoke',  label: 'ROGUE CERT REVOKED -- unauthorized CA removed from trust',       check: 'rogueRevoked' },
        { id: 'verify',  label: 'TLS CHAIN VERIFIED -- endpoint certificate chain validated',      check: 'chainVerified' }
    ],

    integrity: 3,

    completion: {
        title: 'KEY ESCROW',
        subtitle: 'Rogue CA neutralized. PKI integrity restored.',
        storageKey: 'hexworth_operator_crypto02'
    }
};
