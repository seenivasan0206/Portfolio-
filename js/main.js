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
            if (window.scrollY > 600) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();

        btn.addEventListener('click', function() {
            if (lenis) {
                lenis.scrollTo(0, { duration: 1.5 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    function initCopyEmail() {
        const emailLink = document.querySelector('a[href^="mailto:seeni3188@gmail.com"]');
        if (!emailLink) return;
    }

    function initAnchorScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();
                const navEl = document.querySelector('nav');
                const navHeight = navEl ? navEl.offsetHeight : 0;

                if (lenis) {
                    lenis.scrollTo(target, { offset: -navHeight, duration: 1.5 });
                } else {
                    const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            });
        });
    }

    function initTiltCards() {
        if (!window.matchMedia('(hover: hover)').matches) return;

        const cards = document.querySelectorAll('.project-card');
        cards.forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                if (typeof gsap !== 'undefined') {
                    gsap.to(card, {
                        rotateX: rotateX,
                        rotateY: rotateY,
                        transformPerspective: 1000,
                        duration: 0.4,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            });

            card.addEventListener('mouseleave', function() {
                if (typeof gsap !== 'undefined') {
                    gsap.to(card, {
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
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

    function init() {
        initHamburger();
        initBackToTop();
        initCopyEmail();
        initAnchorScroll();
        initTiltCards();

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