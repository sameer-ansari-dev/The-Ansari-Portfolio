document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.getElementById('site-header');
  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navBackdrop = document.querySelector('.nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-link');
  const statsSection = document.getElementById('stats');
  const statCards = document.querySelectorAll('.stat-card');
  const projectCards = document.querySelectorAll('.project-card');
  const featureCards = document.querySelectorAll('.feature-card');
  const certificateCards = document.querySelectorAll('.certificate-card');
  const hero = document.querySelector('.hero');
  const modal = document.querySelector('.modal-overlay');
  const modalImage = modal?.querySelector('.modal-preview img');
  const modalTitle = modal?.querySelector('.modal-copy h3');
  const modalText = modal?.querySelector('.modal-copy p');
  const modalClose = modal?.querySelector('.modal-close');
  const resumeButtons = document.querySelectorAll('.resume-button, .resume-trigger');
  const contactForm = document.querySelector('.contact-form');

  const closeMenu = () => {
    if (!nav || !navToggle || !navBackdrop) return;
    nav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-label', 'Open menu');
    navToggle.setAttribute('aria-expanded', 'false');
    navBackdrop.hidden = true;
    document.body.classList.remove('nav-open');
  };

  const openMenu = () => {
    if (!nav || !navToggle || !navBackdrop) return;
    nav.classList.add('is-open');
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-label', 'Close menu');
    navToggle.setAttribute('aria-expanded', 'true');
    navBackdrop.hidden = false;
    document.body.classList.add('nav-open');
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.contains('is-open');
      if (open) closeMenu();
      else openMenu();
    });
  }

  if (navBackdrop) navBackdrop.addEventListener('click', closeMenu);
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  resumeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.getAttribute('href') === '#') {
        event.preventDefault();
        const contact = document.getElementById('contact');
        if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      contactForm.reset();
      alert('Thanks for reaching out. I will get back to you soon.');
    });
  }

  const activeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const match = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', match);
      });
    });
  }, { rootMargin: '-40% 0px -45% 0px', threshold: 0.01 });

  document.querySelectorAll('section[id]').forEach((section) => activeSectionObserver.observe(section));

  const countUp = (element) => {
    const target = Number(element.dataset.count || 0);
    if (prefersReducedMotion) {
      element.textContent = target;
      return;
    }
    const duration = 1200;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      if (entry.target.matches('.stat-card')) {
        const number = entry.target.querySelector('strong[data-count]');
        if (number && !number.dataset.animated) {
          number.dataset.animated = 'true';
          countUp(number);
        }
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  [hero, statsSection, ...statCards, ...featureCards, ...projectCards, ...certificateCards].forEach((el) => {
    if (el) revealObserver.observe(el);
  });

  if (certificateCards.length && modal && modalImage && modalTitle && modalText && modalClose) {
    const openCertificate = (card) => {
      const preview = card.dataset.preview;
      modalImage.src = preview || '';
      modalImage.alt = card.dataset.title || 'Certificate preview';
      modalTitle.textContent = card.dataset.title || 'Certificate';
      modalText.textContent = `${card.dataset.issuer || ''}${card.dataset.issuer ? ' • ' : ''}${card.dataset.year || ''}`;
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add('is-open'));
      document.body.classList.add('nav-open');
    };

    const closeCertificate = () => {
      modal.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      window.setTimeout(() => {
        modal.hidden = true;
      }, 180);
    };

    certificateCards.forEach((card) => {
      card.addEventListener('click', () => openCertificate(card));
    });

    modalClose.addEventListener('click', closeCertificate);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeCertificate();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeCertificate();
    });
  }

  const setHeroReveal = () => {
    if (prefersReducedMotion || !window.gsap) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
    tl.from('.eyebrow', { y: 18, opacity: 0 })
      .from('.hero h1', { y: 34, opacity: 0 }, '-=0.55')
      .from('.role-line', { y: 18, opacity: 0 }, '-=0.55')
      .from('.hero-description', { y: 18, opacity: 0 }, '-=0.45')
      .from('.hero-actions .button', { y: 18, opacity: 0, stagger: 0.08 }, '-=0.4')
      .from('.profile-orbit', { scale: 0.92, opacity: 0, rotation: -4 }, '-=0.8');
  };

  const setSectionStagger = () => {
    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const groups = [
      { selector: '.feature-card', trigger: '#about' },
      { selector: '.project-card', trigger: '#projects' },
      { selector: '.certificate-card', trigger: '#certificates' },
      { selector: '.timeline-item', trigger: '#journey' },
      { selector: '.contact-form, .contact-panel', trigger: '#contact' },
      { selector: '.stat-card', trigger: '#stats' },
    ];

    groups.forEach(({ selector, trigger }) => {
      gsap.from(selector, {
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger,
          start: 'top 72%',
        },
      });
    });
  };

  setHeroReveal();
  setSectionStagger();

  const updateHeaderShadow = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  updateHeaderShadow();
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
});
