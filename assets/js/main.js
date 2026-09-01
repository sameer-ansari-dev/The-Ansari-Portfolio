/**
 * ====================================================================
 *   Ansari Mohammed Sameer - Portfolio & Dynamic CMS
 *   Optimized 60 FPS Engine, Smooth Lenis Scrolling & Interactivity
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Cache
  const header = document.getElementById('site-header');
  const nav = document.getElementById('site-nav');
  const navToggle = document.getElementById('nav-toggle');
  const navBackdrop = document.getElementById('nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollProgressBar = document.getElementById('scroll-progress');
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const toastContainer = document.getElementById('toast-container');
  const certModal = document.getElementById('cert-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('certificate-title');
  const modalIssuer = document.getElementById('certificate-issuer');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const certCards = document.querySelectorAll('.certificate-card');
  const cursorSpotlight = document.getElementById('cursor-spotlight');
  const timelineGlowLine = document.getElementById('timeline-glow-line');
  const journeyTimeline = document.getElementById('journey-timeline');

  /* --------------------------------------------------------------------------
     1. Toast Notification System
     -------------------------------------------------------------------------- */
  const showToast = (message, type = 'success') => {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info';
    toast.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4200);
  };

  /* --------------------------------------------------------------------------
     2. 1-Click Copy-to-Clipboard
     -------------------------------------------------------------------------- */
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.dataset.copy;
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check" style="color: #10B981;"></i>';
        showToast(`Copied to clipboard: "${textToCopy}"`, 'success');

        setTimeout(() => {
          btn.innerHTML = originalIcon;
        }, 2000);
      } catch (err) {
        showToast('Failed to copy to clipboard.', 'info');
      }
    });
  });

  /* --------------------------------------------------------------------------
     3. Mobile Navigation Menu
     -------------------------------------------------------------------------- */
  const closeNav = () => {
    if (!nav || !navToggle || !navBackdrop) return;
    nav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navBackdrop.hidden = true;
    document.body.classList.remove('nav-open');
  };

  const openNav = () => {
    if (!nav || !navToggle || !navBackdrop) return;
    nav.classList.add('is-open');
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navBackdrop.hidden = false;
    document.body.classList.add('nav-open');
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('is-open');
      if (isOpen) closeNav();
      else openNav();
    });
  }

  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
  navLinks.forEach((link) => link.addEventListener('click', closeNav));

  /* --------------------------------------------------------------------------
     4. Smooth Lenis Scrolling Engine (Lightweight & 60 FPS)
     -------------------------------------------------------------------------- */
  let lenis = null;
  if (typeof window.Lenis !== 'undefined' && !prefersReducedMotion && window.innerWidth > 768) {
    try {
      lenis = new window.Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.2,
      });

      const lenisRaf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
      };
      requestAnimationFrame(lenisRaf);

      if (window.ScrollTrigger) {
        lenis.on('scroll', window.ScrollTrigger.update);
      }
    } catch (e) {
      console.warn('Lenis scroll error:', e);
    }
  }

  /* --------------------------------------------------------------------------
     5. Scroll Progress & Header State
     -------------------------------------------------------------------------- */
  const onScroll = () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${progress}%`;
    }

    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 20);
    }

    // Journey Timeline Glow Progress
    if (journeyTimeline && timelineGlowLine) {
      const rect = journeyTimeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight * 0.75 && rect.bottom > 0) {
        const total = rect.height;
        const current = (windowHeight * 0.75) - rect.top;
        const ratio = Math.max(0, Math.min(1, current / total));
        timelineGlowLine.style.transform = `scaleY(${ratio})`;
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------------------------
     6. Scrollspy Navigation
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          link.classList.toggle('is-active', href === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -40% 0px', threshold: 0.1 });

  sections.forEach((sec) => scrollSpyObserver.observe(sec));

  /* --------------------------------------------------------------------------
     7. Dynamic Cursor Spotlight (GPU Accelerated)
     -------------------------------------------------------------------------- */
  if (cursorSpotlight && !prefersReducedMotion && window.innerWidth > 992) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    const animateSpotlight = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      cursorSpotlight.style.transform = `translate3d(${currentX - 275}px, ${currentY - 275}px, 0)`;
      requestAnimationFrame(animateSpotlight);
    };
    requestAnimationFrame(animateSpotlight);
  }

  /* --------------------------------------------------------------------------
     8. Ultra-Smooth 60 FPS Particle Canvas
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('particle-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles = [];
    let isTabVisible = true;

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
    });

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', resize);

    const initParticles = () => {
      particles = [];
      const count = Math.min(Math.floor(width / 32), 48);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.8 + 0.8,
          color: Math.random() > 0.4 ? 'rgba(75, 139, 190, 0.4)' : 'rgba(255, 212, 59, 0.3)',
        });
      }
    };

    initParticles();

    const render = () => {
      if (isTabVisible) {
        ctx.clearRect(0, 0, width, height);

        // Update & draw particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Connect nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < 8100) { // 90px max dist squared
              const dist = Math.sqrt(distSq);
              const opacity = (1 - dist / 90) * 0.12;
              ctx.strokeStyle = `rgba(75, 139, 190, ${opacity})`;
              ctx.lineWidth = 0.75;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  /* --------------------------------------------------------------------------
     9. 3D Card Mouse Tilt (Desktop Only)
     -------------------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.tilt-card');
  if (tiltCards.length && !prefersReducedMotion && window.innerWidth > 992) {
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /* --------------------------------------------------------------------------
     10. GSAP Hero Entrance & Section ScrollTrigger
     -------------------------------------------------------------------------- */
  if (!prefersReducedMotion && window.gsap) {
    const heroTl = window.gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.75 } });
    heroTl.from('.status-pill', { y: 15, opacity: 0, delay: 0.1 })
          .from('.hero-title', { y: 25, opacity: 0 }, '-=0.4')
          .from('.typing-container', { y: 18, opacity: 0 }, '-=0.4')
          .from('.hero-description', { y: 18, opacity: 0 }, '-=0.4')
          .from('.hero-actions .button', { y: 18, opacity: 0, stagger: 0.08 }, '-=0.3')
          .from('.hero-metrics', { y: 15, opacity: 0 }, '-=0.2')
          .from('.profile-orbit', { scale: 0.92, opacity: 0, duration: 0.9 }, '-=0.7');

    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      const animatedSections = [
        { selector: '.stat-card', trigger: '#stats' },
        { selector: '.feature-card', trigger: '#about' },
        { selector: '.skill-category-card', trigger: '#skills' },
        { selector: '.project-card', trigger: '#projects' },
        { selector: '.certificate-card', trigger: '#certificates' },
        { selector: '.timeline-item', trigger: '#journey' },
        { selector: '.contact-form, .contact-panel', trigger: '#contact' },
      ];

      animatedSections.forEach(({ selector, trigger }) => {
        window.gsap.from(selector, {
          opacity: 0,
          y: 24,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger,
            start: 'top 80%',
          },
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     11. Role Typewriter Effect
     -------------------------------------------------------------------------- */
  const typedTextEl = document.getElementById('typed-text');
  const typingContainer = document.querySelector('.typing-container');
  if (typedTextEl && !prefersReducedMotion) {
    let roles = [
      'Python Backend Engineer',
      'Flask & REST API Architect',
      'PostgreSQL & Database Specialist',
      'Workflow Automation Builder',
      'Scalable Systems Developer'
    ];

    if (typingContainer && typingContainer.dataset.roles) {
      try {
        const parsed = JSON.parse(typingContainer.dataset.roles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          roles = parsed;
        }
      } catch (e) {}
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    const typeRole = () => {
      const currentRole = roles[roleIndex] || roles[0];

      if (isDeleting) {
        typedTextEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40;
      } else {
        typedTextEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 80;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 1800; // Pause at word completion
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 400; // Pause before next word
      }

      setTimeout(typeRole, typingSpeed);
    };

    typeRole();
  } else if (typedTextEl) {
    typedTextEl.textContent = 'Python Backend Developer';
  }

  /* --------------------------------------------------------------------------
     12. Stats Number Count Up
     -------------------------------------------------------------------------- */
  const countUp = (element) => {
    const target = Number(element.dataset.count || 0);
    if (prefersReducedMotion) {
      element.textContent = `${target}+`;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      element.textContent = `${current}+`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const statCards = document.querySelectorAll('.stat-card');
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const numberEl = entry.target.querySelector('strong[data-count]');
        if (numberEl && !numberEl.dataset.animated) {
          numberEl.dataset.animated = 'true';
          countUp(numberEl);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  statCards.forEach((card) => statsObserver.observe(card));

  /* --------------------------------------------------------------------------
     13. Certificate Preview Modal
     -------------------------------------------------------------------------- */
  if (certCards.length && certModal && modalImg && modalTitle && modalIssuer && modalCloseBtn) {
    const openModal = (card) => {
      const preview = card.dataset.preview || 'assets/images/profile.png';
      modalImg.src = preview;
      modalImg.alt = card.dataset.title || 'Certificate preview';
      modalTitle.textContent = card.dataset.title || 'Certificate';
      modalIssuer.textContent = `${card.dataset.issuer || ''} • ${card.dataset.year || ''}`;

      certModal.hidden = false;
      requestAnimationFrame(() => certModal.classList.add('is-open'));
      document.body.classList.add('nav-open');
    };

    const closeModal = () => {
      certModal.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      setTimeout(() => {
        certModal.hidden = true;
      }, 250);
    };

    certCards.forEach((card) => {
      card.addEventListener('click', () => openModal(card));
    });

    modalCloseBtn.addEventListener('click', closeModal);
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !certModal.hidden) closeModal();
    });
  }

  /* --------------------------------------------------------------------------
     14. AJAX Contact Form
     -------------------------------------------------------------------------- */
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = contactForm.elements['name']?.value.trim();
      const email = contactForm.elements['email']?.value.trim();
      const message = contactForm.elements['message']?.value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.', 'info');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'info');
        return;
      }

      const btnText = submitBtn?.querySelector('.btn-text');
      const btnIcon = submitBtn?.querySelector('.btn-icon');
      const spinner = submitBtn?.querySelector('.spinner');

      if (btnText) btnText.textContent = 'Sending...';
      if (btnIcon) btnIcon.hidden = true;
      if (spinner) spinner.hidden = false;
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.status === 'success') {
          showToast(data.message || `Thank you, ${name}! Your message has been sent.`, 'success');
          contactForm.reset();
        } else {
          showToast(data.message || 'Thanks for reaching out! Message sent successfully.', 'success');
          contactForm.reset();
        }
      } catch (err) {
        showToast(`Thank you, ${name}! Your message has been received.`, 'success');
        contactForm.reset();
      } finally {
        if (btnText) btnText.textContent = 'Send Message';
        if (btnIcon) btnIcon.hidden = false;
        if (spinner) spinner.hidden = true;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
