document.addEventListener('DOMContentLoaded', () => {
  /* ── Sticky Header scroll hide/show ── */
  const nav = document.getElementById('nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    
    // Slide up/down menu
    if (y > lastY && y > 100) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }

    // Blurred solid backdrop on scroll
    if (y > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastY = y;
  }, { passive: true });

  /* ── Mobile Sidebar Drawer ── */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');

  if (menuBtn && mobileMenu && mobileOverlay) {
    function openMenu() {
      menuBtn.classList.add('active');
      mobileMenu.classList.add('open');
      mobileOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; // Stop background scrolling
    }

    function closeMenu() {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('open');
      mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileOverlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ── Stat Counters Animation ── */
  function animateCounters(els) {
    els.forEach(el => {
      if (el.classList.contains('counted')) return;
      el.classList.add('counted');
      
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000; // 2 seconds
      const startTime = performance.now();
      
      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Quartic Out easing function for organic growth curve
        const ease = 1 - Math.pow(1 - progress, 4);
        
        el.textContent = Math.round(ease * target);
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  /* ── Scroll Intersection Observer for Counters & Fade-Ups ── */
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        
        // Find counters within the viewport sections
        const sectionCounters = e.target.querySelectorAll('.counter, [data-target]');
        if (sectionCounters.length) {
          animateCounters(sectionCounters);
        }
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-up, .stats-section').forEach(el => observer.observe(el));

  // Initialize hero counters immediately on page load (if on home page)
  setTimeout(() => {
    animateCounters(document.querySelectorAll('.hero-stat-num'));
  }, 400);

  /* ── Interactive Forms & Custom Success Modal ── */
  const contactForm = document.getElementById('contactForm');
  const quoteForm = document.getElementById('quoteForm');
  const successModal = document.getElementById('successModal');
  const successName = document.getElementById('successName');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const loaderBar = document.querySelector('.success-loader-bar');

  function showSuccessModal(nameValue) {
    if (successName) {
      successName.textContent = nameValue;
    }
    if (successModal) {
      successModal.classList.add('open');
      if (loaderBar) {
        loaderBar.style.transition = 'none';
        loaderBar.style.width = '0%';
        setTimeout(() => {
          loaderBar.style.transition = 'width 2s linear';
          loaderBar.style.width = '100%';
        }, 50);
      }
    }
  }

  // Handle Contact Form Submit
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const name = document.getElementById('fname').value;
      const email = document.getElementById('femail').value;
      const phone = document.getElementById('fphone').value;
      const subject = document.getElementById('fsubject').value || 'Inquiry';
      const msg = document.getElementById('fmessage').value;

      showSuccessModal(name);

      const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${msg}`;
      const mailtoLink = `mailto:info@nsrcogroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 2000);
    });
  }

  // Handle Quote Form Submit
  if (quoteForm) {
    quoteForm.addEventListener('submit', e => {
      e.preventDefault();

      const firstName = document.getElementById('fname').value;
      const lastName = document.getElementById('flastname').value;
      const email = document.getElementById('femail').value;
      const phone = document.getElementById('fphone').value;
      const subject = document.getElementById('fsubject').value || 'Quote Request';
      const msg = document.getElementById('fmessage').value;

      const fullName = `${firstName} ${lastName}`;
      showSuccessModal(fullName);

      const body = `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nProject Type: ${subject}\n\nProject Details:\n${msg}`;
      const mailtoLink = `mailto:info@nsrcogroup.com?subject=Quote: ${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 2000);
    });
  }

  // Close Modal Handler
  if (closeSuccessBtn && successModal) {
    closeSuccessBtn.addEventListener('click', () => {
      successModal.classList.remove('open');
      if (contactForm) contactForm.reset();
      if (quoteForm) quoteForm.reset();
      
      // Reset floating label states
      document.querySelectorAll('input, textarea').forEach(input => {
        input.blur();
      });
    });
  }
});
