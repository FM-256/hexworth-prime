/**
 * FirebaseAuth.js - Firebase Authentication Manager
 *
 * QC-4: Server-side admin verification via Firebase Auth custom claims.
 * Handles Google sign-in, admin claims, and Cloud Function invocation.
 * Persists auth state to localStorage for file:// protocol compatibility.
 */

const FirebaseAuth = (function() {
    'use strict';

    // Firebase SDK instances
    let app = null;
    let auth = null;
    let functions = null;
    let initialized = false;

    // Configuration
    const config = {
        firebase: {
            apiKey: "AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M",
            authDomain: "hexworth-prime.firebaseapp.com",
            projectId: "hexworth-prime",
            storageBucket: "hexworth-prime.firebasestorage.app",
            messagingSenderId: "11726236962",
            appId: "1:11726236962:web:1829ea0839f2587121497b",
            measurementId: "G-YK193VC8S9"
        },
        // Client-side fallback — real authority is the Cloud Function ADMIN_EMAILS list
        adminEmails: [
            'f.mora80@gmail.com',
            'jorden@hexworth.com'
        ],
        storageKeys: {
            user: 'hexworth_firebase_user',
            isAdmin: 'hexworth_firebase_admin'
        }
    };

    // Current user state
    let currentUser = null;
    let isAdmin = false;
    let _authReady = false;
    let _authReadyResolve = null;
    const _authReadyPromise = new Promise(resolve => { _authReadyResolve = resolve; });

    /**
     * Load Firebase SDK dynamically (App + Auth + Functions + App Check)
     */
    async function loadFirebaseSDK() {
        if (window.firebaseApp && window.firebaseAuth) {
            return true;
        }

        try {
            const modules = await Promise.all([
                import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js'),
                import('https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js'),
                import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app-check.js')
            ]);

            window.firebaseApp = modules[0];
            window.firebaseAuth = modules[1];
            window.firebaseFunctions = modules[2];
            window.firebaseAppCheck = modules[3];
            return true;
        } catch (error) {
            console.error('[FirebaseAuth] Failed to load Firebase SDK:', error);
            return false;
        }
    }

    /**
     * Initialize Firebase
     */
    async function init() {
        if (initialized) return true;

        // Load SDK
        const sdkLoaded = await loadFirebaseSDK();
        if (!sdkLoaded) {
            console.warn('[FirebaseAuth] Running without Firebase - using cached state only');
            loadCachedState();
            return false;
        }

        try {
            // Initialize Firebase app
            const { initializeApp, getApps } = window.firebaseApp;
            if (getApps().length === 0) {
                app = initializeApp(config.firebase);
            } else {
                app = getApps()[0];
            }

            // Initialize App Check (HTTPS only — skip on file:// and skip if no real key)
            const RECAPTCHA_KEY = 'RECAPTCHA_SITE_KEY_PLACEHOLDER';
            if (window.firebaseAppCheck && window.location.protocol === 'https:'
                && RECAPTCHA_KEY !== 'RECAPTCHA_SITE_KEY' + '_PLACEHOLDER') {
                try {
                    const { initializeAppCheck, ReCaptchaV3Provider } = window.firebaseAppCheck;
                    initializeAppCheck(app, {
                        provider: new ReCaptchaV3Provider(RECAPTCHA_KEY),
                        isTokenAutoRefreshEnabled: true
                    });
                    console.log('[FirebaseAuth] App Check initialized');
                } catch (e) {
                    console.warn('[FirebaseAuth] App Check initialization failed:', e);
                }
            }

            // Initialize Auth
            const { getAuth, onAuthStateChanged } = window.firebaseAuth;
            auth = getAuth(app);

            // Initialize Functions (QC-4)
            if (window.firebaseFunctions) {
                const { getFunctions } = window.firebaseFunctions;
                functions = getFunctions(app, 'us-central1');
            }

            // Listen for auth state changes
            onAuthStateChanged(auth, handleAuthStateChange);

            initialized = true;
            console.log('[FirebaseAuth] Initialized (Auth + Functions)');
            return true;
        } catch (error) {
            console.error('[FirebaseAuth] Initialization failed:', error);
            loadCachedState();
            return false;
        }
    }

    /**
     * Wait for auth state to be resolved (first onAuthStateChanged callback).
     * Returns the current user or null.
     */
    async function waitForAuth() {
        if (!initialized) await init();
        if (_authReady) return currentUser;
        await _authReadyPromise;
        return currentUser;
    }

    /**
     * Handle auth state changes
     */
    async function handleAuthStateChange(user) {
        if (user) {
            currentUser = {
                uid: user.uid,
                email: user.email || null,
                displayName: user.displayName || null,
                photoURL: user.photoURL || null,
                isAnonymous: user.isAnonymous || false,
                deviceId: getOrCreateDeviceId()
            };

            // QC-4: Read admin from custom claims (set by setAdminClaim Cloud Function)
            try {
                const tokenResult = await user.getIdTokenResult();
                isAdmin = tokenResult.claims.admin === true;
            } catch (e) {
                isAdmin = false;
            }
            // Email allowlist fallback (covers period before Cloud Function sets claims)
            if (!isAdmin && user.email) {
                isAdmin = config.adminEmails.includes(user.email.toLowerCase());
            }

            // Cache to localStorage for file:// persistence and sync AccessGuard checks
            localStorage.setItem(config.storageKeys.user, JSON.stringify(currentUser));
            localStorage.setItem(config.storageKeys.isAdmin, isAdmin.toString());

            console.log(`[FirebaseAuth] Signed in: ${user.email || 'anonymous:' + user.uid} (Admin: ${isAdmin})`);

            // Initialize Firestore profile and migrate localStorage data
            let firestoreResult = null;
            if (typeof FirestoreManager !== 'undefined') {
                try {
                    firestoreResult = await FirestoreManager.initializeNewUser(user);
                    console.log('[FirebaseAuth] Firestore profile ready:', firestoreResult);
                } catch (error) {
                    console.warn('[FirebaseAuth] Firestore initialization failed:', error);
                }
            }

            // Dispatch event with Firestore data
            window.dispatchEvent(new CustomEvent('firebaseAuthStateChanged', {
                detail: {
                    user: currentUser,
                    isAdmin,
                    firestoreProfile: firestoreResult?.profile || null,
                    needsCallsign: firestoreResult?.needsCallsign || false,
                    migration: firestoreResult?.migration || null
                }
            }));
        } else {
            currentUser = null;
            isAdmin = false;
            localStorage.removeItem(config.storageKeys.user);
            localStorage.removeItem(config.storageKeys.isAdmin);

            console.log('[FirebaseAuth] Signed out');

            // Dispatch event for sign out
            window.dispatchEvent(new CustomEvent('firebaseAuthStateChanged', {
                detail: { user: null, isAdmin: false }
            }));
        }

        // Mark auth as ready (resolves waitForAuth promise)
        if (!_authReady) {
            _authReady = true;
            _authReadyResolve();
        }
    }

    /**
     * Load cached auth state from localStorage
     * Used when Firebase SDK can't load (offline/file:// issues)
     */
    function loadCachedState() {
        try {
            const cachedUser = localStorage.getItem(config.storageKeys.user);
            const cachedAdmin = localStorage.getItem(config.storageKeys.isAdmin);

            if (cachedUser) {
                currentUser = JSON.parse(cachedUser);
                isAdmin = cachedAdmin === 'true';
                console.log('[FirebaseAuth] Loaded cached state:', currentUser.email);
            }
        } catch (e) {
            console.warn('[FirebaseAuth] Failed to load cached state');
        }
    }

    // ─── QC-4: Cloud Function & Claims API ──────────────────────────

    /**
     * Call a Cloud Function by name.
     * @param {string} name - Function name (e.g., 'setAdminClaim', 'completeGate', 'validateFlag')
     * @param {Object} data - Data to pass to the function
     * @returns {Promise<Object>} Function result
     */
    async function callFunction(name, data) {
        if (!functions) {
            throw new Error('Firebase Functions not initialized');
        }
        const { httpsCallable } = window.firebaseFunctions;
        const fn = httpsCallable(functions, name);
        return fn(data || {});
    }

    /**
     * Get custom claims from the current user's ID token.
     * Claims are embedded in the JWT — this is a local decode, not a network call
     * (unless the token is expired and needs refresh).
     * @returns {Promise<Object>} Claims object or empty object
     */
    async function getCustomClaims() {
        if (!auth || !auth.currentUser) return {};
        try {
            const tokenResult = await auth.currentUser.getIdTokenResult();
            return tokenResult.claims || {};
        } catch (e) {
            return {};
        }
    }

    /**
     * Force refresh the ID token (needed after claims change).
     * @returns {Promise<string|null>} New ID token or null
     */
    async function refreshToken() {
        if (!auth || !auth.currentUser) return null;
        return auth.currentUser.getIdToken(true);
    }

    // ─── Sign In / Sign Out ─────────────────────────────────────────

    /**
     * Sign in with Google — also sets admin claims via Cloud Function (QC-4)
     */
    async function signInWithGoogle() {
        if (!initialized || !auth) {
            await init();
        }

        if (!auth) {
            console.error('[FirebaseAuth] Auth not available');
            alert('Authentication not available. Please check your internet connection.');
            return null;
        }

        try {
            const { GoogleAuthProvider, signInWithPopup } = window.firebaseAuth;
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // QC-4: Set admin claims via Cloud Function after explicit sign-in
            if (functions && !result.user.isAnonymous) {
                try {
                    const claimResult = await callFunction('setAdminClaim');
                    // Force token refresh so claims are available immediately
                    await result.user.getIdToken(true);

                    isAdmin = claimResult.data.admin === true;
                    localStorage.setItem(config.storageKeys.isAdmin, isAdmin.toString());

                    // Re-dispatch auth event so UI picks up updated admin status
                    window.dispatchEvent(new CustomEvent('firebaseAuthStateChanged', {
                        detail: { user: currentUser, isAdmin }
                    }));
                    window.dispatchEvent(new CustomEvent('firebaseAdminVerified', {
                        detail: { admin: isAdmin }
                    }));

                    console.log('[FirebaseAuth] Admin claims set via Cloud Function:', isAdmin);
                } catch (e) {
                    console.warn('[FirebaseAuth] setAdminClaim failed (using email fallback):', e);
                }
            }

            return result.user;
        } catch (error) {
            console.error('[FirebaseAuth] Sign in failed:', error);

            if (error.code === 'auth/popup-blocked') {
                alert('Popup was blocked. Please allow popups for this site.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // User cancelled, no alert needed
            } else {
                alert('Sign in failed: ' + error.message);
            }
            return null;
        }
    }

    /**
     * Sign out
     */
    async function signOut() {
        if (!auth) {
            // Clear local state anyway
            currentUser = null;
            isAdmin = false;
            localStorage.removeItem(config.storageKeys.user);
            localStorage.removeItem(config.storageKeys.isAdmin);
            window.dispatchEvent(new CustomEvent('firebaseAuthStateChanged', {
                detail: { user: null, isAdmin: false }
            }));
            return;
        }

        try {
            const { signOut: firebaseSignOut } = window.firebaseAuth;
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('[FirebaseAuth] Sign out failed:', error);
        }
    }

    /**
     * Get current user
     */
    function getUser() {
        return currentUser;
    }

    /**
     * Check if current user is admin
     */
    function checkIsAdmin() {
        return isAdmin;
    }

    /**
     * Check if user is signed in
     */
    function isSignedIn() {
        return currentUser !== null;
    }

    /**
     * Add an admin email (runtime only - doesn't persist to config)
     */
    function addAdminEmail(email) {
        if (!config.adminEmails.includes(email.toLowerCase())) {
            config.adminEmails.push(email.toLowerCase());
        }
        // Re-check current user
        if (currentUser && currentUser.email) {
            isAdmin = config.adminEmails.includes(currentUser.email.toLowerCase());
            localStorage.setItem(config.storageKeys.isAdmin, isAdmin.toString());
        }
    }

    /**
     * Remove an admin email (runtime only)
     */
    function removeAdminEmail(email) {
        const index = config.adminEmails.indexOf(email.toLowerCase());
        if (index > -1) {
            config.adminEmails.splice(index, 1);
        }
        // Re-check current user
        if (currentUser && currentUser.email) {
            isAdmin = config.adminEmails.includes(currentUser.email.toLowerCase());
            localStorage.setItem(config.storageKeys.isAdmin, isAdmin.toString());
        }
    }

    /**
     * Sign in anonymously (for students joining a class without Google)
     */
    async function signInAnonymously() {
        if (!initialized || !auth) {
            await init();
        }

        if (!auth) {
            console.error('[FirebaseAuth] Auth not available');
            throw new Error('Authentication not available. Please check your internet connection.');
        }

        try {
            const { signInAnonymously: firebaseSignInAnon } = window.firebaseAuth;
            const result = await firebaseSignInAnon(auth);
            console.log('[FirebaseAuth] Anonymous sign-in successful:', result.user.uid);
            return result.user;
        } catch (error) {
            console.error('[FirebaseAuth] Anonymous sign-in failed:', error);
            throw error;
        }
    }

    /**
     * Create account with email and password
     */
    async function createAccountWithEmail(email, password) {
        if (!initialized || !auth) {
            await init();
        }

        if (!auth) {
            throw new Error('Authentication not available. Please check your internet connection.');
        }

        try {
            const { createUserWithEmailAndPassword } = window.firebaseAuth;
            if (typeof createUserWithEmailAndPassword !== 'function') {
                console.error('[FirebaseAuth] createUserWithEmailAndPassword not found in SDK. Available exports:', Object.keys(window.firebaseAuth).filter(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('create') || k.toLowerCase().includes('password')));
                throw { code: 'auth/operation-not-allowed', message: 'Email auth function not available in this SDK version.' };
            }
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // QC-4: Set admin claims
            if (functions && !result.user.isAnonymous) {
                try {
                    const claimResult = await callFunction('setAdminClaim');
                    await result.user.getIdToken(true);
                    isAdmin = claimResult.data.admin === true;
                    localStorage.setItem(config.storageKeys.isAdmin, isAdmin.toString());

                    // Re-dispatch auth event so UI picks up updated admin status
                    window.dispatchEvent(new CustomEvent('firebaseAuthStateChanged', {
                        detail: { user: currentUser, isAdmin }
                    }));
                    window.dispatchEvent(new CustomEvent('firebaseAdminVerified', {
                        detail: { admin: isAdmin }
                    }));
                } catch (e) {
                    console.warn('[FirebaseAuth] setAdminClaim failed:', e);
                }
            }

            console.log('[FirebaseAuth] Email account created:', result.user.uid);
            return result.user;
        } catch (error) {
            console.error('[FirebaseAuth] Email account creation failed:', error);
            throw error;
        }
    }

    /**
     * Sign in with email and password
     */
    async function signInWithEmail(email, password) {
        if (!initialized || !auth) {
            await init();
        }

        if (!auth) {
            throw new Error('Authentication not available. Please check your internet connection.');
        }

        try {
            const { signInWithEmailAndPassword } = window.firebaseAuth;
            if (typeof signInWithEmailAndPassword !== 'function') {
                console.error('[FirebaseAuth] signInWithEmailAndPassword not found in SDK. Available exports:', Object.keys(window.firebaseAuth).filter(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('sign') || k.toLowerCase().includes('password')));
                throw { code: 'auth/operation-not-allowed', message: 'Email auth function not available in this SDK version.' };
            }
            const result = await signInWithEmailAndPassword(auth, email, password);

            // QC-4: Set admin claims
            if (functions && !result.user.isAnonymous) {
                try {
                    const claimResult = await callFunction('setAdminClaim');
                    await result.user.getIdToken(true);
                    isAdmin = claimResult.data.admin === true;
                    localStorage.setItem(config.storageKeys.isAdmin, isAdmin.toString());

                    // Re-dispatch auth event so UI picks up updated admin status
                    window.dispatchEvent(new CustomEvent('firebaseAuthStateChanged', {
                        detail: { user: currentUser, isAdmin }
                    }));
                    window.dispatchEvent(new CustomEvent('firebaseAdminVerified', {
                        detail: { admin: isAdmin }
                    }));
                } catch (e) {
                    console.warn('[FirebaseAuth] setAdminClaim failed:', e);
                }
            }

            return result.user;
        } catch (error) {
            console.error('[FirebaseAuth] Email sign-in failed:', error);
            throw error;
        }
    }

    /**
     * Send password reset email
     */
    async function sendPasswordReset(email) {
        if (!initialized || !auth) {
            await init();
        }

        if (!auth) {
            throw new Error('Authentication not available.');
        }

        try {
            const { sendPasswordResetEmail } = window.firebaseAuth;
            await sendPasswordResetEmail(auth, email);
            console.log('[FirebaseAuth] Password reset email sent to:', email);
        } catch (error) {
            console.error('[FirebaseAuth] Password reset failed:', error);
            throw error;
        }
    }

    /**
     * Link anonymous account with Google (claim flow)
     * Preserves the same uid so Firestore data stays intact
     */
    async function linkWithGoogle() {
        if (!auth || !auth.currentUser) {
            throw new Error('No current user to link');
        }

        try {
            const { GoogleAuthProvider, linkWithPopup, signInWithCredential } = window.firebaseAuth;
            const provider = new GoogleAuthProvider();
            const result = await linkWithPopup(auth.currentUser, provider);
            console.log('[FirebaseAuth] Account linked successfully:', result.user.email);

            // QC-4: Set admin claims for newly linked Google account
            if (functions) {
                try {
                    const claimResult = await callFunction('setAdminClaim');
                    await result.user.getIdToken(true);
                    isAdmin = claimResult.data.admin === true;
                    localStorage.setItem(config.storageKeys.isAdmin, isAdmin.toString());
                } catch (e) {
                    console.warn('[FirebaseAuth] setAdminClaim after link failed:', e);
                }
            }

            return result.user;
        } catch (error) {
            // If Google account already exists, sign in with that credential instead
            if (error.code === 'auth/credential-already-in-use') {
                console.warn('[FirebaseAuth] Credential already in use, signing in with existing account');
                try {
                    const { signInWithCredential } = window.firebaseAuth;
                    const result = await signInWithCredential(auth, error.credential);
                    return result.user;
                } catch (fallbackError) {
                    console.error('[FirebaseAuth] Fallback sign-in failed:', fallbackError);
                    throw fallbackError;
                }
            }

            if (error.code === 'auth/popup-blocked') {
                throw new Error('Popup was blocked. Please allow popups for this site.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                return null; // User cancelled
            }

            throw error;
        }
    }

    /**
     * Check if current user is anonymous
     */
    function checkIsAnonymous() {
        return currentUser?.isAnonymous === true;
    }

    /**
     * Get or create a stable device ID (UUID v4)
     * Used for UID recovery and duplicate detection in classroom scenarios.
     * Same lifetime as localStorage — if wiped, both progress and deviceId reset together.
     */
    function getOrCreateDeviceId() {
        const STORAGE_KEY = 'hexworth_device_id';
        let deviceId = localStorage.getItem(STORAGE_KEY);
        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem(STORAGE_KEY, deviceId);
            console.log('[FirebaseAuth] Generated new device ID:', deviceId);
        }
        return deviceId;
    }

    // Public API
    return {
        init,
        waitForAuth,
        signInWithGoogle,
        signInWithEmail,
        createAccountWithEmail,
        sendPasswordReset,
        signInAnonymously,
        linkWithGoogle,
        signOut,
        getUser,
        isAdmin: checkIsAdmin,
        isAnonymous: checkIsAnonymous,
        isSignedIn,
        addAdminEmail,
        removeAdminEmail,
        getOrCreateDeviceId,
        // QC-4: Server-side verification
        callFunction,
        getCustomClaims,
        refreshToken
    };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    FirebaseAuth.init();
});
