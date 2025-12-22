/**
 * FirebaseAuth.js - Firebase Authentication Manager
 *
 * Handles Google sign-in and admin access control.
 * Persists auth state to localStorage for file:// protocol compatibility.
 */

const FirebaseAuth = (function() {
    'use strict';

    // Firebase SDK imports will be loaded dynamically
    let app = null;
    let auth = null;
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
        adminEmails: [
            'f.mora80@gmail.com'
        ],
        storageKeys: {
            user: 'hexworth_firebase_user',
            isAdmin: 'hexworth_firebase_admin'
        }
    };

    // Current user state
    let currentUser = null;
    let isAdmin = false;

    /**
     * Load Firebase SDK dynamically
     */
    async function loadFirebaseSDK() {
        if (window.firebaseApp && window.firebaseAuth) {
            return true;
        }

        try {
            // Import Firebase modules
            const [appModule, authModule] = await Promise.all([
                import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js')
            ]);

            window.firebaseApp = appModule;
            window.firebaseAuth = authModule;
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

            // Check if already initialized
            if (getApps().length === 0) {
                app = initializeApp(config.firebase);
            } else {
                app = getApps()[0];
            }

            // Initialize Auth
            const { getAuth, onAuthStateChanged } = window.firebaseAuth;
            auth = getAuth(app);

            // Listen for auth state changes
            onAuthStateChanged(auth, handleAuthStateChange);

            initialized = true;
            console.log('[FirebaseAuth] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[FirebaseAuth] Initialization failed:', error);
            loadCachedState();
            return false;
        }
    }

    /**
     * Handle auth state changes
     */
    function handleAuthStateChange(user) {
        if (user) {
            currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            };
            isAdmin = config.adminEmails.includes(user.email.toLowerCase());

            // Cache to localStorage for file:// persistence
            localStorage.setItem(config.storageKeys.user, JSON.stringify(currentUser));
            localStorage.setItem(config.storageKeys.isAdmin, isAdmin.toString());

            console.log(`[FirebaseAuth] Signed in: ${user.email} (Admin: ${isAdmin})`);
        } else {
            currentUser = null;
            isAdmin = false;
            localStorage.removeItem(config.storageKeys.user);
            localStorage.removeItem(config.storageKeys.isAdmin);

            console.log('[FirebaseAuth] Signed out');
        }

        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('firebaseAuthStateChanged', {
            detail: { user: currentUser, isAdmin }
        }));
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

    /**
     * Sign in with Google
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

    // Public API
    return {
        init,
        signInWithGoogle,
        signOut,
        getUser,
        isAdmin: checkIsAdmin,
        isSignedIn,
        addAdminEmail,
        removeAdminEmail
    };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    FirebaseAuth.init();
});
