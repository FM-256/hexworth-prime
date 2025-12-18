/**
 * Hexworth Prime - Page Transition System
 * Handles smooth fade transitions between pages
 */

const PageTransition = {
    // Duration in milliseconds
    duration: 400,

    /**
     * Initialize the transition system
     * Call this on DOMContentLoaded
     */
    init: function() {
        // Create overlay element if not exists
        if (!document.querySelector('.page-transition-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'page-transition-overlay';

            // Add theme class based on localStorage
            const theme = localStorage.getItem('hexworth_theme');
            if (theme === 'matrix') {
                overlay.classList.add('matrix');
            } else {
                overlay.classList.add('magic');
            }

            document.body.appendChild(overlay);
        }

        // Fade in on page load
        document.body.style.opacity = '0';
        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 0.4s ease';
            document.body.style.opacity = '1';
        });
    },

    /**
     * Navigate to a new page with transition
     * @param {string} url - The URL to navigate to
     * @param {string} [theme] - Optional theme override ('magic' or 'matrix')
     */
    navigateTo: function(url, theme) {
        const overlay = document.querySelector('.page-transition-overlay');
        const currentTheme = theme || localStorage.getItem('hexworth_theme') || 'magic';

        // Update overlay theme
        overlay.classList.remove('magic', 'matrix');
        overlay.classList.add(currentTheme);

        // Start fade out
        document.body.classList.add('fade-out');

        // Navigate after transition
        setTimeout(() => {
            window.location.href = url;
        }, this.duration);
    },

    /**
     * Quick fade (no overlay, just opacity)
     * @param {string} url - The URL to navigate to
     */
    fadeToPage: function(url) {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0';

        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PageTransition.init());
} else {
    PageTransition.init();
}
