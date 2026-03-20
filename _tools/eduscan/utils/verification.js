/**
 * Verification Engine — Human-in-the-Loop False Positive Labeling
 *
 * PURPOSE:
 * EduScan's validators detect patterns that MIGHT be problems, but some
 * patterns are intentionally correct (e.g., $\{} inside a regex character
 * class, or console.log in an OWASP teaching example). These need a human
 * to review and label them as "verified false positive."
 *
 * HOW IT WORKS:
 * This follows the same supervised learning workflow used in AI/ML labeling:
 *
 *   1. Scanner flags a finding (the "detection")
 *   2. Human reviews and decides it's a false positive
 *   3. Human labels it via CLI: --verify <code> <file> <line>
 *   4. A signature is stored in verified-findings.json
 *   5. On future scans, the engine checks each finding against labels
 *   6. Matched findings are suppressed (not reported as issues)
 *
 * SIGNATURE EXPIRATION:
 * Each label includes a content hash of the flagged line. If the code
 * changes, the hash won't match and the label expires — the finding
 * gets re-flagged for human review. This prevents stale suppressions
 * from hiding real problems introduced by code changes.
 *
 * AUDIT TRAIL:
 * Every label records who verified it, when, and why. This creates
 * accountability and lets teams review suppression decisions.
 *
 * @author Hexworth Prime
 * @version 1.0.0
 * @created 2026-03-19
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Constants ──────────────────────────────────────────────────
// Store file lives alongside the scanner config, not in the scanned codebase
const VERIFIED_FILE = path.resolve(__dirname, '../verified-findings.json');

class VerificationEngine {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.store = this._loadStore();
    }

    // ── Core: Check if a finding has been verified ─────────────
    /**
     * Check whether a specific finding has been labeled as a verified
     * false positive by a human reviewer.
     *
     * Matching is done on three fields:
     *   - code:  The rule ID (e.g., HEUR-009)
     *   - file:  The relative file path
     *   - hash:  SHA-256 of the line content where the finding occurs
     *
     * If code + file match but the hash differs, the label has EXPIRED
     * (code changed since verification). The finding is re-flagged.
     *
     * @param {object} finding - An EduScan issue object
     * @param {string} finding.code - Rule code (e.g., 'HEUR-009')
     * @param {string} finding.file - Relative file path
     * @param {number} finding.line - Line number
     * @param {string} [lineContent] - The actual content of the flagged line
     * @returns {boolean} true if the finding is verified and should be suppressed
     */
    isVerified(finding, lineContent) {
        if (!finding || !finding.code || !finding.file) return false;

        const normalizedFile = this._normalizePath(finding.file);
        const currentHash = lineContent ? this._hashLine(lineContent) : null;

        for (const entry of this.store.verified) {
            // Match on code + file
            if (entry.code !== finding.code) continue;
            if (this._normalizePath(entry.file) !== normalizedFile) continue;

            // If we have line content, verify the hash still matches
            // This is the expiration mechanism — changed code invalidates the label
            if (currentHash && entry.hash && entry.hash !== currentHash) {
                if (this.verbose) {
                    console.log(`[VERIFY] Label expired: ${entry.code} in ${entry.file} — code changed since verification`);
                }
                continue; // Hash mismatch = label expired, re-flag it
            }

            // Line number check (soft match — lines can shift slightly)
            // We allow a tolerance of +/- 5 lines for minor edits that
            // don't change the flagged content but shift line numbers
            if (finding.line && entry.line) {
                const LINE_TOLERANCE = 5;
                if (Math.abs(finding.line - entry.line) > LINE_TOLERANCE) continue;
            }

            if (this.verbose) {
                console.log(`[VERIFY] Suppressed: ${entry.code} in ${entry.file}:${entry.line} (verified by ${entry.verifiedBy})`);
            }
            return true;
        }

        return false;
    }

    // ── Label Management ───────────────────────────────────────

    /**
     * Add a verified false positive label.
     *
     * @param {object} params
     * @param {string} params.code - Rule code (e.g., 'HEUR-009')
     * @param {string} params.file - Relative file path
     * @param {number} params.line - Line number
     * @param {string} params.reason - Human explanation of why this is a false positive
     * @param {string} [params.verifiedBy] - Who verified it (defaults to system user)
     * @param {string} [params.lineContent] - Content of the flagged line (used for hashing)
     * @returns {object} The created label entry
     */
    addVerification(params) {
        const { code, file, line, reason, verifiedBy = 'unknown', lineContent = '' } = params;

        if (!code || !file || !reason) {
            throw new Error('Verification requires: code, file, and reason');
        }

        const entry = {
            code,
            file: this._normalizePath(file),
            line: line || null,
            hash: lineContent ? this._hashLine(lineContent) : null,
            verifiedBy,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            reason
        };

        // Check for duplicates — don't label the same thing twice
        const existing = this.store.verified.findIndex(e =>
            e.code === entry.code &&
            this._normalizePath(e.file) === entry.file &&
            e.line === entry.line
        );

        if (existing !== -1) {
            // Update existing label (re-verification refreshes the hash and date)
            this.store.verified[existing] = entry;
        } else {
            this.store.verified.push(entry);
        }

        this._saveStore();
        return entry;
    }

    /**
     * Remove a verification label (un-verify a finding).
     * Use this when a previously verified finding should be re-evaluated.
     *
     * @param {string} code - Rule code
     * @param {string} file - File path
     * @param {number} [line] - Line number (optional, removes all matching if omitted)
     * @returns {number} Number of labels removed
     */
    removeVerification(code, file, line) {
        const normalizedFile = this._normalizePath(file);
        const before = this.store.verified.length;

        this.store.verified = this.store.verified.filter(e => {
            if (e.code !== code) return true;
            if (this._normalizePath(e.file) !== normalizedFile) return true;
            if (line !== undefined && e.line !== line) return true;
            return false; // Remove this entry
        });

        const removed = before - this.store.verified.length;
        if (removed > 0) this._saveStore();
        return removed;
    }

    /**
     * Get all current verification labels.
     * Useful for auditing what's been suppressed and by whom.
     *
     * @returns {Array} All verified finding entries
     */
    getAll() {
        return [...this.store.verified];
    }

    /**
     * Get verification stats for reporting.
     *
     * @returns {object} Summary of verified findings by code and status
     */
    getStats() {
        const byCode = {};
        for (const entry of this.store.verified) {
            byCode[entry.code] = (byCode[entry.code] || 0) + 1;
        }
        return {
            total: this.store.verified.length,
            byCode,
            lastUpdated: this.store.lastUpdated || null
        };
    }

    // ── Batch Operations ───────────────────────────────────────

    /**
     * Filter an array of findings, removing those that are verified.
     * This is the main integration point — called after all validators
     * run but before results are reported.
     *
     * @param {Array} findings - Array of EduScan issue objects
     * @param {Function} [getLineContent] - Optional function(file, line) that
     *   returns the content of a specific line for hash verification.
     *   If not provided, hash checking is skipped (labels match on code+file+line only).
     * @returns {object} { active: [...], suppressed: [...] }
     */
    filterFindings(findings, getLineContent) {
        const active = [];
        const suppressed = [];

        for (const finding of findings) {
            let lineContent = null;
            if (getLineContent && finding.file && finding.line) {
                try {
                    lineContent = getLineContent(finding.file, finding.line);
                } catch (e) {
                    // If we can't read the line, skip hash check
                }
            }

            if (this.isVerified(finding, lineContent)) {
                suppressed.push(finding);
            } else {
                active.push(finding);
            }
        }

        if (this.verbose && suppressed.length > 0) {
            console.log(`[VERIFY] Suppressed ${suppressed.length} verified false positive(s)`);
        }

        return { active, suppressed };
    }

    // ── Internal Helpers ───────────────────────────────────────

    /**
     * Generate a SHA-256 hash of a line's content.
     * The hash serves as a "content fingerprint" — if the code changes,
     * the hash changes, and the verification label expires.
     * We trim whitespace so indentation changes don't invalidate labels.
     */
    _hashLine(content) {
        const normalized = (content || '').trim();
        return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 12);
    }

    /**
     * Normalize file paths for consistent matching.
     * Strips leading ./ and normalizes separators.
     */
    _normalizePath(filePath) {
        return (filePath || '')
            .replace(/\\/g, '/')
            .replace(/^\.\//, '');
    }

    /**
     * Load the verified findings store from disk.
     * Creates an empty store if the file doesn't exist yet.
     */
    _loadStore() {
        try {
            if (fs.existsSync(VERIFIED_FILE)) {
                const data = JSON.parse(fs.readFileSync(VERIFIED_FILE, 'utf8'));
                // Ensure structure is valid
                if (!Array.isArray(data.verified)) {
                    data.verified = [];
                }
                return data;
            }
        } catch (e) {
            if (this.verbose) {
                console.log(`[VERIFY] Could not load ${VERIFIED_FILE}: ${e.message}`);
            }
        }

        // Return empty store
        return {
            _comment: 'EduScan Verified False Positives — human-reviewed findings that are intentionally correct code',
            verified: [],
            lastUpdated: null
        };
    }

    /**
     * Save the store to disk.
     * Pretty-printed JSON for easy human review and git diffs.
     */
    _saveStore() {
        this.store.lastUpdated = new Date().toISOString();
        fs.writeFileSync(VERIFIED_FILE, JSON.stringify(this.store, null, 2) + '\n', 'utf8');
    }
}

module.exports = VerificationEngine;
