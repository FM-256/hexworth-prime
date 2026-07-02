'use strict';

/**
 * Canonical platform admin allowlist — single source of truth.
 *
 * Required by index.js (requireAdmin + setAdminClaim), hex-ai-bridge.js
 * (admin stream/tool access), and manage-announcements.js (local script).
 * Previously each file declared its own copy and they drifted
 * (manage-announcements.js was missing jorden@).
 *
 * Changing this list changes who passes every allowlist-based admin gate
 * on the next functions deploy — treat edits as operator-authorized only.
 */
module.exports = ['f.mora80@gmail.com', 'jorden@hexworth.com'];
