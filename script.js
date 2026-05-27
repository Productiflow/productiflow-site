/* ============================================================
   PRODUCTIFLOW — Main Script
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Nav scroll state ---------- */
  const navWrapper = document.querySelector('.nav-wrapper');

  function updateNav() {
    navWrapper.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();


  /* ---------- Mobile hamburger ---------- */
  const hamburger = document.querySelector('.nav-hamburger');
  hamburger.addEventListener('click', () => {
    navWrapper.classList.toggle('menu-open');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-mobile-menu a').forEach(link => {
    link.addEventListener('click', () => navWrapper.classList.remove('menu-open'));
  });


  /* ---------- Smooth scroll for anchor buttons ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#stripe' || href === '#calendly') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ---------- Wave Lines ---------- */
  const waveSvg = document.getElementById('waves');

  // speed: autonomous time-based drift (rad/ms). Full cycle ≈ 30–60 s.
  // scrollSpeed: additional phase shift per pixel scrolled.
  const waveConfigs = [
    { color: '#33658A', opacity: 0.55, amplitude: 90,  period: 680,  phase: 0,   xPct: 0.10, speed:  0.00024, scrollSpeed:  0.005 },
    { color: '#33658A', opacity: 0.40, amplitude: 120, period: 820,  phase: 1.2, xPct: 0.30, speed: -0.00019, scrollSpeed: -0.004 },
    { color: '#86BBD8', opacity: 0.50, amplitude: 80,  period: 600,  phase: 2.5, xPct: 0.50, speed:  0.00029, scrollSpeed:  0.006 },
    { color: '#86BBD8', opacity: 0.35, amplitude: 140, period: 900,  phase: 0.8, xPct: 0.70, speed: -0.00016, scrollSpeed: -0.005 },
    { color: '#33658A', opacity: 0.30, amplitude: 70,  period: 740,  phase: 3.8, xPct: 0.90, speed:  0.00021, scrollSpeed:  0.003 },
  ];

  // Create SVG path elements
  const wavePaths = waveConfigs.map(cfg => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'wave-path');
    path.setAttribute('stroke', cfg.color);
    path.setAttribute('stroke-opacity', cfg.opacity);
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('fill', 'none');
    waveSvg.appendChild(path);
    return path;
  });

  let svgW = 1440, svgH = 900;
  let scrollY = 0;
  let animTime = 0;
  let lastTime = null;

  function resizeSvg() {
    svgW = waveSvg.clientWidth || window.innerWidth;
    svgH = waveSvg.clientHeight || window.innerHeight;
    // Keep coordinate system 1:1 with CSS pixels regardless of viewport size
    waveSvg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  }

  // Build a smooth vertical sine wave path — blends slow autonomous drift with scroll phase.
  function buildWavePath(cfg) {
    const x = svgW * cfg.xPct;
    const numPoints = 120;
    const yStep = svgH / numPoints;
    let d = '';
    for (let i = 0; i <= numPoints; i++) {
      const y = i * yStep;
      const wave = cfg.amplitude * Math.sin(
        (y / cfg.period) * Math.PI * 2 + cfg.phase + animTime * cfg.speed + scrollY * cfg.scrollSpeed
      );
      const px = x + wave;
      d += i === 0 ? `M ${px.toFixed(2)} ${y.toFixed(2)}` : ` L ${px.toFixed(2)} ${y.toFixed(2)}`;
    }
    return d;
  }

  function tick(ts) {
    if (lastTime === null) lastTime = ts;
    animTime += ts - lastTime;
    lastTime = ts;

    waveConfigs.forEach((cfg, i) => {
      wavePaths[i].setAttribute('d', buildWavePath(cfg));
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', resizeSvg, { passive: true });
  resizeSvg();
  requestAnimationFrame(tick);


  /* ---------- Before/After Comparison Slider ---------- */
  const slider = document.getElementById('comparisonSlider');
  const afterEl = slider?.querySelector('.comparison-after');
  const handle  = document.getElementById('comparisonHandle');

  if (slider && afterEl && handle) {
    let isDragging = false;
    let pct = 50;

    function setSliderPct(x) {
      const rect = slider.getBoundingClientRect();
      let p = ((x - rect.left) / rect.width) * 100;
      p = Math.max(4, Math.min(96, p));
      pct = p;
      afterEl.style.clipPath = `inset(0 0 0 ${p}%)`;
      handle.style.left = `${p}%`;
    }

    // Set initial position
    afterEl.style.clipPath = 'inset(0 0 0 50%)';
    handle.style.left = '50%';

    slider.addEventListener('mousedown', e => {
      isDragging = true;
      setSliderPct(e.clientX);
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      setSliderPct(e.clientX);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch
    slider.addEventListener('touchstart', e => {
      isDragging = true;
      setSliderPct(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (!isDragging) return;
      setSliderPct(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });
  }


  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('faq-item--open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('faq-item--open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it wasn't already open)
      if (!isOpen) {
        item.classList.add('faq-item--open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ---------- Scroll-reveal (minimal, CSS-friendly) ---------- */
  const revealEls = document.querySelectorAll('.step, .pricing-card, .faq-item');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
      io.observe(el);
    });
  }

})();
