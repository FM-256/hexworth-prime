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
    missionTitle: 'CRYPTO-02',
    title: 'Key Escrow',
    subtitle: 'Investigate rogue CA issuance in the PKI.',
    category: 'crypto',
    difficulty: 3,
    inputMode: 'terminal',
    promptText: 'analyst@pki:~$ ',
    promptLabel: 'OPERATOR TERMINAL',

    briefing: [
        'A rogue intermediate CA has been detected in the PKI.',
        'Examine certificate stores, identify the forgery,',
        'revoke the rogue cert, and verify the TLS chain.'
    ],

    customState: {
        rogueIdentified: false,
        messageDecoded: false,
        rogueRevoked: false,
        chainVerified: false,
        certsExamined: []
    },

    statusFields: [
        { key: 'rogueIdentified', label: 'Rogue CA',    trueText: 'IDENTIFIED', falseText: 'UNKNOWN' },
        { key: 'messageDecoded',  label: 'Message',      trueText: 'DECODED', falseText: 'PENDING' },
        { key: 'rogueRevoked',    label: 'Revocation',   trueText: 'REVOKED', falseText: 'PENDING' },
        { key: 'chainVerified',   label: 'TLS Chain',    trueText: 'VERIFIED', falseText: 'PENDING' }
    ],

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

    /* Diff command aliases */
    diffAliases: {
        'intermediate': 'intermediate-ca', 'ica': 'intermediate-ca', 'intermediate-ca': 'intermediate-ca',
        'rogue': 'rogue-cert', 'rgc': 'rogue-cert', 'rogue-cert': 'rogue-cert',
        'root': 'ca-root', 'car': 'ca-root', 'ca-root': 'ca-root'
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
    },

    /* ----------------------------------------------------------------
       Terminal Commands
       ---------------------------------------------------------------- */
    terminalCommands: {
        'examine': {
            help: 'Inspect the current PKI node',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var type = c.grid.cells[s.position.row][s.position.col];
                if (type === 'empty' || type === 'wall') { e.printLine('Nothing to examine.', 'error'); return; }
                e.printLine('', 'system');
                if (type === 'ca-root') {
                    e.printLine('=== ROOT CA ===', 'heading');
                    e.printLine('CN=Hexworth Root CA | RSA 4096-bit (HSM)', 'info');
                    e.printLine('Valid: 2020-2040 | Status: TRUSTED', 'success');
                } else if (type === 'intermediate-ca') {
                    e.printLine('=== INTERMEDIATE CA ===', 'heading');
                    e.printLine('CN=Hexworth Issuing CA | Issued by Root CA', 'info');
                    e.printLine('Status: VALID', 'success');
                    e.printLine('', 'system');
                    e.printLine('Also found: CN=Hexworth Cloud CA <- [SUSPICIOUS]', 'warning');
                    e.printLine('Serial: 00:FF:00:11:22 -- NOT in original issuance plan.', 'warning');
                } else if (type === 'cert-store') {
                    e.printLine('=== CERT DATABASE ===', 'heading');
                    e.printLine('Total: 2,847 certs', 'info');
                    e.printLine('[03/03] *.hexworth.com -- issued by Hexworth Cloud CA <- [SUSPICIOUS]', 'warning');
                    e.printLine('[03/04] vpn.hexworth.com -- issued by Hexworth Cloud CA <- [SUSPICIOUS]', 'warning');
                } else if (type === 'rogue-cert') {
                    e.printLine('=== ROGUE CERT ===', 'heading');
                    e.printLine('CN=Hexworth Cloud CA | Issuer: Root CA (FORGED)', 'warning');
                    e.printLine('Key: RSA 2048-bit (software, NOT HSM)', 'warning');
                    e.printLine('[!] Signature verification FAILS against root key.', 'error');
                    if (!s.rogueIdentified) {
                        s.rogueIdentified = true;
                        e.printLine('', 'system');
                        e.printLine('[FINDING] Rogue CA confirmed.', 'success');
                    }
                } else if (type === 'revocation-list') {
                    e.printLine('=== CRL/OCSP ===', 'heading');
                    if (s.rogueRevoked) e.printLine('Serial 00:FF:00:11:22 -- REVOKED', 'success');
                    else e.printLine('CRL loaded. Use "revoke" to add rogue cert.', 'info');
                } else if (type === 'tls-endpoint') {
                    e.printLine('=== TLS: app.hexworth.com ===', 'heading');
                    e.printLine('Chain: leaf -> Issuing CA -> Root CA', 'info');
                    if (s.rogueRevoked) e.printLine('Rogue CA removed. Chain VALID. Run "verify".', 'success');
                    else e.printLine('Rogue CA still active in trust store.', 'warning');
                } else if (type === 'key-escrow') {
                    e.printLine('=== KEY ESCROW ===', 'heading');
                    e.printLine('[3] Hexworth Cloud CA -- software key <- [NO HSM]', 'warning');
                    e.printLine('Encoded message: ' + c.encodedMessage, 'node-info');
                    e.printLine('Use: decode ' + c.encodedMessage, 'system');
                } else if (type === 'signing-log') {
                    e.printLine('=== CT LOG ===', 'heading');
                    e.printLine('[02/28] SIGNED: Cloud CA from pki-backup-03 (NOT HSM) <- [SUSPICIOUS]', 'warning');
                    e.printLine('[03/03] SIGNED: *.hexworth.com by Cloud CA <- [ROGUE]', 'warning');
                }
                if (s.certsExamined.indexOf(type) === -1) s.certsExamined.push(type);
                e.printLine('', 'system');
                e.printLine('[+] ' + c.nodes[type].label + ' examined. (' + s.certsExamined.length + '/8)', 'info');
                e.checkObjectives(); e.saveState();
            }
        },

        'openssl': {
            help: 'Inspect certificate with OpenSSL',
            syntax: 'openssl <target>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: openssl <target>', 'error'); return; }
                var resolved = c.opensslAliases[args.join('-').toLowerCase()] || c.opensslAliases[args[0].toLowerCase()];
                if (!resolved) { e.printLine('Unknown target.', 'error'); return; }
                e.printLine('', 'system');
                e.printLine('openssl x509 -in ' + resolved + '.pem -text -noout', 'prompt-echo');
                e.printLine('', 'system');
                if (resolved === 'rogue-cert') {
                    e.printLine('Issuer: Root CA (CLAIMED)', 'warning');
                    e.printLine('Key: RSA 2048 (software)', 'warning');
                    e.printLine('verify error:num=7: signature failure', 'error');
                    e.printLine('FORGED CERTIFICATE', 'error');
                } else if (resolved === 'ca-root') {
                    e.printLine('Subject/Issuer: Hexworth Root CA | RSA 4096 | VALID', 'success');
                } else if (resolved === 'intermediate-ca') {
                    e.printLine('Subject: Hexworth Issuing CA | Issuer: Root CA | VALID', 'success');
                } else if (resolved === 'tls-endpoint') {
                    e.printLine('Chain: Root -> Issuing -> app.hexworth.com: VALID', 'success');
                    if (!s.rogueRevoked) e.printLine('Warning: Rogue CA still active.', 'warning');
                }
            }
        },

        'decode': {
            help: 'Decode an encoded string',
            syntax: 'decode <string>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: decode <string>', 'error'); return; }
                var input = args[0];
                e.printLine('', 'system');
                e.printLine('Decoding: ' + input, 'system');
                if (input === c.encodedMessage || input.trim() === c.encodedMessage) {
                    e.printLine('Decoded: ' + c.decodedMessage, 'success');
                    if (!s.messageDecoded) {
                        s.messageDecoded = true;
                        e.printLine('[FINDING] Hidden message extracted.', 'success');
                        e.checkObjectives();
                    }
                } else {
                    try { e.printLine('Result: ' + atob(input), 'node-info'); } catch(ex) { e.printLine('Invalid encoding.', 'error'); }
                }
                e.saveState();
            }
        },

        'diff': {
            help: 'Compare two certificates',
            syntax: 'diff <c1> <c2>',
            handler: function(args, ctx) {
                var e = ctx.engine, c = ctx.config;
                if (args.length < 2) { e.printLine('Usage: diff <c1> <c2>', 'error'); return; }
                var c1 = c.diffAliases[args[0].toLowerCase()] || args[0].toLowerCase();
                var c2 = c.diffAliases[args[1].toLowerCase()] || args[1].toLowerCase();
                e.printLine('', 'system');
                e.printLine('Comparing: ' + c1 + ' vs ' + c2, 'heading');
                e.printLine('', 'system');
                if ((c1 === 'intermediate-ca' && c2 === 'rogue-cert') || (c1 === 'rogue-cert' && c2 === 'intermediate-ca')) {
                    e.printLine('Key type:    HSM-protected    vs  Software-generated', 'warning');
                    e.printLine('Signature:   VERIFIED          vs  FORGED             <- MISMATCH', 'warning');
                    e.printLine('Audit trail: Complete          vs  None               <- MISSING', 'warning');
                } else {
                    e.printLine('No diff data for this pair.', 'info');
                }
            }
        },

        'revoke': {
            help: 'Revoke rogue cert (at CRL/OCSP node)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var type = c.grid.cells[s.position.row][s.position.col];
                if (type !== 'revocation-list') { e.printLine('Must be at CRL/OCSP node.', 'error'); return; }
                if (!s.rogueIdentified) { e.printLine('Identify the rogue cert first (examine it).', 'error'); return; }
                if (s.rogueRevoked) { e.printLine('Already revoked.', 'system'); return; }
                e.printLine('', 'system');
                e.printLine('Adding serial 00:FF:00:11:22 to CRL...', 'system');
                e.printLine('Publishing updated CRL via OCSP...', 'system');
                e.printLine('[+] Rogue certificate REVOKED.', 'success');
                s.rogueRevoked = true;
                e.checkObjectives(); e.saveState();
            }
        },

        'verify': {
            help: 'Verify TLS chain (at TLS-ENDPOINT)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var type = c.grid.cells[s.position.row][s.position.col];
                if (type !== 'tls-endpoint') { e.printLine('Must be at TLS-ENDPOINT.', 'error'); return; }
                if (!s.rogueRevoked) { e.printLine('Revoke the rogue cert first.', 'error'); return; }
                e.printLine('', 'system');
                e.printLine('Verifying TLS chain for app.hexworth.com...', 'system');
                e.printLine('depth=2: Root CA -- OK', 'info');
                e.printLine('depth=1: Issuing CA -- OK', 'info');
                e.printLine('depth=0: app.hexworth.com -- OK', 'info');
                e.printLine('Chain: VALID. No rogue issuers.', 'success');
                if (!s.chainVerified) { s.chainVerified = true; e.checkObjectives(); }
                e.saveState();
            }
        }
    }
};
