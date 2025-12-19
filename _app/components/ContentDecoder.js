/**
 * ContentDecoder.js - Runtime Content Decryption System
 *
 * Works with AccessGuard to decode protected content only after
 * authorization passes. Content is stored as encrypted payloads
 * in data attributes and revealed at runtime.
 *
 * Encoding Layers:
 * 1. Compression (LZ-based)
 * 2. XOR cipher with derived key
 * 3. Base64 encoding (transport layer)
 *
 * Usage:
 *   <div class="protected-content" data-payload="[encoded]" data-salt="[salt]">
 *       <div class="content-locked">🔒 Content Protected</div>
 *   </div>
 *
 *   <script>
 *       AccessGuard.require('sorted');
 *       ContentDecoder.revealAll();
 *   </script>
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const ContentDecoder = (function() {
    'use strict';

    // Configuration
    const config = {
        protectedClass: 'protected-content',
        payloadAttr: 'data-payload',
        saltAttr: 'data-salt',
        lockedClass: 'content-locked',
        revealedClass: 'content-revealed',
        masterSalt: 'HexworthPrime2025',  // Combined with per-file salt
        storagePrefix: 'hexworth_'
    };

    // ============================================
    // KEY DERIVATION
    // ============================================

    /**
     * Derive a decryption key from user's progression state
     * This ties content access to actual progress
     */
    function deriveKey(salt) {
        const userHouse = localStorage.getItem(config.storagePrefix + 'house') || '';
        const sortingComplete = localStorage.getItem(config.storagePrefix + 'sorting_complete') || '';

        // Combine factors into key material
        const keyMaterial = [
            config.masterSalt,
            salt || '',
            userHouse,
            sortingComplete ? 'sorted' : ''
        ].join('|');

        // Simple hash to derive key bytes
        return hashString(keyMaterial);
    }

    /**
     * Simple string hash (djb2 variant)
     * Returns a consistent numeric hash
     */
    function hashString(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Generate key bytes from hash for XOR cipher
     */
    function generateKeyBytes(hash, length) {
        const bytes = [];
        let h = hash;
        for (let i = 0; i < length; i++) {
            h = (h * 1103515245 + 12345) & 0x7fffffff;
            bytes.push(h % 256);
        }
        return bytes;
    }

    // ============================================
    // DECRYPTION
    // ============================================

    /**
     * Decode Base64 to bytes
     */
    function base64ToBytes(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * XOR decrypt bytes with key
     */
    function xorDecrypt(encryptedBytes, keyHash) {
        const keyBytes = generateKeyBytes(keyHash, encryptedBytes.length);
        const decrypted = new Uint8Array(encryptedBytes.length);

        for (let i = 0; i < encryptedBytes.length; i++) {
            decrypted[i] = encryptedBytes[i] ^ keyBytes[i];
        }

        return decrypted;
    }

    /**
     * Decompress LZ-compressed data
     * Simple LZ-based decompression
     */
    function decompress(bytes) {
        // Check for compression marker
        if (bytes[0] !== 0x1F || bytes[1] !== 0x8B) {
            // Not compressed, just decode as UTF-8
            return new TextDecoder().decode(bytes);
        }

        // Simple RLE decompression for our format
        const result = [];
        let i = 2; // Skip marker

        while (i < bytes.length) {
            const byte = bytes[i++];

            if (byte === 0xFF && i < bytes.length - 1) {
                // Repeat marker: 0xFF, count, byte
                const count = bytes[i++];
                const repeatByte = bytes[i++];
                for (let j = 0; j < count; j++) {
                    result.push(repeatByte);
                }
            } else {
                result.push(byte);
            }
        }

        return new TextDecoder().decode(new Uint8Array(result));
    }

    /**
     * Full decryption pipeline
     */
    function decrypt(payload, salt) {
        try {
            // Step 1: Base64 decode
            const encryptedBytes = base64ToBytes(payload);

            // Step 2: Derive key
            const keyHash = deriveKey(salt);

            // Step 3: XOR decrypt
            const decryptedBytes = xorDecrypt(encryptedBytes, keyHash);

            // Step 4: Decompress (if applicable)
            const content = decompress(decryptedBytes);

            return content;
        } catch (error) {
            console.error('ContentDecoder: Decryption failed', error);
            return null;
        }
    }

    // ============================================
    // DOM MANIPULATION
    // ============================================

    /**
     * Reveal a single protected content element
     */
    function reveal(element) {
        const payload = element.getAttribute(config.payloadAttr);
        const salt = element.getAttribute(config.saltAttr) || '';

        if (!payload) {
            console.warn('ContentDecoder: No payload found on element');
            return false;
        }

        const content = decrypt(payload, salt);

        if (content) {
            // Remove locked indicator
            const locked = element.querySelector('.' + config.lockedClass);
            if (locked) {
                locked.remove();
            }

            // Inject decrypted content
            element.innerHTML = content;
            element.classList.remove(config.protectedClass);
            element.classList.add(config.revealedClass);

            // Clean up data attributes
            element.removeAttribute(config.payloadAttr);
            element.removeAttribute(config.saltAttr);

            return true;
        } else {
            // Show decryption failed message
            element.innerHTML = `
                <div class="decode-error">
                    <span class="error-icon">⚠️</span>
                    <span class="error-text">Content verification failed</span>
                </div>
            `;
            return false;
        }
    }

    /**
     * Reveal all protected content on page
     */
    function revealAll() {
        const elements = document.querySelectorAll('.' + config.protectedClass);
        let successCount = 0;

        elements.forEach(element => {
            if (reveal(element)) {
                successCount++;
            }
        });

        console.log(`ContentDecoder: Revealed ${successCount}/${elements.length} content blocks`);
        return successCount;
    }

    /**
     * Check if page has protected content
     */
    function hasProtectedContent() {
        return document.querySelectorAll('.' + config.protectedClass).length > 0;
    }

    // ============================================
    // INTEGRATION WITH ACCESSGUARD
    // ============================================

    /**
     * Auto-reveal after AccessGuard passes
     * Call this after AccessGuard.require() succeeds
     */
    function autoReveal() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', revealAll);
        } else {
            revealAll();
        }
    }

    // ============================================
    // ENCODING (for development/testing)
    // Note: Real encoding should use content-encoder.py
    // ============================================

    /**
     * Encode content (for testing - real encoding uses Python tool)
     */
    function encode(content, salt) {
        try {
            // Step 1: Convert to bytes
            const encoder = new TextEncoder();
            const contentBytes = encoder.encode(content);

            // Step 2: Simple compression marker (no actual compression in JS version)
            const bytes = new Uint8Array(contentBytes.length);
            for (let i = 0; i < contentBytes.length; i++) {
                bytes[i] = contentBytes[i];
            }

            // Step 3: XOR encrypt
            const keyHash = deriveKey(salt);
            const keyBytes = generateKeyBytes(keyHash, bytes.length);
            const encrypted = new Uint8Array(bytes.length);

            for (let i = 0; i < bytes.length; i++) {
                encrypted[i] = bytes[i] ^ keyBytes[i];
            }

            // Step 4: Base64 encode
            let binary = '';
            for (let i = 0; i < encrypted.length; i++) {
                binary += String.fromCharCode(encrypted[i]);
            }

            return btoa(binary);
        } catch (error) {
            console.error('ContentDecoder: Encoding failed', error);
            return null;
        }
    }

    // ============================================
    // CSS INJECTION
    // ============================================

    /**
     * Inject required CSS styles
     */
    function injectStyles() {
        if (document.getElementById('content-decoder-styles')) return;

        const style = document.createElement('style');
        style.id = 'content-decoder-styles';
        style.textContent = `
            .protected-content {
                min-height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.2);
                border: 1px dashed rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                margin: 10px 0;
            }

            .content-locked {
                text-align: center;
                color: #666;
                padding: 20px;
            }

            .content-locked .lock-icon {
                font-size: 2rem;
                display: block;
                margin-bottom: 10px;
            }

            .content-locked .lock-text {
                font-size: 0.8rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }

            .content-revealed {
                animation: contentReveal 0.5s ease-out;
            }

            @keyframes contentReveal {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .decode-error {
                color: #f87171;
                padding: 20px;
                text-align: center;
            }

            .decode-error .error-icon {
                font-size: 1.5rem;
                margin-right: 10px;
            }
        `;
        document.head.appendChild(style);
    }

    // Inject styles on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    // ============================================
    // PUBLIC API
    // ============================================

    return {
        reveal,
        revealAll,
        autoReveal,
        hasProtectedContent,
        encode,      // For testing
        decrypt,     // For testing
        deriveKey    // For testing
    };

})();
