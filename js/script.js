document.addEventListener('DOMContentLoaded', () => {
  // ========== UTILITY HELPERS ==========
  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => (ctx || document).querySelectorAll(sel);
  const get = id => document.getElementById(id);

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const throttle = (fn, ms) => { let wait = false; return (...a) => { if (!wait) { fn(...a); wait = true; setTimeout(() => { wait = false; }, ms); } }; };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ========== 0. RANDOM HERO VIDEO ==========
  const heroVideo = qs('.hero__video-bg video');
  if (heroVideo) {
    const videos = [
      'https://www.shutterstock.com/shutterstock/videos/3851460793/preview/stock-footage-new-york-city-october-a-day-time-lapse-vertical-view-of-traffic-on-th-avenue-in.webm',
      'https://www.shutterstock.com/shutterstock/videos/3718333709/preview/stock-footage-business-collage-hands-and-people-with-technology-phone-and-typing-email-on-laptop-in-office.webm',
      'https://www.shutterstock.com/shutterstock/videos/3798323355/preview/stock-footage-a-silhouette-in-a-vibrant-digital-space-capturing-the-essence-of-technology-and-continuous-data.webm'
    ];
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    const source = heroVideo.querySelector('source');
    if (source) {
      source.src = randomVideo;
      heroVideo.load();
    }
  }

  // ========== 1. PAGE LOADER ==========
  const pageLoader = qs('.page-loader');
  if (pageLoader) {
    window.addEventListener('load', () => {
      pageLoader.classList.add('hidden');
    });
  }

  // ========== 2. MOBILE MENU TOGGLE ==========
  const headerToggle = get('headerToggle');
  const headerNav = get('headerNav');
  const headerOverlay = get('headerOverlay');
  if (headerToggle && headerNav) {
    const toggleMenu = (open) => {
      headerNav.classList.toggle('open', open);
      headerToggle.classList.toggle('open', open);
      headerToggle.setAttribute('aria-expanded', open);
      if (headerOverlay) headerOverlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    headerToggle.addEventListener('click', () => {
      const isOpen = !headerNav.classList.contains('open');
      toggleMenu(isOpen);
    });
    if (headerOverlay) {
      headerOverlay.addEventListener('click', () => toggleMenu(false));
    }
    qsa('.header__nav-link', headerNav).forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  // ========== 3. PROGRESS BAR ==========
  const progressBar = qs('.progress-bar');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const percent = (scrollTop / (docHeight - winHeight)) * 100;
      progressBar.style.width = Math.min(percent, 100) + '%';
    };
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { updateProgress(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  // ========== 4. SCROLL SPY / NAVBAR ==========
  const header = qs('.header');
  const allNavLinks = qsa('.header__nav-link');
  let allSections = [];

  const updateActiveLink = () => {
    if (!allSections.length) {
      allSections = qsa('section[id]');
    }
    const scrollY = window.scrollY + 120;
    let current = '';
    allSections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = section.getAttribute('id');
      }
    });
    allNavLinks.forEach(a => {
      a.classList.toggle('header__nav-link--active', a.getAttribute('href') === `#${current}`);
    });
  };

  const handleScroll = () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 100);
    }
    updateActiveLink();
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ========== 5. HEADER HIDE/SHOW ON SCROLL ==========
  let lastScrollY = 0;
  if (header) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // ========== 6. PARTICLE BACKGROUND ==========
  const canvas = get('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animationId = null;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    const debouncedResize = debounce(resizeCanvas, 200);
    window.addEventListener('resize', debouncedResize);

    canvas.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    canvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.opacity = 0.6;
        this.isPrimary = Math.random() > 0.7;
      }
      update() {
        let dx = 0, dy = 0;
        if (mouse.x !== null && mouse.y !== null) {
          dx = this.x - mouse.x;
          dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist > 0) {
            const force = (100 - dist) / 100 * 0.5;
            this.x += (dx / dist) * force;
            this.y += (dy / dist) * force;
          }
        }
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.isPrimary ? 'rgba(59,130,246,0.4)' : `rgba(255,255,255,${this.opacity})`;
        ctx.fill();
      }
    }

    const initParticles = count => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };
    initParticles(100);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
  }

  // ========== 7. SCROLL REVEAL ANIMATION ==========
  const revealElements = qsa('.reveal');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-delay');
          if (delay) {
            el.style.transitionDelay = delay + 'ms';
          }
          el.classList.add('visible');
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ========== 8. SERVICES CAROUSEL + CARD FLIP ==========
  const servicesTrack = get('servicesTrack');
  const servicesCarousel = get('servicesCarousel');
  const serviceCards = qsa('.service-card:not(.service-card--lead)');
  const allServiceCards = qsa('.service-card');
  const servicesDots = get('servicesDots');
  const servicesPrev = get('servicesPrev');
  const servicesNext = get('servicesNext');
  let servicesIndex = 0;

  if (servicesTrack && serviceCards.length) {
    const updateServicesCarousel = (index) => {
      const total = allServiceCards.length;
      servicesIndex = (index + total) % total;
      const cardWidth = allServiceCards[0].offsetWidth + 24;
      servicesTrack.style.transform = `translateX(-${servicesIndex * cardWidth}px)`;
      const dots = servicesDots ? qsa('.services__dot', servicesDots) : [];
      dots.forEach((d, i) => d.classList.toggle('active', i === servicesIndex));
      if (servicesPrev) servicesPrev.disabled = servicesIndex === 0;
      if (servicesNext) servicesNext.disabled = servicesIndex === total - 1;
    };

    if (servicesPrev) servicesPrev.addEventListener('click', () => updateServicesCarousel(servicesIndex - 1));
    if (servicesNext) servicesNext.addEventListener('click', () => updateServicesCarousel(servicesIndex + 1));
    if (servicesDots) {
      qsa('.services__dot', servicesDots).forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.getAttribute('data-index'));
          updateServicesCarousel(idx);
        });
      });
    }

    // Wheel navigation
    servicesCarousel.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        updateServicesCarousel(servicesIndex + 1);
      } else {
        updateServicesCarousel(servicesIndex - 1);
      }
    }, { passive: false });

    // Touch navigation
    let touchStartX = 0;
    let touchEndX = 0;
    servicesCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    servicesCarousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) updateServicesCarousel(servicesIndex + 1);
        else updateServicesCarousel(servicesIndex - 1);
      }
    }, { passive: true });

    // Card Flip on click
    allServiceCards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('service-card--lead')) {
          const target = qs('#lead-magnet');
          if (target) {
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
          }
          return;
        }
        card.classList.toggle('flipped');
      });
    });

    // Keyboard navigation
    servicesCarousel.setAttribute('tabindex', '0');
    servicesCarousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') updateServicesCarousel(servicesIndex - 1);
      else if (e.key === 'ArrowRight') updateServicesCarousel(servicesIndex + 1);
    });

    // Init
    updateServicesCarousel(0);

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => updateServicesCarousel(servicesIndex), 200);
    });
  }

  // ========== 9. LEAD MAGNET FORM ==========
  const leadForm = get('leadForm');
  const leadSuccess = get('leadSuccess');
  if (leadForm) {
    const leadName = get('leadName');
    const leadEmail = get('leadEmail');
    const leadSector = get('leadSector');
    const leadChallenge = get('leadChallenge');

    const validateLead = () => {
      let valid = true;
      [leadName, leadEmail, leadSector, leadChallenge].forEach(field => {
        if (field) field.classList.remove('error');
      });
      if (!leadName || leadName.value.trim().length <= 2) {
        if (leadName) leadName.classList.add('error');
        valid = false;
      }
      if (!leadEmail || !emailRegex.test(leadEmail.value.trim())) {
        if (leadEmail) leadEmail.classList.add('error');
        valid = false;
      }
      if (!leadSector || leadSector.value === '') {
        if (leadSector) leadSector.classList.add('error');
        valid = false;
      }
      if (!leadChallenge || leadChallenge.value === '') {
        if (leadChallenge) leadChallenge.classList.add('error');
        valid = false;
      }
      return valid;
    };

    leadForm.addEventListener('submit', e => {
      e.preventDefault();
      if (validateLead()) {
        const submitBtn = leadForm.querySelector('.form__submit, button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando...';
        }
        setTimeout(() => {
          leadForm.style.display = 'none';
          if (leadSuccess) {
            leadSuccess.classList.add('success');
            leadSuccess.style.opacity = '0';
            requestAnimationFrame(() => {
              leadSuccess.style.transition = 'opacity 0.5s ease';
              leadSuccess.style.opacity = '1';
            });
          }
        }, 1500);
      }
    });
  }

  // ========== 10. COUNTER ANIMATION ==========
  const counters = qsa('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-count'));
          const isDecimal = target % 1 !== 0;
          const duration = 2500;
          const startTime = performance.now();
          const animate = now => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(2, -10 * progress);
            const current = eased * target;
            el.textContent = isDecimal ? current.toFixed(1) : Math.round(current).toString();
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = isDecimal ? target.toFixed(1) : target.toString();
              el.classList.add('count-complete');
              setTimeout(() => el.classList.remove('count-complete'), 600);
            }
          };
          requestAnimationFrame(animate);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  // ========== 11. FINANCIAL PARTNERS CAROUSEL ==========
  const finTrack = get('finPartnersTrack');
  const finPrev = get('finPrev');
  const finNext = get('finNext');
  if (finTrack) {
    const finCards = qsa('.fin-partner-card', finTrack);
    let finIndex = 0;
    const getVisibleCount = () => {
      const w = window.innerWidth;
      if (w <= 480) return 2;
      if (w <= 768) return 3;
      return 4;
    };
    const updateFinCarousel = () => {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, finCards.length - visible);
      finIndex = Math.min(finIndex, maxIndex);
      const cardWidth = finCards[0].offsetWidth + 20;
      finTrack.style.transform = `translateX(-${finIndex * cardWidth}px)`;
      if (finPrev) finPrev.style.opacity = finIndex === 0 ? '0.3' : '1';
      if (finNext) finNext.style.opacity = finIndex >= maxIndex ? '0.3' : '1';
    };
    if (finPrev) finPrev.addEventListener('click', () => { finIndex = Math.max(0, finIndex - 1); updateFinCarousel(); });
    if (finNext) finNext.addEventListener('click', () => { finIndex++; updateFinCarousel(); });
    let finResize;
    window.addEventListener('resize', () => { clearTimeout(finResize); finResize = setTimeout(updateFinCarousel, 200); });
    updateFinCarousel();
  }

  // ========== 12. TESTIMONIAL CAROUSEL ==========
  const carousel = qs('.carousel');
  if (carousel) {
    const track = get('carouselTrack') || qs('.carousel__track', carousel);
    const slides = qsa('.carousel__slide', carousel);
    const prevBtn = get('carouselPrev') || qs('.carousel__btn--prev', carousel);
    const nextBtn = get('carouselNext') || qs('.carousel__btn--next', carousel);
    const dotsContainer = get('carouselDots') || qs('.carousel__dots', carousel);
    let currentIndex = 0;
    let autoplayTimer = null;
    const interval = 5000;

    if (dotsContainer && slides.length) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'carousel__dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    const goToSlide = index => {
      if (!track || !slides.length) return;
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      const dots = dotsContainer ? qsa('.carousel__dot', dotsContainer) : [];
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(() => goToSlide(currentIndex + 1), interval);
    };
    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentIndex - 1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentIndex + 1); startAutoplay(); });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    startAutoplay();
  }

  // ========== 12. FAQ ACCORDION ==========
  const faqList = get('faqList');
  const faqItems = faqList ? qsa('.faq-item', faqList) : qsa('.faq-item');
  faqItems.forEach(item => {
    const question = qs('.faq-item__question', item);
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // ========== 13. SMOOTH SCROLL ==========
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });

  // ========== 14. CONTATO FORM ==========
  const contactForm = get('contactForm');
  if (contactForm) {
    const formName = get('formName');
    const formEmail = get('formEmail');
    const formPhone = get('formPhone');
    const formCompany = get('formCompany');
    const formMessage = get('formMessage');

    const validateContact = () => {
      let valid = true;
      [formName, formEmail, formMessage].forEach(field => {
        if (field) field.classList.remove('error');
      });
      if (!formName || formName.value.trim().length <= 2) {
        if (formName) formName.classList.add('error');
        valid = false;
      }
      if (!formEmail || !emailRegex.test(formEmail.value.trim())) {
        if (formEmail) formEmail.classList.add('error');
        valid = false;
      }
      if (!formMessage || formMessage.value.trim().length < 10) {
        if (formMessage) formMessage.classList.add('error');
        valid = false;
      }
      return valid;
    };

    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      if (validateContact()) {
        const btn = contactForm.querySelector('.form__submit, button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Enviando...';
        }
        const feedback = qs('.form__feedback', contactForm) || (() => {
          const div = document.createElement('div');
          div.className = 'form__feedback';
          contactForm.appendChild(div);
          return div;
        })();
        setTimeout(() => {
          contactForm.reset();
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Enviar Mensagem';
          }
          feedback.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
          feedback.className = 'form-feedback success';
          setTimeout(() => {
            feedback.className = 'form-feedback';
            feedback.textContent = '';
          }, 4000);
        }, 1500);
      }
    });
  }

  // ========== 15. FLOATING CTA ==========
  const floatingCta = qs('.floating-cta');
  if (floatingCta) {
    floatingCta.addEventListener('click', e => {
      e.preventDefault();
      const target = qs('#contato');
      if (target) {
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  }

  // ========== 16. SCROLL TO TOP ==========
  const scrollTop = qs('.scroll-top');
  if (scrollTop) {
    window.addEventListener('scroll', () => {
      scrollTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== 17. RIPPLE EFFECT ==========
  qsa('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // ========== 18. COOKIE BANNER ==========
  const cookieBanner = qs('.cookie-banner');
  if (cookieBanner) {
    if (!localStorage.getItem('cookiesAccepted')) {
      cookieBanner.classList.add('visible');
    }
    const acceptBtn = get('cookieAccept') || qs('button', cookieBanner);
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.remove('visible');
      });
    }
  }

  // ========== 19. 3D TILT EFFECT ==========
  const tiltCards = qsa('.service-card, .team-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });

  // ========== 20. PARALLAX SECTIONS ==========
  const parallaxSections = qsa('.hero, .about, .services, .results, .faq');
  if (parallaxSections.length) {
    let parallaxTicking = false;
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const speed = 0.15;
              const offset = (scrollY - section.offsetTop) * speed;
              const visual = qs('.hero__graphic', section);
              if (visual) {
                visual.style.transform = `translateY(${offset * 0.3}px)`;
              }
            }
          });
          parallaxTicking = false;
        });
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  // ========== 21. TYPEWRITER EFFECT (Hero Subtitle) ==========
  const heroSubtitle = qs('.hero__subtitle');
  if (heroSubtitle) {
    const originalText = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    let typeIndex = 0;
    const typeSpeed = 25;
    const typeWriter = () => {
      if (typeIndex < originalText.length) {
        heroSubtitle.textContent += originalText.charAt(typeIndex);
        typeIndex++;
        setTimeout(typeWriter, typeSpeed);
      }
    };
    setTimeout(typeWriter, 800);
  }

  // ========== 22. MAGNETIC BUTTONS ==========
  const magneticBtns = qsa('.hero__actions .btn, .floating-cta');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ========== 23. NEWSLETTER FORM ==========
  const newsletterForm = get('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = qs('input', newsletterForm);
      const btn = qs('button', newsletterForm);
      if (input && btn) {
        btn.textContent = '✓ Inscrito!';
        btn.disabled = true;
        input.value = '';
        setTimeout(() => {
          btn.textContent = 'Inscrever';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  // ========== 24. KEYBOARD NAV FOR CAROUSEL ==========
  if (carousel) {
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentIndex - 1);
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentIndex + 1);
        startAutoplay();
      }
    });
  }

  // ========== 25. DYNAMIC PARTICLE COUNT ==========
  // Already handled above, but reduce on mobile
  if (canvas && window.innerWidth < 768) {
    initParticles(50);
  }

  // ========== 26. CASE MODAL ==========
  const caseData = [
    {
      tag: 'Estratégia & Growth',
      title: 'Reposicionamento da NovaTech',
      subtitle: 'Como transformamos uma empresa estagnada em referência do setor',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&auto=format&q=80',
      challenge: 'A NovaTech era uma empresa de tecnologia com mais de 10 anos de mercado, mas enfrentava crescimento estagnado, marca desgastada e perda gradual de participação para concorrentes mais ágeis. O funil de vendas era ineficiente, o CAC estava alto e a equipe comercial não tinha clareza de posicionamento.',
      solution: 'Conduzimos um reposicionamento completo de marca, reestruturamos a estratégia de go-to-market, implementamos inbound marketing com automação de funil, criamos conteúdo de valor para cada etapa da jornada do cliente e otimizamos todo o processo comercial com CRM integrado.',
      stack: ['HubSpot', 'Salesforce', 'Google Analytics', 'WordPress', 'Mailchimp', 'LinkedIn Ads'],
      results: [
        { number: '+180%', label: 'Crescimento em 18 meses' },
        { number: '3x', label: 'Geração de leads' },
        { number: '-40%', label: 'Redução do CAC' }
      ],
      quote: 'A PronoiA não fez só um rebranding — ela redefiniu quem somos e para onde vamos. O crescimento foi imediato e sustentável.',
      cite: '— Marcos Andrade, CEO da NovaTech'
    },
    {
      tag: 'Transformação Digital',
      title: 'Digitalização da HealthPlus',
      subtitle: 'Modernização completa de uma rede de saúde com automação e portal do paciente',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop&auto=format&q=80',
      challenge: 'A HealthPlus operava com processos manuais e sistemas fragmentados. Agendamentos eram feitos por telefone, prontuários em papel, e a experiência do paciente era deficiente. Custos operacionais estavam insustentáveis e a satisfação dos pacientes em queda.',
      solution: 'Implementamos um prontuário eletrônico integrado, automação completa de agendamentos, portal do paciente com autoatendimento, integração com sistemas de saúde via API FHIR, e migramos toda a infraestrutura para a nuvem com arquitetura escalável.',
      stack: ['Supabase', 'React', 'Node.js', 'FHIR API', 'Docker', 'AWS', 'Twilio'],
      results: [
        { number: '-60%', label: 'Redução de custos operacionais' },
        { number: '95%', label: 'Satisfação dos pacientes' },
        { number: '3x', label: 'Agendamentos online' }
      ],
      quote: 'A transformação digital que a PronoiA liderou mudou completamente nossa relação com os pacientes. Hoje somos referência em tecnologia na saúde.',
      cite: '— Ricardo Lemos, CTO da HealthPlus'
    },
    {
      tag: 'Marketing Digital',
      title: 'Expansão do EducaBrasil',
      subtitle: 'Estratégia de marketing digital e SEO que multiplicou o alcance orgânico',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format&q=80',
      challenge: 'O Grupo EducaBrasil tinha um produto excelente, mas não conseguia escalar a captação de alunos. O tráfego orgânico era baixo, dependiam de mídia paga com ROI decrescente, e não tinham estratégia de conteúdo estruturada.',
      solution: 'Desenvolvemos uma estratégia completa de SEO e marketing de conteúdo, criamos um blog com mais de 200 artigos otimizados, implementamos automação de email marketing com nurturing, e reestruturamos a arquitetura de informação do site para conversão.',
      stack: ['Google Search Console', 'SEMrush', 'WordPress', 'RD Station', 'Hotjar', 'Google Tag Manager'],
      results: [
        { number: '+250%', label: 'Leads orgânicos' },
        { number: '+400%', label: 'Tráfego orgânico' },
        { number: '-55%', label: 'Custo por lead' }
      ],
      quote: 'Em 12 meses, saímos de uma operação dependente de mídia paga para um motor de crescimento orgânico que funciona 24/7.',
      cite: '— Juliana Martins, Diretora do EducaBrasil'
    },
    {
      tag: 'Processos & IA',
      title: 'Otimização da GreenField',
      subtitle: 'Automação inteligente de processos com IA que reduziu custos operacionais',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop&auto=format&q=80',
      challenge: 'A GreenField, empresa do setor agrícola, tinha processos manuais repetitivos que consumiam horas de trabalho da equipe. Relatórios eram gerados manualmente, análises de safra eram lentas, e a tomada de decisão era baseada em intuição, não em dados.',
      solution: 'Implementamos automação de processos com IA, criamos pipelines de dados para análise preditiva de safra, desenvolvemos dashboards em tempo real para a liderança, e integramos sensores IoT com modelos de machine learning para otimização de recursos.',
      stack: ['Python', 'TensorFlow', 'Power BI', 'Azure IoT', 'PostgreSQL', 'FastAPI', 'Docker'],
      results: [
        { number: '-45%', label: 'Tempo operacional' },
        { number: '+30%', label: 'Produtividade' },
        { number: '99.5%', label: 'Precisão dos relatórios' }
      ],
      quote: 'A automação com IA que a PronoiA implementou transformou nossa operação. Decisões que levavam dias agora tomam minutos.',
      cite: '— Patricia Souza, COO da GreenField'
    }
  ];

  const caseModal = get('caseModal');
  const caseModalContent = get('caseModalContent');
  const caseModalOverlay = get('caseModalOverlay');
  const caseModalClose = get('caseModalClose');

  const openCaseModal = (index) => {
    const data = caseData[index];
    if (!data || !caseModal) return;

    get('caseModalImage').src = data.image;
    get('caseModalImage').alt = data.title;
    get('caseModalTag').textContent = data.tag;
    get('caseModalTitle').textContent = data.title;
    get('caseModalSubtitle').textContent = data.subtitle;
    get('caseModalChallenge').textContent = data.challenge;
    get('caseModalSolution').textContent = data.solution;

    const stackContainer = get('caseModalStack');
    if (stackContainer) {
      stackContainer.innerHTML = '';
      data.stack.forEach(tech => {
        const span = document.createElement('span');
        span.textContent = tech;
        stackContainer.appendChild(span);
      });
    }

    const resultsContainer = get('caseModalResults');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
      data.results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'case-modal__result';
        div.innerHTML = `<span class="case-modal__result-number">${result.number}</span><span class="case-modal__result-label">${result.label}</span>`;
        resultsContainer.appendChild(div);
      });
    }

    get('caseModalQuote').textContent = `"${data.quote}"`;
    get('caseModalCite').textContent = data.cite;

    caseModal.classList.add('active');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    caseModalContent.scrollTop = 0;
  };

  const closeCaseModal = () => {
    if (!caseModal) return;
    caseModal.classList.remove('active');
    caseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  qsa('.case-card').forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.getAttribute('data-case'));
      openCaseModal(index);
    });
  });

  if (caseModalClose) caseModalClose.addEventListener('click', closeCaseModal);
  if (caseModalOverlay) caseModalOverlay.addEventListener('click', closeCaseModal);

  if (caseModal) {
    caseModal.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCaseModal();
    });
  }

  const caseModalCta = get('caseModalCta');
  if (caseModalCta) {
    caseModalCta.addEventListener('click', () => {
      closeCaseModal();
    });
  }
});
