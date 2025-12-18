/**
 * Hexworth Prime - Path Encoding System
 * Caesar Cipher Implementation
 *
 * This module provides encoding/decoding for path protection.
 * Key: 17 (stored separately for security)
 */

const PathCipher = (function() {
    // The shift key - change this to invalidate all encoded paths
    const SHIFT_KEY = 17;

    /**
     * Encode a string using Caesar cipher
     * @param {string} str - The string to encode
     * @returns {string} - Encoded string
     */
    function encode(str) {
        if (!str) return str;

        return str.split('').map(char => {
            const code = char.charCodeAt(0);

            // Lowercase letters (a-z)
            if (code >= 97 && code <= 122) {
                return String.fromCharCode(((code - 97 + SHIFT_KEY) % 26) + 97);
            }

            // Uppercase letters (A-Z)
            if (code >= 65 && code <= 90) {
                return String.fromCharCode(((code - 65 + SHIFT_KEY) % 26) + 65);
            }

            // Numbers (0-9) - shift by 7 within digit range
            if (code >= 48 && code <= 57) {
                return String.fromCharCode(((code - 48 + 7) % 10) + 48);
            }

            // Everything else passes through unchanged
            return char;
        }).join('');
    }

    /**
     * Decode a string using Caesar cipher
     * @param {string} str - The encoded string
     * @returns {string} - Decoded string
     */
    function decode(str) {
        if (!str) return str;

        return str.split('').map(char => {
            const code = char.charCodeAt(0);

            // Lowercase letters (a-z)
            if (code >= 97 && code <= 122) {
                return String.fromCharCode(((code - 97 - SHIFT_KEY + 26) % 26) + 97);
            }

            // Uppercase letters (A-Z)
            if (code >= 65 && code <= 90) {
                return String.fromCharCode(((code - 65 - SHIFT_KEY + 26) % 26) + 65);
            }

            // Numbers (0-9) - reverse shift by 7
            if (code >= 48 && code <= 57) {
                return String.fromCharCode(((code - 48 - 7 + 10) % 10) + 48);
            }

            // Everything else passes through unchanged
            return char;
        }).join('');
    }

    // Public API
    return {
        encode: encode,
        decode: decode
    };
})();

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PathCipher;
}
