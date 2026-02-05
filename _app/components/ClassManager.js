/**
 * ClassManager.js - Class/Group Management for Hexworth Prime
 *
 * Handles class CRUD operations for Handler (instructor) accounts:
 * - Create classes with unique HEX-XXXX codes
 * - List handler's classes
 * - Update/soft-delete classes
 * - Lookup classes by code
 * - Student join/leave flow (HD-2)
 * - Roster management (member profiles subcollection)
 *
 * Firestore Collections:
 *   - classes/{autoId}
 *   - classes/{autoId}/members/{uid}
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - FirestoreManager (components/FirestoreManager.js) — for init/db
 *   - window.firebaseFirestore — set by FirestoreManager.init()
 *
 * @version 2.0.0
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
            const { collection: colRef, query, where, getDocs } = window.firebaseFirestore;

            // Single-field query (no composite index needed)
            // Filter isActive and sort in JS for resilience
            const q = query(
                colRef(db, COLLECTION),
                where('handlerUid', '==', handlerUid)
            );

            const snapshot = await getDocs(q);
            const classes = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.isActive !== false) {
                    classes.push({ id: doc.id, ...data });
                }
            });

            // Sort newest first (createdAt may be a Firestore Timestamp)
            classes.sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
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

            // Single-field query — filter isActive in JS
            const q = query(
                colRef(db, COLLECTION),
                where('classCode', '==', code.toUpperCase().trim())
            );

            const snapshot = await getDocs(q);

            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (data.isActive !== false) {
                    return { id: doc.id, ...data };
                }
            }
            return null;
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
    // STUDENT JOIN/LEAVE OPERATIONS (HD-2)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Join a class using a HEX-XXXX code
     * Creates member profile in subcollection and adds UID to memberUids array
     * @param {string} classCode - e.g. "HEX-7K9M"
     * @returns {Promise<{classId: string, className: string, classCode: string}>}
     */
    async function joinClass(classCode) {
        if (!initialized) await init();
        if (!db) throw new Error('Database not available');

        const user = FirebaseAuth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Find the class by code
        const cls = await getClassByCode(classCode);
        if (!cls) throw new Error('Class not found. Check the code and try again.');
        if (cls.isActive === false) throw new Error('This class is no longer active.');

        // Check capacity
        if ((cls.memberUids || []).length >= (cls.maxMembers || 50)) {
            throw new Error('This class is full (max ' + (cls.maxMembers || 50) + ' students).');
        }

        // Check duplicate
        if ((cls.memberUids || []).includes(user.uid)) {
            throw new Error('You are already enrolled in this class.');
        }

        const {
            doc, updateDoc, setDoc, arrayUnion, increment, serverTimestamp,
            collection: colRef
        } = window.firebaseFirestore;

        // Update class doc: add UID to memberUids, increment memberCount
        const classRef = doc(db, COLLECTION, cls.id);
        await updateDoc(classRef, {
            memberUids: arrayUnion(user.uid),
            memberCount: increment(1),
            updatedAt: serverTimestamp()
        });

        // Create member profile in subcollection (pull from user profile)
        const memberRef = doc(db, COLLECTION, cls.id, 'members', user.uid);
        const profile = await _getUserProfile();

        const firstName = profile?.firstName || '';
        const lastName = profile?.lastName || '';
        const displayName = (firstName && lastName)
            ? `${firstName} ${lastName}`
            : user.displayName || user.email?.split('@')[0] || 'Unknown';

        await setDoc(memberRef, {
            uid: user.uid,
            firstName: firstName,
            lastName: lastName,
            displayName: displayName,
            studentId: profile?.studentId || null,
            email: user.email || '',
            photoURL: user.photoURL || '',
            house: localStorage.getItem('hexworth_house') || null,
            callsign: profile?.callsign || null,
            joinedAt: serverTimestamp()
        });

        console.log(`[ClassManager] Joined class: ${cls.id} (${cls.classCode})`);

        return {
            classId: cls.id,
            className: cls.name,
            classCode: cls.classCode
        };
    }

    /**
     * Leave a class — removes UID from memberUids and deletes member profile
     * @param {string} classId - Firestore document ID
     * @returns {Promise<boolean>}
     */
    async function leaveClass(classId) {
        if (!initialized) await init();
        if (!db) throw new Error('Database not available');

        const user = FirebaseAuth.getUser();
        if (!user) throw new Error('Not authenticated');

        const {
            doc, getDoc, updateDoc, deleteDoc, arrayRemove, increment, serverTimestamp
        } = window.firebaseFirestore;

        // Verify user is a member
        const classRef = doc(db, COLLECTION, classId);
        const snapshot = await getDoc(classRef);
        if (!snapshot.exists()) throw new Error('Class not found');

        const cls = snapshot.data();
        if (!(cls.memberUids || []).includes(user.uid)) {
            throw new Error('You are not a member of this class.');
        }

        // Remove from memberUids, decrement memberCount
        await updateDoc(classRef, {
            memberUids: arrayRemove(user.uid),
            memberCount: increment(-1),
            updatedAt: serverTimestamp()
        });

        // Delete member profile
        const memberRef = doc(db, COLLECTION, classId, 'members', user.uid);
        await deleteDoc(memberRef);

        console.log(`[ClassManager] Left class: ${classId}`);
        return true;
    }

    /**
     * Get all active classes a student is enrolled in
     * @param {string} studentUid - Firebase UID
     * @returns {Promise<Array>} Array of class objects sorted by name
     */
    async function getStudentClasses(studentUid) {
        if (!initialized) await init();
        if (!db) return [];

        try {
            const { collection: colRef, query, where, getDocs } = window.firebaseFirestore;

            const q = query(
                colRef(db, COLLECTION),
                where('memberUids', 'array-contains', studentUid)
            );

            const snapshot = await getDocs(q);
            const classes = [];

            snapshot.forEach(d => {
                const data = d.data();
                if (data.isActive !== false) {
                    classes.push({ id: d.id, ...data });
                }
            });

            // Sort alphabetically by name
            classes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            return classes;
        } catch (error) {
            console.error('[ClassManager] Failed to get student classes:', error);
            return [];
        }
    }

    /**
     * Get all members of a class from the members subcollection
     * @param {string} classId - Firestore document ID
     * @returns {Promise<Array>} Array of member profiles sorted by displayName
     */
    async function getClassMembers(classId) {
        if (!initialized) await init();
        if (!db) return [];

        try {
            const { collection: colRef, getDocs } = window.firebaseFirestore;

            const membersRef = colRef(db, COLLECTION, classId, 'members');
            const snapshot = await getDocs(membersRef);
            const members = [];

            snapshot.forEach(d => {
                members.push({ id: d.id, ...d.data() });
            });

            // Sort by displayName
            members.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));

            return members;
        } catch (error) {
            console.error('[ClassManager] Failed to get class members:', error);
            return [];
        }
    }

    /**
     * Remove a student from a class (handler only)
     * @param {string} classId - Firestore document ID
     * @param {string} studentUid - Student's Firebase UID
     * @returns {Promise<boolean>}
     */
    async function removeStudentFromClass(classId, studentUid) {
        if (!initialized) await init();
        if (!db) throw new Error('Database not available');

        const user = FirebaseAuth.getUser();
        if (!user) throw new Error('Not authenticated');

        const {
            doc, getDoc, updateDoc, deleteDoc, arrayRemove, increment, serverTimestamp
        } = window.firebaseFirestore;

        // Verify handler ownership
        const classRef = doc(db, COLLECTION, classId);
        const snapshot = await getDoc(classRef);
        if (!snapshot.exists()) throw new Error('Class not found');

        const cls = snapshot.data();
        if (cls.handlerUid !== user.uid) {
            throw new Error('Only the class handler can remove students.');
        }

        // Remove from memberUids, decrement memberCount
        await updateDoc(classRef, {
            memberUids: arrayRemove(studentUid),
            memberCount: increment(-1),
            updatedAt: serverTimestamp()
        });

        // Delete member profile
        const memberRef = doc(db, COLLECTION, classId, 'members', studentUid);
        await deleteDoc(memberRef);

        console.log(`[ClassManager] Removed student ${studentUid} from class ${classId}`);
        return true;
    }

    /**
     * Helper: get user's Firestore profile (callsign, etc.)
     * @private
     */
    async function _getUserProfile() {
        try {
            const user = FirebaseAuth.getUser();
            if (!user) return null;

            const { doc, getDoc } = window.firebaseFirestore;
            const profileRef = doc(db, 'users', user.uid);
            const snap = await getDoc(profileRef);
            return snap.exists() ? snap.data() : null;
        } catch {
            return null;
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
        deleteClass,
        joinClass,
        leaveClass,
        getStudentClasses,
        getClassMembers,
        removeStudentFromClass
    };

})();
