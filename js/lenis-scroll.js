(function() {
    'use strict';

    let lenis = null;

    function initLenis() {
        if (typeof Lenis === 'undefined') {
            return null;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return null;
        }

        lenis = new Lenis({
            duration: 2.0,
            easing: function(t) {
                return Math.min(1, 1.001 - Math.pow(2, -10 * t));
            },
            smoothWheel: true,
            wheelMultiplier: 0.75,
            touchMultiplier: 1.2,
            normalizeWheel: true
        });

        lenis.on('scroll', function(e) {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.update();
            }
        });

        if (typeof gsap !== 'undefined') {
            gsap.ticker.add(function(time) {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        return lenis;
    }

    window.__lenis = initLenis();
})();