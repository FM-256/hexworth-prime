/**
 * ClassManager.js - Class/Group Management for Hexworth Prime
 *
 * Handles class CRUD operations for Handler (instructor) accounts:
 * - Create classes with unique HEX-XXXX codes
 * - List handler's classes
 * - Update/soft-delete classes
 * - Lookup classes by code (Phase 2: student join flow)
 *
 * Firestore Collection: classes/{autoId}
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - FirestoreManager (components/FirestoreManager.js) — for init/db
 *   - window.firebaseFirestore — set by FirestoreManager.init()
 *
 * @version 1.0.0
 */

const ClassManager = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════

    const COLLECTION = 'classes';

    // Unambiguous character set (no 0/O, 1/I/l, 5/S, 8/B)
    const CODE_CHARS = '234679ACDEFGHJKMNPQRTUVWXYZ';
    const CODE_PREFIX = 'HEX-';
    const CODE_LENGTH = 4;
    const MAX_CODE_ATTEMPTS = 10;

    let initialized = false;
    let db = null;

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Initialize ClassManager — connects to Firestore
     * Lazy init, same pattern as FirestoreManager
     */
    async function init() {
        if (initialized) return true;

        try {
            // Ensure FirestoreManager is ready (it sets window.firebaseFirestore)
            if (typeof FirestoreManager !== 'undefined') {
                await FirestoreManager.init();
            }

            if (!window.firebaseFirestore) {
                throw new Error('Firestore SDK not available');
            }

            // Get db instance
            const { getFirestore } = window.firebaseFirestore;
            const { getApps } = window.firebaseApp;

            if (getApps().length === 0) {
                throw new Error('Firebase app not initialized');
            }

            db = getFirestore(getApps()[0]);
            initialized = true;
            console.log('[ClassManager] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[ClassManager] Initialization failed:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CLASS CODE GENERATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Generate a cryptographically random code character
     */
    function randomChar() {
        if (window.crypto && window.crypto.getRandomValues) {
            const arr = new Uint32Array(1);
            window.crypto.getRandomValues(arr);
            return CODE_CHARS[arr[0] % CODE_CHARS.length];
        }
        // Fallback
        return CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }

    /**
     * Generate a HEX-XXXX class code
     * @returns {string} e.g. "HEX-7K9M"
     */
    function generateCode() {
        let code = '';
        for (let i = 0; i < CODE_LENGTH; i++) {
            code += randomChar();
        }
        return CODE_PREFIX + code;
    }

    /**
     * Generate a unique class code (checks Firestore for collisions)
     * @returns {Promise<string>} Unique class code
     */
    async function generateUniqueCode() {
        if (!initialized) await init();

        const { collection, query, where, getDocs } = window.firebaseFirestore;

        for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
            const code = generateCode();

            // Check if code already exists
            const q = query(
                collection(db, COLLECTION),
                where('classCode', '==', code)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return code;
            }

            console.warn(`[ClassManager] Code collision: ${code}, retrying...`);
        }

        throw new Error('Failed to generate unique class code after ' + MAX_CODE_ATTEMPTS + ' attempts');
    }

    // ═══════════════════════════════════════════════════════════════
    // CRUD OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create a new class
     * @param {Object} params
     * @param {string} params.name - Class name (required, max 60 chars)
     * @param {string} [params.description] - Class description (optional, max 200 chars)
     * @returns {Promise<{classId: string, classCode: string}>}
     */
    async function createClass({ name, description = '' }) {
        if (!initialized) await init();
        if (!db) throw new Error('Database not available');

        // Validate inputs
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Class name is required');
        }
        if (name.trim().length > 60) {
            throw new Error('Class name must be 60 characters or less');
        }
        if (description && description.length > 200) {
            throw new Error('Description must be 200 characters or less');
        }

        // Get current handler info
        const user = FirebaseAuth.getUser();
        if (!user) throw new Error('Not authenticated');

        if (typeof AccountFrame !== 'undefined' && AccountFrame.getAccountType() !== 'handler') {
            throw new Error('Handler status required');
        }

        // Generate unique code
        const classCode = await generateUniqueCode();

        const { collection: colRef, addDoc, serverTimestamp } = window.firebaseFirestore;

        const classData = {
            name: name.trim(),
            description: (description || '').trim(),
            classCode: classCode,
            handlerUid: user.uid,
            handlerEmail: user.email || '',
            handlerDisplayName: user.displayName || '',
            memberUids: [],
            memberCount: 0,
            isActive: true,
            maxMembers: 50,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(colRef(db, COLLECTION), classData);

        console.log(`[ClassManager] Class created: ${docRef.id} (${classCode})`);

        return {
            classId: docRef.id,
            classCode: classCode
        };
    }

    /**
     * Get all active classes for a handler, sorted newest first
     * @param {string} handlerUid - Firebase UID of the handler
     * @returns {Promise<Array>} Array of class objects
     */
    async function getHandlerClasses(handlerUid) {
        if (!initialized) await init();
        if (!db) return [];

        try {
            const { collection: colRef, query, where, orderBy, getDocs } = window.firebaseFirestore;

            const q = query(
                colRef(db, COLLECTION),
                where('handlerUid', '==', handlerUid),
                where('isActive', '==', true),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const classes = [];

            snapshot.forEach(doc => {
                classes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return classes;
        } catch (error) {
            console.error('[ClassManager] Failed to get handler classes:', error);
            return [];
        }
    }

    /**
     * Get a single class by its code
     * @param {string} code - Class code (e.g. "HEX-7K9M")
     * @returns {Promise<Object|null>}
     */
    async function getClassByCode(code) {
        if (!initialized) await init();
        if (!db) return null;

        try {
            const { collection: colRef, query, where, getDocs } = window.firebaseFirestore;

            const q = query(
                colRef(db, COLLECTION),
                where('classCode', '==', code.toUpperCase().trim()),
                where('isActive', '==', true)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('[ClassManager] Failed to get class by code:', error);
            return null;
        }
    }

    /**
     * Update class details
     * @param {string} classId - Firestore document ID
     * @param {Object} updates - Fields to update (name, description)
     * @returns {Promise<boolean>}
     */
    async function updateClass(classId, updates) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            const { doc, getDoc, updateDoc, serverTimestamp } = window.firebaseFirestore;

            // Verify ownership
            const classRef = doc(db, COLLECTION, classId);
            const snapshot = await getDoc(classRef);

            if (!snapshot.exists()) throw new Error('Class not found');

            const classData = snapshot.data();
            const user = FirebaseAuth.getUser();
            if (!user || classData.handlerUid !== user.uid) {
                throw new Error('Not authorized to edit this class');
            }

            // Validate updates
            const safeUpdates = {};
            if (updates.name !== undefined) {
                const name = updates.name.trim();
                if (name.length === 0 || name.length > 60) {
                    throw new Error('Class name must be 1-60 characters');
                }
                safeUpdates.name = name;
            }
            if (updates.description !== undefined) {
                const desc = updates.description.trim();
                if (desc.length > 200) {
                    throw new Error('Description must be 200 characters or less');
                }
                safeUpdates.description = desc;
            }

            safeUpdates.updatedAt = serverTimestamp();

            await updateDoc(classRef, safeUpdates);

            console.log(`[ClassManager] Class updated: ${classId}`);
            return true;
        } catch (error) {
            console.error('[ClassManager] Failed to update class:', error);
            throw error;
        }
    }

    /**
     * Soft-delete a class (sets isActive: false)
     * @param {string} classId - Firestore document ID
     * @returns {Promise<boolean>}
     */
    async function deleteClass(classId) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            const { doc, getDoc, updateDoc, serverTimestamp } = window.firebaseFirestore;

            // Verify ownership
            const classRef = doc(db, COLLECTION, classId);
            const snapshot = await getDoc(classRef);

            if (!snapshot.exists()) throw new Error('Class not found');

            const classData = snapshot.data();
            const user = FirebaseAuth.getUser();
            if (!user || classData.handlerUid !== user.uid) {
                throw new Error('Not authorized to delete this class');
            }

            await updateDoc(classRef, {
                isActive: false,
                updatedAt: serverTimestamp()
            });

            console.log(`[ClassManager] Class soft-deleted: ${classId}`);
            return true;
        } catch (error) {
            console.error('[ClassManager] Failed to delete class:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        init,
        createClass,
        getHandlerClasses,
        getClassByCode,
        updateClass,
        deleteClass
    };

})();
