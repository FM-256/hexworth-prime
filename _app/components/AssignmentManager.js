/**
 * AssignmentManager.js - Content Assignment Management for Hexworth Prime
 *
 * Handles assignment CRUD operations for Handler (instructor) accounts:
 * - Create assignments (learning paths or individual items)
 * - List assignments for a class
 * - Update assignment metadata (due date, notes)
 * - Soft-delete assignments
 *
 * Firestore Subcollection: classes/{classId}/assignments/{autoId}
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - FirestoreManager (components/FirestoreManager.js)
 *   - window.firebaseFirestore
 *
 * @version 1.0.0
 */

const AssignmentManager = (function() {
    'use strict';

    let initialized = false;
    let db = null;

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
            initialized = true;
            console.log('[AssignmentManager] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[AssignmentManager] Initialization failed:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // OWNERSHIP VERIFICATION
    // ═══════════════════════════════════════════════════════════════

    async function verifyOwnership(classId) {
        const { doc, getDoc } = window.firebaseFirestore;
        const user = FirebaseAuth.getUser();
        if (!user) throw new Error('Not authenticated');

        const classRef = doc(db, 'classes', classId);
        const snapshot = await getDoc(classRef);

        if (!snapshot.exists()) throw new Error('Class not found');
        if (snapshot.data().handlerUid !== user.uid) {
            throw new Error('Not authorized to manage this class');
        }

        return user;
    }

    // ═══════════════════════════════════════════════════════════════
    // CRUD OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create a new assignment in a class
     * @param {string} classId - Parent class Firestore ID
     * @param {Object} params - Assignment data
     * @returns {Promise<string>} Assignment document ID
     */
    async function createAssignment(classId, {
        assignmentType,
        contentId,
        title,
        description = '',
        house = '',
        contentType = null,
        difficulty = null,
        moduleCount = 1,
        dueDate = null,
        notes = ''
    }) {
        if (!initialized) await init();
        if (!db) throw new Error('Database not available');

        const user = await verifyOwnership(classId);

        // Validate
        if (!assignmentType || !['path', 'item'].includes(assignmentType)) {
            throw new Error('Invalid assignment type');
        }
        if (!contentId || !title) {
            throw new Error('Content ID and title are required');
        }
        if (notes && notes.length > 500) {
            throw new Error('Notes must be 500 characters or less');
        }

        const { collection: colRef, addDoc, serverTimestamp, Timestamp } = window.firebaseFirestore;

        const assignmentData = {
            assignmentType,
            contentId,
            title: title.trim(),
            description: (description || '').trim(),
            house,
            contentType: assignmentType === 'item' ? contentType : null,
            difficulty: assignmentType === 'item' ? difficulty : null,
            moduleCount: moduleCount || 1,
            dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
            notes: (notes || '').trim(),
            handlerUid: user.uid,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(
            colRef(db, 'classes', classId, 'assignments'),
            assignmentData
        );

        console.log(`[AssignmentManager] Assignment created: ${docRef.id} in class ${classId}`);
        return docRef.id;
    }

    /**
     * Get all active assignments for a class, newest first
     * @param {string} classId - Parent class Firestore ID
     * @returns {Promise<Array>} Array of assignment objects
     */
    async function getClassAssignments(classId) {
        if (!initialized) await init();
        if (!db) return [];

        try {
            const { collection: colRef, getDocs } = window.firebaseFirestore;

            const snapshot = await getDocs(
                colRef(db, 'classes', classId, 'assignments')
            );

            const assignments = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.isActive !== false) {
                    assignments.push({ id: doc.id, ...data });
                }
            });

            // Sort newest first
            assignments.sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });

            return assignments;
        } catch (error) {
            console.error('[AssignmentManager] Failed to get assignments:', error);
            return [];
        }
    }

    /**
     * Soft-delete an assignment (sets isActive: false)
     * @param {string} classId - Parent class Firestore ID
     * @param {string} assignmentId - Assignment document ID
     * @returns {Promise<boolean>}
     */
    async function deleteAssignment(classId, assignmentId) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            await verifyOwnership(classId);

            const { doc, updateDoc, serverTimestamp } = window.firebaseFirestore;

            const assignmentRef = doc(db, 'classes', classId, 'assignments', assignmentId);
            await updateDoc(assignmentRef, {
                isActive: false,
                updatedAt: serverTimestamp()
            });

            console.log(`[AssignmentManager] Assignment soft-deleted: ${assignmentId}`);
            return true;
        } catch (error) {
            console.error('[AssignmentManager] Failed to delete assignment:', error);
            throw error;
        }
    }

    /**
     * Update assignment metadata (due date, notes)
     * @param {string} classId - Parent class Firestore ID
     * @param {string} assignmentId - Assignment document ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<boolean>}
     */
    async function updateAssignment(classId, assignmentId, updates) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            await verifyOwnership(classId);

            const { doc, updateDoc, serverTimestamp, Timestamp } = window.firebaseFirestore;

            const safeUpdates = {};

            if (updates.dueDate !== undefined) {
                safeUpdates.dueDate = updates.dueDate
                    ? Timestamp.fromDate(new Date(updates.dueDate))
                    : null;
            }

            if (updates.notes !== undefined) {
                const notes = (updates.notes || '').trim();
                if (notes.length > 500) {
                    throw new Error('Notes must be 500 characters or less');
                }
                safeUpdates.notes = notes;
            }

            safeUpdates.updatedAt = serverTimestamp();

            const assignmentRef = doc(db, 'classes', classId, 'assignments', assignmentId);
            await updateDoc(assignmentRef, safeUpdates);

            console.log(`[AssignmentManager] Assignment updated: ${assignmentId}`);
            return true;
        } catch (error) {
            console.error('[AssignmentManager] Failed to update assignment:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PROGRESS TRACKING
    // ═══════════════════════════════════════════════════════════════

    /**
     * Submit student progress for a specific content item within a class
     * @param {string} classId - Parent class Firestore ID
     * @param {string} contentId - Content identifier (e.g. 'aplus-core1-ch05')
     * @param {Object} progressData - { completed, score, completedAt }
     */
    async function submitProgress(classId, contentId, progressData) {
        if (!initialized) await init();
        if (!db) throw new Error('Database not available');

        const user = FirebaseAuth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { doc, setDoc, serverTimestamp } = window.firebaseFirestore;

        const progressRef = doc(db, 'classes', classId, 'progress', user.uid);
        await setDoc(progressRef, {
            uid: user.uid,
            displayName: user.displayName || user.email || 'Unknown',
            [`completions.${contentId}`]: {
                completed: progressData.completed || false,
                score: progressData.score || null,
                completedAt: progressData.completedAt || new Date().toISOString()
            },
            updatedAt: serverTimestamp()
        }, { merge: true });
    }

    /**
     * Get all student progress documents for a class
     * @param {string} classId - Parent class Firestore ID
     * @returns {Promise<Array>} Array of student progress objects
     */
    async function getClassProgress(classId) {
        if (!initialized) await init();
        if (!db) return [];

        const { collection: colRef, getDocs } = window.firebaseFirestore;
        const snapshot = await getDocs(colRef(db, 'classes', classId, 'progress'));

        const progress = [];
        snapshot.forEach(doc => {
            progress.push({ id: doc.id, ...doc.data() });
        });
        return progress;
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        init,
        createAssignment,
        getClassAssignments,
        deleteAssignment,
        updateAssignment,
        submitProgress,
        getClassProgress
    };

})();
