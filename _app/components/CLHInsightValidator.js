/**
 * CLHInsightValidator — Server-side CLH insight phase validation
 *
 * Replaces client-side acceptedAnswers comparison with a Cloud Function call.
 * Each CLH lab/applet calls CLHInsightValidator.submit() instead of doing
 * local string matching against plaintext answers.
 *
 * Requires: FirebaseAuth.js loaded first (for callFunction)
 */
const CLHInsightValidator = {

    /**
     * Submit an insight answer for server-side validation.
     * @param {string} moduleId - CLH module ID (e.g., 'CLH-005')
     * @param {string} userAnswer - Student's trimmed answer text
     * @returns {Promise<{success: boolean, feedback: string}>}
     */
    async submit(moduleId, userAnswer) {
        if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.callFunction) {
            return { success: false, feedback: 'Sign in required to submit answers.' };
        }

        const result = await FirebaseAuth.callFunction('validateChallenge', {
            challengeId: 'clh-insight',
            levelId: moduleId,
            userInput: userAnswer
        });

        const data = result.data || result;
        return {
            success: data.success,
            feedback: data.feedback || ''
        };
    }
};
