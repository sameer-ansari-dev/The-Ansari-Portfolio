/**
 * Ansari Mohammed Sameer - Portfolio Main JavaScript
 * Dynamic Interactions, Animations, Canvas & Backend API Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
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
     4. Scroll Progress & Header Shadow
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
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------------------------
     5. Scrollspy for Active Navigation Link
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
     6. Dynamic Role Typing Effect
     -------------------------------------------------------------------------- */
  const typedTextEl = document.getElementById('typed-text');
  const typingContainer = document.querySelector('.typing-container');
  if (typedTextEl && !prefersReducedMotion) {
    let roles = [
      'Python Backend Engineer',
      'Flask & FastAPI Specialist',
      'PostgreSQL & Database Architect',
      'RESTful API Developer',
      'Workflow Automation Builder'
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
    let typingSpeed = 85;

    const typeRole = () => {
      const currentRole = roles[roleIndex] || roles[0];

      if (isDeleting) {
        typedTextEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45;
      } else {
        typedTextEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 85;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 1800; // Pause at end of text
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 400; // Pause before typing next word
      }

      setTimeout(typeRole, typingSpeed);
    };

    typeRole();
  } else if (typedTextEl) {
    typedTextEl.textContent = 'Python Backend Developer';
  }

  /* --------------------------------------------------------------------------
     7. Ambient Interactive Particle Canvas
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('particle-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null, y: null, radius: 100 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    const resizeCanvas = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.color = Math.random() > 0.3 ? 'rgba(75, 139, 190, 0.45)' : 'rgba(255, 212, 59, 0.35)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;

        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;

        // Mouse gentle repulsion
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * 1.5;
            this.y -= Math.sin(angle) * 1.5;
          }
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const count = Math.floor(Math.min(width, 1400) / 24);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    initParticles();

    const connectParticles = () => {
      const maxDist = 95;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.15;
            ctx.strokeStyle = `rgba(75, 139, 190, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();
      requestAnimationFrame(animateParticles);
    };

    animateParticles();
  }

  /* --------------------------------------------------------------------------
     8. 3D Card Tilt Effect
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
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /* --------------------------------------------------------------------------
     9. Stats Animated Number Count Up
     -------------------------------------------------------------------------- */
  const countUp = (element) => {
    const target = Number(element.dataset.count || 0);
    if (prefersReducedMotion) {
      element.textContent = `${target}+`;
      return;
    }

    const duration = 1500;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
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
     10. GSAP ScrollTrigger Entrance Animations
     -------------------------------------------------------------------------- */
  if (!prefersReducedMotion && window.gsap) {
    // Hero Entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    heroTl.from('.status-pill', { y: 15, opacity: 0, delay: 0.1 })
          .from('.hero-title', { y: 30, opacity: 0 }, '-=0.5')
          .from('.typing-container', { y: 20, opacity: 0 }, '-=0.5')
          .from('.hero-description', { y: 20, opacity: 0 }, '-=0.4')
          .from('.hero-actions .button', { y: 20, opacity: 0, stagger: 0.1 }, '-=0.4')
          .from('.hero-metrics', { y: 15, opacity: 0 }, '-=0.3')
          .from('.profile-orbit', { scale: 0.9, opacity: 0, duration: 1 }, '-=0.9');

    // ScrollTrigger for sections
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      const animatedSections = [
        { selector: '.feature-card', trigger: '#about' },
        { selector: '.skill-category-card', trigger: '#skills' },
        { selector: '.project-card', trigger: '#projects' },
        { selector: '.certificate-card', trigger: '#certificates' },
        { selector: '.timeline-item', trigger: '#journey' },
        { selector: '.contact-form, .contact-panel', trigger: '#contact' },
      ];

      animatedSections.forEach(({ selector, trigger }) => {
        gsap.from(selector, {
          opacity: 0,
          y: 32,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger,
            start: 'top 75%',
          },
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     11. Certificate Preview Modal
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
     12. AJAX Contact Form with Flask API & Fallback
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

      // Email basic regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'info');
        return;
      }

      // Loading state
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
          showToast(data.message || 'Thanks for reaching out! Message prepared successfully.', 'success');
          contactForm.reset();
        }
      } catch (err) {
        // Standalone static file server fallback
        showToast(`Thank you, ${name}! Your message has been noted. Feel free to also email directly.`, 'success');
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
