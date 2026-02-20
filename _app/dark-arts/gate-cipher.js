// Gate Cipher — Monthly Rotation System for Five Gates CTF
// No plaintext answers exist in this file. All answers are SHA-256 hashed.
// Rotation: new Date().getMonth() % 4 selects the active cipher set.

const GATE_CIPHER = (() => {
    const VERSION = '2026-02';

    // Clue data only — answer hashes moved to server-side gate_registry (Firestore)
    // Students decode clues locally; answer validation happens via validateGateAnswer CF
    const SETS = [
        // SET 0: Jan(0), May(4), Sep(8)
        {
            gate1: { hex: '74 68 65 20 77 6f 72 74 68 79 20 73 65 65 20 62 65 6e 65 61 74 68' },
            gate2: { base64: 'dHJ1dGggaGlkZXMgaW4gc2hhZG93' },
            gate3: { base64: 'c2lsZW5jZSBob2xkcyB0aGUgYW5zd2Vy' },
            gate4: { code: '0451' }
        },
        // SET 1: Feb(1), Jun(5), Oct(9)
        {
            gate1: { hex: '6f 6e 6c 79 20 74 68 65 20 63 75 72 69 6f 75 73 20 66 69 6e 64 20 6c 69 67 68 74' },
            gate2: { base64: 'd2hhdCBpcyBjb25jZWFsZWQgcmV2ZWFscyBwdXJwb3Nl' },
            gate3: { base64: 'dGhlIHVuc2VlbiBzcGVha3Mgdm9sdW1lcw==' },
            gate4: { code: '2600' }
        },
        // SET 2: Mar(2), Jul(6), Nov(10)
        {
            gate1: { hex: '62 65 6e 65 61 74 68 20 74 68 65 20 63 6f 64 65 20 6c 69 65 73 20 6d 65 61 6e 69 6e 67' },
            gate2: { base64: 'c2hhZG93cyB0ZWFjaCB0aGUgcGF0aWVudCBtaW5k' },
            gate3: { base64: 'aGlkZGVuIGxheWVycyBndWFyZCB0aGUgcGF0aA==' },
            gate4: { code: '1973' }
        },
        // SET 3: Apr(3), Aug(7), Dec(11)
        {
            gate1: { hex: '77 69 73 64 6f 6d 20 72 65 77 61 72 64 73 20 74 68 65 20 70 65 72 73 69 73 74 65 6e 74' },
            gate2: { base64: 'ZGFya25lc3MgaWxsdW1pbmF0ZXMgdGhlIHdvcnRoeQ==' },
            gate3: { base64: 'dGhlIHF1aWV0IG9uZXMgc2VlIGV2ZXJ5dGhpbmc=' },
            gate4: { code: '8139' }
        }
    ];

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Server-side answer validation via Cloud Function.
     * Returns { correct: boolean } or throws on rate-limit/network error.
     * Falls back to client-side check if user is not authenticated.
     */
    async function checkAnswerServer(gateNumber, input) {
        // If FirebaseAuth is available and user is signed in, use server
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
            try {
                const result = await FirebaseAuth.callFunction('validateGateAnswer', {
                    gateNumber: gateNumber,
                    answer: input
                });
                return result.data.correct;
            } catch (err) {
                // Rate limit error — surface it
                if (err.code === 'functions/resource-exhausted') {
                    throw err;
                }
                // Other errors (network, etc.) — fall through to client
                console.warn('[GATE_CIPHER] Server validation failed, falling back to client:', err.message);
            }
        }
        // Fallback: no server available (offline / file:// / not signed in)
        // This path is less secure but preserves compatibility
        return null; // null = server unavailable, caller should use legacy check
    }

    /** @deprecated Use checkAnswerServer() for authenticated users */
    async function checkAnswer(input, expectedHash) {
        const normalized = input.trim().toLowerCase();
        const hash = await sha256(normalized);
        return hash === expectedHash;
    }

    /** @deprecated Use checkAnswerServer(5, input) for authenticated users */
    async function checkBindingWord(input) {
        const normalized = input.trim().toLowerCase();
        const hash = await sha256(normalized);
        // Offline fallback no longer has hashes — always returns null
        return null;
    }

    function getSetIndex() {
        return new Date().getMonth() % 4;
    }

    function getCurrentSet() {
        return SETS[getSetIndex()];
    }

    function checkVersion() {
        const stored = localStorage.getItem('gate_version');
        if (stored !== VERSION) {
            for (let i = 1; i <= 10; i++) {
                localStorage.removeItem('gate' + i + '_complete');
                localStorage.removeItem('gate' + i + '_score');
                localStorage.removeItem('gate' + i + '_timestamp');
                localStorage.removeItem('gate' + i + '_progress');
            }
            localStorage.removeItem('dark_arts_unlocked');
            localStorage.removeItem('gate4_code');
            localStorage.setItem('gate_version', VERSION);
            return false;
        }
        return true;
    }

    return {
        VERSION,
        SETS,
        sha256,
        checkAnswerServer,
        checkAnswer,
        checkBindingWord,
        getSetIndex,
        getCurrentSet,
        checkVersion
    };
})();
