(function() {
    'use strict';

    if (typeof gsap === 'undefined') {
        document.body.classList.add('no-anim');
        document.documentElement.classList.remove('js-pending');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.remove('js-pending');

    // Dynamic & Energetic motion tokens
    const EASE_SPRING = 'back.out(1.4)';
    const EASE_POP = 'back.out(2.4)';
    const EASE_SNAP = 'power3.out';
    const REVEAL_TOGGLE = 'play none none none';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initHero() {
        const heroTitle = document.querySelector('.hero-title') || document.querySelector('.hero h1');
        if (heroTitle && !reduceMotion) {
            const heroTL = gsap.timeline({
                defaults: { ease: EASE_SNAP },
                onComplete: function() {
                    document.documentElement.classList.remove('js-pending');
                }
            });

            // 1. Badge bouncy spring drop
            heroTL.from('.hero-badge', {
                y: -24,
                opacity: 0,
                scale: 0.85,
                duration: 0.75,
                ease: 'back.out(1.8)'
            })
            // 2. Title components: crisp staggered rise
            .from('.hero-greeting, .hero-name, .hero-role-text', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: EASE_SPRING
            }, '-=0.4')
            // 3. Subtitle soft rise
            .from('.hero-subtitle', {
                y: 18,
                opacity: 0,
                duration: 0.65,
                ease: EASE_SNAP
            }, '-=0.4')
            // 4. Buttons snappy staggered pop-up
            .from('.hero-actions .btn', {
                y: 20,
                opacity: 0,
                scale: 0.92,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.8)'
            }, '-=0.4')
            // 5. Hero stats row items
            .from('.hero-stat-item', {
                y: 15,
                opacity: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: EASE_SNAP
            }, '-=0.3')
            // 6. Right Console Card 3D entrance
            .from('.hero-console-card', {
                y: 40,
                opacity: 0,
                scale: 0.94,
                duration: 0.9,
                ease: 'back.out(1.4)'
            }, '-=0.7')
            // 7. Floating Badges pop
            .from('.hero-float-badge', {
                scale: 0,
                opacity: 0,
                duration: 0.65,
                stagger: 0.15,
                ease: 'back.out(2.2)'
            }, '-=0.4');
        } else {
            document.documentElement.classList.remove('js-pending');
        }
    }

    // Scroll-driven Hero Parallax (content gracefully recedes upward as user scrolls into About)
    function initHeroScrollParallax() {
        if (reduceMotion) return;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        const heroVisual = document.querySelector('.hero-visual');
        if (!hero || !heroContent) return;

        gsap.to([heroContent, heroVisual], {
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom 20%',
                scrub: 0.5
            },
            y: -40,
            opacity: 0.25,
            stagger: 0.05,
            ease: 'none'
        });
    }

    function initChart() {
        const curvePath = document.querySelector('.chart-curve-path');
        const areaPath = document.querySelector('.chart-area-path');
        if (!curvePath || reduceMotion) {
            return;
        }

        const length = curvePath.getTotalLength ? curvePath.getTotalLength() : 400;
        gsap.set(curvePath, {
            strokeDasharray: length,
            strokeDashoffset: length
        });
        if (areaPath) {
            gsap.set(areaPath, { opacity: 0 });
        }

        const tl = gsap.timeline({ delay: 0.5 });
        tl.to(curvePath, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: 'power2.inOut'
        });
        if (areaPath) {
            tl.to(areaPath, {
                opacity: 1,
                duration: 1.0,
                ease: 'power1.out'
            }, '-=0.7');
        }

        const points = document.querySelectorAll('.chart-point');
        if (points.length) {
            gsap.set(points, { scale: 0, transformOrigin: 'center center' });
            tl.to(points, {
                scale: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: EASE_POP
            }, '-=0.5');
        }
    }

    function initSectionHeadings() {
        if (reduceMotion) return;
        gsap.utils.toArray('.section-header').forEach(function(header) {
            const h2 = header.querySelector('h2');
            const p = header.querySelector('p');
            if (!h2) return;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 88%',
                    toggleActions: REVEAL_TOGGLE
                }
            });
            tl.from(h2, {
                y: 28,
                opacity: 0,
                scale: 0.97,
                duration: 0.75,
                ease: 'back.out(1.3)'
            });
            if (p) {
                tl.from(p, {
                    y: 15,
                    opacity: 0,
                    duration: 0.6,
                    ease: EASE_SNAP
                }, '-=0.4');
            }
        });
    }

    function initReveals() {
        const revealAxis = {
            'reveal': { y: 24, x: 0 },
            'reveal-left': { y: 0, x: -28 },
            'reveal-right': { y: 0, x: 28 }
        };

        function getFrom(el) {
            if (el.classList.contains('reveal-left')) return revealAxis['reveal-left'];
            if (el.classList.contains('reveal-right')) return revealAxis['reveal-right'];
            return revealAxis['reveal'];
        }

        const revealEls = Array.from(document.querySelectorAll(
            '.reveal, .reveal-left, .reveal-right'
        )).filter(function(el) {
            return !el.classList.contains('section-header') &&
                   !el.closest('.projects-bento, .projects-grid, .contact-links, .experience-list') &&
                   !el.classList.contains('stat-card');
        });

        if (reduceMotion) {
            gsap.set(revealEls, { opacity: 1, x: 0, y: 0 });
        } else {
            revealEls.forEach(function(el) {
                const from = getFrom(el);
                gsap.fromTo(el,
                    { opacity: 0, x: from.x, y: from.y },
                    {
                        opacity: 1, x: 0, y: 0,
                        duration: 0.85, ease: EASE_SNAP, overwrite: true,
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 88%',
                            toggleActions: REVEAL_TOGGLE
                        }
                    }
                );
            });
        }

        gsap.set('.section-header.reveal', { opacity: 1, y: 0 });
    }

    function initStatCards() {
        if (reduceMotion) return;
        const grid = document.querySelector('.about-stats');
        if (!grid) return;
        const cards = grid.querySelectorAll('.stat-card');
        if (!cards.length) return;

        gsap.fromTo(cards,
            { opacity: 0, y: 30, scale: 0.9 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.75,
                ease: 'back.out(1.6)',
                stagger: 0.08,
                overwrite: true,
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 88%',
                    toggleActions: REVEAL_TOGGLE,
                    onEnter: function() {
                        cards.forEach(function(card) {
                            const numEl = card.querySelector('.stat-number');
                            if (!numEl) return;
                            const text = numEl.textContent.trim();
                            const match = text.match(/^(\d+)(\+)?$/);
                            if (match) {
                                const targetVal = parseInt(match[1], 10);
                                const hasPlus = !!match[2];
                                const obj = { val: 0 };
                                gsap.to(obj, {
                                    val: targetVal,
                                    duration: 1.3,
                                    ease: 'power2.out',
                                    onUpdate: function() {
                                        numEl.textContent = Math.round(obj.val) + (hasPlus ? '+' : '');
                                    }
                                });
                            }
                        });
                    }
                }
            }
        );
    }

    function initSkills() {
        if (reduceMotion) return;
        const grid = document.querySelector('.skills-grid');
        if (!grid) return;

        const cards = grid.querySelectorAll('.skill-category');
        cards.forEach(function(card) {
            gsap.fromTo(card,
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.75,
                    ease: EASE_SPRING,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 88%',
                        toggleActions: REVEAL_TOGGLE
                    }
                }
            );

            const tags = card.querySelectorAll('.skill-tag');
            if (tags.length) {
                gsap.fromTo(tags,
                    { opacity: 0, scale: 0.4, y: 8 },
                    {
                        opacity: 1, scale: 1, y: 0,
                        duration: 0.45,
                        ease: EASE_POP,
                        stagger: 0.035,
                        overwrite: true,
                        delay: 0.15,
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 88%',
                            toggleActions: REVEAL_TOGGLE
                        }
                    }
                );
            }
        });
    }

    // 2-Column Experience scroll reveal (Left card slides from left, Right card slides from right)
    function initExperience() {
        if (reduceMotion) return;
        const lists = gsap.utils.toArray('.experience-list');
        lists.forEach(function(list) {
            const items = list.querySelectorAll('.experience-item');
            if (!items.length) return;

            items.forEach(function(item, index) {
                const isLeft = index % 2 === 0;
                gsap.fromTo(item,
                    {
                        opacity: 0,
                        x: isLeft ? -30 : 30,
                        y: 35,
                        scale: 0.95
                    },
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.85,
                        ease: EASE_SPRING,
                        scrollTrigger: {
                            trigger: list,
                            start: 'top 85%',
                            toggleActions: REVEAL_TOGGLE
                        }
                    }
                );

                const lis = item.querySelectorAll('ul li');
                const summary = item.querySelector('.experience-summary');
                if (lis.length) {
                    gsap.fromTo(lis,
                        { opacity: 0, x: -14 },
                        {
                            opacity: 1, x: 0,
                            duration: 0.5,
                            stagger: 0.05,
                            ease: 'power2.out',
                            delay: 0.2,
                            scrollTrigger: {
                                trigger: list,
                                start: 'top 85%',
                                toggleActions: REVEAL_TOGGLE
                            }
                        }
                    );
                }
                if (summary) {
                    gsap.fromTo(summary,
                        { opacity: 0, y: 14, scale: 0.97 },
                        {
                            opacity: 1, y: 0, scale: 1,
                            duration: 0.6,
                            ease: EASE_SNAP,
                            delay: 0.35,
                            scrollTrigger: {
                                trigger: list,
                                start: 'top 85%',
                                toggleActions: REVEAL_TOGGLE
                            }
                        }
                    );
                }
            });
        });
    }

    // Projects: 3D Staggered Roll-Up & Settle (All 5 cards 100% visible)
    function initProjects() {
        if (reduceMotion) return;
        const grids = gsap.utils.toArray('.projects-bento, .projects-grid');
        grids.forEach(function(grid) {
            const cards = gsap.utils.toArray(grid.querySelectorAll('.project-card'));
            if (!cards.length) return;

            gsap.fromTo(cards,
                {
                    opacity: 0,
                    y: 42,
                    scale: 0.94,
                    rotateX: 6,
                    transformPerspective: 1000
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotateX: 0,
                    duration: 0.85,
                    ease: EASE_SPRING,
                    stagger: 0.12,
                    overwrite: true,
                    scrollTrigger: {
                        trigger: grid,
                        start: 'top 85%',
                        toggleActions: REVEAL_TOGGLE
                    }
                }
            );
        });
    }

    function initContact() {
        if (reduceMotion) return;
        const contactSection = document.querySelector('#contact');
        if (!contactSection) return;

        const links = contactSection.querySelectorAll('.contact-link');
        if (links.length) {
            gsap.fromTo(links,
                { opacity: 0, x: -35, y: 10, scale: 0.95 },
                {
                    opacity: 1, x: 0, y: 0, scale: 1,
                    duration: 0.75,
                    ease: 'back.out(1.5)',
                    stagger: 0.08,
                    overwrite: true,
                    scrollTrigger: {
                        trigger: '#contact .contact-links',
                        start: 'top 88%',
                        toggleActions: REVEAL_TOGGLE
                    }
                }
            );
        }

        const cta = contactSection.querySelector('.contact-cta');
        if (cta) {
            gsap.fromTo(cta,
                { opacity: 0, y: 30, scale: 0.93 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.85,
                    ease: EASE_SPRING,
                    overwrite: true,
                    scrollTrigger: {
                        trigger: cta,
                        start: 'top 88%',
                        toggleActions: REVEAL_TOGGLE
                    }
                }
            );
        }
    }

    function initNavbar() {
        const navEl = document.querySelector('nav');
        if (!navEl) return;

        ScrollTrigger.create({
            start: 'top -20',
            end: 'max',
            onUpdate: function(self) {
                const scrolled = self.scroll() > 30;
                navEl.classList.toggle('nav-scrolled', scrolled);
            }
        });
    }

    function initScrollProgress() {
        const bar = document.querySelector('.scroll-progress');
        if (!bar) return;

        ScrollTrigger.create({
            start: 'top top',
            end: 'max',
            onUpdate: function(self) {
                const progress = self.progress * 100;
                gsap.set(bar, { width: progress + '%' });
            }
        });
    }

    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
        if (!sections.length || !navLinks.length) return;

        function updateActive() {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const navEl = document.querySelector('nav');
            const navHeight = navEl ? navEl.offsetHeight : 70;

            // 1. In Hero (near top): clear active state
            if (scrollY < 200) {
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                });
                return;
            }

            // 2. Near bottom: activate Contact
            if (scrollY + windowHeight >= docHeight - 70) {
                navLinks.forEach(function(link) {
                    link.classList.toggle('active', link.getAttribute('href') === '#contact');
                });
                return;
            }

            // 3. Find currently visible section
            let activeId = '';
            sections.forEach(function(sec) {
                const top = sec.offsetTop - navHeight - 80;
                const height = sec.offsetHeight;
                if (scrollY >= top && scrollY < top + height) {
                    activeId = sec.getAttribute('id');
                }
            });

            if (activeId) {
                navLinks.forEach(function(link) {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
                });
            }
        }

        window.addEventListener('scroll', updateActive, { passive: true });
        updateActive();
    }

    function refreshScrollTriggers() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }

    function init() {
        initHero();
        initHeroScrollParallax();
        initChart();
        initSectionHeadings();
        initReveals();
        initStatCards();
        initSkills();
        initExperience();
        initProjects();
        initContact();
        initNavbar();
        initScrollProgress();
        initActiveNav();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(refreshScrollTriggers);
        }
        if (document.fonts && document.fonts.load) {
            Promise.all([
                document.fonts.load('1em "Font Awesome 6 Free"').catch(function() {}),
                document.fonts.load('1em "Font Awesome 6 Free Solid"').catch(function() {}),
                document.fonts.load('1em "Font Awesome 6 Brands"').catch(function() {})
            ]).then(refreshScrollTriggers);
        }
        Promise.all(
            Array.from(document.images).map(function(img) {
                return (img.complete && img.naturalWidth > 0)
                    ? Promise.resolve()
                    : new Promise(function(res) { img.onload = img.onerror = res; });
            })
        ).then(refreshScrollTriggers);
        window.addEventListener('load', refreshScrollTriggers);
        window.addEventListener('orientationchange', function() {
            setTimeout(refreshScrollTriggers, 200);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();