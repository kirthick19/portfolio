/* ============================================
   Kirthick Kanna — Portfolio
   Vanilla JS · no dependencies
   ============================================ */
(function () {
    'use strict';

    /* ---------- Helpers ---------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Theme toggle ---------- */
    const themeToggle = $('#theme-toggle');
    const root = document.documentElement;
    const STORAGE_KEY = 'kk-theme';

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]:not([media])');
        if (meta) meta.setAttribute('content', theme === 'light' ? '#faf9f5' : '#08090d');
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* storage unavailable */ }
    }

    function getInitialTheme() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'light' || stored === 'dark') return stored;
        } catch (e) { /* ignore */ }
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    setTheme(getInitialTheme());

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = root.getAttribute('data-theme') || 'dark';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    /* ---------- Mobile nav ---------- */
    const navToggle = $('#nav-toggle');
    const navMenu = $('#nav-menu');

    function closeMenu() {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
    }
    function openMenu() {
        if (!navMenu || !navToggle) return;
        navMenu.classList.add('is-open');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Close menu');
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            expanded ? closeMenu() : openMenu();
        });

        $$('.nav__link', navMenu).forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
                closeMenu();
                navToggle.focus();
            }
        });
    }

    /* ---------- Header shadow + scroll progress on scroll ---------- */
    const header = $('#header');
    const scrollProgress = $('#scroll-progress');
    let lastScroll = 0;
    let ticking = false;

    function updateScrollProgress() {
        if (!scrollProgress) return;
        const doc = document.documentElement;
        const max = (doc.scrollHeight - doc.clientHeight) || 1;
        const ratio = Math.min(1, Math.max(0, window.scrollY / max));
        scrollProgress.style.transform = `scaleX(${ratio})`;
    }

    function onScroll() {
        const y = window.scrollY;

        if (header) {
            header.classList.toggle('is-scrolled', y > 8);
        }

        updateActiveLink();
        updateBackToTop();
        updateScrollProgress();
        lastScroll = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    /* ---------- Active nav link on scroll ---------- */
    const sections = $$('main section[id]');
    const navLinks = $$('.nav__link');

    function updateActiveLink() {
        if (!sections.length) return;
        const scrollPos = window.scrollY + (window.innerHeight * 0.35);

        let currentId = sections[0].id;
        for (const section of sections) {
            if (section.offsetTop <= scrollPos) currentId = section.id;
        }

        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            link.classList.toggle('is-active', href === '#' + currentId);
        });
    }

    /* ---------- Reveal on scroll ---------- */
    const revealEls = $$('.reveal');

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    /* ---------- Typing effect ---------- */
    const typedEl = $('#typed-text');
    if (typedEl) {
        const titles = [
            'Computer Science Engineer',
            'Web Developer',
            'Android Developer',
            'Problem Solver'
        ];
        let titleIdx = 0;
        let charIdx = 0;
        let deleting = false;

        const prefersReduced = prefersReducedMotion;

        function tick() {
            const current = titles[titleIdx];

            if (prefersReduced) {
                typedEl.textContent = current;
                return;
            }

            if (deleting) {
                typedEl.textContent = current.substring(0, charIdx - 1);
                charIdx--;
            } else {
                typedEl.textContent = current.substring(0, charIdx + 1);
                charIdx++;
            }

            let delay = deleting ? 45 : 95;

            if (!deleting && charIdx === current.length) {
                delay = 1800;
                deleting = true;
            } else if (deleting && charIdx === 0) {
                deleting = false;
                titleIdx = (titleIdx + 1) % titles.length;
                delay = 400;
            }

            setTimeout(tick, delay);
        }

        if (!prefersReduced) {
            setTimeout(tick, 800);
        } else {
            typedEl.textContent = titles[0];
        }
    }

    /* ---------- Copy-to-clipboard ---------- */
    $$('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.getAttribute('data-copy') || '';
            if (!text) return;

            const original = btn.textContent;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }

                btn.textContent = 'Copied!';
                btn.classList.add('is-copied');
                setTimeout(() => {
                    btn.textContent = original;
                    btn.classList.remove('is-copied');
                }, 1800);
            } catch (err) {
                btn.textContent = 'Press Ctrl+C';
                setTimeout(() => { btn.textContent = original; }, 1800);
            }
        });
    });

    /* ---------- Back to top ---------- */
    const backToTop = $('#back-to-top');
    function updateBackToTop() {
        if (!backToTop) return;
        const visible = window.scrollY > 500;
        backToTop.classList.toggle('is-visible', visible);
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Footer year ---------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    /* ---------- Skill bar fill on reveal ---------- */
    const skillBars = $$('.skill-bar');
    if (skillBars.length) {
        if ('IntersectionObserver' in window && !prefersReducedMotion) {
            const barObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        barObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            skillBars.forEach(bar => barObserver.observe(bar));
        } else {
            skillBars.forEach(bar => bar.classList.add('is-visible'));
        }
    }


    /* ---------- Pointer-tracked card glow ---------- */
    const glowCards = $$('.skill-card, .contact__card');
    if (glowCards.length && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
        glowCards.forEach(card => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
                card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
            });
            card.addEventListener('pointerleave', () => {
                card.style.removeProperty('--mx');
                card.style.removeProperty('--my');
            });
        });
    }


    /* ---------- Initial calls ---------- */
    onScroll();
})();
