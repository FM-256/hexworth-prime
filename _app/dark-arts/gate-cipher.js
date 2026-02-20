// Gate Cipher — Monthly Rotation System for Five Gates CTF
// No plaintext answers exist in this file. All answers are SHA-256 hashed.
// Rotation: new Date().getMonth() % 4 selects the active cipher set.

const GATE_CIPHER = (() => {
    const VERSION = '2026-02';

    const SETS = [
        // SET 0: Jan(0), May(4), Sep(8)
        {
            gate1: {
                hex: '74 68 65 20 77 6f 72 74 68 79 20 73 65 65 20 62 65 6e 65 61 74 68',
                hash: '020ac54b315b295ad705b1d0ce5964f62591201114e25361e7d84acbac81cd94'
            },
            gate2: {
                base64: 'dHJ1dGggaGlkZXMgaW4gc2hhZG93',
                hash: '20524b12c3e0d27febace929c0a114bde5e5f833bf93d409ab5b2ed715b11733'
            },
            gate3: {
                base64: 'c2lsZW5jZSBob2xkcyB0aGUgYW5zd2Vy',
                hash: '305e3574e96892791779baf17075151eaf260178c66b0576f3c336a20bf6b143'
            },
            gate4: {
                code: '0451',
                hash: 'ca99994b3b9bc0cbdb210efef623759146df77abe378eb5d13ca01fe6116e8fe'
            }
        },
        // SET 1: Feb(1), Jun(5), Oct(9)
        {
            gate1: {
                hex: '6f 6e 6c 79 20 74 68 65 20 63 75 72 69 6f 75 73 20 66 69 6e 64 20 6c 69 67 68 74',
                hash: 'c75faed564c74ded5e73b15fec865838510618929f48c9e880bd7def8328acf4'
            },
            gate2: {
                base64: 'd2hhdCBpcyBjb25jZWFsZWQgcmV2ZWFscyBwdXJwb3Nl',
                hash: 'ab4b8a6be78bbc40be155a60a9999308f3ec304bd374986e85fa52424d8875eb'
            },
            gate3: {
                base64: 'dGhlIHVuc2VlbiBzcGVha3Mgdm9sdW1lcw==',
                hash: 'e758ef07d7e7c1d844d8b3aa94dfe8bb604fbba76cf0bf5f0a68128b35937d2f'
            },
            gate4: {
                code: '2600',
                hash: '3a0e14026c6b1d6b4cae899e451e9ebcbd9646c44a956440f2227b2212447be6'
            }
        },
        // SET 2: Mar(2), Jul(6), Nov(10)
        {
            gate1: {
                hex: '62 65 6e 65 61 74 68 20 74 68 65 20 63 6f 64 65 20 6c 69 65 73 20 6d 65 61 6e 69 6e 67',
                hash: '54f127b2790d0be10f3caac1714d38279c2ddc5f9e42e29c829461c7d060ae2f'
            },
            gate2: {
                base64: 'c2hhZG93cyB0ZWFjaCB0aGUgcGF0aWVudCBtaW5k',
                hash: 'e855d6051bb9ab88163c325f1512432c44c79bbaea81131eec8534216385b114'
            },
            gate3: {
                base64: 'aGlkZGVuIGxheWVycyBndWFyZCB0aGUgcGF0aA==',
                hash: '321be37ec4e36f40cbcff22a311258cb2514f7f0256a8bb3282c7c88bcb639f9'
            },
            gate4: {
                code: '1973',
                hash: '9baed8fceea6e36d36670d72429d909547165efc038c293a14a41ef2edf83141'
            }
        },
        // SET 3: Apr(3), Aug(7), Dec(11)
        {
            gate1: {
                hex: '77 69 73 64 6f 6d 20 72 65 77 61 72 64 73 20 74 68 65 20 70 65 72 73 69 73 74 65 6e 74',
                hash: '204eb305678b60770be636e80fc6f32cbe82b610c34162120914ad7e7deaa5d1'
            },
            gate2: {
                base64: 'ZGFya25lc3MgaWxsdW1pbmF0ZXMgdGhlIHdvcnRoeQ==',
                hash: '56eadef15f7190903774243c4d2fc5915065a754963bb9449121ec83ead302db'
            },
            gate3: {
                base64: 'dGhlIHF1aWV0IG9uZXMgc2VlIGV2ZXJ5dGhpbmc=',
                hash: '315a6c5811d2ecfeb79feb54c6ba6d663f7ad1977cc94671044b014b2733fd27'
            },
            gate4: {
                code: '8139',
                hash: '42e544025f96e6ee0a064873a7f2d431ca555ed0ab1f2990377a5dcac1a7dd16'
            }
        }
    ];

    const GATE5_BINDING_HASHES = [
        'f44e85c4b8ea2addc796f8beab6600e801d767ccd26c800dce6d88fdaa5eb4e6',
        'b83d7514ba17c3f1156a2648c1a9d3d167143e695ad491e6197f88441c7a1e4a',
        '29ba6947875fa4dbc743bf54cd2ee163cf566e14203dfccd6c1bbf65585d861c',
        '57794bdeddd908748d80f827d22b534019ac4de886dde656caef927cbb839537',
        'ccb261d43dccffa7475815572d1b031be3731cb77d5772cf90207cae491142df',
        '14a60637758cb026afd2fe447f3648a07965072eeefaa9ee57734959bce8ae2b',
        '5d2d3ceb7abe552344276d47d36a8175b7aeb250a9bf0bf00e850cd23ecf2e43',
        '1f5087db919ced5c123c7f507d3fcce818cb0cf6e77c2f95a8a35e951e03fdb9',
        '8950aeb7bd2ed1fa44e3f753013b8274d578a51b963b7c9b303274a2d367b6be',
        '44fdf624b4cd4ddb26a2b389ecbffac8ba20d72ee8e030ea183c1a8fdd61c683',
        'ee8da6515d50832259fd35b357d89e81fa194a746d99f38f05c0c5fba4db2639'
    ];

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function checkAnswer(input, expectedHash) {
        const normalized = input.trim().toLowerCase();
        const hash = await sha256(normalized);
        return hash === expectedHash;
    }

    async function checkBindingWord(input) {
        const normalized = input.trim().toLowerCase();
        const hash = await sha256(normalized);
        return GATE5_BINDING_HASHES.includes(hash);
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
        GATE5_BINDING_HASHES,
        sha256,
        checkAnswer,
        checkBindingWord,
        getSetIndex,
        getCurrentSet,
        checkVersion
    };
})();
