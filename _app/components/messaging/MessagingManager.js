/**
 * MessagingManager.js - Messaging Service for Hexworth Prime
 *
 * F-23C: Client-side messaging singleton.
 * Handles conversations, real-time listeners, and Cloud Function calls.
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - FirestoreManager (components/FirestoreManager.js) — for init/db
 *   - window.firebaseFirestore — set by FirestoreManager.init()
 *
 * @version 1.0.0
 */

const MessagingManager = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════

    const MESSAGES_COLLECTION = 'messages';
    const CONVERSATIONS_COLLECTION = 'conversations';
    const BLOCKS_COLLECTION = 'messaging_blocks';
    const MESSAGES_PER_PAGE = 20;
    const MAX_MESSAGE_LENGTH = 500;

    let initialized = false;
    let db = null;
    let currentUid = null;

    // Active listeners (for cleanup)
    let conversationsListener = null;
    let activeMessageListeners = {};
    let unreadCountListener = null;

    // Cached state
    let conversations = [];
    let unreadCount = 0;

    // Callbacks
    let onConversationsUpdate = null;
    let onUnreadCountUpdate = null;

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async function init() {
        if (initialized) return true;

        try {
            if (typeof FirestoreManager !== 'undefined') {
                await FirestoreManager.init();
            }

            if (!window.firebaseFirestore) {
                throw new Error('Firestore SDK not available');
            }

            const { getFirestore } = window.firebaseFirestore;
            const { getApps } = window.firebaseApp;

            if (getApps().length === 0) {
                throw new Error('Firebase app not initialized');
            }

            db = getFirestore(getApps()[0]);

            // Get current user
            const user = FirebaseAuth.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }
            currentUid = user.uid;

            initialized = true;
            console.log('[MessagingManager] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[MessagingManager] Initialization failed:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // SEND MESSAGE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Send a message to another user.
     * Calls the sendMessage Cloud Function for server-side validation.
     *
     * @param {string} toUid - Recipient user ID
     * @param {string} text - Message text (max 500 chars)
     * @param {string} classId - Class context for the message
     * @returns {Promise<object>} - Result from Cloud Function
     */
    async function sendMessage(toUid, text, classId) {
        if (!initialized) await init();

        // Client-side validation (server also validates)
        if (!toUid || typeof toUid !== 'string') {
            throw new Error('Invalid recipient');
        }
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('Message cannot be empty');
        }
        if (text.length > MAX_MESSAGE_LENGTH) {
            throw new Error(`Message exceeds ${MAX_MESSAGE_LENGTH} character limit`);
        }
        if (!classId) {
            throw new Error('Class context required');
        }

        const { getFunctions, httpsCallable } = window.firebaseFunctions;
        const functions = getFunctions(window.firebaseApp.getApps()[0], 'us-central1');
        const sendMessageFn = httpsCallable(functions, 'sendMessage');

        const result = await sendMessageFn({
            toUid: toUid,
            text: text.trim(),
            classId: classId
        });

        return result.data;
    }

    // ═══════════════════════════════════════════════════════════════
    // CONVERSATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Subscribe to real-time conversation updates.
     * Returns conversations where current user is a participant.
     *
     * @param {Function} callback - Called with updated conversations array
     * @returns {Function} Unsubscribe function
     */
    function getConversations(callback) {
        if (!initialized) {
            init().then(() => getConversations(callback));
            return () => {};
        }

        onConversationsUpdate = callback;

        const { collection, query, where, orderBy, onSnapshot } = window.firebaseFirestore;

        // Clean up existing listener
        if (conversationsListener) {
            conversationsListener();
        }

        const q = query(
            collection(db, CONVERSATIONS_COLLECTION),
            where('participants', 'array-contains', currentUid),
            orderBy('lastTimestamp', 'desc')
        );

        conversationsListener = onSnapshot(q, (snapshot) => {
            conversations = [];
            snapshot.forEach((doc) => {
                conversations.push({ id: doc.id, ...doc.data() });
            });

            if (onConversationsUpdate) {
                onConversationsUpdate(conversations);
            }
        }, (error) => {
            console.error('[MessagingManager] Conversations listener error:', error);
        });

        return conversationsListener;
    }

    // ═══════════════════════════════════════════════════════════════
    // MESSAGES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Subscribe to real-time messages for a conversation.
     * Paginated — returns the most recent 20 messages.
     *
     * @param {string} conversationId - Conversation document ID
     * @param {Function} callback - Called with messages array
     * @param {object} [lastDoc] - Last document for pagination (load more)
     * @returns {Function} Unsubscribe function
     */
    function getMessages(conversationId, callback, lastDoc) {
        if (!initialized) {
            init().then(() => getMessages(conversationId, callback, lastDoc));
            return () => {};
        }

        const {
            collection, query, where, orderBy, limit, startAfter, onSnapshot
        } = window.firebaseFirestore;

        // Clean up existing listener for this conversation
        if (activeMessageListeners[conversationId]) {
            activeMessageListeners[conversationId]();
        }

        let constraints = [
            where('conversationId', '==', conversationId),
            where('deleted', '==', false),
            orderBy('timestamp', 'desc'),
            limit(MESSAGES_PER_PAGE)
        ];

        if (lastDoc) {
            constraints.splice(3, 0, startAfter(lastDoc));
        }

        const q = query(collection(db, MESSAGES_COLLECTION), ...constraints);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = [];
            let lastVisible = null;
            snapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data(), _doc: doc });
                lastVisible = doc;
            });

            // Reverse so oldest is first (chat order)
            messages.reverse();

            callback(messages, lastVisible);
        }, (error) => {
            console.error('[MessagingManager] Messages listener error:', error);
        });

        activeMessageListeners[conversationId] = unsubscribe;
        return unsubscribe;
    }

    // ═══════════════════════════════════════════════════════════════
    // MARK AS READ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Mark a message as read. Only the recipient can do this.
     *
     * @param {string} messageId - Message document ID
     */
    async function markAsRead(messageId) {
        if (!initialized) await init();

        const { doc, updateDoc } = window.firebaseFirestore;
        await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), {
            read: true
        });
    }

    /**
     * Mark all unread messages in a conversation as read.
     *
     * @param {string} conversationId - Conversation document ID
     */
    async function markConversationRead(conversationId) {
        if (!initialized) await init();

        const {
            collection, query, where, getDocs, doc, updateDoc
        } = window.firebaseFirestore;

        const q = query(
            collection(db, MESSAGES_COLLECTION),
            where('conversationId', '==', conversationId),
            where('to', '==', currentUid),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        const updates = [];
        snapshot.forEach((docSnap) => {
            updates.push(updateDoc(doc(db, MESSAGES_COLLECTION, docSnap.id), { read: true }));
        });

        await Promise.all(updates);
    }

    // ═══════════════════════════════════════════════════════════════
    // REPORT MESSAGE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Report a message. Calls the reportMessage Cloud Function.
     *
     * @param {string} messageId - Message document ID
     * @returns {Promise<object>} - Result from Cloud Function
     */
    async function reportMessage(messageId) {
        if (!initialized) await init();

        const { getFunctions, httpsCallable } = window.firebaseFunctions;
        const functions = getFunctions(window.firebaseApp.getApps()[0], 'us-central1');
        const reportMessageFn = httpsCallable(functions, 'reportMessage');

        const result = await reportMessageFn({ messageId });
        return result.data;
    }

    // ═══════════════════════════════════════════════════════════════
    // UNREAD COUNT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Subscribe to real-time unread message count.
     *
     * @param {Function} callback - Called with unread count (number)
     * @returns {Function} Unsubscribe function
     */
    function getUnreadCount(callback) {
        if (!initialized) {
            init().then(() => getUnreadCount(callback));
            return () => {};
        }

        onUnreadCountUpdate = callback;

        const { collection, query, where, onSnapshot } = window.firebaseFirestore;

        if (unreadCountListener) {
            unreadCountListener();
        }

        const q = query(
            collection(db, MESSAGES_COLLECTION),
            where('to', '==', currentUid),
            where('read', '==', false),
            where('deleted', '==', false)
        );

        unreadCountListener = onSnapshot(q, (snapshot) => {
            unreadCount = snapshot.size;
            if (onUnreadCountUpdate) {
                onUnreadCountUpdate(unreadCount);
            }
        }, (error) => {
            console.error('[MessagingManager] Unread count listener error:', error);
        });

        return unreadCountListener;
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════════════════════

    /**
     * Generate a deterministic conversation ID from two UIDs and a classId.
     * Sorts UIDs alphabetically to ensure consistency.
     */
    function buildConversationId(uid1, uid2, classId) {
        const sorted = [uid1, uid2].sort();
        return `${sorted[0]}_${sorted[1]}_${classId}`;
    }

    /**
     * Get the other participant's UID from a conversation.
     */
    function getOtherParticipant(conversation) {
        if (!conversation || !conversation.participants) return null;
        return conversation.participants.find(uid => uid !== currentUid) || null;
    }

    /**
     * Format a Firestore timestamp for display.
     */
    function formatTimestamp(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Today: show time
        if (diff < 86400000 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        // Yesterday
        if (diff < 172800000) {
            return 'Yesterday';
        }
        // This week: show day name
        if (diff < 604800000) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        // Older: show date
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    /**
     * Clean up all listeners. Call on logout or page unload.
     */
    function destroy() {
        if (conversationsListener) {
            conversationsListener();
            conversationsListener = null;
        }
        if (unreadCountListener) {
            unreadCountListener();
            unreadCountListener = null;
        }
        Object.values(activeMessageListeners).forEach(unsub => unsub());
        activeMessageListeners = {};

        conversations = [];
        unreadCount = 0;
        onConversationsUpdate = null;
        onUnreadCountUpdate = null;
        initialized = false;
        db = null;
        currentUid = null;

        console.log('[MessagingManager] Destroyed');
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        init,
        sendMessage,
        getConversations,
        getMessages,
        markAsRead,
        markConversationRead,
        reportMessage,
        getUnreadCount,
        buildConversationId,
        getOtherParticipant,
        formatTimestamp,
        destroy,

        // Expose constants
        MAX_MESSAGE_LENGTH,
        MESSAGES_PER_PAGE,

        // Getters
        get currentUid() { return currentUid; },
        get conversations() { return [...conversations]; },
        get unreadCount() { return unreadCount; }
    };
})();
