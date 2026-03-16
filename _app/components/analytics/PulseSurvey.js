/**
 * PulseSurvey.js - Quick Survey System for Handler Dashboard
 *
 * Enables handlers to create short pulse surveys (max 5 questions)
 * and collect student responses. Supports multiple choice and 1-5 scale.
 *
 * API:
 *   PulseSurvey.createSurvey(classId, questions)
 *   PulseSurvey.submitResponse(surveyId, answers)
 *   PulseSurvey.getResults(surveyId)
 *   PulseSurvey.getActiveSurveys(classId)
 *   PulseSurvey.closeSurvey(surveyId)
 *   PulseSurvey.TEMPLATES
 *
 * Firestore Collections:
 *   surveys/{surveyId}              - survey definition
 *   surveys/{surveyId}/responses/{uid} - individual responses
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - FirestoreManager (components/FirestoreManager.js)
 *
 * @version 1.0.0
 */
const PulseSurvey = (function() {
    'use strict';

    // =====================================================================
    // STATE
    // =====================================================================

    let db = null;
    let initialized = false;

    const MAX_QUESTIONS = 5;
    const COLLECTION = 'surveys';

    // Question types
    const QUESTION_TYPES = {
        MULTIPLE_CHOICE: 'multiple_choice',
        SCALE: 'scale'   // 1-5
    };

    // Pre-built question templates
    const TEMPLATES = {
        satisfaction: {
            name: 'Course Satisfaction',
            questions: [
                {
                    text: 'How satisfied are you with the course material so far?',
                    type: 'scale',
                    scaleLabels: { 1: 'Very Unsatisfied', 5: 'Very Satisfied' }
                },
                {
                    text: 'How clear are the instructions and explanations?',
                    type: 'scale',
                    scaleLabels: { 1: 'Very Unclear', 5: 'Very Clear' }
                },
                {
                    text: 'Would you recommend this course to a peer?',
                    type: 'multiple_choice',
                    options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not']
                }
            ]
        },
        difficulty: {
            name: 'Difficulty Check',
            questions: [
                {
                    text: 'How would you rate the difficulty of recent assignments?',
                    type: 'scale',
                    scaleLabels: { 1: 'Too Easy', 3: 'Just Right', 5: 'Too Hard' }
                },
                {
                    text: 'How confident do you feel about the material covered this week?',
                    type: 'scale',
                    scaleLabels: { 1: 'Not Confident', 5: 'Very Confident' }
                },
                {
                    text: 'Which area needs more explanation?',
                    type: 'multiple_choice',
                    options: ['Labs', 'Presentations', 'Quizzes', 'CTF Boxes', 'Everything is clear']
                }
            ]
        },
        pace: {
            name: 'Pacing Feedback',
            questions: [
                {
                    text: 'How is the pace of the course?',
                    type: 'multiple_choice',
                    options: ['Too fast', 'Slightly fast', 'Just right', 'Slightly slow', 'Too slow']
                },
                {
                    text: 'How much time per week are you spending on coursework outside of class?',
                    type: 'multiple_choice',
                    options: ['Less than 1 hour', '1-3 hours', '3-5 hours', '5-8 hours', 'More than 8 hours']
                },
                {
                    text: 'Do you feel you have enough time to complete assignments?',
                    type: 'scale',
                    scaleLabels: { 1: 'Never enough time', 5: 'Always enough time' }
                }
            ]
        },
        weekly: {
            name: 'Weekly Check-In',
            questions: [
                {
                    text: 'How was this week overall?',
                    type: 'scale',
                    scaleLabels: { 1: 'Rough', 5: 'Great' }
                },
                {
                    text: 'What was the highlight of this week?',
                    type: 'multiple_choice',
                    options: ['A lab exercise', 'A presentation', 'A CTF challenge', 'Group work', 'Nothing stood out']
                }
            ]
        }
    };

    // =====================================================================
    // INITIALIZATION
    // =====================================================================

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
            console.log('[PulseSurvey] Initialized');
            return true;
        } catch (error) {
            console.error('[PulseSurvey] Init failed:', error);
            return false;
        }
    }

    // =====================================================================
    // PUBLIC API
    // =====================================================================

    /**
     * Create a new survey for a class.
     * @param {string} classId - Class identifier
     * @param {Array} questions - Array of question objects
     *   { text, type: 'multiple_choice'|'scale', options?: string[], scaleLabels?: {} }
     * @param {string} title - Optional survey title
     * @returns {string} surveyId
     */
    async function createSurvey(classId, questions, title) {
        if (!db) await init();

        if (!classId) throw new Error('classId is required');
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            throw new Error('At least one question is required');
        }
        if (questions.length > MAX_QUESTIONS) {
            throw new Error('Maximum ' + MAX_QUESTIONS + ' questions per survey');
        }

        // Validate questions
        const validatedQuestions = questions.map((q, i) => {
            if (!q.text) throw new Error('Question ' + (i + 1) + ' is missing text');
            if (!q.type || !Object.values(QUESTION_TYPES).includes(q.type)) {
                throw new Error('Question ' + (i + 1) + ' has invalid type');
            }
            if (q.type === 'multiple_choice' && (!q.options || q.options.length < 2)) {
                throw new Error('Question ' + (i + 1) + ' needs at least 2 options');
            }
            return {
                text: q.text,
                type: q.type,
                options: q.options || null,
                scaleLabels: q.scaleLabels || null
            };
        });

        const { collection, addDoc, Timestamp } = window.firebaseFirestore;

        const currentUser = _getCurrentUser();
        const surveyData = {
            classId,
            title: title || 'Pulse Survey',
            questions: validatedQuestions,
            createdBy: currentUser ? currentUser.uid : 'unknown',
            createdAt: Timestamp.fromDate(new Date()),
            status: 'active',
            responseCount: 0
        };

        const docRef = await addDoc(collection(db, COLLECTION), surveyData);
        console.log('[PulseSurvey] Created survey:', docRef.id);
        return docRef.id;
    }

    /**
     * Submit a student's response to a survey.
     * @param {string} surveyId
     * @param {Array} answers - Array matching question order
     *   For multiple_choice: string (selected option)
     *   For scale: number (1-5)
     */
    async function submitResponse(surveyId, answers) {
        if (!db) await init();

        const { doc, getDoc, setDoc, updateDoc, Timestamp, increment } = window.firebaseFirestore;

        // Get survey to validate
        const surveyRef = doc(db, COLLECTION, surveyId);
        const surveyDoc = await getDoc(surveyRef);

        if (!surveyDoc.exists()) throw new Error('Survey not found');
        const survey = surveyDoc.data();

        if (survey.status !== 'active') throw new Error('Survey is no longer active');
        if (!answers || answers.length !== survey.questions.length) {
            throw new Error('Must answer all ' + survey.questions.length + ' questions');
        }

        // Validate answers
        const validatedAnswers = answers.map((ans, i) => {
            const q = survey.questions[i];
            if (q.type === 'scale') {
                const val = parseInt(ans);
                if (isNaN(val) || val < 1 || val > 5) {
                    throw new Error('Question ' + (i + 1) + ': scale must be 1-5');
                }
                return val;
            }
            if (q.type === 'multiple_choice') {
                if (!q.options.includes(ans)) {
                    throw new Error('Question ' + (i + 1) + ': invalid option');
                }
                return ans;
            }
            return ans;
        });

        const currentUser = _getCurrentUser();
        const uid = currentUser ? currentUser.uid : 'anonymous';

        // Store response (one per user, overwrite allowed)
        const responseRef = doc(db, COLLECTION, surveyId, 'responses', uid);
        await setDoc(responseRef, {
            answers: validatedAnswers,
            submittedAt: Timestamp.fromDate(new Date()),
            uid
        });

        // Increment response count
        await updateDoc(surveyRef, {
            responseCount: increment(1)
        });

        console.log('[PulseSurvey] Response submitted for', surveyId);
    }

    /**
     * Get aggregated results for a survey.
     * Returns { survey, results: [{ question, type, distribution|average }], totalResponses }
     */
    async function getResults(surveyId) {
        if (!db) await init();

        const { doc, getDoc, collection, getDocs } = window.firebaseFirestore;

        // Get survey
        const surveyDoc = await getDoc(doc(db, COLLECTION, surveyId));
        if (!surveyDoc.exists()) throw new Error('Survey not found');
        const survey = surveyDoc.data();

        // Get all responses
        const responsesSnap = await getDocs(collection(db, COLLECTION, surveyId, 'responses'));
        const responses = [];
        responsesSnap.forEach(d => responses.push(d.data()));

        // Aggregate per question
        const results = survey.questions.map((q, i) => {
            const questionResult = {
                text: q.text,
                type: q.type,
                totalAnswers: responses.length
            };

            if (q.type === 'scale') {
                const values = responses.map(r => r.answers[i]).filter(v => typeof v === 'number');
                const sum = values.reduce((s, v) => s + v, 0);
                questionResult.average = values.length > 0 ? Math.round((sum / values.length) * 10) / 10 : 0;
                questionResult.distribution = [0, 0, 0, 0, 0]; // index 0 = score 1
                values.forEach(v => { questionResult.distribution[v - 1]++; });
                questionResult.scaleLabels = q.scaleLabels || null;
            }

            if (q.type === 'multiple_choice') {
                questionResult.distribution = {};
                q.options.forEach(opt => { questionResult.distribution[opt] = 0; });
                responses.forEach(r => {
                    const ans = r.answers[i];
                    if (questionResult.distribution.hasOwnProperty(ans)) {
                        questionResult.distribution[ans]++;
                    }
                });
                questionResult.options = q.options;
            }

            return questionResult;
        });

        return {
            survey: {
                id: surveyId,
                title: survey.title,
                classId: survey.classId,
                status: survey.status,
                createdAt: survey.createdAt
            },
            results,
            totalResponses: responses.length
        };
    }

    /**
     * Get active surveys for a class.
     * Returns array of survey summaries.
     */
    async function getActiveSurveys(classId) {
        if (!db) await init();

        const { collection, query, where, getDocs, orderBy } = window.firebaseFirestore;

        const q = query(
            collection(db, COLLECTION),
            where('classId', '==', classId),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc')
        );

        const snap = await getDocs(q);
        const surveys = [];
        snap.forEach(doc => {
            surveys.push({ id: doc.id, ...doc.data() });
        });

        return surveys;
    }

    /**
     * Get all surveys for a class (including closed).
     */
    async function getAllSurveys(classId) {
        if (!db) await init();

        const { collection, query, where, getDocs, orderBy } = window.firebaseFirestore;

        const q = query(
            collection(db, COLLECTION),
            where('classId', '==', classId),
            orderBy('createdAt', 'desc')
        );

        const snap = await getDocs(q);
        const surveys = [];
        snap.forEach(doc => {
            surveys.push({ id: doc.id, ...doc.data() });
        });

        return surveys;
    }

    /**
     * Close a survey (no more responses).
     */
    async function closeSurvey(surveyId) {
        if (!db) await init();

        const { doc, updateDoc } = window.firebaseFirestore;
        await updateDoc(doc(db, COLLECTION, surveyId), {
            status: 'closed'
        });

        console.log('[PulseSurvey] Survey closed:', surveyId);
    }

    /**
     * Check if a user has already responded to a survey.
     */
    async function hasResponded(surveyId, uid) {
        if (!db) await init();

        const { doc, getDoc } = window.firebaseFirestore;
        const responseDoc = await getDoc(doc(db, COLLECTION, surveyId, 'responses', uid));
        return responseDoc.exists();
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    function _getCurrentUser() {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
            return FirebaseAuth.getUser();
        }
        return null;
    }

    // =====================================================================
    // PUBLIC INTERFACE
    // =====================================================================

    return {
        init,
        createSurvey,
        submitResponse,
        getResults,
        getActiveSurveys,
        getAllSurveys,
        closeSurvey,
        hasResponded,
        TEMPLATES,
        QUESTION_TYPES,
        MAX_QUESTIONS
    };

})();
