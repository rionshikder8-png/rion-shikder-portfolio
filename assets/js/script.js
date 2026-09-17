(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* -------------------- footer year -------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------- sticky nav shadow -------------------- */
  const nav = document.getElementById('siteNav');
  const onScrollNav = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* -------------------- mobile menu -------------------- */
  const navToggle = document.getElementById('navToggle');
  const mobilePanel = document.getElementById('mobilePanel');

  const closeMobilePanel = () => {
    if (!navToggle || !mobilePanel) return;
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobilePanel.classList.remove('is-open');
  };

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobilePanel.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobilePanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobilePanel);
    });

    document.addEventListener('click', (e) => {
      if (!mobilePanel.classList.contains('is-open')) return;
      if (mobilePanel.contains(e.target) || navToggle.contains(e.target)) return;
      closeMobilePanel();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobilePanel();
    });
  }

  /* -------------------- active nav link on scroll -------------------- */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const linkFor = (id) => navAnchors.find((a) => a.getAttribute('href') === `#${id}`);

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = linkFor(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((s) => navObserver.observe(s));
  }

  /* -------------------- scroll reveal -------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* -------------------- animated counters -------------------- */
  const counters = document.querySelectorAll('[data-count]');

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach((c) => animateCounter(c));
  }

  /* -------------------- subtle 3D tilt on hero card (desktop only) -------------------- */
  const tiltCard = document.getElementById('tiltCard');

  if (tiltCard && !isTouch && !prefersReducedMotion) {
    const strength = 10;

    const handleMove = (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tiltCard.style.transform = `rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`;
    };

    const resetTilt = () => {
      tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
    };

    const heroVisual = tiltCard.closest('.hero-visual');
    if (heroVisual) {
      heroVisual.addEventListener('mousemove', handleMove);
      heroVisual.addEventListener('mouseleave', resetTilt);
    }
  }

  /* -------------------- project strip controls -------------------- */
  const strip = document.getElementById('projectStrip');
  const prevBtn = document.getElementById('stripPrev');
  const nextBtn = document.getElementById('stripNext');

  if (strip && prevBtn && nextBtn) {
    const scrollByCard = (dir) => {
      const card = strip.querySelector('.project-card');
      const distance = card ? card.getBoundingClientRect().width + 24 : 320;
      strip.scrollBy({ left: dir * distance, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));
  }

  /* -------------------- smooth scroll offset for fixed nav -------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('siteNav')?.offsetHeight || 76;
      const top = target.getBoundingClientRect().top + window.pageYOffset - (navHeight + 28);
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();
