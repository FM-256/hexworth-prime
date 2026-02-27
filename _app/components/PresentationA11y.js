/**
 * PresentationA11y.js — Drop-in Screen Reader Enhancement for Presentations
 *
 * Auto-detects the standard Hexworth presentation pattern (.slide / .active)
 * and adds ARIA attributes, live region announcements, and keyboard helpers.
 *
 * Usage: Add <script src="../../components/PresentationA11y.js"></script>
 *        at the bottom of any presentation HTML (after inline scripts).
 *
 * What it does:
 *  - Adds aria-live region that announces slide changes
 *  - Adds role="region" and aria-label to slide viewport
 *  - Adds aria-roledescription="slide" to each slide
 *  - Adds proper roles to navigation buttons
 *  - Adds aria-label to progress bar if present
 *  - Adds scope="col" to table header cells missing it
 *  - Ensures hidden slides have aria-hidden="true"
 */

(function PresentationA11y() {
    'use strict';

    // Wait for DOM + inline scripts to finish
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small delay to let inline scripts run first
        setTimeout(init, 50);
    }

    function init() {
        const slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return; // Not a presentation page

        // Find the slide viewport (parent of slides)
        const viewport = slides[0].parentElement;
        if (viewport) {
            viewport.setAttribute('role', 'region');
            viewport.setAttribute('aria-label', 'Presentation slides');
        }

        // Add aria-roledescription to each slide
        slides.forEach((slide, i) => {
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
        });

        // Create a visually hidden live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-slide-announce';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.setAttribute('role', 'status');
        liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        document.body.appendChild(liveRegion);

        // Enhance the slide counter if present
        const counter = document.getElementById('counter');
        if (counter) {
            counter.setAttribute('aria-live', 'polite');
            counter.setAttribute('aria-atomic', 'true');
        }

        // Enhance progress bar if present
        const progressFill = document.getElementById('progressFill');
        if (progressFill && progressFill.parentElement) {
            const bar = progressFill.parentElement;
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', '100');
            bar.setAttribute('aria-label', 'Presentation progress');
        }

        // Enhance nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const text = btn.textContent.trim().toLowerCase();
            if (text.includes('previous') || text.includes('prev') || text === '←') {
                btn.setAttribute('aria-label', 'Previous slide');
            } else if (text.includes('next') || text === '→') {
                btn.setAttribute('aria-label', 'Next slide');
            }
        });

        // Fix tables: add scope="col" to <th> in <thead>
        document.querySelectorAll('thead th:not([scope])').forEach(th => {
            th.setAttribute('scope', 'col');
        });

        // Fix tables: add scope="row" to first <th> in <tbody> rows
        document.querySelectorAll('tbody tr').forEach(tr => {
            const firstTh = tr.querySelector('th:not([scope])');
            if (firstTh) firstTh.setAttribute('scope', 'row');
        });

        // Observe slide changes via MutationObserver on class attribute
        let lastActiveIndex = -1;
        function checkSlideChange() {
            const active = document.querySelector('.slide.active');
            if (!active) return;

            const currentIndex = Array.from(slides).indexOf(active);
            if (currentIndex === lastActiveIndex) return;
            lastActiveIndex = currentIndex;

            // Update aria-hidden on all slides
            slides.forEach((slide, i) => {
                if (i === currentIndex) {
                    slide.removeAttribute('aria-hidden');
                } else {
                    slide.setAttribute('aria-hidden', 'true');
                }
            });

            // Update progress bar
            if (progressFill && progressFill.parentElement) {
                const pct = Math.round(((currentIndex + 1) / slides.length) * 100);
                progressFill.parentElement.setAttribute('aria-valuenow', String(pct));
                progressFill.parentElement.setAttribute('aria-valuetext',
                    `Slide ${currentIndex + 1} of ${slides.length}`);
            }

            // Announce slide change
            const slideTitle = getSlideTitle(active);
            const announcement = slideTitle
                ? `Slide ${currentIndex + 1} of ${slides.length}: ${slideTitle}`
                : `Slide ${currentIndex + 1} of ${slides.length}`;
            liveRegion.textContent = announcement;
        }

        // Get the first heading or meaningful text from a slide
        function getSlideTitle(slide) {
            const heading = slide.querySelector('h1, h2, h3, h4');
            if (heading) return heading.textContent.trim();
            const firstP = slide.querySelector('p, .slide-title, .section-title');
            if (firstP) {
                const text = firstP.textContent.trim();
                return text.length > 60 ? text.substring(0, 57) + '...' : text;
            }
            return '';
        }

        // Monitor for class changes on slides (catches both manual and programmatic transitions)
        const observer = new MutationObserver(checkSlideChange);
        slides.forEach(slide => {
            observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
        });

        // Initial state
        checkSlideChange();

        // Also hook into global nextSlide/prevSlide if they exist
        if (typeof window.nextSlide === 'function') {
            const origNext = window.nextSlide;
            window.nextSlide = function() {
                origNext.apply(this, arguments);
                checkSlideChange();
            };
        }
        if (typeof window.prevSlide === 'function') {
            const origPrev = window.prevSlide;
            window.prevSlide = function() {
                origPrev.apply(this, arguments);
                checkSlideChange();
            };
        }

        // Keyboard help: add Escape to blur focus from slides (useful for trapped focus)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.activeElement.blur();
            }
        });
    }
})();
