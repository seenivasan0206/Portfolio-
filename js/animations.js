(function() {
    'use strict';

    if (typeof gsap === 'undefined') {
        document.body.classList.add('no-anim');
        document.documentElement.classList.remove('js-pending');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') {
        gsap.registerPlugin(SplitText);
    }

    document.documentElement.classList.remove('js-pending');

    const EASE = 'power3.out';
    const REVEAL_TOGGLE = 'play none none reverse';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;

    function splitIntoWords(el) {
        if (typeof SplitText !== 'undefined') {
            const split = new SplitText(el, {
                type: 'words',
                wordsClass: 'word'
            });
            split.words.forEach(function(w) {
                const mask = document.createElement('span');
                mask.className = 'word-mask';
                w.parentNode.insertBefore(mask, w);
                mask.appendChild(w);
            });
            return split.words;
        }

        const words = [];
        function walk(node, targetParent) {
            node.childNodes.forEach(function(child) {
                if (child.nodeType === Node.TEXT_NODE) {
                    const parts = child.textContent.split(/(\s+)/);
                    parts.forEach(function(part) {
                        if (part.trim() === '') {
                            targetParent.appendChild(document.createTextNode(part));
                            return;
                        }
                        const mask = document.createElement('span');
                        mask.className = 'word-mask';
                        const word = document.createElement('span');
                        word.className = 'word';
                        word.textContent = part;
                        if (targetParent.dataset && targetParent.dataset.inheritColor) {
                            word.style.color = targetParent.dataset.inheritColor;
                        }
                        mask.appendChild(word);
                        targetParent.appendChild(mask);
                        words.push(word);
                    });
                } else if (child.nodeName === 'BR') {
                    targetParent.appendChild(document.createElement('br'));
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const clone = child.cloneNode(false);
                    const colour = getComputedStyle(child).color;
                    clone.dataset.inheritColor = colour;
                    targetParent.appendChild(clone);
                    walk(child, clone);
                }
            });
        }
        const frag = document.createElement('span');
        frag.className = 'split-line';
        walk(el, frag);
        el.innerHTML = '';
        el.appendChild(frag);
        return words;
    }

    function initHero() {
        const heroHeading = document.querySelector('.hero h1');
        if (heroHeading && !reduceMotion) {
            const heroTL = gsap.timeline({ defaults: { ease: EASE } });
            heroTL.from(heroHeading, {
                y: 30,
                opacity: 0,
                duration: 1,
            })
            .from('.hero-badge', { y: 20, opacity: 0, duration: 0.7 }, '+=0.1')
            .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
            .from('.hero-buttons', { y: 24, opacity: 0, scale: 0.92, duration: 0.8 }, '-=0.4');
        } else {
            document.documentElement.classList.remove('js-pending');
        }
    }

    function initChart() {
        const chartLine = document.querySelector('.hero-chart .chart-line');
        if (!chartLine || reduceMotion) {
            if (chartLine) {
                gsap.set(chartLine, { strokeDashoffset: 0 });
            }
            return;
        }

        const length = chartLine.getTotalLength ? chartLine.getTotalLength() : 400;
        gsap.set(chartLine, {
            strokeDasharray: length,
            strokeDashoffset: length
        });

        const tl = gsap.timeline({ delay: 0.8 });
        tl.to(chartLine, {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: 'power2.inOut'
        });

        const dots = document.querySelectorAll('.hero-chart .chart-dot');
        if (dots.length) {
            gsap.set(dots, { scale: 0, transformOrigin: 'center center' });
            tl.to(dots, {
                scale: 1,
                duration: 0.4,
                stagger: 0.15,
                ease: 'back.out(1.7)'
            }, '-=0.6');
        }
    }

    function initSectionHeadings() {
        gsap.utils.toArray('.section-header').forEach(function(header) {
            const h2 = header.querySelector('h2');
            const p = header.querySelector('p');
            if (!h2 || reduceMotion) return;

            const words = splitIntoWords(h2);
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: REVEAL_TOGGLE
                },
                defaults: { ease: EASE }
            });
            tl.from(words, { yPercent: 120, duration: 0.7, stagger: 0.06 });
            if (p) tl.from(p, { y: 18, opacity: 0, duration: 0.6 }, '-=0.35');
        });
    }

    function initReveals() {
        const revealAxis = {
            'reveal': { y: 30, x: 0 },
            'reveal-left': { y: 0, x: -40 },
            'reveal-right': { y: 0, x: 40 }
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
                   !el.closest('.projects-grid, .contact-links, .experience-list') &&
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
                        duration: 0.9, ease: EASE, overwrite: true,
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
        gsap.utils.toArray('.about-stats').forEach(function(grid) {
            const cards = grid.querySelectorAll('.stat-card');
            if (!cards.length) return;
            gsap.fromTo(cards,
                { opacity: 0, scale: 0.85, y: 16 },
                {
                    opacity: 1, scale: 1, y: 0,
                    duration: 0.7, ease: EASE,
                    stagger: 0.12, overwrite: true,
                    scrollTrigger: {
                        trigger: grid,
                        start: 'top 88%',
                        toggleActions: REVEAL_TOGGLE
                    }
                }
            );
        });
    }

    function initSkills() {
        if (reduceMotion) return;
        gsap.utils.toArray('.skill-category').forEach(function(card) {
            gsap.fromTo(card,
                { opacity: 0, scale: 0.92, y: 20 },
                {
                    opacity: 1, scale: 1, y: 0,
                    duration: 0.8, ease: EASE, overwrite: true,
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
                    { opacity: 0, scale: 0.8, y: 8 },
                    {
                        opacity: 1, scale: 1, y: 0,
                        duration: 0.5, ease: EASE,
                        stagger: 0.05, overwrite: true,
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

    function initExperience() {
        if (reduceMotion) return;
        gsap.utils.toArray('.experience-item').forEach(function(item) {
            const lis = item.querySelectorAll('ul li');
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: REVEAL_TOGGLE
                },
                defaults: { ease: EASE }
            });
            tl.from(item, { y: 40, opacity: 0, duration: 0.9, clearProps: 'transform' })
              .from(lis, {
                  y: 16, opacity: 0, duration: 0.6, stagger: 0.12,
                  clearProps: 'transform'
              }, '-=0.45');
        });
    }

    function initProjects() {
        if (reduceMotion) return;
        const grids = gsap.utils.toArray('.projects-grid');
        grids.forEach(function(grid) {
            const cards = gsap.utils.toArray(grid.querySelectorAll('.project-card'));
            if (!cards.length) return;

            gsap.set(cards, { opacity: 0, scale: 0.95, y: 30 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 85%',
                    toggleActions: REVEAL_TOGGLE
                },
                defaults: { ease: EASE }
            });
            tl.to(cards, {
                opacity: 1, scale: 1, y: 0,
                duration: 0.9, stagger: 0.12, overwrite: true
            });
        });

        if (canHover) {
            gsap.utils.toArray('.project-card').forEach(function(card) {
                card.addEventListener('mouseenter', function() {
                    gsap.to(card, {
                        scale: 1.02, y: -4,
                        duration: 0.4, ease: EASE, overwrite: 'auto'
                    });
                });
                card.addEventListener('mouseleave', function() {
                    gsap.to(card, {
                        scale: 1, y: 0,
                        duration: 0.5, ease: EASE, overwrite: 'auto'
                    });
                });
            });
        }
    }

    function initContact() {
        if (reduceMotion) return;
        gsap.utils.toArray('.contact-link').forEach(function(link) {
            gsap.fromTo(link,
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0,
                    duration: 0.8, ease: EASE, overwrite: true,
                    scrollTrigger: {
                        trigger: link,
                        start: 'top 90%',
                        toggleActions: REVEAL_TOGGLE
                    }
                }
            );

            if (canHover) {
                const icon = link.querySelector('.icon i, .icon');
                link.addEventListener('mouseenter', function() {
                    gsap.to(icon, {
                        rotation: 12, scale: 1.15,
                        duration: 0.4, ease: EASE, overwrite: 'auto'
                    });
                });
                link.addEventListener('mouseleave', function() {
                    gsap.to(icon, {
                        rotation: 0, scale: 1,
                        duration: 0.5, ease: EASE, overwrite: 'auto'
                    });
                });
            }
        });
    }

    function initNavbar() {
        const navEl = document.querySelector('nav');
        if (!navEl) return;

        if (!reduceMotion) {
            gsap.utils.toArray('.nav-links a').forEach(function(link) {
                link.addEventListener('mouseenter', function() {
                    gsap.to(link, { '--ul-w': 100, duration: 0.35, ease: EASE });
                });
                link.addEventListener('mouseleave', function() {
                    gsap.to(link, { '--ul-w': 0, duration: 0.3, ease: EASE });
                });
            });

            gsap.to(navEl, {
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                ease: 'none',
                scrollTrigger: {
                    start: 'top top',
                    end: '+=120',
                    scrub: true
                }
            });
        }

        ScrollTrigger.create({
            start: 'top top',
            end: 'max',
            onUpdate: function(self) {
                const scrolled = self.scroll() > 40;
                navEl.style.boxShadow = scrolled
                    ? '0 6px 24px rgba(0,0,0,0.25)'
                    : '0 1px 3px rgba(0,0,0,0.05)';
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

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(function(link) {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, {
            rootMargin: '-40% 0px -55% 0px',
            threshold: 0
        });

        sections.forEach(function(section) {
            observer.observe(section);
        });
    }

    function refreshScrollTriggers() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }

    function init() {
        initHero();
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