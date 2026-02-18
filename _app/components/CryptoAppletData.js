/**
 * CryptoAppletData.js — Complete Cryptography Applet Data
 *
 * All 17 crypto topics with overview, how-it-works, interactive exercises, and quizzes.
 * Used by CryptoAppletRenderer.js
 */
const CryptoAppletData = {

    // =====================================================================
    // AES — Advanced Encryption Standard
    // =====================================================================
    AES: {
        key: 'AES',
        title: 'Advanced Encryption Standard (AES)',
        icon: '🔒',
        color: '#a855f7',
        description: 'The gold standard of symmetric encryption. AES replaced DES in 2001 and is used everywhere — from HTTPS to full-disk encryption to government classified data.',
        overview: {
            concepts: ['Symmetric Encryption', 'Block Cipher', '128/192/256-bit Keys', 'SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey', 'Rijndael'],
            explanation: `
                <p>AES (Advanced Encryption Standard) is a <strong>symmetric block cipher</strong> adopted by the U.S. government in 2001 after a 5-year public competition. It was designed by Belgian cryptographers Joan Daemen and Vincent Rijmen (originally called Rijndael).</p>
                <h4>Why AES Matters</h4>
                <ul>
                    <li><strong>Speed:</strong> Extremely fast in both hardware and software — modern CPUs have dedicated AES-NI instructions</li>
                    <li><strong>Security:</strong> No practical attacks exist against full AES. A brute-force attack on AES-128 would take longer than the age of the universe</li>
                    <li><strong>Ubiquity:</strong> Used in TLS/HTTPS, WPA2/WPA3, BitLocker, FileVault, SSH, VPNs, and virtually every encrypted protocol</li>
                    <li><strong>Government approved:</strong> NSA approved AES-256 for TOP SECRET data</li>
                </ul>
                <h4>Key Sizes</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">AES-128</div>
                        <div class="crypto-compare-detail">10 rounds, 128-bit key</div>
                        <div class="crypto-compare-note">Standard security — sufficient for most applications</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">AES-192</div>
                        <div class="crypto-compare-detail">12 rounds, 192-bit key</div>
                        <div class="crypto-compare-note">Rarely used in practice</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">AES-256</div>
                        <div class="crypto-compare-detail">14 rounds, 256-bit key</div>
                        <div class="crypto-compare-note">Required for classified government data</div>
                    </div>
                </div>
            `,
            diagram: 'aes-rounds'
        },
        howItWorks: {
            steps: [
                { title: 'Key Expansion', description: 'The cipher key is expanded into a key schedule — a series of round keys derived from the original key using the Rijndael key schedule algorithm.', detail: 'AES-128 generates 11 round keys (one initial + 10 rounds) from the original 128-bit key.' },
                { title: 'Initial Round — AddRoundKey', description: 'The plaintext block (16 bytes arranged in a 4x4 matrix) is XORed with the first round key.', detail: 'This is the only step in the initial round. It ensures the plaintext is immediately mixed with key material.' },
                { title: 'SubBytes (Substitution)', description: 'Each byte in the state matrix is replaced using a fixed substitution table (S-Box). This provides non-linearity — the critical property that prevents linear cryptanalysis.', detail: 'The S-Box is constructed from the multiplicative inverse in GF(2^8) followed by an affine transformation.' },
                { title: 'ShiftRows (Permutation)', description: 'Each row of the state matrix is cyclically shifted: Row 0 stays, Row 1 shifts left 1, Row 2 shifts left 2, Row 3 shifts left 3.', detail: 'This step ensures that columns from the previous step get mixed across different columns.' },
                { title: 'MixColumns (Diffusion)', description: 'Each column is multiplied by a fixed polynomial matrix in GF(2^8). This spreads the influence of each input byte across 4 output bytes.', detail: 'After MixColumns, changing one input byte affects all four bytes in the column. This step is skipped in the final round.' },
                { title: 'AddRoundKey', description: 'The state is XORed with the current round key from the key schedule.', detail: 'Steps 3-6 repeat for each round (10/12/14 rounds depending on key size). The final round omits MixColumns.' }
            ]
        },
        interactive: {
            type: 'aes-encrypt',
            instructions: 'Type a message below to see it encrypted with AES. Watch the state matrix transform through each step.',
            placeholder: 'Enter plaintext (16 chars = 1 block)...'
        },
        quiz: [
            { question: 'What type of cipher is AES?', options: ['Stream cipher', 'Symmetric block cipher', 'Asymmetric cipher', 'Hash function'], correct: 1, explanation: 'AES is a symmetric block cipher — it uses the same key for encryption and decryption and processes data in fixed-size blocks of 128 bits.' },
            { question: 'How many rounds does AES-256 perform?', options: ['10', '12', '14', '16'], correct: 2, explanation: 'AES-256 performs 14 rounds. AES-128 uses 10 rounds, and AES-192 uses 12 rounds. More rounds = more security but slightly slower.' },
            { question: 'Which AES step provides non-linearity to resist linear cryptanalysis?', options: ['ShiftRows', 'MixColumns', 'SubBytes', 'AddRoundKey'], correct: 2, explanation: 'SubBytes uses an S-Box (substitution box) based on the multiplicative inverse in GF(2^8), providing the critical non-linearity that defeats linear cryptanalysis.' },
            { question: 'What is the block size of AES?', options: ['64 bits', '128 bits', '256 bits', 'Variable'], correct: 1, explanation: 'AES always uses a 128-bit (16-byte) block size regardless of key size. The key size (128/192/256) affects the number of rounds, not the block size.' },
            { question: 'Which step is skipped in the final round of AES?', options: ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'], correct: 2, explanation: 'MixColumns is omitted in the final round. Including it would not add security but would make decryption require an extra step without benefit.' },
            { question: 'What replaced DES as the U.S. encryption standard?', options: ['3DES', 'Blowfish', 'AES (Rijndael)', 'Twofish'], correct: 2, explanation: 'AES (originally called Rijndael) won the NIST competition in 2001, replacing DES. Twofish was a finalist but Rijndael was selected for its combination of security, speed, and simplicity.' }
        ]
    },

    // =====================================================================
    // BLOCK_CIPHERS — Block Cipher Modes of Operation
    // =====================================================================
    BLOCK_CIPHERS: {
        key: 'BLOCK_CIPHERS',
        title: 'Block Cipher Modes of Operation',
        icon: '🧱',
        color: '#a855f7',
        description: 'Block ciphers encrypt fixed-size blocks, but real data comes in all sizes. Modes of operation define how to chain blocks together securely.',
        overview: {
            concepts: ['ECB', 'CBC', 'CTR', 'GCM', 'IV / Nonce', 'Padding', 'Chaining', 'Authenticated Encryption'],
            explanation: `
                <p>A block cipher like AES encrypts exactly one block (128 bits) at a time. But real-world data is rarely exactly 128 bits. <strong>Modes of operation</strong> define how to handle multi-block messages securely.</p>
                <h4>The ECB Problem</h4>
                <p>The simplest mode — Electronic Codebook (ECB) — encrypts each block independently. This is <strong>catastrophically insecure</strong> because identical plaintext blocks produce identical ciphertext blocks, leaking patterns. The famous "ECB Penguin" demonstrates this: encrypting an image with ECB preserves the image outline.</p>
                <h4>Common Modes</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">ECB</div>
                        <div class="crypto-compare-detail">Each block encrypted independently</div>
                        <div class="crypto-compare-note warn">NEVER use for real data — leaks patterns</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">CBC</div>
                        <div class="crypto-compare-detail">Each block XORed with previous ciphertext</div>
                        <div class="crypto-compare-note">Widely used but vulnerable to padding oracle attacks</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">CTR</div>
                        <div class="crypto-compare-detail">Encrypts a counter, XORs with plaintext</div>
                        <div class="crypto-compare-note">Parallelizable, turns block cipher into stream cipher</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">GCM</div>
                        <div class="crypto-compare-detail">CTR mode + authentication tag (GMAC)</div>
                        <div class="crypto-compare-note good">Best practice — encryption + integrity in one</div>
                    </div>
                </div>
            `,
            diagram: 'block-modes'
        },
        howItWorks: {
            steps: [
                { title: 'Padding the Message', description: 'The plaintext is padded to a multiple of the block size. PKCS#7 is the most common scheme: if 3 bytes of padding needed, each pad byte = 0x03.', detail: 'CTR and GCM modes do not require padding because they effectively turn the block cipher into a stream cipher.' },
                { title: 'ECB Mode (Electronic Codebook)', description: 'Each block is encrypted independently with the same key. Identical plaintext blocks produce identical ciphertext — this leaks patterns and is considered insecure.', detail: 'ECB is only acceptable for encrypting single blocks (like a single key). Never use it for multi-block data.' },
                { title: 'CBC Mode (Cipher Block Chaining)', description: 'Before encryption, each plaintext block is XORed with the previous ciphertext block. The first block is XORed with a random Initialization Vector (IV).', detail: 'CBC requires sequential processing (cannot parallelize encryption). The IV must be unpredictable but does not need to be secret.' },
                { title: 'CTR Mode (Counter)', description: 'A nonce + counter value is encrypted, and the result is XORed with the plaintext. Each block uses a different counter value, so blocks can be processed in parallel.', detail: 'CTR effectively turns AES into a stream cipher. The nonce must never be reused with the same key.' },
                { title: 'GCM Mode (Galois/Counter Mode)', description: 'Combines CTR mode encryption with GMAC authentication. Produces both ciphertext and an authentication tag that detects tampering.', detail: 'AES-GCM is the gold standard for TLS 1.3, providing both confidentiality and integrity. The auth tag is typically 128 bits.' },
                { title: 'Choosing a Mode', description: 'For new applications, always prefer authenticated encryption (GCM or ChaCha20-Poly1305). Avoid ECB entirely. CBC is legacy but still common.', detail: 'TLS 1.3 removed all CBC cipher suites, allowing only AEAD (Authenticated Encryption with Associated Data) modes.' }
            ]
        },
        interactive: {
            type: 'block-mode-visual',
            instructions: 'See how different block cipher modes process the same message. Toggle between ECB, CBC, and CTR to see how chaining affects the output.',
            placeholder: 'Enter a message with repeating patterns (e.g., "AAAA AAAA AAAA AAAA")...'
        },
        quiz: [
            { question: 'Why is ECB mode insecure for encrypting images or structured data?', options: ['It uses a weak key schedule', 'Identical plaintext blocks produce identical ciphertext blocks', 'It does not use an IV', 'It is too slow'], correct: 1, explanation: 'ECB encrypts each block independently, so identical plaintext blocks always produce identical ciphertext. This preserves patterns in the data — the famous "ECB Penguin" demonstrates this visually.' },
            { question: 'What does CBC mode XOR each plaintext block with before encryption?', options: ['The encryption key', 'The previous ciphertext block', 'A random salt', 'The block index'], correct: 1, explanation: 'CBC XORs each plaintext block with the previous ciphertext block (or the IV for the first block). This ensures identical plaintext blocks produce different ciphertext.' },
            { question: 'Which mode turns a block cipher into a stream cipher?', options: ['ECB', 'CBC', 'CTR', 'OFB'], correct: 2, explanation: 'CTR (Counter) mode encrypts sequential counter values and XORs the output with plaintext, effectively creating a keystream — the defining characteristic of a stream cipher.' },
            { question: 'What additional security property does GCM provide over CTR?', options: ['Larger key sizes', 'Authentication (integrity verification)', 'Post-quantum resistance', 'Compression'], correct: 1, explanation: 'GCM combines CTR mode with GMAC (Galois Message Authentication Code), providing both encryption and an authentication tag that detects any tampering with the ciphertext.' },
            { question: 'What must NEVER be reused with the same key in CTR/GCM mode?', options: ['The plaintext', 'The nonce/IV', 'The block size', 'The padding scheme'], correct: 1, explanation: 'Reusing a nonce with the same key in CTR or GCM mode is catastrophic — it produces the same keystream, allowing an attacker to XOR two ciphertexts together and recover plaintext.' },
            { question: 'Which cipher mode was removed from TLS 1.3?', options: ['GCM', 'CBC', 'CTR', 'CCM'], correct: 1, explanation: 'TLS 1.3 removed all CBC cipher suites due to historical vulnerabilities (padding oracle attacks like POODLE and Lucky Thirteen). Only AEAD modes (GCM, CCM, ChaCha20-Poly1305) are allowed.' }
        ]
    },

    // =====================================================================
    // CAESAR — Caesar Cipher
    // =====================================================================
    CAESAR: {
        key: 'CAESAR',
        title: 'Caesar Cipher',
        icon: '🏛️',
        color: '#a855f7',
        description: 'The original encryption — Julius Caesar shifted letters to hide military messages. Simple, elegant, and trivially broken — but it teaches the foundation of all substitution ciphers.',
        overview: {
            concepts: ['Substitution Cipher', 'Shift Cipher', 'ROT13', 'Monoalphabetic', 'Brute Force', 'Frequency Analysis', 'Modular Arithmetic'],
            explanation: `
                <p>The Caesar cipher is one of the oldest known encryption techniques, used by Julius Caesar to communicate with his generals. Each letter in the plaintext is <strong>shifted by a fixed number</strong> of positions in the alphabet.</p>
                <h4>How It Works</h4>
                <p>With a shift of 3: A becomes D, B becomes E, C becomes F, and so on. Z wraps around to C.</p>
                <h4>Why Study It?</h4>
                <ul>
                    <li><strong>Foundation:</strong> It introduces the core concept of encryption — transforming plaintext into ciphertext using a key</li>
                    <li><strong>Key space:</strong> Only 25 possible keys (shifts 1-25) — perfect for demonstrating brute-force attacks</li>
                    <li><strong>Frequency analysis:</strong> Introduces the concept that ciphertext leaks statistical information about the plaintext</li>
                    <li><strong>ROT13:</strong> A Caesar cipher with shift=13 is still used in computing (e.g., obscuring spoilers, simple obfuscation)</li>
                </ul>
                <h4>Real-World Connection</h4>
                <p>Hexworth Prime uses a <strong>Caesar-17 cipher</strong> internally for path encoding. The principle is the same — shift letters by a fixed amount — but applied to URL paths rather than military messages.</p>
            `,
            diagram: 'caesar-wheel'
        },
        howItWorks: {
            steps: [
                { title: 'Choose a Shift Key', description: 'Select a number between 1 and 25. This is your key. Caesar himself used a shift of 3.', detail: 'The shift key determines how many positions each letter moves in the alphabet. A shift of 0 or 26 produces no change.' },
                { title: 'Encrypt Each Letter', description: 'For each letter in the plaintext, count forward in the alphabet by the shift amount. Non-letter characters (spaces, numbers) are typically left unchanged.', detail: 'Mathematically: E(x) = (x + k) mod 26, where x is the letter position (A=0, B=1...) and k is the shift key.' },
                { title: 'Wrap Around', description: 'When shifting past Z, wrap back to A. With shift 3: X becomes A, Y becomes B, Z becomes C.', detail: 'The "mod 26" operation handles the wraparound automatically. This is modular arithmetic — the same math used in advanced cryptography.' },
                { title: 'Decrypt (Reverse the Shift)', description: 'To decrypt, shift each letter backward by the same amount. Alternatively, shift forward by (26 - key).', detail: 'D(x) = (x - k) mod 26. Decrypting a shift-3 cipher is the same as encrypting with shift 23.' },
                { title: 'Breaking It: Brute Force', description: 'With only 25 possible keys, an attacker can try all of them in seconds. This makes the Caesar cipher trivially breakable.', detail: 'A computer can test all 25 shifts instantly. Even by hand, a determined attacker can try all possibilities in minutes.' },
                { title: 'Breaking It: Frequency Analysis', description: 'In English, E is the most common letter (~13%), followed by T, A, O, I, N. The most common letter in the ciphertext likely corresponds to E, revealing the shift.', detail: 'Frequency analysis was first described by the Arab polymath Al-Kindi in the 9th century, making it one of the first known cryptanalytic techniques.' }
            ]
        },
        interactive: {
            type: 'caesar-shift',
            instructions: 'Type a message and adjust the shift value to encrypt it. Try to crack the encrypted sample message below by finding the right shift.',
            placeholder: 'Type your secret message...'
        },
        quiz: [
            { question: 'What shift value did Julius Caesar reportedly use?', options: ['1', '3', '7', '13'], correct: 1, explanation: 'Historical accounts indicate Caesar used a shift of 3, replacing A with D, B with E, and so on.' },
            { question: 'How many possible keys does the Caesar cipher have?', options: ['10', '25', '26', '52'], correct: 1, explanation: 'There are 25 meaningful shifts (1-25). A shift of 0 or 26 would produce the original plaintext, not encryption.' },
            { question: 'What is ROT13?', options: ['A hash function', 'A Caesar cipher with shift 13', 'A 13-round AES variant', 'A 13-bit key cipher'], correct: 1, explanation: 'ROT13 is a Caesar cipher with shift 13. Since 13 is half of 26, applying ROT13 twice returns the original text — making it its own inverse.' },
            { question: 'What technique uses letter frequency to break substitution ciphers?', options: ['Brute force', 'Side-channel analysis', 'Frequency analysis', 'Differential cryptanalysis'], correct: 2, explanation: 'Frequency analysis exploits the fact that in any natural language, certain letters appear more often. In English, E (~13%) is the most common letter, so the most frequent ciphertext letter likely maps to E.' },
            { question: 'If A=0, B=1, ..., Z=25, what is the encrypted value of M (position 12) with a shift of 17?', options: ['C (position 2)', 'D (position 3)', 'E (position 4)', 'F (position 5)'], correct: 1, explanation: '(12 + 17) mod 26 = 29 mod 26 = 3 = D. Hexworth Prime actually uses this exact shift (Caesar-17) for its path encoding!' },
            { question: 'Why is the Caesar cipher considered insecure?', options: ['The algorithm is secret', 'The key space is too small (25 keys)', 'It only works with English', 'It requires a computer to use'], correct: 1, explanation: 'With only 25 possible keys, a brute-force attack is trivial. An attacker can try all 25 shifts in seconds, even by hand. Modern ciphers like AES-128 have 2^128 possible keys.' }
        ]
    },

    // =====================================================================
    // CRYPTO_PROTOCOLS — Cryptographic Protocols
    // =====================================================================
    CRYPTO_PROTOCOLS: {
        key: 'CRYPTO_PROTOCOLS',
        title: 'Cryptographic Protocols',
        icon: '🔗',
        color: '#a855f7',
        description: 'TLS, SSH, and IPsec — the protocols that use cryptographic primitives to secure real-world communications. Where theory meets practice.',
        overview: {
            concepts: ['TLS 1.3', 'SSH', 'IPsec', 'Handshake', 'Certificate Validation', 'Perfect Forward Secrecy', 'Cipher Suites', 'AEAD'],
            explanation: `
                <p>Cryptographic protocols combine multiple primitives (encryption, hashing, key exchange, signatures) into complete systems for securing communication. The three most important are:</p>
                <h4>The Big Three</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">TLS 1.3</div>
                        <div class="crypto-compare-detail">Secures HTTPS, email, APIs</div>
                        <div class="crypto-compare-note">1-RTT handshake, mandatory PFS, AEAD only</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">SSH</div>
                        <div class="crypto-compare-detail">Secure remote shell, file transfer</div>
                        <div class="crypto-compare-note">Host key verification, key-based auth, tunneling</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">IPsec</div>
                        <div class="crypto-compare-detail">Network-layer VPN encryption</div>
                        <div class="crypto-compare-note">AH (auth) + ESP (encrypt), IKEv2 key exchange</div>
                    </div>
                </div>
                <h4>Why Protocols Matter</h4>
                <p>Individual algorithms like AES or RSA are building blocks. A protocol defines <em>how</em> to use them together safely — key negotiation, identity verification, session management, and failure handling. Getting the protocol wrong has caused catastrophic real-world breaches (Heartbleed, POODLE, ROBOT).</p>
            `,
            diagram: 'tls-handshake'
        },
        howItWorks: {
            steps: [
                { title: 'Client Hello', description: 'The client sends supported cipher suites, TLS version, and a random number. In TLS 1.3, the client also includes key shares (DH parameters) to enable 1-RTT handshakes.', detail: 'TLS 1.3 cipher suite example: TLS_AES_256_GCM_SHA384 — meaning AES-256-GCM encryption with SHA-384 for key derivation.' },
                { title: 'Server Hello + Certificate', description: 'The server selects a cipher suite, sends its random number, certificate (containing its public key), and in TLS 1.3, its key share.', detail: 'The certificate is signed by a Certificate Authority (CA). The client validates this chain of trust back to a trusted root CA.' },
                { title: 'Key Exchange', description: 'Using Diffie-Hellman (ECDHE in TLS 1.3), both sides compute a shared secret without ever transmitting it. The shared secret derives the session keys.', detail: 'TLS 1.3 mandates ECDHE for Perfect Forward Secrecy — even if the server private key is later compromised, past sessions remain secure.' },
                { title: 'Key Derivation', description: 'The shared secret passes through HKDF (HMAC-based Key Derivation Function) to produce separate keys for client-to-server and server-to-client encryption.', detail: 'Separate keys for each direction prevent reflection attacks. The derivation also incorporates the hello messages to bind the keys to this specific session.' },
                { title: 'Encrypted Application Data', description: 'All subsequent data is encrypted with the derived session keys using an AEAD cipher (AES-GCM or ChaCha20-Poly1305).', detail: 'AEAD provides both confidentiality and integrity in a single operation. Every record includes a sequence number to prevent replay attacks.' },
                { title: 'Session Resumption', description: 'TLS 1.3 supports 0-RTT resumption using pre-shared keys from previous sessions, eliminating the handshake latency for returning clients.', detail: '0-RTT data is vulnerable to replay attacks, so it should only be used for idempotent requests (GET, not POST).' }
            ]
        },
        interactive: {
            type: 'tls-handshake-sim',
            instructions: 'Walk through a TLS 1.3 handshake step by step. Click each stage to see the messages exchanged between client and server.',
            placeholder: ''
        },
        quiz: [
            { question: 'How many round trips does a TLS 1.3 handshake require?', options: ['0-RTT (zero)', '1-RTT (one)', '2-RTT (two)', '3-RTT (three)'], correct: 1, explanation: 'TLS 1.3 achieves a 1-RTT (one round trip) handshake by having the client send key shares in the Client Hello. TLS 1.2 required 2-RTT.' },
            { question: 'What does Perfect Forward Secrecy (PFS) protect against?', options: ['Brute-force attacks', 'Decrypting past sessions if the server key is later compromised', 'Man-in-the-middle attacks', 'Denial of service'], correct: 1, explanation: 'PFS ensures each session uses unique ephemeral keys. Even if the server\'s long-term private key is compromised, previously recorded sessions cannot be decrypted.' },
            { question: 'Which key exchange algorithm does TLS 1.3 mandate?', options: ['RSA key transport', 'Diffie-Hellman (DHE/ECDHE)', 'Pre-shared key only', 'Kerberos'], correct: 1, explanation: 'TLS 1.3 requires ephemeral Diffie-Hellman (DHE or ECDHE) for all handshakes. RSA key transport was removed because it does not provide forward secrecy.' },
            { question: 'What type of encryption does TLS 1.3 exclusively use?', options: ['CBC mode ciphers', 'Stream ciphers only', 'AEAD (Authenticated Encryption with Associated Data)', 'ECB mode'], correct: 2, explanation: 'TLS 1.3 only allows AEAD ciphers (AES-GCM, AES-CCM, ChaCha20-Poly1305). All non-AEAD cipher suites were removed to prevent padding oracle attacks.' },
            { question: 'What does SSH use to prevent connecting to an impersonator server?', options: ['SSL certificates', 'Host key fingerprint verification', 'IP address validation', 'MAC address checking'], correct: 1, explanation: 'SSH uses host key fingerprints — the first time you connect, you verify the server\'s public key fingerprint. Subsequent connections check that the key hasn\'t changed ("REMOTE HOST IDENTIFICATION HAS CHANGED" warning).' },
            { question: 'IPsec operates at which layer of the OSI model?', options: ['Application (Layer 7)', 'Transport (Layer 4)', 'Network (Layer 3)', 'Data Link (Layer 2)'], correct: 2, explanation: 'IPsec operates at the network layer (Layer 3), encrypting IP packets. This means it can protect all traffic between two endpoints transparently, unlike TLS which operates at the application layer.' }
        ]
    },

    // =====================================================================
    // DIFFIE_HELLMAN — Diffie-Hellman Key Exchange
    // =====================================================================
    DIFFIE_HELLMAN: {
        key: 'DIFFIE_HELLMAN',
        title: 'Diffie-Hellman Key Exchange',
        icon: '🤝',
        color: '#a855f7',
        description: 'The breakthrough that solved the key distribution problem. Two parties can agree on a secret key over a public channel — even if an eavesdropper is watching everything.',
        overview: {
            concepts: ['Key Exchange', 'Discrete Logarithm', 'Shared Secret', 'Modular Arithmetic', 'ECDHE', 'Forward Secrecy', 'Color Mixing Analogy'],
            explanation: `
                <p>Published in 1976 by Whitfield Diffie and Martin Hellman, the Diffie-Hellman key exchange was the <strong>first practical solution to the key distribution problem</strong> — how to establish a shared secret over an insecure channel.</p>
                <h4>The Color Mixing Analogy</h4>
                <p>Imagine mixing paint colors:</p>
                <ol>
                    <li>Alice and Bob publicly agree on a common color (say, yellow)</li>
                    <li>Each secretly picks a private color (Alice: red, Bob: blue)</li>
                    <li>Each mixes their private color with the public yellow and sends the result</li>
                    <li>Each mixes their private color with the received mixture</li>
                    <li>Both arrive at the same final color — but an observer who saw only the mixtures cannot determine the private colors</li>
                </ol>
                <h4>Why It's Revolutionary</h4>
                <ul>
                    <li>Before DH, two parties needed to physically exchange keys in person or through a trusted courier</li>
                    <li>DH enabled secure communication over public networks — making the internet as we know it possible</li>
                    <li>Used in TLS, SSH, IPsec, Signal Protocol, and virtually every key exchange today</li>
                    <li>Modern variant (ECDHE) uses elliptic curves for better performance with equivalent security</li>
                </ul>
            `,
            diagram: 'diffie-hellman'
        },
        howItWorks: {
            steps: [
                { title: 'Agree on Public Parameters', description: 'Alice and Bob publicly agree on a large prime number p and a generator g. These are not secret — anyone can know them.', detail: 'Typical values: p is 2048+ bits long. g is usually a small number (2 or 5) that generates a large subgroup of integers modulo p.' },
                { title: 'Generate Private Keys', description: 'Alice picks a secret random number a. Bob picks a secret random number b. These never leave their machines.', detail: 'The security of DH depends on these private values being truly random and kept secret. They are typically 256+ bits.' },
                { title: 'Compute Public Values', description: 'Alice computes A = g^a mod p and sends A to Bob. Bob computes B = g^b mod p and sends B to Alice.', detail: 'The "discrete logarithm problem" makes it computationally infeasible to recover a from A (or b from B) even knowing g and p.' },
                { title: 'Compute Shared Secret', description: 'Alice computes s = B^a mod p. Bob computes s = A^b mod p. Both get the same value because g^(ab) mod p = g^(ba) mod p.', detail: 'The shared secret s is never transmitted. An eavesdropper who captured g, p, A, and B still cannot compute s without knowing a or b.' },
                { title: 'Derive Session Keys', description: 'The shared secret is passed through a Key Derivation Function (KDF) to produce the actual encryption keys used for the session.', detail: 'The raw DH output should never be used directly as an encryption key. KDFs like HKDF extract uniformly random key material from the shared secret.' },
                { title: 'Ephemeral DH (DHE/ECDHE)', description: 'For perfect forward secrecy, new random values (a, b) are generated for every session. If a long-term key is later compromised, past sessions remain secure.', detail: 'ECDHE (Elliptic Curve DHE) uses points on an elliptic curve instead of modular exponentiation, achieving the same security with much smaller keys (256-bit ECDHE ~ 3072-bit DH).' }
            ]
        },
        interactive: {
            type: 'diffie-hellman-sim',
            instructions: 'Watch Alice and Bob perform a Diffie-Hellman key exchange with real numbers. See how they arrive at the same shared secret while the eavesdropper (Eve) cannot.',
            placeholder: ''
        },
        quiz: [
            { question: 'What problem does Diffie-Hellman solve?', options: ['Encrypting large files', 'Key distribution over an insecure channel', 'Digital signatures', 'Password storage'], correct: 1, explanation: 'DH solves the key distribution problem — how two parties who have never met can establish a shared secret key over a public channel that may be monitored.' },
            { question: 'What mathematical problem makes DH secure?', options: ['Integer factorization', 'Discrete logarithm problem', 'Traveling salesman problem', 'P vs NP'], correct: 1, explanation: 'DH security relies on the discrete logarithm problem: given g, p, and g^a mod p, it is computationally infeasible to find a. This is a one-way function.' },
            { question: 'In the color mixing analogy, what represents the "public channel"?', options: ['The private colors', 'The common starting color (yellow)', 'The mixed colors sent between parties', 'The final combined color'], correct: 2, explanation: 'The mixed colors (public values) are sent over the public channel. An observer sees the mixtures but cannot unmix them to determine the private colors.' },
            { question: 'What does the "E" in ECDHE stand for?', options: ['Enhanced', 'Ephemeral', 'Encrypted', 'Extended'], correct: 1, explanation: 'ECDHE stands for Elliptic Curve Diffie-Hellman Ephemeral. "Ephemeral" means new keys are generated for each session, providing perfect forward secrecy.' },
            { question: 'Why should the raw DH shared secret NOT be used directly as an encryption key?', options: ['It is too short', 'It is not uniformly random — needs KDF processing', 'It is public knowledge', 'It is encrypted'], correct: 1, explanation: 'The raw DH output may have biased bits and is not uniformly distributed. A Key Derivation Function (KDF) like HKDF extracts high-quality key material from the shared secret.' },
            { question: 'DH alone is vulnerable to which attack?', options: ['Brute force', 'Frequency analysis', 'Man-in-the-middle (MITM)', 'Side-channel'], correct: 2, explanation: 'DH alone does not authenticate the parties. A MITM attacker can perform separate DH exchanges with each party, intercepting all communication. This is why DH is always combined with authentication (certificates, signatures).' }
        ]
    },

    // =====================================================================
    // DIGITAL_SIGNATURES — Digital Signatures
    // =====================================================================
    DIGITAL_SIGNATURES: {
        key: 'DIGITAL_SIGNATURES',
        title: 'Digital Signatures',
        icon: '✍️',
        color: '#a855f7',
        description: 'The digital equivalent of a handwritten signature — but unforgeable and tamper-evident. Provides authentication, integrity, and non-repudiation.',
        overview: {
            concepts: ['Authentication', 'Integrity', 'Non-Repudiation', 'RSA Signatures', 'ECDSA', 'EdDSA', 'Hash-then-Sign', 'Certificate Signing'],
            explanation: `
                <p>A digital signature proves three things:</p>
                <ol>
                    <li><strong>Authentication:</strong> The message was sent by the claimed sender</li>
                    <li><strong>Integrity:</strong> The message was not altered in transit</li>
                    <li><strong>Non-repudiation:</strong> The sender cannot deny sending the message</li>
                </ol>
                <h4>How Signatures Differ from Encryption</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Encryption</div>
                        <div class="crypto-compare-detail">Encrypt with public key, decrypt with private key</div>
                        <div class="crypto-compare-note">Goal: confidentiality — only the recipient can read it</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Signing</div>
                        <div class="crypto-compare-detail">Sign with private key, verify with public key</div>
                        <div class="crypto-compare-note">Goal: authenticity — anyone can verify, only signer can create</div>
                    </div>
                </div>
                <h4>Real-World Uses</h4>
                <ul>
                    <li><strong>Code Signing:</strong> Windows, macOS, and Linux verify that software updates come from the real vendor</li>
                    <li><strong>TLS Certificates:</strong> Certificate Authorities sign website certificates to prove identity</li>
                    <li><strong>Email (S/MIME, PGP):</strong> Verify sender identity and message integrity</li>
                    <li><strong>Blockchain:</strong> Every cryptocurrency transaction is digitally signed</li>
                </ul>
            `,
            diagram: 'digital-signature'
        },
        howItWorks: {
            steps: [
                { title: 'Hash the Message', description: 'The signer computes a cryptographic hash of the message (e.g., SHA-256). This creates a fixed-size "fingerprint" of the message content.', detail: 'We hash first because signing is slow for large messages. Hashing reduces any message to 256 bits, which can be signed quickly.' },
                { title: 'Sign the Hash', description: 'The signer encrypts the hash with their private key. This is the digital signature. Only the holder of the private key can create this specific signature for this specific hash.', detail: 'RSA: signature = hash^d mod n (where d is the private exponent). ECDSA uses elliptic curve point multiplication instead.' },
                { title: 'Attach Signature', description: 'The original message and the signature are sent together. The message is NOT encrypted — anyone can read it. The signature proves who sent it and that it has not been altered.', detail: 'A signed message is like a notarized document — the content is visible, but the notary seal proves authenticity.' },
                { title: 'Verify: Hash the Message', description: 'The verifier independently hashes the received message using the same hash algorithm.', detail: 'If even one bit of the message was changed, the hash will be completely different due to the avalanche effect.' },
                { title: 'Verify: Decrypt the Signature', description: 'The verifier decrypts the signature using the signer\'s public key, recovering the hash the signer computed.', detail: 'Only the matching private key could have produced a signature that decrypts correctly with this public key.' },
                { title: 'Verify: Compare Hashes', description: 'If the two hashes match, the signature is valid — the message is authentic and unaltered. If they differ, either the message was tampered with or the signature is forged.', detail: 'This is the hash-then-sign paradigm. Modern algorithms (EdDSA) combine these steps but the concept is the same.' }
            ]
        },
        interactive: {
            type: 'digital-signature-sim',
            instructions: 'Type a message, sign it with a simulated private key, then try modifying the message to see the signature verification fail.',
            placeholder: 'Type a message to sign...'
        },
        quiz: [
            { question: 'Which key is used to CREATE a digital signature?', options: ['Public key', 'Private key', 'Session key', 'Shared key'], correct: 1, explanation: 'The signer uses their private key to create the signature. This is the reverse of encryption, where the public key encrypts. Only the private key holder can produce valid signatures.' },
            { question: 'Which property ensures a signer cannot deny having signed a message?', options: ['Confidentiality', 'Integrity', 'Non-repudiation', 'Availability'], correct: 2, explanation: 'Non-repudiation means the signer cannot later deny signing the message, because only their private key could have produced that signature. This is crucial for legal and financial transactions.' },
            { question: 'Why is the message hashed before signing?', options: ['To encrypt the message', 'To make it smaller and faster to sign', 'To hide the message content', 'To add randomness'], correct: 1, explanation: 'Asymmetric signing operations are slow. By hashing the message first (producing a fixed 256-bit digest), we can sign quickly regardless of the original message size.' },
            { question: 'If Alice signs a message and Bob modifies one character, what happens when Carol verifies?', options: ['The signature still verifies (it is robust)', 'Verification fails — the hashes will not match', 'Only the modified character is detected', 'The signature becomes Carol\'s'], correct: 1, explanation: 'Even a single-bit change produces a completely different hash (avalanche effect). When Carol decrypts the signature and compares hashes, they will not match, indicating tampering.' },
            { question: 'What digital signature algorithm does Bitcoin use?', options: ['RSA-2048', 'ECDSA (secp256k1)', 'EdDSA (Ed25519)', 'DSA-1024'], correct: 1, explanation: 'Bitcoin uses ECDSA with the secp256k1 elliptic curve. Ethereum is migrating to support EdDSA as well. ECDSA provides equivalent security to RSA with much smaller keys.' },
            { question: 'A digitally signed email provides which of the following?', options: ['Confidentiality only', 'Authentication and integrity, but NOT confidentiality', 'Confidentiality and integrity, but NOT authentication', 'All three: confidentiality, authentication, integrity'], correct: 1, explanation: 'A digital signature provides authentication (who sent it) and integrity (it was not altered), but NOT confidentiality — the message content is visible. For confidentiality, the message must also be encrypted.' }
        ]
    },

    // =====================================================================
    // HASHING — Cryptographic Hash Functions
    // =====================================================================
    HASHING: {
        key: 'HASHING',
        title: 'Cryptographic Hashing',
        icon: '#️⃣',
        color: '#a855f7',
        description: 'One-way functions that compress any input into a fixed-size fingerprint. The foundation of password storage, digital signatures, blockchain, and file integrity.',
        overview: {
            concepts: ['One-Way Function', 'Avalanche Effect', 'Collision Resistance', 'MD5', 'SHA-1', 'SHA-256', 'SHA-3', 'Pre-image Resistance'],
            explanation: `
                <p>A cryptographic hash function takes an input of any size and produces a fixed-size output (the "digest" or "hash"). It is designed to be a <strong>one-way function</strong> — easy to compute but infeasible to reverse.</p>
                <h4>Key Properties</h4>
                <ul>
                    <li><strong>Deterministic:</strong> Same input always produces the same hash</li>
                    <li><strong>Fixed output:</strong> SHA-256 always produces 256 bits, regardless of input size</li>
                    <li><strong>Avalanche effect:</strong> Changing one bit of input changes ~50% of output bits</li>
                    <li><strong>Pre-image resistance:</strong> Given a hash, you cannot find the original input</li>
                    <li><strong>Collision resistance:</strong> Infeasible to find two different inputs with the same hash</li>
                </ul>
                <h4>Algorithm Comparison</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">MD5</div>
                        <div class="crypto-compare-detail">128-bit output</div>
                        <div class="crypto-compare-note warn">BROKEN — collisions found in seconds</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">SHA-1</div>
                        <div class="crypto-compare-detail">160-bit output</div>
                        <div class="crypto-compare-note warn">BROKEN — SHAttered attack (2017)</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">SHA-256</div>
                        <div class="crypto-compare-detail">256-bit output</div>
                        <div class="crypto-compare-note good">Current standard — used in Bitcoin, TLS, etc.</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">SHA-3</div>
                        <div class="crypto-compare-detail">Variable output (Keccak sponge)</div>
                        <div class="crypto-compare-note good">Different design than SHA-2, backup standard</div>
                    </div>
                </div>
            `,
            diagram: 'hash-function'
        },
        howItWorks: {
            steps: [
                { title: 'Input Processing', description: 'The message is padded to a multiple of the block size (512 bits for SHA-256) and a length field is appended. This ensures the hash function processes complete blocks.', detail: 'The padding includes a 1 bit, then zeros, then the original message length in bits. This Merkle-Damgard construction is used by MD5, SHA-1, and SHA-2.' },
                { title: 'Initialize State', description: 'The hash function starts with a fixed initial hash value (IV) — specific constants defined in the algorithm specification.', detail: 'SHA-256 uses 8 initial values derived from the fractional parts of the square roots of the first 8 primes.' },
                { title: 'Process Each Block', description: 'Each 512-bit block is processed through a compression function that combines it with the current state. The output becomes the new state for the next block.', detail: 'SHA-256 uses 64 rounds of bitwise operations, additions, and rotations per block. The compression function is not reversible.' },
                { title: 'Avalanche Effect', description: 'The compression function is designed so that changing one input bit cascades through all rounds, flipping approximately half the output bits. This makes hashes unpredictable.', detail: 'Example: SHA-256("abc") and SHA-256("abd") share only ~50% of their bits, despite differing by just one character.' },
                { title: 'Final Hash Output', description: 'After all blocks are processed, the final state is the hash digest. For SHA-256, this is 256 bits (64 hex characters).', detail: 'The hash is deterministic — the same input always produces the same output, but even a tiny change produces a completely different hash.' },
                { title: 'Use Cases', description: 'Password storage (hash + salt), file integrity (checksums), digital signatures (hash then sign), blockchain (proof of work), and certificate fingerprints.', detail: 'Passwords should use slow hashes (bcrypt, Argon2) not fast ones (SHA-256). Fast hashes enable rapid brute-force attacks against password databases.' }
            ]
        },
        interactive: {
            type: 'hash-demo',
            instructions: 'Type any text to see its hash computed in real-time. Notice how even a tiny change produces a completely different hash (avalanche effect).',
            placeholder: 'Type anything to see its hash...'
        },
        quiz: [
            { question: 'What is the output size of SHA-256?', options: ['128 bits', '160 bits', '256 bits', '512 bits'], correct: 2, explanation: 'SHA-256 always produces a 256-bit (32-byte, 64 hex character) digest, regardless of the input size.' },
            { question: 'Which property means you cannot find the input from the hash?', options: ['Collision resistance', 'Pre-image resistance', 'Avalanche effect', 'Determinism'], correct: 1, explanation: 'Pre-image resistance means given a hash h, it is computationally infeasible to find any input m such that hash(m) = h. This is what makes hashing a "one-way function."' },
            { question: 'Which hash algorithm has been broken (collision found)?', options: ['SHA-256', 'SHA-3', 'SHA-1', 'BLAKE2'], correct: 2, explanation: 'SHA-1 was broken by the SHAttered attack in 2017, which produced two different PDF files with the same SHA-1 hash. MD5 was broken even earlier. SHA-256 and SHA-3 remain secure.' },
            { question: 'Changing one bit in the input should change approximately what percentage of the hash output?', options: ['1%', '10%', '25%', '50%'], correct: 3, explanation: 'The avalanche effect means changing one input bit flips ~50% of output bits. This makes hashes appear random and prevents any pattern analysis.' },
            { question: 'Why should passwords NOT be stored with SHA-256 directly?', options: ['SHA-256 is broken', 'SHA-256 is too fast — enables rapid brute-force', 'SHA-256 output is too long', 'SHA-256 is reversible'], correct: 1, explanation: 'SHA-256 is too fast for password hashing — a GPU can compute billions of hashes per second. Password-specific hashes (bcrypt, Argon2) are intentionally slow to make brute-force impractical.' },
            { question: 'What is a hash collision?', options: ['When a hash function crashes', 'When two different inputs produce the same hash output', 'When the hash is too long to store', 'When the hash contains only zeros'], correct: 1, explanation: 'A collision is when hash(m1) = hash(m2) but m1 != m2. Collision resistance means this should be infeasible to find intentionally, though collisions must exist (pigeonhole principle).' }
        ]
    },

    // =====================================================================
    // HMAC — Hash-based Message Authentication Code
    // =====================================================================
    HMAC: {
        key: 'HMAC',
        title: 'HMAC (Hash-based Message Authentication Code)',
        icon: '🔏',
        color: '#a855f7',
        description: 'Combines a hash function with a secret key to verify both integrity AND authenticity. The difference between "was this modified?" and "did the right person send this?"',
        overview: {
            concepts: ['MAC', 'HMAC', 'Message Authentication', 'Integrity', 'Shared Secret', 'API Authentication', 'JWT', 'Keyed Hash'],
            explanation: `
                <p>A regular hash verifies integrity (was the data modified?) but not authenticity (who sent it?). An HMAC adds a <strong>secret key</strong> to the hash, proving that only someone who knows the key could have produced it.</p>
                <h4>Hash vs HMAC</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Hash</div>
                        <div class="crypto-compare-detail">SHA-256("message") = digest</div>
                        <div class="crypto-compare-note">Anyone can compute — proves integrity only</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">HMAC</div>
                        <div class="crypto-compare-detail">HMAC-SHA256(key, "message") = tag</div>
                        <div class="crypto-compare-note good">Only key holders can compute — proves integrity + authenticity</div>
                    </div>
                </div>
                <h4>Where HMAC Is Used</h4>
                <ul>
                    <li><strong>JWT (JSON Web Tokens):</strong> HS256 is HMAC-SHA256 — used to sign API tokens</li>
                    <li><strong>API Authentication:</strong> AWS, Stripe, and other APIs use HMAC to sign requests</li>
                    <li><strong>TLS:</strong> The handshake Finished message uses HMAC to verify the handshake was not tampered with</li>
                    <li><strong>IPsec:</strong> Uses HMAC for packet authentication</li>
                    <li><strong>TOTP (2FA):</strong> Time-based One-Time Passwords use HMAC-SHA1 internally</li>
                </ul>
            `,
            diagram: 'hmac-process'
        },
        howItWorks: {
            steps: [
                { title: 'Key Preparation', description: 'If the key is longer than the hash block size (64 bytes for SHA-256), hash it first. If shorter, pad it with zeros to the block size.', detail: 'This normalization ensures HMAC works correctly regardless of key length. The block size is specific to the underlying hash function.' },
                { title: 'Inner Padding (ipad)', description: 'XOR the prepared key with a constant (0x36 repeated). This creates the inner key. Prepend it to the message.', detail: 'The ipad constant 0x36 was chosen to maximize bit differences with the opad constant, ensuring the inner and outer hashes are independent.' },
                { title: 'Inner Hash', description: 'Hash the combined (inner_key || message) to produce an intermediate digest. This is the "inner hash."', detail: 'inner_hash = H((key XOR ipad) || message)' },
                { title: 'Outer Padding (opad)', description: 'XOR the prepared key with a different constant (0x5c repeated). This creates the outer key.', detail: 'The opad constant 0x5c ensures the outer hash uses a different effective key than the inner hash, preventing length extension attacks.' },
                { title: 'Outer Hash', description: 'Hash the combined (outer_key || inner_hash) to produce the final HMAC tag.', detail: 'HMAC = H((key XOR opad) || H((key XOR ipad) || message)). This double-hash construction is provably secure if the underlying hash is a PRF.' },
                { title: 'Verification', description: 'The recipient computes HMAC with the same key and message, then compares tags. They must use constant-time comparison to prevent timing attacks.', detail: 'Timing attacks: if comparison returns early on the first mismatched byte, an attacker can determine the correct tag one byte at a time.' }
            ]
        },
        interactive: {
            type: 'hmac-demo',
            instructions: 'Enter a message and a secret key to compute an HMAC. Change either the message or the key and see how the HMAC completely changes.',
            placeholder: 'Enter a message...'
        },
        quiz: [
            { question: 'What does HMAC provide that a regular hash does not?', options: ['Encryption', 'Authentication (proof of who computed it)', 'Larger output size', 'Faster computation'], correct: 1, explanation: 'HMAC proves that the creator knew the secret key, providing authentication. A regular hash can be computed by anyone, so it only proves integrity (no tampering), not who created it.' },
            { question: 'What algorithm is "HS256" in JWT?', options: ['Hash-SHA-256', 'HMAC-SHA-256', 'HTTPS-256', 'Hybrid-SHA-256'], correct: 1, explanation: 'HS256 stands for HMAC using SHA-256. It is used to sign JSON Web Tokens, allowing the server to verify that the token was not tampered with and was created by someone with the secret key.' },
            { question: 'Why does HMAC use two hash operations (inner and outer)?', options: ['For speed', 'To produce a longer output', 'To prevent length extension attacks', 'To support multiple hash algorithms'], correct: 2, explanation: 'The double-hash construction prevents length extension attacks. With a single hash(key || message), an attacker who sees the hash can compute hash(key || message || attacker_data) without knowing the key. HMAC\'s nested structure prevents this.' },
            { question: 'Why must HMAC verification use constant-time comparison?', options: ['For accuracy', 'To prevent timing side-channel attacks', 'To save CPU cycles', 'For thread safety'], correct: 1, explanation: 'If comparison returns as soon as a byte mismatches, an attacker can measure response times to determine how many leading bytes are correct, eventually recovering the full HMAC tag byte by byte.' },
            { question: 'Which two-factor authentication method uses HMAC internally?', options: ['SMS codes', 'Push notifications', 'TOTP (Authenticator apps)', 'Biometric'], correct: 2, explanation: 'TOTP (Time-based One-Time Password) computes HMAC-SHA1(secret, timestamp/30) to generate the 6-digit codes you see in apps like Google Authenticator.' },
            { question: 'Can HMAC be used for password storage?', options: ['Yes, it is the best option', 'No — HMAC is too fast, use bcrypt/Argon2 instead', 'Only with SHA-3', 'Only for admin passwords'], correct: 1, explanation: 'Like regular SHA-256, HMAC-SHA256 is too fast for password hashing. Attackers can compute billions per second. Password-specific functions (bcrypt, Argon2, scrypt) are intentionally slow.' }
        ]
    },

    // =====================================================================
    // KEY_EXCHANGE — Key Exchange Mechanisms
    // =====================================================================
    KEY_EXCHANGE: {
        key: 'KEY_EXCHANGE',
        title: 'Key Exchange Mechanisms',
        icon: '🔄',
        color: '#a855f7',
        description: 'The fundamental problem of cryptography: how do two parties establish a shared secret? From physical key exchange to Diffie-Hellman to post-quantum algorithms.',
        overview: {
            concepts: ['Key Distribution Problem', 'Pre-Shared Keys', 'Diffie-Hellman', 'RSA Key Transport', 'Ephemeral Keys', 'Key Derivation', 'Post-Quantum', 'Key Encapsulation'],
            explanation: `
                <p>Before two parties can communicate securely, they need a shared secret key. The <strong>key exchange problem</strong> is: how do you establish this key without an attacker intercepting it?</p>
                <h4>Evolution of Key Exchange</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Physical Exchange</div>
                        <div class="crypto-compare-detail">Courier delivers sealed keys</div>
                        <div class="crypto-compare-note">The original method — does not scale to the internet</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">RSA Key Transport</div>
                        <div class="crypto-compare-detail">Client encrypts random key with server public key</div>
                        <div class="crypto-compare-note warn">No forward secrecy — removed from TLS 1.3</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Diffie-Hellman (ECDHE)</div>
                        <div class="crypto-compare-detail">Both parties contribute to shared secret</div>
                        <div class="crypto-compare-note good">Forward secrecy — standard for TLS 1.3</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Post-Quantum (Kyber/ML-KEM)</div>
                        <div class="crypto-compare-detail">Lattice-based key encapsulation</div>
                        <div class="crypto-compare-note good">Resistant to quantum computer attacks</div>
                    </div>
                </div>
                <h4>Why Forward Secrecy Matters</h4>
                <p>Without forward secrecy (e.g., RSA key transport), if the server's private key is ever compromised, <em>all past recorded sessions</em> can be decrypted. With ephemeral DH, each session uses unique keys that are discarded — past sessions remain secure even after a key compromise.</p>
            `,
            diagram: 'key-exchange-evolution'
        },
        howItWorks: {
            steps: [
                { title: 'The Problem', description: 'Alice and Bob want to communicate securely over the internet. An eavesdropper (Eve) can observe everything they send. How can they establish a shared key?', detail: 'This is the key distribution problem — the central challenge of cryptography until 1976.' },
                { title: 'Pre-Shared Keys (PSK)', description: 'The simplest solution: share a key before communication begins (in person, by phone, by courier). Used in WiFi (WPA2-PSK), VPNs, and IoT devices.', detail: 'PSK does not scale — managing keys for N parties requires N*(N-1)/2 unique keys. For 1,000 parties, that is 499,500 keys.' },
                { title: 'RSA Key Transport (Legacy)', description: 'The client generates a random session key, encrypts it with the server\'s RSA public key, and sends it. Only the server can decrypt it with its private key.', detail: 'Used in TLS 1.0-1.2. Removed from TLS 1.3 because compromising the server\'s RSA key allows decryption of all past sessions.' },
                { title: 'Diffie-Hellman Exchange', description: 'Both parties contribute random values to compute a shared secret. Neither party alone determines the secret, and an eavesdropper cannot compute it from the public values.', detail: 'ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) is the standard for TLS 1.3. New random values per session = forward secrecy.' },
                { title: 'Key Derivation', description: 'The raw shared secret is passed through HKDF (HMAC-based Key Derivation Function) to derive separate keys for encryption, authentication, and both directions.', detail: 'HKDF has two phases: Extract (condense entropy) and Expand (produce the required key material). The handshake transcript is included as context.' },
                { title: 'Post-Quantum Key Exchange', description: 'Quantum computers could break DH and RSA. NIST standardized ML-KEM (formerly Kyber) for post-quantum key encapsulation. TLS is transitioning to hybrid key exchange (ECDHE + ML-KEM).', detail: 'Hybrid key exchange combines classical and post-quantum algorithms so that security is maintained even if one algorithm is broken.' }
            ]
        },
        interactive: {
            type: 'key-exchange-compare',
            instructions: 'Compare three key exchange methods side by side. See why RSA key transport lacks forward secrecy and how DH solves the problem.',
            placeholder: ''
        },
        quiz: [
            { question: 'What is the key distribution problem?', options: ['Keys are too expensive to manufacture', 'How to establish a shared secret over an insecure channel', 'How to make keys long enough', 'How to store keys securely'], correct: 1, explanation: 'The key distribution problem is: how do two parties who have never met establish a shared secret key when their communication channel may be monitored? This was the central problem of cryptography until Diffie-Hellman (1976).' },
            { question: 'Why was RSA key transport removed from TLS 1.3?', options: ['RSA is too slow', 'It does not provide forward secrecy', 'RSA is broken by quantum computers', 'It uses too much bandwidth'], correct: 1, explanation: 'With RSA key transport, the client encrypts the session key with the server\'s RSA public key. If the server\'s private key is later compromised (or compelled by court order), all recorded past sessions can be decrypted. DH provides forward secrecy.' },
            { question: 'How many pre-shared keys are needed for 100 people to all communicate pairwise?', options: ['100', '200', '4,950', '10,000'], correct: 2, explanation: 'For N parties, N*(N-1)/2 unique keys are needed. For 100 parties: 100*99/2 = 4,950 keys. This scaling problem is why pre-shared keys do not work for the internet.' },
            { question: 'What is ML-KEM (formerly KYBER)?', options: ['A new hash algorithm', 'A post-quantum key encapsulation mechanism', 'A faster version of AES', 'A quantum random number generator'], correct: 1, explanation: 'ML-KEM (Module Lattice Key Encapsulation Mechanism) is NIST\'s standardized post-quantum key exchange algorithm. It is designed to resist attacks from quantum computers.' },
            { question: 'What does "ephemeral" mean in ECDHE?', options: ['Encrypted', 'Elliptic', 'Keys are generated fresh for each session', 'Keys are stored temporarily'], correct: 2, explanation: 'Ephemeral means the DH key pair is generated new for every session and discarded afterward. This provides forward secrecy — there is no long-term DH key to compromise.' },
            { question: 'What does HKDF do?', options: ['Encrypts data', 'Derives high-quality key material from a shared secret', 'Compresses keys', 'Signs messages'], correct: 1, explanation: 'HKDF (HMAC-based Key Derivation Function) takes the raw shared secret from key exchange and derives the actual encryption and authentication keys. It ensures the keys are uniformly random and properly separated.' }
        ]
    },

    // =====================================================================
    // PKI — Public Key Infrastructure
    // =====================================================================
    PKI: {
        key: 'PKI',
        title: 'Public Key Infrastructure (PKI)',
        icon: '🏗️',
        color: '#a855f7',
        description: 'The trust framework behind HTTPS. PKI uses Certificate Authorities, digital certificates, and chain-of-trust to bind public keys to real-world identities.',
        overview: {
            concepts: ['Certificate Authority (CA)', 'X.509 Certificates', 'Chain of Trust', 'Root CA', 'Intermediate CA', 'Certificate Revocation', 'OCSP', 'CRL', 'Let\'s Encrypt'],
            explanation: `
                <p>Public keys solve the encryption problem, but create a new one: <strong>how do you know a public key actually belongs to who you think?</strong> An attacker could substitute their own key (man-in-the-middle). PKI solves this with a hierarchy of trust.</p>
                <h4>The Chain of Trust</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Root CA</div>
                        <div class="crypto-compare-detail">Self-signed, stored in OS/browser trust store</div>
                        <div class="crypto-compare-note">~150 trusted root CAs worldwide (DigiCert, Let's Encrypt, GlobalSign...)</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Intermediate CA</div>
                        <div class="crypto-compare-detail">Signed by root CA, issues end-entity certs</div>
                        <div class="crypto-compare-note">Protects root — if intermediate is compromised, only it is revoked</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">End-Entity Certificate</div>
                        <div class="crypto-compare-detail">Your website's certificate (e.g., example.com)</div>
                        <div class="crypto-compare-note">Contains your public key + domain name, signed by intermediate CA</div>
                    </div>
                </div>
                <h4>What a Certificate Contains</h4>
                <ul>
                    <li><strong>Subject:</strong> Who the certificate belongs to (domain name or organization)</li>
                    <li><strong>Public Key:</strong> The subject's public key</li>
                    <li><strong>Issuer:</strong> Which CA signed this certificate</li>
                    <li><strong>Validity Period:</strong> Not Before and Not After dates</li>
                    <li><strong>Serial Number:</strong> Unique identifier for revocation tracking</li>
                    <li><strong>Signature:</strong> The CA's digital signature over all the above</li>
                </ul>
            `,
            diagram: 'pki-chain'
        },
        howItWorks: {
            steps: [
                { title: 'Generate Key Pair', description: 'The website owner generates an RSA or ECDSA key pair. The private key stays on the server. The public key will be included in the certificate.', detail: 'RSA-2048 or ECDSA P-256 are standard. The private key must be protected — its compromise means anyone can impersonate the site.' },
                { title: 'Create CSR (Certificate Signing Request)', description: 'The owner creates a CSR containing their public key, domain name, and organization info. This is sent to a Certificate Authority.', detail: 'The CSR is signed with the owner\'s private key, proving they possess the corresponding key pair.' },
                { title: 'CA Validates Identity', description: 'The CA verifies the requestor controls the domain. For DV certs, this is automated (DNS or HTTP challenge). For EV certs, the CA verifies the legal organization.', detail: 'Let\'s Encrypt uses the ACME protocol for fully automated DV validation — place a file at a specific URL or create a DNS record to prove domain control.' },
                { title: 'CA Issues Certificate', description: 'The CA signs the certificate with its private key and returns the signed certificate. The signature binds the public key to the domain name.', detail: 'The certificate includes the CA\'s digital signature, validity dates, and the complete chain (end-entity + intermediate certificates).' },
                { title: 'Browser Validates Certificate', description: 'When a user visits the site, the browser checks: (1) the certificate chain leads to a trusted root, (2) signatures are valid, (3) the certificate is not expired, (4) the domain matches.', detail: 'Browsers also check revocation status via OCSP (Online Certificate Status Protocol) or CRL (Certificate Revocation List) to detect compromised certificates.' },
                { title: 'Certificate Revocation', description: 'If a private key is compromised, the CA revokes the certificate. Browsers check revocation status and reject revoked certificates.', detail: 'OCSP stapling is the modern approach — the server periodically fetches its own OCSP response and "staples" it to the TLS handshake, avoiding client-side OCSP lookups.' }
            ]
        },
        interactive: {
            type: 'pki-chain-explorer',
            instructions: 'Explore a certificate chain. Click each certificate level to see its contents and how signatures link the chain from your website up to the trusted root CA.',
            placeholder: ''
        },
        quiz: [
            { question: 'What does a Certificate Authority (CA) do?', options: ['Encrypts your website traffic', 'Verifies identity and signs certificates binding public keys to entities', 'Generates encryption keys for websites', 'Hosts website content'], correct: 1, explanation: 'A CA verifies that a certificate requestor controls the domain (or is the claimed organization) and then digitally signs a certificate that binds their public key to their identity.' },
            { question: 'Why are intermediate CAs used instead of signing directly with the root CA?', options: ['For faster signing', 'To protect the root — if an intermediate is compromised, only it needs revocation', 'To make certificates cheaper', 'For backwards compatibility'], correct: 1, explanation: 'Root CA private keys are kept offline in hardware security modules. If the root signed everything directly and was compromised, every certificate in the world would be untrusted. Intermediates provide a security boundary.' },
            { question: 'What does a DV (Domain Validation) certificate prove?', options: ['The organization is legally registered', 'The requestor controls the domain name', 'The website is free of malware', 'The server uses strong encryption'], correct: 1, explanation: 'DV certificates only prove domain control (via DNS or HTTP challenge). They do NOT verify the legal identity of the organization. EV (Extended Validation) certificates do verify organizational identity.' },
            { question: 'What happens if a website\'s certificate is expired?', options: ['It works normally', 'The browser shows a warning/error and may block access', 'The certificate automatically renews', 'Only mobile browsers reject it'], correct: 1, explanation: 'Browsers check the NotAfter date and display a security warning if the certificate is expired. Users can sometimes bypass the warning, but automated systems (APIs, bots) typically reject expired certificates.' },
            { question: 'What is OCSP stapling?', options: ['Attaching multiple certificates together', 'The server pre-fetches its own revocation status and includes it in the TLS handshake', 'A new certificate format', 'Compressing certificates'], correct: 1, explanation: 'OCSP stapling lets the server periodically check its own certificate\'s revocation status with the CA, then "staple" the signed response to its TLS handshake. This avoids the client having to make a separate OCSP request.' },
            { question: 'Approximately how many root CAs are trusted by major browsers?', options: ['About 10', 'About 50', 'About 150', 'About 1,000'], correct: 2, explanation: 'Major browsers trust approximately 150 root CAs. This number changes as CAs are added or removed. Each root CA can issue intermediate CAs, which can then sign end-entity certificates.' }
        ]
    },

    // =====================================================================
    // RSA — RSA Algorithm
    // =====================================================================
    RSA: {
        key: 'RSA',
        title: 'RSA Algorithm',
        icon: '🔐',
        color: '#a855f7',
        description: 'The first practical public-key cryptosystem. RSA enables encryption and digital signatures using the mathematical difficulty of factoring large prime numbers.',
        overview: {
            concepts: ['Public-Key Cryptography', 'Prime Factorization', 'Modular Exponentiation', 'Key Generation', 'Euler\'s Totient', 'PKCS#1', 'OAEP', 'Key Sizes'],
            explanation: `
                <p>RSA (Rivest-Shamir-Adleman, 1977) was the first algorithm that made public-key cryptography practical. Its security relies on the fact that <strong>multiplying two large primes is easy, but factoring the product back into primes is extremely hard</strong>.</p>
                <h4>The Core Insight</h4>
                <p>Easy: 61 x 53 = 3,233 (instant multiplication)<br>
                Hard: 3,233 = ? x ? (requires trial division or sophisticated algorithms)<br>
                With 2048-bit primes, factoring is computationally infeasible.</p>
                <h4>Key Sizes and Security</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">RSA-1024</div>
                        <div class="crypto-compare-detail">~80-bit security</div>
                        <div class="crypto-compare-note warn">DEPRECATED — factorable with significant resources</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">RSA-2048</div>
                        <div class="crypto-compare-detail">~112-bit security</div>
                        <div class="crypto-compare-note">Current minimum standard</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">RSA-4096</div>
                        <div class="crypto-compare-detail">~140-bit security</div>
                        <div class="crypto-compare-note good">Used for long-term keys, root CAs</div>
                    </div>
                </div>
                <h4>RSA vs Elliptic Curves</h4>
                <p>ECDSA/EdDSA achieve equivalent security with much smaller keys: a 256-bit ECDSA key ~ 3072-bit RSA key. RSA remains widely used but is being gradually replaced by elliptic curve algorithms.</p>
            `,
            diagram: 'rsa-process'
        },
        howItWorks: {
            steps: [
                { title: 'Choose Two Large Primes', description: 'Randomly generate two large prime numbers p and q (each at least 1024 bits for RSA-2048). These must be kept secret.', detail: 'Primes are found by generating random odd numbers and testing with the Miller-Rabin primality test until a prime is found.' },
                { title: 'Compute n = p * q', description: 'Multiply the two primes to get n (the modulus). This is 2048 bits long and is part of both the public and private keys.', detail: 'The security of RSA depends on the difficulty of factoring n back into p and q. With 1024-bit primes, n is 2048 bits — no known algorithm can factor it efficiently.' },
                { title: 'Compute Euler\'s Totient', description: 'Calculate phi(n) = (p-1)(q-1). This counts the integers less than n that are coprime to n. Phi(n) is used to find the keys and must be kept secret.', detail: 'Modern implementations use the Carmichael function lambda(n) = lcm(p-1, q-1) instead, which produces smaller private exponents.' },
                { title: 'Choose Public Exponent e', description: 'Select e such that 1 < e < phi(n) and gcd(e, phi(n)) = 1. The standard choice is e = 65537 (0x10001).', detail: '65537 is preferred because it is prime, has only two 1-bits in binary (fast exponentiation), and is large enough to prevent certain attacks.' },
                { title: 'Compute Private Exponent d', description: 'Find d such that d*e = 1 mod phi(n). This is the modular multiplicative inverse of e. d is the private key and must be kept secret.', detail: 'Use the Extended Euclidean Algorithm to compute d. The public key is (n, e), the private key is (n, d). The values p, q, and phi(n) are discarded (or kept for CRT optimization).' },
                { title: 'Encrypt / Decrypt', description: 'Encrypt: c = m^e mod n (using public key). Decrypt: m = c^d mod n (using private key). The math works because m^(ed) mod n = m (by Euler\'s theorem).', detail: 'In practice, RSA is not used to encrypt messages directly. It encrypts session keys (RSA-OAEP) or signs hashes (RSA-PSS). Direct textbook RSA has several vulnerabilities.' }
            ]
        },
        interactive: {
            type: 'rsa-demo',
            instructions: 'Generate RSA keys with small primes to see the math in action. Enter a number to encrypt it with the public key, then decrypt with the private key.',
            placeholder: ''
        },
        quiz: [
            { question: 'What mathematical problem makes RSA secure?', options: ['Discrete logarithm', 'Integer factorization', 'Traveling salesman', 'Graph coloring'], correct: 1, explanation: 'RSA security relies on the difficulty of factoring the product of two large primes. Given n = p*q where p and q are 1024-bit primes, no known algorithm can efficiently find p and q.' },
            { question: 'What is the standard public exponent used in RSA?', options: ['2', '3', '257', '65537'], correct: 3, explanation: '65537 (2^16 + 1) is the standard public exponent. It is prime, has only two 1-bits in binary (making exponentiation fast), and is large enough to resist certain small-exponent attacks.' },
            { question: 'An RSA-2048 key is equivalent in security to approximately what AES key size?', options: ['80-bit', '112-bit', '128-bit', '256-bit'], correct: 1, explanation: 'RSA-2048 provides approximately 112 bits of security. RSA-3072 ~ 128-bit AES. This is why RSA keys are much larger than symmetric keys — the math behind RSA is "easier to attack" than brute-forcing AES.' },
            { question: 'Why is textbook RSA (m^e mod n) not used directly in practice?', options: ['It is too slow', 'It is deterministic and vulnerable to several attacks', 'It only works with prime messages', 'It produces ciphertext larger than the message'], correct: 1, explanation: 'Textbook RSA is deterministic (same plaintext always produces same ciphertext), vulnerable to chosen-plaintext attacks, and has other weaknesses. OAEP padding adds randomness and structure to prevent these attacks.' },
            { question: 'What threat could eventually break RSA?', options: ['Faster CPUs', 'Quantum computers running Shor\'s algorithm', 'GPU computing', 'Machine learning'], correct: 1, explanation: 'Shor\'s algorithm, running on a sufficiently powerful quantum computer, could factor large numbers in polynomial time, breaking RSA. This is why post-quantum cryptography (lattice-based, hash-based) is being developed.' },
            { question: 'Who invented RSA?', options: ['Diffie and Hellman', 'Rivest, Shamir, and Adleman', 'Bernstein and Lange', 'Daemen and Rijmen'], correct: 1, explanation: 'Ron Rivest, Adi Shamir, and Leonard Adleman published RSA in 1977 at MIT. It was the first practical public-key encryption algorithm. (Clifford Cocks at GCHQ independently discovered it in 1973 but it was classified.)' }
        ]
    },

    // =====================================================================
    // STEGANOGRAPHY — Steganography
    // =====================================================================
    STEGANOGRAPHY: {
        key: 'STEGANOGRAPHY',
        title: 'Steganography',
        icon: '🖼️',
        color: '#a855f7',
        description: 'The art of hiding messages in plain sight. Unlike encryption (which makes data unreadable), steganography makes the data invisible — the observer does not even know a message exists.',
        overview: {
            concepts: ['Hiding in Plain Sight', 'LSB (Least Significant Bit)', 'Image Steganography', 'Audio Steganography', 'Steganalysis', 'Cover Object', 'Payload', 'Capacity'],
            explanation: `
                <p>Steganography comes from the Greek "steganos" (covered) + "graphein" (writing). While encryption protects the <em>content</em> of a message, steganography hides the <em>existence</em> of the message itself.</p>
                <h4>Encryption vs Steganography</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Encryption</div>
                        <div class="crypto-compare-detail">Message is visible but unreadable</div>
                        <div class="crypto-compare-note">Observer KNOWS a secret message exists</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Steganography</div>
                        <div class="crypto-compare-detail">Message is invisible, hidden in innocent-looking data</div>
                        <div class="crypto-compare-note good">Observer does NOT know a message exists</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Both Combined</div>
                        <div class="crypto-compare-detail">Encrypted message hidden in cover object</div>
                        <div class="crypto-compare-note good">Even if found, the message is still unreadable</div>
                    </div>
                </div>
                <h4>Common Techniques</h4>
                <ul>
                    <li><strong>Image LSB:</strong> Replace the least significant bit of each pixel with message data — visually imperceptible</li>
                    <li><strong>Audio LSB:</strong> Hide data in the least significant bits of audio samples</li>
                    <li><strong>Whitespace:</strong> Use invisible spaces and tabs to encode binary data in text files</li>
                    <li><strong>Network:</strong> Hide data in protocol headers, timing, or unused packet fields</li>
                </ul>
            `,
            diagram: 'steganography-lsb'
        },
        howItWorks: {
            steps: [
                { title: 'Choose a Cover Object', description: 'Select an innocent-looking carrier file — typically an image, audio file, or video. The larger and more complex the cover, the more data can be hidden without detection.', detail: 'Natural photographs with lots of variation (landscapes, crowds) are ideal. Solid-color images or simple graphics are poor choices because changes are more noticeable.' },
                { title: 'Convert Message to Binary', description: 'The secret message is converted to a stream of bits. Optionally, encrypt the message first for additional security.', detail: 'Best practice: always encrypt before hiding. If the steganography is detected, the encrypted message is still unreadable.' },
                { title: 'LSB Embedding', description: 'For each pixel in the image, replace the least significant bit (LSB) of each color channel (R, G, B) with one bit of the message. The change is imperceptible to human vision.', detail: 'Changing the LSB alters a color value by at most 1 (e.g., 148 becomes 149). This is invisible to the naked eye. Each pixel can carry 3 bits (one per channel).' },
                { title: 'Mark End of Message', description: 'Include a delimiter or message length so the receiver knows where the hidden message ends and the normal image data resumes.', detail: 'Common approaches: prepend the message length, or use a special end-of-message byte sequence.' },
                { title: 'Save the Stego Image', description: 'Save the modified image in a lossless format (PNG, BMP). JPEG compression would destroy the hidden data because it modifies pixel values.', detail: 'This is a key limitation: steganographic images must use lossless formats. Converting PNG to JPEG destroys the hidden message.' },
                { title: 'Extraction', description: 'The receiver reads the LSBs from the image pixels in the same order, reconstructing the binary stream and converting back to the original message.', detail: 'Both sender and receiver must agree on the embedding order, bit depth, and any encryption applied to the payload.' }
            ]
        },
        interactive: {
            type: 'steganography-demo',
            instructions: 'Type a secret message to hide in the sample image below. See how the pixels change (barely!) when the message is embedded using LSB steganography.',
            placeholder: 'Enter a secret message to hide...'
        },
        quiz: [
            { question: 'What is the primary goal of steganography?', options: ['Make data unreadable', 'Hide the existence of the data', 'Compress data', 'Authenticate the sender'], correct: 1, explanation: 'Steganography hides the existence of a message. The observer does not even know a secret message is present. Encryption makes data unreadable but its existence is obvious.' },
            { question: 'What does LSB stand for in image steganography?', options: ['Large Scale Bitmap', 'Least Significant Bit', 'Low Signal Band', 'Linear Substitution Block'], correct: 1, explanation: 'LSB (Least Significant Bit) steganography replaces the last bit of each pixel color value with message data. Changing one bit (e.g., 148 to 149) is imperceptible to human vision.' },
            { question: 'Why must steganographic images be saved as PNG, not JPEG?', options: ['PNG files are smaller', 'JPEG compression alters pixel values, destroying the hidden data', 'JPEG does not support color', 'PNG is more secure'], correct: 1, explanation: 'JPEG uses lossy compression that changes pixel values. Since the hidden message is encoded in exact pixel bit values, JPEG compression would corrupt or destroy the hidden data. PNG is lossless.' },
            { question: 'What is steganalysis?', options: ['A type of steganography', 'The art of detecting hidden messages in cover objects', 'Converting images to text', 'A hash function'], correct: 1, explanation: 'Steganalysis is the detection of steganographic content. Techniques include statistical analysis of LSB patterns, chi-square tests, and machine learning classifiers trained on stego vs clean images.' },
            { question: 'For maximum security, what should you do before hiding a message steganographically?', options: ['Compress it', 'Encrypt it', 'Convert it to uppercase', 'Add checksums'], correct: 1, explanation: 'Best practice is to encrypt the message before embedding. This provides two layers of protection: even if an analyst detects the steganography, the extracted data is still encrypted and unreadable.' },
            { question: 'Approximately how many bits of data can be hidden per pixel using basic LSB steganography?', options: ['1 bit', '3 bits (1 per RGB channel)', '8 bits', '24 bits'], correct: 1, explanation: 'Basic LSB steganography hides 1 bit in the least significant bit of each color channel (R, G, B), for 3 bits per pixel. A 1000x1000 pixel image can hide ~375 KB of data.' }
        ]
    },

    // =====================================================================
    // STREAM_CIPHERS — Stream Ciphers
    // =====================================================================
    STREAM_CIPHERS: {
        key: 'STREAM_CIPHERS',
        title: 'Stream Ciphers',
        icon: '🌊',
        color: '#a855f7',
        description: 'Encrypt data one bit (or byte) at a time by XORing with a keystream. Fast, lightweight, and essential for real-time communication — from RC4 to ChaCha20.',
        overview: {
            concepts: ['Keystream', 'XOR Encryption', 'RC4', 'ChaCha20', 'Synchronous', 'Self-Synchronizing', 'Nonce', 'One-Time Pad'],
            explanation: `
                <p>Stream ciphers generate a pseudo-random <strong>keystream</strong> from the key and XOR it with the plaintext, one bit or byte at a time. Think of it like a one-time pad, but the pad is generated algorithmically.</p>
                <h4>Stream vs Block Ciphers</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Block Cipher</div>
                        <div class="crypto-compare-detail">Processes fixed-size blocks (128 bits for AES)</div>
                        <div class="crypto-compare-note">Needs padding, mode of operation</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Stream Cipher</div>
                        <div class="crypto-compare-detail">Processes one bit/byte at a time</div>
                        <div class="crypto-compare-note good">No padding needed, low latency, lightweight</div>
                    </div>
                </div>
                <h4>Notable Stream Ciphers</h4>
                <ul>
                    <li><strong>RC4:</strong> Once the most widely used stream cipher (WEP, early TLS). Now BROKEN — multiple biases discovered</li>
                    <li><strong>ChaCha20:</strong> Designed by Daniel Bernstein. Fast in software, used in TLS 1.3 (ChaCha20-Poly1305), WireGuard VPN, and mobile devices</li>
                    <li><strong>Salsa20:</strong> ChaCha20's predecessor, also by Bernstein</li>
                    <li><strong>A5/1:</strong> Used in GSM cellular — broken, enabling cell phone eavesdropping</li>
                </ul>
            `,
            diagram: 'stream-cipher'
        },
        howItWorks: {
            steps: [
                { title: 'Initialize with Key + Nonce', description: 'The stream cipher takes a secret key and a nonce (number used once) as input. The nonce ensures the same key produces different keystreams for different messages.', detail: 'ChaCha20 uses a 256-bit key, a 96-bit nonce, and a 32-bit counter. This state is expanded into a keystream through 20 rounds of quarter-round operations.' },
                { title: 'Generate Keystream', description: 'The cipher produces a pseudo-random stream of bits using the key and nonce. This keystream looks random to anyone without the key.', detail: 'A good keystream is indistinguishable from true randomness (without the key). This is the definition of a secure pseudo-random generator.' },
                { title: 'XOR with Plaintext', description: 'Each bit of plaintext is XORed with the corresponding keystream bit: ciphertext = plaintext XOR keystream. XOR is its own inverse — the same operation encrypts and decrypts.', detail: 'XOR truth table: 0^0=0, 0^1=1, 1^0=1, 1^1=0. Applying XOR twice returns the original: (P XOR K) XOR K = P.' },
                { title: 'Decrypt (Same Operation)', description: 'Decryption uses the exact same process: generate the same keystream (same key + nonce) and XOR with the ciphertext to recover the plaintext.', detail: 'This symmetry makes stream ciphers very simple to implement. The same code encrypts and decrypts.' },
                { title: 'The Nonce Rule', description: 'NEVER reuse a nonce with the same key. If two messages use the same keystream, XORing the two ciphertexts cancels the keystream, revealing plaintext information.', detail: 'If C1 = P1 XOR K and C2 = P2 XOR K, then C1 XOR C2 = P1 XOR P2 — the XOR of the two plaintexts, which is easily exploitable.' },
                { title: 'Authentication (AEAD)', description: 'Stream ciphers alone provide no integrity protection. ChaCha20 is paired with Poly1305 (a MAC) to create ChaCha20-Poly1305, an AEAD cipher that provides both encryption and authentication.', detail: 'ChaCha20-Poly1305 is one of only three AEAD ciphers allowed in TLS 1.3, alongside AES-128-GCM and AES-256-GCM.' }
            ]
        },
        interactive: {
            type: 'stream-cipher-xor',
            instructions: 'See stream cipher encryption in action. Enter plaintext to XOR with a generated keystream. Toggle individual keystream bits to see how the ciphertext changes.',
            placeholder: 'Enter text to encrypt...'
        },
        quiz: [
            { question: 'How does a stream cipher encrypt data?', options: ['Substitution tables', 'XOR plaintext with a pseudo-random keystream', 'Block permutation', 'Matrix multiplication'], correct: 1, explanation: 'Stream ciphers generate a pseudo-random keystream from the key and XOR it with the plaintext. Each plaintext bit is encrypted independently with the corresponding keystream bit.' },
            { question: 'What happens if you reuse a nonce with the same stream cipher key?', options: ['Nothing — nonces are just labels', 'Same keystream is generated — XOR of two ciphertexts reveals plaintext XOR', 'The cipher crashes', 'The key is revealed'], correct: 1, explanation: 'Nonce reuse produces the same keystream. An attacker can XOR two ciphertexts to get P1 XOR P2, which reveals information about both plaintexts. This is called a "two-time pad" and is catastrophic.' },
            { question: 'Which stream cipher is used in TLS 1.3 alongside AES-GCM?', options: ['RC4', 'A5/1', 'ChaCha20-Poly1305', 'Salsa20'], correct: 2, explanation: 'ChaCha20-Poly1305 is one of the three cipher suites allowed in TLS 1.3. It is especially useful on mobile devices without AES hardware acceleration (AES-NI), where ChaCha20 is faster.' },
            { question: 'Why was RC4 removed from TLS?', options: ['It was too slow', 'Multiple biases were discovered in its keystream output', 'It was patent-encumbered', 'It did not support long keys'], correct: 1, explanation: 'RC4 has multiple statistical biases — certain byte positions in the keystream are not uniformly random. These biases allow plaintext recovery with enough captured ciphertexts (e.g., the Royal Holloway attack).' },
            { question: 'What is the theoretical "perfect" stream cipher?', options: ['AES-CTR', 'One-time pad', 'RC4', 'ChaCha20'], correct: 1, explanation: 'The one-time pad uses a truly random key as long as the message, XORed with plaintext. It is provably unbreakable (information-theoretically secure), but impractical because the key must be as long as the message and never reused.' },
            { question: 'How is ChaCha20 related to AES-CTR?', options: ['They are the same algorithm', 'Both are AEAD ciphers', 'Both generate keystreams, but ChaCha20 is a native stream cipher while AES-CTR is a block cipher in counter mode', 'ChaCha20 is a mode of AES'], correct: 2, explanation: 'AES-CTR turns the AES block cipher into a stream cipher by encrypting counter values. ChaCha20 is a purpose-built stream cipher — it natively generates a keystream without an underlying block cipher.' }
        ]
    },

    // =====================================================================
    // SYMMETRIC_VS_ASYMMETRIC — Symmetric vs Asymmetric Encryption
    // =====================================================================
    SYMMETRIC_VS_ASYMMETRIC: {
        key: 'SYMMETRIC_VS_ASYMMETRIC',
        title: 'Symmetric vs Asymmetric Encryption',
        icon: '⚖️',
        color: '#a855f7',
        description: 'One key or two? The fundamental division in cryptography — symmetric (shared secret) vs asymmetric (public/private key pair) — and why real systems use both.',
        overview: {
            concepts: ['Symmetric Encryption', 'Asymmetric Encryption', 'Hybrid Encryption', 'Key Distribution', 'Performance', 'AES', 'RSA', 'Elliptic Curves'],
            explanation: `
                <p>All encryption falls into two categories based on how keys are used:</p>
                <h4>Head-to-Head Comparison</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Symmetric</div>
                        <div class="crypto-compare-detail">Same key encrypts and decrypts</div>
                        <div class="crypto-compare-note good">Fast (1000x faster), used for bulk data</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Asymmetric</div>
                        <div class="crypto-compare-detail">Public key encrypts, private key decrypts (or vice versa for signing)</div>
                        <div class="crypto-compare-note">Slow but solves key distribution</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Hybrid (Real World)</div>
                        <div class="crypto-compare-detail">Asymmetric exchanges a symmetric key, symmetric encrypts the data</div>
                        <div class="crypto-compare-note good">Best of both — used in TLS, PGP, S/MIME</div>
                    </div>
                </div>
                <h4>Key Characteristics</h4>
                <table style="width:100%;border-collapse:collapse;margin-top:.5rem">
                    <tr style="border-bottom:1px solid rgba(255,255,255,.1)">
                        <td style="padding:.4rem;color:#94a3b8;font-size:.82rem"></td>
                        <td style="padding:.4rem;color:#a855f7;font-size:.82rem;font-weight:600">Symmetric</td>
                        <td style="padding:.4rem;color:#a855f7;font-size:.82rem;font-weight:600">Asymmetric</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,.06)">
                        <td style="padding:.4rem;color:#94a3b8;font-size:.82rem">Speed</td>
                        <td style="padding:.4rem;font-size:.82rem;color:#22c55e">Very fast</td>
                        <td style="padding:.4rem;font-size:.82rem;color:#ef4444">1000x slower</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,.06)">
                        <td style="padding:.4rem;color:#94a3b8;font-size:.82rem">Key Size</td>
                        <td style="padding:.4rem;font-size:.82rem">128-256 bits</td>
                        <td style="padding:.4rem;font-size:.82rem">2048-4096 bits (RSA)</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,.06)">
                        <td style="padding:.4rem;color:#94a3b8;font-size:.82rem">Key Distribution</td>
                        <td style="padding:.4rem;font-size:.82rem;color:#ef4444">Hard (must share key securely)</td>
                        <td style="padding:.4rem;font-size:.82rem;color:#22c55e">Easy (public key is public)</td>
                    </tr>
                    <tr>
                        <td style="padding:.4rem;color:#94a3b8;font-size:.82rem">Examples</td>
                        <td style="padding:.4rem;font-size:.82rem">AES, ChaCha20</td>
                        <td style="padding:.4rem;font-size:.82rem">RSA, ECDSA, Ed25519</td>
                    </tr>
                </table>
            `,
            diagram: 'symmetric-vs-asymmetric'
        },
        howItWorks: {
            steps: [
                { title: 'Symmetric: Shared Secret', description: 'Both parties use the same key to encrypt and decrypt. Like a combination lock — both people need the same combination.', detail: 'The challenge: how do you share the key securely? If you meet in person, great. But over the internet, you need asymmetric crypto to bootstrap the symmetric key.' },
                { title: 'Asymmetric: Key Pairs', description: 'Each party generates a key pair: a public key (shared freely) and a private key (kept secret). Data encrypted with one key can only be decrypted with the other.', detail: 'Encryption: encrypt with public key, decrypt with private key. Signing: sign with private key, verify with public key. These are inverse operations.' },
                { title: 'Why Symmetric Is Faster', description: 'Symmetric ciphers use simple operations (XOR, substitution, permutation). Asymmetric ciphers use computationally expensive math (modular exponentiation, elliptic curve point multiplication).', detail: 'AES can encrypt at 3+ GB/s with hardware acceleration. RSA-2048 encryption is limited to ~3,000 operations per second. That is a million-fold difference.' },
                { title: 'The Hybrid Approach', description: 'Real protocols use both: asymmetric crypto exchanges a session key, then symmetric crypto encrypts all the actual data. This is how TLS, PGP, and Signal work.', detail: 'In TLS 1.3: ECDHE (asymmetric) establishes a shared secret → HKDF derives symmetric keys → AES-GCM or ChaCha20-Poly1305 (symmetric) encrypts all data.' },
                { title: 'Key Management', description: 'Symmetric: N parties need N*(N-1)/2 keys. Asymmetric: N parties need only N key pairs. This is why asymmetric crypto is essential for the internet.', detail: 'For 1 billion internet users with symmetric-only crypto, you would need ~5 x 10^17 unique keys. With asymmetric, each user just needs one key pair.' },
                { title: 'Post-Quantum Considerations', description: 'Quantum computers threaten asymmetric algorithms (RSA, ECDSA) via Shor\'s algorithm. Symmetric algorithms (AES) are only weakened (Grover\'s algorithm halves the effective key size — AES-256 becomes 128-bit equivalent).', detail: 'Response: double symmetric key sizes (AES-256 is already safe) and replace asymmetric algorithms with post-quantum alternatives (ML-KEM, ML-DSA).' }
            ]
        },
        interactive: {
            type: 'symmetric-asymmetric-compare',
            instructions: 'Compare symmetric and asymmetric encryption side by side. Encrypt a message with each type and see the speed difference and key management implications.',
            placeholder: 'Type a message to encrypt...'
        },
        quiz: [
            { question: 'How many keys does symmetric encryption use?', options: ['One (shared between parties)', 'Two (public and private)', 'Three (encrypt, decrypt, sign)', 'None (uses passwords)'], correct: 0, explanation: 'Symmetric encryption uses a single shared key for both encryption and decryption. Both parties must know the same key — this is the key distribution challenge.' },
            { question: 'Roughly how much faster is AES than RSA for bulk encryption?', options: ['2x', '10x', '100x', '1000x or more'], correct: 3, explanation: 'AES with hardware acceleration (AES-NI) is approximately 1000x faster than RSA. This is why TLS uses RSA/ECDHE only for key exchange and AES for actual data encryption.' },
            { question: 'What is hybrid encryption?', options: ['Using two symmetric algorithms', 'Using asymmetric crypto to exchange a symmetric key, then symmetric crypto for data', 'Combining encryption with compression', 'Using multiple public keys'], correct: 1, explanation: 'Hybrid encryption uses asymmetric crypto (slow but easy key distribution) to establish a symmetric session key, then uses symmetric crypto (fast) to encrypt the actual data. This is how TLS, PGP, and virtually all real-world encryption works.' },
            { question: 'Why can\'t we use asymmetric encryption for everything?', options: ['It is not secure enough', 'It is too slow for bulk data encryption', 'It only works for small messages', 'Both B and C are correct'], correct: 3, explanation: 'Asymmetric encryption is ~1000x slower than symmetric, making it impractical for large data. Additionally, RSA can only encrypt messages shorter than the key size (< 256 bytes for RSA-2048).' },
            { question: 'For 1000 people to communicate pairwise with symmetric keys, how many keys are needed?', options: ['1,000', '2,000', '499,500', '1,000,000'], correct: 2, explanation: 'N*(N-1)/2 = 1000*999/2 = 499,500 unique symmetric keys. With asymmetric crypto, only 1,000 key pairs are needed. This scaling problem is why asymmetric crypto was invented.' },
            { question: 'What does Grover\'s algorithm (quantum) do to AES?', options: ['Breaks it completely', 'Halves the effective key strength', 'Has no effect', 'Doubles the key requirement'], correct: 1, explanation: 'Grover\'s algorithm provides a quadratic speedup for brute-force searches, effectively halving the key strength. AES-256 becomes ~128-bit strength — still secure. AES-128 would drop to ~64-bit — potentially vulnerable. Response: use AES-256.' }
        ]
    },

    // =====================================================================
    // BLOCKCHAIN — Blockchain Technology
    // =====================================================================
    BLOCKCHAIN: {
        key: 'BLOCKCHAIN',
        title: 'Blockchain Technology',
        icon: '⛓️',
        color: '#a855f7',
        description: 'A distributed, immutable ledger that solves the money transfer problem without a trusted middleman. The cryptographic backbone of cryptocurrency, smart contracts, and decentralized trust.',
        overview: {
            concepts: ['Distributed Ledger', 'Immutability', 'Block Structure', 'Hashing Chains', 'Mining', 'Proof of Work', 'Consensus', 'Smart Contracts'],
            explanation: `
                <p>Blockchain technology emerged to solve the <strong>money transfer problem</strong> — how do you transfer value between two parties without a trusted intermediary (bank, PayPal, government)? The answer: a shared ledger that everyone can verify but no one can tamper with.</p>
                <h4>The Money Transfer Problem</h4>
                <p>Traditional transfers require trust in a central authority. If Alice sends Bob $100, a bank verifies Alice has funds, deducts from her account, and credits Bob's. But what if there is no bank? How do you prevent Alice from spending the same $100 twice (double-spending)?</p>
                <h4>Open / Distributed Ledger</h4>
                <p>A blockchain is a <strong>distributed ledger</strong> — a record of all transactions shared across thousands of nodes. No single entity controls it. Every participant has a complete copy, and the network collectively validates new entries.</p>
                <h4>Block Structure</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Block Hash</div>
                        <div class="crypto-compare-detail">SHA-256 fingerprint of the entire block</div>
                        <div class="crypto-compare-note">Changes if ANY data in the block is modified</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Transaction Data</div>
                        <div class="crypto-compare-detail">The actual records (sender, receiver, amount)</div>
                        <div class="crypto-compare-note">Grouped into a Merkle tree for efficient verification</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Previous Block Hash</div>
                        <div class="crypto-compare-detail">Hash of the preceding block in the chain</div>
                        <div class="crypto-compare-note good">This link creates the immutable chain — altering one block invalidates all subsequent blocks</div>
                    </div>
                </div>
                <h4>Practical Applications</h4>
                <ul>
                    <li><strong>Cryptocurrency:</strong> Bitcoin, Ethereum — decentralized digital money with no central bank</li>
                    <li><strong>Smart Contracts:</strong> Self-executing code on the blockchain (Ethereum, Solana) — "if condition X, then automatically do Y"</li>
                    <li><strong>Healthcare:</strong> Immutable patient records, drug supply chain tracking, clinical trial transparency</li>
                    <li><strong>Elections:</strong> Tamper-evident voting systems where every vote is verifiable without revealing the voter</li>
                    <li><strong>Supply Chain:</strong> Track goods from manufacturer to consumer — verify authenticity, prevent counterfeiting</li>
                </ul>
                <h4>Pros and Cons</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Pros</div>
                        <div class="crypto-compare-detail">Decentralized, immutable, transparent, trustless</div>
                        <div class="crypto-compare-note good">No single point of failure or control</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Cons</div>
                        <div class="crypto-compare-detail">Slow throughput, high energy cost (PoW), scalability limits</div>
                        <div class="crypto-compare-note warn">Bitcoin: ~7 tx/sec vs Visa: ~65,000 tx/sec</div>
                    </div>
                </div>
            `,
            diagram: 'blockchain-structure'
        },
        howItWorks: {
            steps: [
                { title: 'Transaction Creation', description: 'Alice wants to send Bob 1 BTC. She creates a transaction signed with her private key (digital signature). This proves she authorized the transfer without revealing her private key.', detail: 'The transaction includes Alice\'s public address, Bob\'s public address, the amount, and a timestamp. The digital signature makes it unforgeable.' },
                { title: 'Broadcast to Network', description: 'The signed transaction is broadcast to the peer-to-peer network. Nodes validate the signature and check that Alice has sufficient funds by examining the ledger history.', detail: 'Nodes independently verify: (1) valid signature, (2) sufficient balance, (3) no double-spending. Invalid transactions are rejected.' },
                { title: 'Transaction Pool (Mempool)', description: 'Valid transactions wait in a pool (mempool) until a miner selects them for inclusion in the next block. Miners typically prioritize transactions with higher fees.', detail: 'The mempool is where unconfirmed transactions live. During high traffic, the mempool grows and fees increase as users compete for block space.' },
                { title: 'Mining — Proof of Work', description: 'Miners compete to solve a computational puzzle: find a nonce value such that SHA-256(block header + nonce) starts with a required number of leading zeros. This requires trillions of guesses.', detail: 'The difficulty adjusts every 2,016 blocks (~2 weeks) to maintain a ~10 minute block time. More miners = higher difficulty. This is why Bitcoin mining consumes enormous energy.' },
                { title: 'Block Added to Chain', description: 'The winning miner broadcasts the new block. Other nodes verify the proof of work, validate all transactions, and add the block to their copy of the chain. The miner receives the block reward + fees.', detail: 'Each block contains: block hash, previous block hash, timestamp, nonce, Merkle root of transactions. The previous hash is what chains the blocks together.' },
                { title: 'Immutability Through Chaining', description: 'To alter a past transaction, an attacker would need to re-mine that block AND every subsequent block faster than the rest of the network combined. This is computationally infeasible.', detail: 'A transaction is considered "confirmed" after ~6 blocks (~1 hour). The deeper a block is in the chain, the more computationally expensive it is to alter — this is the source of blockchain immutability.' }
            ]
        },
        interactive: {
            type: 'blockchain-builder',
            instructions: 'Build a simple blockchain. Add transactions to blocks, watch the hashes chain together, then try tampering with a past block to see how it breaks the chain.',
            placeholder: 'Enter a transaction (e.g., "Alice pays Bob 5 BTC")...'
        },
        quiz: [
            { question: 'What problem does blockchain technology fundamentally solve?', options: ['Faster internet speeds', 'Trustless value transfer without a central authority', 'Data compression', 'Password management'], correct: 1, explanation: 'Blockchain solves the money transfer (double-spending) problem — how to transfer value between parties without needing a trusted intermediary like a bank. The distributed ledger and consensus mechanism replace centralized trust.' },
            { question: 'What links blocks together in a blockchain?', options: ['A central database index', 'Each block contains the hash of the previous block', 'Timestamps only', 'Block numbers'], correct: 1, explanation: 'Each block includes the SHA-256 hash of the previous block. This creates a chain — if you modify any data in a past block, its hash changes, which invalidates every block after it.' },
            { question: 'What is Proof of Work?', options: ['A legal document proving ownership', 'A computational puzzle miners solve to add blocks to the chain', 'A user authentication method', 'A type of encryption'], correct: 1, explanation: 'Proof of Work requires miners to find a nonce that produces a block hash meeting a difficulty target (leading zeros). This requires massive computational effort, making it prohibitively expensive to tamper with the chain.' },
            { question: 'Why is blockchain considered immutable?', options: ['Files are saved as read-only', 'Altering one block invalidates all subsequent blocks, requiring re-mining the entire chain', 'Blocks are encrypted with AES-256', 'Government regulations prevent changes'], correct: 1, explanation: 'Because each block\'s hash depends on the previous block\'s hash, changing any historical block requires re-computing every subsequent block\'s proof of work — faster than the rest of the network combined. This is computationally infeasible.' },
            { question: 'What is a smart contract?', options: ['A legally binding digital agreement', 'Self-executing code stored on the blockchain that runs when conditions are met', 'A virus that runs on blockchain networks', 'An encrypted email contract'], correct: 1, explanation: 'Smart contracts are programs stored on the blockchain (e.g., Ethereum) that automatically execute when predefined conditions are met — "if X happens, then do Y." They enable decentralized applications (dApps) without middlemen.' }
        ]
    },

    // =====================================================================
    // XOR_ENCRYPTION — XOR Encryption & Data Formatting
    // =====================================================================
    XOR_ENCRYPTION: {
        key: 'XOR_ENCRYPTION',
        title: 'XOR Encryption & Data Formatting',
        icon: '⊕',
        color: '#a855f7',
        description: 'The simplest encryption operation — XOR. Understand how ASCII encoding, binary logic gates, and the reversibility property of XOR form the basis of every modern stream cipher.',
        overview: {
            concepts: ['ASCII Encoding', 'XOR Gate', 'Truth Table', 'Streaming Cipher', 'Reversibility', 'Binary / Decimal / Hex', 'One-Time Pad', 'Data Format Conversion'],
            explanation: `
                <p>XOR (Exclusive OR) is the <strong>fundamental building block</strong> of nearly all encryption. AES uses it. ChaCha20 uses it. The one-time pad — the only provably unbreakable cipher — is pure XOR. Understanding XOR is understanding encryption at its core.</p>
                <h4>ASCII Character Encoding</h4>
                <p>Before we can XOR text, we need to represent characters as numbers. ASCII (American Standard Code for Information Interchange) maps characters to 7-bit values:</p>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">A = 65</div>
                        <div class="crypto-compare-detail">Binary: 01000001 | Hex: 0x41</div>
                        <div class="crypto-compare-note">Uppercase letters: 65-90</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">a = 97</div>
                        <div class="crypto-compare-detail">Binary: 01100001 | Hex: 0x61</div>
                        <div class="crypto-compare-note">Lowercase letters: 97-122</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">0 = 48</div>
                        <div class="crypto-compare-detail">Binary: 00110000 | Hex: 0x30</div>
                        <div class="crypto-compare-note">Digit characters: 48-57</div>
                    </div>
                </div>
                <h4>XOR Gate Logic</h4>
                <p>XOR outputs 1 when the inputs <em>differ</em>, and 0 when they are the <em>same</em>:</p>
                <table style="width:100%;max-width:300px;border-collapse:collapse;margin-top:.5rem">
                    <tr style="border-bottom:1px solid rgba(255,255,255,.1)">
                        <td style="padding:.4rem;color:#a855f7;font-size:.82rem;font-weight:600">A</td>
                        <td style="padding:.4rem;color:#a855f7;font-size:.82rem;font-weight:600">B</td>
                        <td style="padding:.4rem;color:#a855f7;font-size:.82rem;font-weight:600">A XOR B</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,.06)">
                        <td style="padding:.4rem;font-size:.82rem">0</td>
                        <td style="padding:.4rem;font-size:.82rem">0</td>
                        <td style="padding:.4rem;font-size:.82rem;color:#22c55e">0</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,.06)">
                        <td style="padding:.4rem;font-size:.82rem">0</td>
                        <td style="padding:.4rem;font-size:.82rem">1</td>
                        <td style="padding:.4rem;font-size:.82rem;color:#22c55e">1</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,.06)">
                        <td style="padding:.4rem;font-size:.82rem">1</td>
                        <td style="padding:.4rem;font-size:.82rem">0</td>
                        <td style="padding:.4rem;font-size:.82rem;color:#22c55e">1</td>
                    </tr>
                    <tr>
                        <td style="padding:.4rem;font-size:.82rem">1</td>
                        <td style="padding:.4rem;font-size:.82rem">1</td>
                        <td style="padding:.4rem;font-size:.82rem;color:#22c55e">0</td>
                    </tr>
                </table>
                <h4>The Magic Property: Reversibility</h4>
                <p>XOR is its own inverse: <code>(P XOR K) XOR K = P</code>. Encrypt with a key, XOR with the same key again, and you get the original data back. This is why the same operation encrypts and decrypts.</p>
            `,
            diagram: 'xor-operation'
        },
        howItWorks: {
            steps: [
                { title: 'Convert to Binary', description: 'Convert each character of the plaintext to its ASCII binary representation. For example, "Hi" becomes: H = 01001000, i = 01101001.', detail: 'ASCII uses 7 bits (0-127) but is typically stored in 8-bit bytes. Extended ASCII and UTF-8 use 8+ bits for additional characters.' },
                { title: 'Choose a Key', description: 'Select a key byte (or stream of key bytes). For a simple XOR cipher, the key repeats across the message. For a one-time pad, the key is as long as the message and truly random.', detail: 'A single-byte XOR key has only 256 possibilities — trivially broken by brute force. Real stream ciphers (ChaCha20) use CSPRNG-generated keystreams of the full message length.' },
                { title: 'XOR Each Byte', description: 'XOR each plaintext byte with the corresponding key byte, bit by bit. Example: H (01001000) XOR key 0x2A (00101010) = 01100010 = b.', detail: 'The XOR streaming cipher processes one byte at a time — there is no block size, no padding, and no mode of operation needed.' },
                { title: 'Format the Output', description: 'The ciphertext bytes can be represented in multiple formats: binary (01100010), decimal (98), hexadecimal (0x62), or even ASCII if the result is a printable character.', detail: 'Hex is the most common representation for ciphertext because every byte maps to exactly 2 hex digits, making it compact and unambiguous.' },
                { title: 'Decrypt — XOR Again', description: 'To decrypt, XOR the ciphertext with the same key. Because XOR is self-inverse, (P XOR K) XOR K = P. The exact same function encrypts and decrypts.', detail: 'Full walkthrough: plaintext "H" = 0x48, key = 0x2A → 0x48 XOR 0x2A = 0x62 (ciphertext). Decrypt: 0x62 XOR 0x2A = 0x48 = "H". The original is restored.' },
                { title: 'Connection to Modern Ciphers', description: 'Every stream cipher (ChaCha20, AES-CTR, RC4) is fundamentally a XOR cipher — the only difference is HOW the keystream is generated. XOR is the encryption; the algorithm is the key schedule.', detail: 'The one-time pad proves that XOR with a truly random, never-reused key is information-theoretically secure — unbreakable by any computational power. The challenge is generating and distributing that key.' }
            ]
        },
        interactive: {
            type: 'xor-calculator',
            instructions: 'Enter plaintext and a key to see XOR encryption in action. Watch the binary XOR operation bit by bit, and convert between ASCII, decimal, hex, and binary representations.',
            placeholder: 'Type a message to XOR encrypt...'
        },
        quiz: [
            { question: 'What is the ASCII decimal value of the character "A"?', options: ['41', '65', '97', '01000001'], correct: 1, explanation: 'The character "A" has ASCII decimal value 65 (hex 0x41, binary 01000001). Lowercase "a" is 97 (0x61). The 32-difference between upper and lowercase is a single bit flip.' },
            { question: 'What is 1 XOR 1?', options: ['0', '1', '2', '11'], correct: 0, explanation: 'XOR outputs 1 only when inputs differ. 1 XOR 1 = 0 (same inputs). 1 XOR 0 = 1 (different inputs). This "same = 0, different = 1" property is what makes XOR useful for encryption.' },
            { question: 'What property makes XOR ideal for encryption?', options: ['It is very slow to compute', 'It is self-inverse: (A XOR B) XOR B = A', 'It produces larger output than input', 'It is a one-way function'], correct: 1, explanation: 'XOR is self-inverse — applying the same key twice returns the original data. This means the same operation (XOR with key) both encrypts and decrypts, making implementation simple and efficient.' },
            { question: 'If you XOR the byte 01001000 (H) with key 11111111, what do you get?', options: ['00000000', '01001000', '10110111', '11111111'], correct: 2, explanation: 'XORing with 11111111 flips every bit: 01001000 becomes 10110111. This is the bitwise complement. XOR with all-ones is equivalent to NOT.' },
            { question: 'Why is a single-byte XOR key considered insecure?', options: ['It is too slow', 'Only 256 possible keys — trivially brute-forced', 'It only works with ASCII text', 'It does not produce binary output'], correct: 1, explanation: 'A single byte has only 256 possible values (0x00-0xFF). An attacker can try all 256 keys in microseconds. Additionally, frequency analysis works because each plaintext byte maps consistently to the same ciphertext byte.' }
        ]
    },

    // =====================================================================
    // PRIME_FACTORIZATION — Factoring & Prime Numbers for Cryptography
    // =====================================================================
    PRIME_FACTORIZATION: {
        key: 'PRIME_FACTORIZATION',
        title: 'Factoring & Prime Numbers for Cryptography',
        icon: '🔢',
        color: '#a855f7',
        description: 'Prime numbers are the atoms of mathematics — and the foundation of RSA encryption. Understand factoring, prime factorization, and Euler\'s Totient function (Phi) that makes public-key cryptography work.',
        overview: {
            concepts: ['Factors', 'Prime Numbers', 'Composite Numbers', 'Prime Factorization', 'Factor Tree', 'Division Method', 'Euler\'s Totient (Phi)', 'RSA Key Generation'],
            explanation: `
                <p>Every integer greater than 1 is either <strong>prime</strong> (divisible only by 1 and itself) or <strong>composite</strong> (can be broken into smaller factors). This simple mathematical fact is the foundation of RSA — the most widely deployed public-key cryptosystem.</p>
                <h4>What Are Factors?</h4>
                <p>Factors of a number N are integers that divide N evenly. For example, factors of 12 are: 1, 2, 3, 4, 6, 12. Factors of 7 are: 1, 7 (only — making 7 prime).</p>
                <h4>Prime vs Composite</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Prime</div>
                        <div class="crypto-compare-detail">Exactly 2 factors: 1 and itself</div>
                        <div class="crypto-compare-note">2, 3, 5, 7, 11, 13, 17, 19, 23, 29...</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Composite</div>
                        <div class="crypto-compare-detail">More than 2 factors — can be decomposed</div>
                        <div class="crypto-compare-note">4, 6, 8, 9, 10, 12, 14, 15, 16...</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Special: 1</div>
                        <div class="crypto-compare-detail">Neither prime nor composite</div>
                        <div class="crypto-compare-note">By convention, 1 is excluded from primes</div>
                    </div>
                </div>
                <h4>Prime Factorization Methods</h4>
                <ul>
                    <li><strong>Factor Tree:</strong> Repeatedly split a number into two factors until all leaves are prime. Example: 60 → 2 x 30 → 2 x 2 x 15 → 2 x 2 x 3 x 5</li>
                    <li><strong>Division Method:</strong> Divide by the smallest prime (2, 3, 5, 7...) repeatedly. 60 ÷ 2 = 30, ÷ 2 = 15, ÷ 3 = 5, ÷ 5 = 1. Result: 2² x 3 x 5</li>
                </ul>
                <h4>Euler's Totient Function — phi(n)</h4>
                <p>phi(n) counts how many integers from 1 to n are <strong>coprime</strong> to n (share no common factors). This function is critical to RSA key generation:</p>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">phi(p) for prime p</div>
                        <div class="crypto-compare-detail">phi(p) = p - 1</div>
                        <div class="crypto-compare-note">All integers less than a prime are coprime to it</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">phi(n) for n = p * q</div>
                        <div class="crypto-compare-detail">phi(n) = (p-1)(q-1)</div>
                        <div class="crypto-compare-note good">This is the formula RSA uses — knowing p and q makes phi(n) easy</div>
                    </div>
                </div>
                <h4>Connection to RSA</h4>
                <p>RSA security relies on this asymmetry: multiplying two 1024-bit primes is instant, but factoring the product back into primes is computationally infeasible. If you know p and q, computing phi(n) is trivial. If you only know n = p*q, computing phi(n) requires factoring — which is the hard problem.</p>
                <h4>How Big Are Cryptographic Primes?</h4>
                <p>RSA-2048 uses two primes each approximately 1024 bits (~308 decimal digits). The number of primes below 2^1024 is approximately 2^1024 / (1024 * ln 2) — an astronomically large supply ensuring unique primes for every key ever generated.</p>
            `,
            diagram: 'prime-factorization'
        },
        howItWorks: {
            steps: [
                { title: 'Find the Factors', description: 'To factor a number N, test divisibility starting from the smallest prime (2). If N is divisible, record the factor and divide. Continue until the quotient is 1.', detail: 'You only need to test primes up to sqrt(N). If no prime up to sqrt(N) divides N evenly, then N itself is prime. For N=100, sqrt(100)=10, so test 2, 3, 5, 7.' },
                { title: 'Build the Factor Tree', description: 'Split the number into any two factors, then continue splitting each composite factor until all leaves are prime. Example: 84 → 2 x 42 → 2 x 2 x 21 → 2 x 2 x 3 x 7.', detail: 'The Fundamental Theorem of Arithmetic guarantees that every integer > 1 has a UNIQUE prime factorization (regardless of the order you factor). 84 is always 2² x 3 x 7.' },
                { title: 'Identify Prime Numbers', description: 'A prime number has exactly two factors: 1 and itself. Primality testing for large numbers uses probabilistic tests like Miller-Rabin rather than trial division.', detail: 'The largest known prime (as of 2024) is 2^136,279,841 - 1, a Mersenne prime with over 41 million digits. RSA primes are "only" ~308 digits.' },
                { title: 'Compute Euler\'s Totient', description: 'For any integer n, phi(n) counts integers from 1 to n that are coprime to n. For primes: phi(p) = p-1. For n = p*q where p,q are prime: phi(n) = (p-1)(q-1).', detail: 'Example: phi(15) where 15 = 3 x 5. phi(15) = (3-1)(5-1) = 2 x 4 = 8. The 8 coprime integers are: 1, 2, 4, 7, 8, 11, 13, 14.' },
                { title: 'RSA Key Generation', description: 'Choose two large primes p and q. Compute n = p*q and phi(n) = (p-1)(q-1). Choose public exponent e coprime to phi(n). Compute private exponent d = e^(-1) mod phi(n).', detail: 'The public key is (n, e) and the private key is (n, d). Security: an attacker who knows n but not p and q cannot compute phi(n), and therefore cannot compute d. Factoring n is the hard problem.' },
                { title: 'Why Factoring Is Hard', description: 'Multiplying two 1024-bit primes takes microseconds. Factoring their 2048-bit product with the best known algorithm (General Number Field Sieve) would take billions of years with current computers.', detail: 'This asymmetry (easy to multiply, hard to factor) is called a trapdoor one-way function. Knowing the "trapdoor" (the prime factors) makes the reverse operation easy. This asymmetry is what makes RSA possible.' }
            ]
        },
        interactive: {
            type: 'factor-calculator',
            instructions: 'Enter a number to see its complete prime factorization (factor tree + division method). Then try the Phi calculator to compute Euler\'s Totient for any number and see its connection to RSA.',
            placeholder: 'Enter a number to factorize...'
        },
        quiz: [
            { question: 'What is the prime factorization of 60?', options: ['2 x 30', '4 x 15', '2² x 3 x 5', '2 x 3 x 10'], correct: 2, explanation: '60 = 2 x 2 x 3 x 5 = 2² x 3 x 5. The Fundamental Theorem of Arithmetic guarantees this decomposition is unique. Factor trees may look different, but the prime factors are always the same.' },
            { question: 'What is phi(7) — Euler\'s Totient of the prime number 7?', options: ['1', '6', '7', '8'], correct: 1, explanation: 'For any prime p, phi(p) = p - 1, because every integer from 1 to p-1 is coprime to a prime. phi(7) = 6. The coprime integers are 1, 2, 3, 4, 5, 6.' },
            { question: 'In RSA, what makes computing phi(n) easy for the key owner but hard for an attacker?', options: ['The key owner has a faster computer', 'The key owner knows the prime factors p and q, so phi(n) = (p-1)(q-1)', 'phi(n) is stored in the certificate', 'The key owner uses quantum computing'], correct: 1, explanation: 'The key owner knows p and q, making phi(n) = (p-1)(q-1) trivial. An attacker who only knows n = p*q would need to factor n to find p and q — which is computationally infeasible for large numbers.' },
            { question: 'Why is the number 1 not considered prime?', options: ['It is too small', 'By convention — including 1 would break the uniqueness of prime factorization', 'It is an even number', 'It has too many factors'], correct: 1, explanation: 'If 1 were prime, the Fundamental Theorem of Arithmetic would fail: 6 = 2 x 3 = 1 x 2 x 3 = 1 x 1 x 2 x 3, etc. Excluding 1 preserves unique prime factorization.' },
            { question: 'Approximately how many decimal digits does each prime in RSA-2048 have?', options: ['64 digits', '128 digits', '308 digits', '2048 digits'], correct: 2, explanation: 'RSA-2048 uses a 2048-bit modulus n = p*q. Each prime is approximately 1024 bits, which is about 308 decimal digits. These primes are large enough that factoring their product is infeasible with current technology.' }
        ]
    },

    // =====================================================================
    // CRYPTOGRAPHY_INTRO — Introduction to Cryptography
    // =====================================================================
    CRYPTOGRAPHY_INTRO: {
        key: 'CRYPTOGRAPHY_INTRO',
        title: 'Introduction to Cryptography',
        icon: '🗝️',
        color: '#a855f7',
        description: 'The foundational overview of cryptography — what it is, why it matters, and how its core pillars (symmetric, asymmetric, hashing) protect every digital interaction you have.',
        overview: {
            concepts: ['Confidentiality', 'Integrity', 'Authentication', 'Non-Repudiation', 'Plaintext & Ciphertext', 'Keys & Key Space', 'Symmetric Encryption', 'Asymmetric Encryption', 'Hashing'],
            explanation: `
                <p><strong>Cryptography</strong> is the science of securing communication and data through mathematical transformations. It ensures that information can only be read by intended recipients, has not been tampered with, and can be traced back to its origin.</p>
                <h4>The Four Pillars of Cryptographic Security</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Confidentiality</div>
                        <div class="crypto-compare-detail">Only authorized parties can read the data</div>
                        <div class="crypto-compare-note">Achieved through encryption (symmetric or asymmetric)</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Integrity</div>
                        <div class="crypto-compare-detail">Data has not been altered in transit or storage</div>
                        <div class="crypto-compare-note">Achieved through hashing and MACs</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Authentication</div>
                        <div class="crypto-compare-detail">Verify the identity of communicating parties</div>
                        <div class="crypto-compare-note">Achieved through digital signatures and certificates</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Non-Repudiation</div>
                        <div class="crypto-compare-detail">Sender cannot deny having sent a message</div>
                        <div class="crypto-compare-note">Achieved through digital signatures with PKI</div>
                    </div>
                </div>
                <h4>A Brief History</h4>
                <p>Cryptography has evolved from ancient manual ciphers to modern algorithmic systems:</p>
                <ul>
                    <li><strong>~50 BC — Caesar Cipher:</strong> Simple letter substitution used by Julius Caesar. Each letter shifts by a fixed number. Trivially breakable with only 25 possible keys.</li>
                    <li><strong>1467 — Vigenère Cipher:</strong> Polyalphabetic substitution that resisted frequency analysis for centuries. Called "le chiffre indéchiffrable" until Charles Babbage broke it.</li>
                    <li><strong>1918 — Enigma Machine:</strong> Electromechanical rotor cipher used by Nazi Germany. Cracked by Polish mathematicians and Alan Turing at Bletchley Park — arguably shortening WWII by two years.</li>
                    <li><strong>1977 — DES:</strong> First standardized digital cipher (56-bit key). Broken by brute force in 1999 in under 24 hours by the EFF's "Deep Crack" machine.</li>
                    <li><strong>1977 — RSA:</strong> First practical public-key cryptosystem. Enabled secure communication without pre-shared keys — revolutionary.</li>
                    <li><strong>2001 — AES:</strong> Replaced DES after a 5-year NIST competition. Still the gold standard for symmetric encryption today.</li>
                    <li><strong>2017+ — Post-Quantum:</strong> NIST standardizing lattice-based algorithms (CRYSTALS-Kyber, CRYSTALS-Dilithium) to resist quantum computers.</li>
                </ul>
                <h4>The Three Pillars of Modern Cryptography</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Symmetric Encryption</div>
                        <div class="crypto-compare-detail">Same key encrypts and decrypts (AES, ChaCha20)</div>
                        <div class="crypto-compare-note good">Fast — used for bulk data encryption</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Asymmetric Encryption</div>
                        <div class="crypto-compare-detail">Public key encrypts, private key decrypts (RSA, ECC)</div>
                        <div class="crypto-compare-note">Slow — used for key exchange, signatures, authentication</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Hashing</div>
                        <div class="crypto-compare-detail">One-way function producing fixed-length digest (SHA-256)</div>
                        <div class="crypto-compare-note">No key — used for integrity verification, password storage</div>
                    </div>
                </div>
                <h4>Core Vocabulary</h4>
                <ul>
                    <li><strong>Plaintext:</strong> The original readable data before encryption</li>
                    <li><strong>Ciphertext:</strong> The scrambled output after encryption — unreadable without the key</li>
                    <li><strong>Key:</strong> A secret value that controls the encryption/decryption process</li>
                    <li><strong>Algorithm (Cipher):</strong> The mathematical procedure that transforms plaintext to ciphertext and back</li>
                    <li><strong>Key Space:</strong> The total number of possible keys. AES-128 has a key space of 2^128 (~3.4 x 10^38) — larger than the number of atoms in the Milky Way</li>
                    <li><strong>Kerckhoffs's Principle:</strong> A cryptosystem should be secure even if everything about it is public knowledge, except the key. Security through obscurity is not security.</li>
                </ul>
            `,
            diagram: 'crypto-overview'
        },
        howItWorks: {
            steps: [
                { title: 'Plaintext Input', description: 'The process begins with readable data — a message, file, password, or any digital content that needs protection.', detail: 'Plaintext can be any format: text, binary, images, video. Cryptographic algorithms operate on raw bytes, not on human-readable content specifically.' },
                { title: 'Key Generation', description: 'A cryptographic key is generated using a secure random number generator (CSPRNG). The key length determines the security level — longer keys mean a larger key space to brute-force.', detail: 'True randomness is critical. Weak random number generators (like rand() in C) are the #1 cause of cryptographic failures in real systems. Always use /dev/urandom, CryptGenRandom, or equivalent CSPRNGs.' },
                { title: 'Encryption Algorithm', description: 'The algorithm combines the plaintext with the key through a series of mathematical operations (substitution, permutation, XOR, modular arithmetic) to produce ciphertext.', detail: 'A good cipher ensures that changing even one bit of plaintext or key produces a completely different ciphertext (avalanche effect). Shannon called these properties "confusion" (complex key-ciphertext relationship) and "diffusion" (spreading plaintext influence across ciphertext).' },
                { title: 'Ciphertext Output', description: 'The encrypted output appears as random bytes. A properly encrypted ciphertext is computationally indistinguishable from random noise — no patterns, no structure, no information leakage.', detail: 'Ciphertext is typically encoded as Base64 or hex for transmission. The ciphertext is usually longer than the plaintext due to padding, IV/nonce, and authentication tags.' },
                { title: 'Key Exchange / Distribution', description: 'The recipient needs the key to decrypt. Symmetric encryption faces the "key distribution problem" — how do you securely share the key? Asymmetric encryption solves this: encrypt with the recipient\'s public key.', detail: 'In practice, TLS uses a hybrid approach: asymmetric encryption (RSA or ECDHE) to exchange a symmetric session key, then AES for bulk encryption. This combines the security of asymmetric with the speed of symmetric.' },
                { title: 'Decryption', description: 'The recipient applies the decryption algorithm with the correct key to recover the original plaintext. If the wrong key is used, the output is garbage — not partial recovery, total garbage.', detail: 'Modern authenticated encryption (AES-GCM) also verifies integrity before decryption. If a single bit was altered in transit, decryption fails entirely rather than producing corrupted plaintext. This prevents bit-flipping attacks.' }
            ]
        },
        interactive: {
            type: 'crypto-overview',
            instructions: 'Explore the fundamentals of cryptography. See how plaintext transforms into ciphertext, compare symmetric vs. asymmetric approaches, and understand where each pillar is used in real-world protocols.',
            placeholder: 'Enter a message to see encryption in action...'
        },
        quiz: [
            { question: 'Which cryptographic property ensures that a sender cannot deny having sent a message?', options: ['Confidentiality', 'Integrity', 'Authentication', 'Non-Repudiation'], correct: 3, explanation: 'Non-repudiation prevents the sender from denying they sent a message. It is achieved through digital signatures — the sender\'s private key creates a signature that only their public key can verify, proving authorship.' },
            { question: 'What is Kerckhoffs\'s Principle?', options: ['The algorithm must be kept secret', 'Security should depend only on the secrecy of the key, not the algorithm', 'Longer keys are always more secure', 'All ciphers can eventually be broken'], correct: 1, explanation: 'Kerckhoffs\'s Principle (1883) states that a cryptosystem should be secure even if everything about it is public knowledge, except the key. This is why AES, RSA, and SHA are all published algorithms — their security comes from the key, not from secrecy.' },
            { question: 'Which type of cryptography uses the same key for encryption and decryption?', options: ['Asymmetric encryption', 'Symmetric encryption', 'Hashing', 'Digital signatures'], correct: 1, explanation: 'Symmetric encryption (AES, ChaCha20, 3DES) uses a single shared key for both encryption and decryption. It is fast and efficient for bulk data but requires a secure way to share the key between parties.' },
            { question: 'What major weakness of DES led to its replacement by AES?', options: ['DES was too slow for modern hardware', 'DES had a backdoor inserted by the NSA', 'DES used a 56-bit key, which was brute-forced in under 24 hours', 'DES could only encrypt text, not binary data'], correct: 2, explanation: 'DES\'s fatal flaw was its 56-bit key length. In 1999, the EFF built "Deep Crack" for $250,000 and brute-forced a DES key in 22 hours. AES uses 128/192/256-bit keys, making brute force computationally infeasible.' },
            { question: 'In TLS (HTTPS), why is a hybrid approach used instead of purely asymmetric encryption?', options: ['Asymmetric encryption is not secure enough', 'Asymmetric encryption is too slow for bulk data — it is used only to exchange a symmetric session key', 'Symmetric encryption cannot work over the internet', 'Browsers do not support asymmetric encryption'], correct: 1, explanation: 'RSA encryption is roughly 1000x slower than AES. TLS uses asymmetric encryption (RSA or ECDHE) to securely exchange a symmetric session key, then uses AES for the actual data encryption. This hybrid approach gives the best of both worlds.' },
            { question: 'What does "key space" refer to in cryptography?', options: ['The physical storage required for a key', 'The total number of possible keys for a given algorithm', 'The network bandwidth needed to transmit keys', 'The time required to generate a key'], correct: 1, explanation: 'Key space is the total number of possible keys. AES-128 has 2^128 possible keys (~3.4 x 10^38). A larger key space makes brute-force attacks infeasible. Each additional bit doubles the key space — AES-256 has 2^128 times more keys than AES-128.' }
        ]
    },

    // =====================================================================
    // ENCRYPTION — Encryption & Data Formatting
    // =====================================================================
    ENCRYPTION: {
        key: 'ENCRYPTION',
        title: 'Encryption & Data Formatting',
        icon: '🔐',
        color: '#a855f7',
        description: 'How encryption transforms data across different states and contexts — symmetric vs. asymmetric, data-at-rest vs. data-in-transit, and the critical distinction between encoding, encryption, and hashing.',
        overview: {
            concepts: ['Symmetric vs Asymmetric', 'Encoding vs Encryption vs Hashing', 'Data-at-Rest', 'Data-in-Transit', 'Data-in-Use', 'Key Management Lifecycle', 'Algorithm Selection'],
            explanation: `
                <p><strong>Encryption</strong> is the process of transforming readable data (plaintext) into an unreadable format (ciphertext) using a mathematical algorithm and a key. Unlike encoding (which is reversible without a key) or hashing (which is one-way), encryption is a <strong>two-way process that requires a key</strong> to reverse.</p>
                <h4>Encoding vs. Encryption vs. Hashing</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Encoding</div>
                        <div class="crypto-compare-detail">Transforms data format (Base64, URL encoding, UTF-8)</div>
                        <div class="crypto-compare-note warn">NOT security — no key required, freely reversible</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Encryption</div>
                        <div class="crypto-compare-detail">Transforms data using a key (AES, RSA, ChaCha20)</div>
                        <div class="crypto-compare-note good">Two-way with key — provides confidentiality</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Hashing</div>
                        <div class="crypto-compare-detail">One-way digest (SHA-256, bcrypt, Argon2)</div>
                        <div class="crypto-compare-note">No key, irreversible — provides integrity verification</div>
                    </div>
                </div>
                <h4>Symmetric vs. Asymmetric Encryption</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Symmetric</div>
                        <div class="crypto-compare-detail">One shared key for encrypt + decrypt</div>
                        <div class="crypto-compare-note good">Fast (AES: ~1 GB/s). Problem: key distribution</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Asymmetric</div>
                        <div class="crypto-compare-detail">Public key encrypts, private key decrypts</div>
                        <div class="crypto-compare-note">Slow (~1000x slower). Solves key distribution</div>
                    </div>
                </div>
                <h4>Three States of Data</h4>
                <p>Data exists in three states, each requiring different encryption strategies:</p>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Data-at-Rest</div>
                        <div class="crypto-compare-detail">Stored on disk, database, backup media</div>
                        <div class="crypto-compare-note">AES-256 (BitLocker, FileVault, LUKS), TDE for databases</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Data-in-Transit</div>
                        <div class="crypto-compare-detail">Moving across a network (HTTPS, VPN, email)</div>
                        <div class="crypto-compare-note">TLS 1.3 (AES-GCM + ECDHE), IPSec, WireGuard</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Data-in-Use</div>
                        <div class="crypto-compare-detail">Being processed in memory/CPU</div>
                        <div class="crypto-compare-note">Hardest to protect — Intel SGX, AMD SEV, homomorphic encryption</div>
                    </div>
                </div>
                <h4>Common Encryption Algorithms and Use Cases</h4>
                <ul>
                    <li><strong>AES-256-GCM:</strong> Standard for data-at-rest and TLS 1.3. Authenticated encryption with associated data (AEAD). Government-approved for TOP SECRET.</li>
                    <li><strong>ChaCha20-Poly1305:</strong> Alternative to AES-GCM for environments without hardware AES support (mobile devices). Used by WireGuard and Google's QUIC protocol.</li>
                    <li><strong>RSA-2048/4096:</strong> Key exchange and digital signatures. Being phased out in favor of ECC for performance. Still dominant in X.509 certificates.</li>
                    <li><strong>ECDHE (Elliptic Curve Diffie-Hellman Ephemeral):</strong> Key agreement protocol. Provides perfect forward secrecy — compromising the server's long-term key doesn't reveal past session keys.</li>
                    <li><strong>XChaCha20-Poly1305:</strong> Extended nonce variant for file encryption. Used by tools like age, Secretstream.</li>
                </ul>
                <h4>Key Management Lifecycle</h4>
                <ul>
                    <li><strong>Generation:</strong> Use CSPRNGs (not math.random). Key ceremony for high-value keys (HSMs).</li>
                    <li><strong>Distribution:</strong> Never send keys in plaintext. Use Diffie-Hellman, PKI, or out-of-band channels.</li>
                    <li><strong>Storage:</strong> Hardware Security Modules (HSMs), key vaults (AWS KMS, Azure Key Vault), or encrypted key files.</li>
                    <li><strong>Rotation:</strong> Regular key rotation limits exposure from compromised keys. TLS session keys rotate per-connection.</li>
                    <li><strong>Revocation:</strong> CRLs and OCSP for certificates. Key escrow for recovery scenarios.</li>
                    <li><strong>Destruction:</strong> Crypto-shredding — destroy the key and the data becomes permanently unrecoverable. Used in cloud decommissioning.</li>
                </ul>
            `,
            diagram: 'encryption-states'
        },
        howItWorks: {
            steps: [
                { title: 'Data Classification', description: 'Before encrypting, classify the data by sensitivity level (public, internal, confidential, restricted). The classification determines the required encryption strength and key management rigor.', detail: 'NIST SP 800-53 defines security controls by impact level (Low/Moderate/High). PCI-DSS mandates AES-128+ for cardholder data. HIPAA requires encryption for PHI at rest and in transit. Classification drives algorithm and key length selection.' },
                { title: 'Algorithm Selection', description: 'Choose the appropriate algorithm based on the use case. Symmetric (AES) for bulk data, asymmetric (RSA/ECC) for key exchange, or hybrid for TLS-style protocols.', detail: 'Key selection criteria: (1) Security margin — AES-256 for long-term secrets. (2) Performance — ChaCha20 for mobile, AES-NI for servers. (3) Compliance — FIPS 140-2/3 may mandate specific algorithms. (4) Forward secrecy — use ephemeral keys (ECDHE) when possible.' },
                { title: 'Key Generation', description: 'Generate a cryptographic key using a CSPRNG (Cryptographically Secure Pseudo-Random Number Generator). The key must have sufficient entropy — predictable keys are the most common real-world crypto failure.', detail: 'Key sizes: AES-128 (standard), AES-256 (high-value). RSA minimum 2048-bit (NIST recommends 3072+ through 2031). ECC: P-256 (equivalent to RSA-3072). Never derive keys from passwords directly — use PBKDF2, scrypt, or Argon2.' },
                { title: 'Encryption Process', description: 'The algorithm transforms plaintext into ciphertext block by block (block ciphers) or byte by byte (stream ciphers). An IV or nonce ensures that encrypting the same plaintext twice produces different ciphertext.', detail: 'AES-GCM generates a 128-bit authentication tag alongside the ciphertext, providing authenticated encryption. If any bit of the ciphertext is modified, decryption fails entirely. Never reuse a nonce with the same key — nonce reuse in AES-GCM is catastrophic (reveals the authentication key).' },
                { title: 'Secure Key Storage', description: 'Keys must be stored separately from the data they protect. Hardware Security Modules (HSMs) provide tamper-resistant key storage. Cloud services use managed key vaults with access controls and audit logging.', detail: 'Key hierarchy: Master Key (stored in HSM) → Data Encryption Key (DEK, encrypted by master key) → Encrypted Data. This "envelope encryption" pattern means compromising one DEK only exposes that data segment, not everything.' },
                { title: 'Decryption on Demand', description: 'The authorized recipient retrieves the key and applies the decryption algorithm. Authenticated encryption (GCM, Poly1305) verifies integrity before returning plaintext — preventing attacks that manipulate ciphertext.', detail: 'Decrypt-then-verify (older approach) is vulnerable to padding oracle attacks (BEAST, POODLE). Encrypt-then-MAC or AEAD (encrypt and authenticate simultaneously) is the modern standard. TLS 1.3 only supports AEAD cipher suites.' }
            ]
        },
        interactive: {
            type: 'encryption-compare',
            instructions: 'Compare symmetric and asymmetric encryption side by side. Encrypt data with AES (symmetric) and RSA (asymmetric) to see the differences in speed, output size, and key usage.',
            placeholder: 'Enter data to encrypt with different algorithms...'
        },
        quiz: [
            { question: 'What is the fundamental difference between encoding and encryption?', options: ['Encoding is faster than encryption', 'Encoding requires no key and is freely reversible; encryption requires a key', 'Encryption produces shorter output than encoding', 'Encoding is a newer technology than encryption'], correct: 1, explanation: 'Encoding (Base64, URL encoding) is a data format transformation that requires no secret — anyone can reverse it. Encryption requires a key to reverse. Treating encoding as security (e.g., Base64-encoding passwords) is a critical mistake.' },
            { question: 'Which data state is the hardest to protect with encryption?', options: ['Data-at-rest', 'Data-in-transit', 'Data-in-use', 'Data-in-backup'], correct: 2, explanation: 'Data-in-use must be decrypted in memory for processing, exposing it to memory dumps, cold boot attacks, and side-channel attacks. Technologies like Intel SGX, AMD SEV, and homomorphic encryption address this but add significant complexity and performance overhead.' },
            { question: 'Why is nonce reuse catastrophic in AES-GCM?', options: ['It slows down encryption significantly', 'It reveals the authentication key, allowing forgery of arbitrary messages', 'It causes the algorithm to crash', 'It doubles the ciphertext size'], correct: 1, explanation: 'AES-GCM derives its authentication key from the nonce. Reusing a nonce with the same key allows an attacker to recover the authentication key via XOR of the two authentication tags, enabling them to forge valid ciphertexts.' },
            { question: 'What is "crypto-shredding"?', options: ['A method to strengthen weak encryption', 'Destroying the encryption key to make data permanently unrecoverable', 'Compressing encrypted data', 'Splitting a key among multiple parties'], correct: 1, explanation: 'Crypto-shredding destroys the encryption key rather than the data itself. Since the data is encrypted, destroying the key makes it permanently unrecoverable. This is used for decommissioning cloud resources, device disposal, and GDPR "right to be forgotten" compliance.' },
            { question: 'What does "perfect forward secrecy" provide?', options: ['Encryption that can never be broken', 'Each session uses ephemeral keys — compromising the long-term key does not reveal past sessions', 'Automatic key rotation every hour', 'Encryption of future messages using predicted keys'], correct: 1, explanation: 'Perfect forward secrecy (PFS) uses ephemeral Diffie-Hellman key exchange so each session has a unique key. Even if the server\'s long-term private key is compromised, an attacker cannot decrypt previously recorded traffic. TLS 1.3 mandates PFS via ECDHE.' },
            { question: 'In envelope encryption, what is the role of the master key?', options: ['It directly encrypts all data', 'It encrypts the Data Encryption Keys (DEKs), which in turn encrypt the data', 'It is shared with all users for decryption', 'It replaces the need for key rotation'], correct: 1, explanation: 'Envelope encryption uses a hierarchy: the master key (stored in an HSM) encrypts DEKs, and DEKs encrypt the actual data. This limits exposure — compromising one DEK only affects that data segment, and key rotation only requires re-encrypting the DEK, not all the data.' }
        ]
    },

    // =====================================================================
    // HASHING_WALKTHROUGH — Hashing: Step-by-Step Walkthrough
    // =====================================================================
    HASHING_WALKTHROUGH: {
        key: 'HASHING_WALKTHROUGH',
        title: 'Hashing: Step-by-Step Walkthrough',
        icon: '#️⃣',
        color: '#a855f7',
        description: 'A guided walkthrough of how cryptographic hash functions work — from input to fixed-length output, the avalanche effect, rainbow tables, salting, and modern password hashing best practices.',
        overview: {
            concepts: ['One-Way Function', 'Fixed-Length Output', 'Avalanche Effect', 'Collision Resistance', 'Rainbow Tables', 'Salting', 'bcrypt / scrypt / Argon2', 'MD5 / SHA-1 / SHA-256 / SHA-3'],
            explanation: `
                <p>A <strong>cryptographic hash function</strong> takes input of any length and produces a fixed-length output (digest) that acts as a unique fingerprint of the data. Unlike encryption, hashing is <strong>one-way</strong> — you cannot recover the original input from the hash.</p>
                <h4>Hashing vs. Encryption</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Encryption</div>
                        <div class="crypto-compare-detail">Two-way: encrypt with key, decrypt with key</div>
                        <div class="crypto-compare-note">Purpose: confidentiality — protect data so it can be recovered later</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Hashing</div>
                        <div class="crypto-compare-detail">One-way: input → digest (no reverse operation)</div>
                        <div class="crypto-compare-note good">Purpose: integrity verification, password storage, digital signatures</div>
                    </div>
                </div>
                <h4>Properties of a Secure Hash Function</h4>
                <ul>
                    <li><strong>Deterministic:</strong> Same input always produces the same hash. "hello" will always hash to the same SHA-256 value.</li>
                    <li><strong>Fixed-length output:</strong> Regardless of input size (1 byte or 1 terabyte), SHA-256 always outputs 256 bits (64 hex characters).</li>
                    <li><strong>Avalanche effect:</strong> Changing one bit of input changes approximately 50% of the output bits. "hello" and "hellp" produce completely different hashes.</li>
                    <li><strong>Pre-image resistance:</strong> Given a hash H, it is computationally infeasible to find any input M such that hash(M) = H.</li>
                    <li><strong>Second pre-image resistance:</strong> Given input M1, it is infeasible to find M2 (where M2 ≠ M1) such that hash(M1) = hash(M2).</li>
                    <li><strong>Collision resistance:</strong> It is infeasible to find ANY two different inputs that produce the same hash. SHA-1 lost this property in 2017 (SHAttered attack).</li>
                </ul>
                <h4>Hash Algorithm Comparison</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">MD5</div>
                        <div class="crypto-compare-detail">128-bit output, fast, widely deployed</div>
                        <div class="crypto-compare-note warn">BROKEN — collision attacks since 2004. Never use for security.</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">SHA-1</div>
                        <div class="crypto-compare-detail">160-bit output, successor to MD5</div>
                        <div class="crypto-compare-note warn">BROKEN — Google produced a collision in 2017 (SHAttered). Deprecated everywhere.</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">SHA-256</div>
                        <div class="crypto-compare-detail">256-bit output, part of SHA-2 family</div>
                        <div class="crypto-compare-note good">Current standard. Used in TLS, Bitcoin, code signing, and file integrity.</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">SHA-3 (Keccak)</div>
                        <div class="crypto-compare-detail">Variable output, sponge construction</div>
                        <div class="crypto-compare-note good">Backup standard. Different internal design than SHA-2 (not Merkle-Damgård).</div>
                    </div>
                </div>
                <h4>Rainbow Tables and Why Salting Matters</h4>
                <p>A <strong>rainbow table</strong> is a precomputed lookup table mapping common passwords to their hash values. If passwords are hashed without a salt, an attacker with a rainbow table can reverse millions of hashes instantly.</p>
                <p>A <strong>salt</strong> is a unique random value prepended to each password before hashing. Even if two users have the same password, their salts differ, producing different hashes. This forces attackers to crack each hash individually.</p>
                <h4>Password Hashing Best Practices</h4>
                <div class="crypto-comparison">
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">bcrypt</div>
                        <div class="crypto-compare-detail">Adaptive cost factor, built-in salt, 60-char output</div>
                        <div class="crypto-compare-note good">Battle-tested since 1999. Default for most web frameworks.</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">scrypt</div>
                        <div class="crypto-compare-detail">Memory-hard: CPU + RAM intensive</div>
                        <div class="crypto-compare-note good">Resists GPU/ASIC attacks. Used in cryptocurrency mining (Litecoin).</div>
                    </div>
                    <div class="crypto-compare-item">
                        <div class="crypto-compare-label">Argon2</div>
                        <div class="crypto-compare-detail">Winner of 2015 Password Hashing Competition</div>
                        <div class="crypto-compare-note good">State of the art. Configurable: time, memory, parallelism. Recommended by OWASP.</div>
                    </div>
                </div>
            `,
            diagram: 'hash-walkthrough'
        },
        howItWorks: {
            steps: [
                { title: 'Input of Any Length', description: 'The hash function accepts an input message of arbitrary length — from a single character to an entire database. The output size is always fixed regardless of input size.', detail: 'SHA-256 processes input in 512-bit (64-byte) blocks. A 1-byte input and a 1-TB input both produce a 256-bit (32-byte) hash. This compression is fundamental — it means collisions must theoretically exist (pigeonhole principle), but finding them should be computationally infeasible.' },
                { title: 'Padding to Block Size', description: 'The input is padded to a multiple of the block size (512 bits for SHA-256). Padding appends a "1" bit, then zeros, then the original message length as a 64-bit integer.', detail: 'Merkle-Damgård padding (used by MD5, SHA-1, SHA-2): append bit "1", then zeros until 448 mod 512, then the 64-bit message length. This length-encoding prevents length extension attacks in the padding itself (though the construction is still vulnerable to them without HMAC).' },
                { title: 'Initial Hash Values', description: 'The algorithm starts with a set of fixed initial hash values (H0-H7 for SHA-256). These are derived from the fractional parts of the square roots of the first 8 prime numbers — nothing-up-my-sleeve numbers.', detail: 'SHA-256 initial values: H0=6a09e667, H1=bb67ae85, H2=3c6ef372, etc. Using mathematical constants (not arbitrary values) provides transparency — anyone can verify they contain no hidden backdoor. SHA-3 (Keccak) uses a different approach with an all-zero initial state.' },
                { title: 'Compression Rounds', description: 'Each 512-bit block is processed through 64 rounds of compression. Each round uses bitwise operations (AND, XOR, NOT, rotate, shift), addition modulo 2^32, and round constants derived from cube roots of the first 64 primes.', detail: 'Each round combines the working variables (a-h) with a message schedule word and a round constant using Sigma functions, Ch (choice), and Maj (majority) operations. After 64 rounds, the result is added to the previous hash state. This Merkle-Damgård construction chains blocks: H(block_n) depends on H(block_n-1).' },
                { title: 'Avalanche Effect', description: 'The compression rounds ensure that every bit of input influences every bit of output. Changing a single bit in the input flips approximately 50% of output bits — making it impossible to predict how a change affects the hash.', detail: 'Example: SHA-256("hello") = 2cf24dba... SHA-256("hellp") = 5f2b7c... — completely different despite one letter change. This is measured by the Strict Avalanche Criterion (SAC): flipping any input bit should give each output bit a 50% chance of flipping. A hash function failing SAC would leak information about the input.' },
                { title: 'Fixed-Length Output', description: 'After all blocks are processed, the final hash state (H0-H7) is concatenated to produce the 256-bit digest. This fixed-length output serves as a unique fingerprint of the input data.', detail: 'The digest is typically displayed as 64 hexadecimal characters. Applications: file integrity (checksums), password storage (with salt), digital signatures (sign the hash, not the message), blockchain (proof-of-work), HMAC (keyed hash for message authentication), and commit hashes (Git uses SHA-1, migrating to SHA-256).' }
            ]
        },
        interactive: {
            type: 'hash-walkthrough',
            instructions: 'Walk through the hashing process step by step. Enter a message and watch as it is padded, compressed through rounds, and reduced to a fixed-length digest. Change one character and observe the avalanche effect.',
            placeholder: 'Enter a message to hash step by step...'
        },
        quiz: [
            { question: 'What is the key difference between hashing and encryption?', options: ['Hashing is faster than encryption', 'Hashing is one-way (irreversible); encryption is two-way (reversible with a key)', 'Hashing uses larger keys than encryption', 'Encryption produces fixed-length output; hashing does not'], correct: 1, explanation: 'Hashing is a one-way function — there is no key and no way to recover the original input from the digest. Encryption is two-way: with the correct key, ciphertext can be decrypted back to plaintext. This fundamental difference determines their use cases.' },
            { question: 'What is the "avalanche effect" in hash functions?', options: ['Output gets larger as input gets larger', 'Changing one input bit changes approximately 50% of output bits', 'The hash computation gets exponentially slower with larger inputs', 'Multiple inputs always produce the same hash'], correct: 1, explanation: 'The avalanche effect means a tiny change in input (even 1 bit) causes approximately half the output bits to flip. This ensures that similar inputs produce completely different hashes, preventing anyone from deducing the input by analyzing the output.' },
            { question: 'Why is MD5 considered broken for security purposes?', options: ['It is too slow for modern hardware', 'Practical collision attacks exist — two different inputs can produce the same hash', 'Its 128-bit output is too long to store', 'It was never standardized by NIST'], correct: 1, explanation: 'In 2004, researchers demonstrated practical collision attacks against MD5. An attacker can create two different files with the same MD5 hash. This was exploited in the real world — the Flame malware used an MD5 collision to forge a Microsoft certificate.' },
            { question: 'What does a "salt" do in password hashing?', options: ['Makes the password longer and harder to guess', 'Adds a unique random value to each password before hashing, defeating rainbow tables', 'Encrypts the hash for additional security', 'Compresses the password before hashing to save storage'], correct: 1, explanation: 'A salt is a unique random value generated for each password and stored alongside the hash. It ensures that identical passwords produce different hashes (different salts). This defeats rainbow tables, which rely on precomputed hash lookups, and forces attackers to crack each hash individually.' },
            { question: 'Why is Argon2 recommended over plain SHA-256 for password hashing?', options: ['Argon2 produces longer hashes', 'Argon2 is deliberately slow and memory-hard, making brute-force attacks expensive', 'SHA-256 is broken', 'Argon2 does not require a salt'], correct: 1, explanation: 'SHA-256 is designed to be FAST — a GPU can compute billions of SHA-256 hashes per second. For password hashing, speed is the enemy. Argon2 is deliberately slow and memory-intensive (configurable time, memory, parallelism), making GPU/ASIC brute-force attacks prohibitively expensive.' },
            { question: 'How does SHA-3 (Keccak) differ architecturally from SHA-2?', options: ['SHA-3 uses longer keys', 'SHA-3 uses a sponge construction instead of Merkle-Damgård', 'SHA-3 is proprietary and closed-source', 'SHA-3 only works on text input, not binary'], correct: 1, explanation: 'SHA-2 uses the Merkle-Damgård construction (chained compression function), which is vulnerable to length extension attacks. SHA-3 uses a sponge construction that "absorbs" input and "squeezes" output, which is inherently resistant to length extension attacks and provides a completely different security foundation.' }
        ]
    }
};
