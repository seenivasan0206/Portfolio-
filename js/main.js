(function() {
    'use strict';

    const lenis = window.__lenis;

    function initHamburger() {
        const hamburger = document.querySelector('.hamburger');
        const mobileNav = document.querySelector('.mobile-nav');
        if (!hamburger || !mobileNav) return;

        hamburger.addEventListener('click', function() {
            const isOpen = mobileNav.classList.contains('open');
            if (isOpen) {
                mobileNav.classList.remove('open');
                hamburger.classList.remove('open');
                document.body.style.overflow = '';
            } else {
                mobileNav.classList.add('open');
                hamburger.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });

        mobileNav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('open');
                hamburger.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    function initBackToTop() {
        const btn = document.querySelector('.back-to-top');
        if (!btn) return;

        function toggleVisibility() {
            if (window.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();

        btn.addEventListener('click', function() {
            if (lenis) {
                lenis.scrollTo(0, {
                    duration: 2.2,
                    easing: function(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
                });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    function initCopyEmail() {
        const emailLinks = document.querySelectorAll('a[href^="mailto:seeni3188@gmail.com"]');
        const toast = document.querySelector('.copy-toast');
        if (!emailLinks.length || !toast) return;

        let toastTimeout = null;
        emailLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText('seeni3188@gmail.com').then(function() {
                        toast.classList.add('show');
                        clearTimeout(toastTimeout);
                        toastTimeout = setTimeout(function() {
                            toast.classList.remove('show');
                        }, 2400);
                    }).catch(function() {});
                }
            });
        });
    }

    function initAnchorScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (!targetId) return;

                // Clicking logo or # scrolls to top smoothly
                if (targetId === '#' || targetId === '#hero') {
                    e.preventDefault();
                    if (lenis) {
                        lenis.scrollTo(0, { duration: 1.0 });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    return;
                }

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();
                const navEl = document.querySelector('nav');
                const navHeight = navEl ? navEl.offsetHeight : 70;

                const startTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetTop = target.getBoundingClientRect().top + startTop - navHeight;

                const scrollDuration = 1.0;
                const scrollEasing = function(t) {
                    return Math.min(1, 1.001 - Math.pow(2, -10 * t));
                };

                if (lenis) {
                    lenis.scrollTo(target, {
                        offset: -navHeight,
                        duration: scrollDuration,
                        easing: scrollEasing
                    });
                } else {
                    const travelDistance = targetTop - startTop;
                    const startTime = performance.now();
                    const durationMs = scrollDuration * 1000;

                    function step(now) {
                        const elapsed = Math.min((now - startTime) / durationMs, 1);
                        const progress = scrollEasing(elapsed);
                        window.scrollTo(0, startTop + travelDistance * progress);
                        if (elapsed < 1) {
                            requestAnimationFrame(step);
                        }
                    }
                    requestAnimationFrame(step);
                }
            });
        });
    }

    function confirmDownload(e) {
        e.preventDefault();
        if (confirm('Do you want to download Seenivasan-CV.pdf?')) {
            const link = document.createElement('a');
            link.href = 'Seenivasan-CV.pdf';
            link.download = 'Seenivasan-CV.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    function initCardSpotlights() {
        if (!window.matchMedia('(hover: hover)').matches) return;
        const cards = document.querySelectorAll(
            '.stat-card, .skill-category, .experience-item, .project-card, .contact-cta, .hero-console-card'
        );
        cards.forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            });
        });
    }

    /* ==========================================================================
       Stationary 3D Corner Butterfly Natural Interaction
       ========================================================================== */
    function initButterflyInteraction() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const corner = document.querySelector('.butterfly-corner');
        if (!corner) return;

        // Interactive hover responsiveness: gentle wing flutter burst on cursor proximity
        const wrappers = corner.querySelectorAll('.butterfly-wrapper');
        wrappers.forEach(function(wrap) {
            wrap.addEventListener('mouseenter', function() {
                const wings = wrap.querySelectorAll('.wing-group');
                wings.forEach(function(w) {
                    w.style.animationDuration = '1.3s';
                });
            });
            wrap.addEventListener('mouseleave', function() {
                const wings = wrap.querySelectorAll('.wing-group');
                wings.forEach(function(w) {
                    w.style.animationDuration = '';
                });
            });
        });

        // 3D Perspective Mouse Parallax (keeps butterflies fixed in place, subtle tilt only)
        const hasHover = window.matchMedia('(hover: hover)').matches;
        const isDesktop = window.innerWidth > 768;
        if (prefersReducedMotion || !hasHover || !isDesktop) return;

        let targetRotX = 0;
        let targetRotY = 0;
        let curRotX = 0;
        let curRotY = 0;
        let isTicking = false;

        window.addEventListener('mousemove', function(e) {
            const normX = (e.clientX / window.innerWidth - 0.5) * 2;
            const normY = (e.clientY / window.innerHeight - 0.5) * 2;
            targetRotY = normX * 12;  // subtle horizontal 3D tilt (degrees)
            targetRotX = -normY * 8;  // subtle vertical 3D tilt (degrees)

            if (!isTicking) {
                isTicking = true;
                requestAnimationFrame(updateParallax);
            }
        }, { passive: true });

        function updateParallax() {
            curRotX += (targetRotX - curRotX) * 0.06;
            curRotY += (targetRotY - curRotY) * 0.06;

            corner.style.transform = `rotateX(${curRotX.toFixed(2)}deg) rotateY(${curRotY.toFixed(2)}deg)`;

            if (Math.abs(targetRotX - curRotX) > 0.02 || Math.abs(targetRotY - curRotY) > 0.02) {
                requestAnimationFrame(updateParallax);
            } else {
                isTicking = false;
            }
        }
    }

    /* ==========================================================================
       Interactive Project Category Filter
       ========================================================================== */
    function initProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.projects-bento .project-card');
        if (!filterBtns.length || !cards.length) return;

        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                if (!filter) return;

                // Update active button state and accessibility attributes
                filterBtns.forEach(function(b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                // Filter cards with subtle staggered entrance animation
                let visibleCount = 0;
                cards.forEach(function(card) {
                    const category = card.getAttribute('data-category');
                    const isMatch = filter === 'all' || category === filter;

                    if (isMatch) {
                        card.classList.remove('filter-hide');
                        card.classList.remove('filter-fade-in');
                        // Reset inline styles that GSAP may have written
                        card.style.opacity = '1';
                        card.style.visibility = 'visible';
                        void card.offsetWidth; // Trigger reflow for CSS animation
                        card.classList.add('filter-fade-in');
                        card.style.animationDelay = (visibleCount * 50) + 'ms';
                        visibleCount++;
                    } else {
                        card.classList.add('filter-hide');
                        card.classList.remove('filter-fade-in');
                        card.style.animationDelay = '';
                    }
                });

                // Dynamically refresh scroll heights
                if (window.ScrollTrigger) {
                    window.ScrollTrigger.refresh();
                }
                if (lenis && typeof lenis.resize === 'function') {
                    lenis.resize();
                }
            });
        });
    }

    function init() {
        initHamburger();
        initBackToTop();
        initCopyEmail();
        initAnchorScroll();
        initCardSpotlights();
        initButterflyInteraction();
        initProjectFilters();

        const downloadLinks = document.querySelectorAll('a[href="Seenivasan-CV.pdf"]');
        downloadLinks.forEach(function(link) {
            link.addEventListener('click', confirmDownload);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();