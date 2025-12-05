document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. SMOOTH SCROLL (LENIS)
  // ==========================================
  const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
  });

  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ==========================================
  // 2. MOBILE MENU LOGIC
  // ==========================================
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const menuLinks = document.querySelectorAll('.header__link');
  const body = document.body;

  const toggleMenu = () => {
      const isOpened = nav.classList.toggle('header__nav--open');
      burger.classList.toggle('active');

      if (isOpened) {
          body.classList.add('no-scroll');
          lenis.stop();
      } else {
          body.classList.remove('no-scroll');
          lenis.start();
      }
  };

  if (burger) {
      burger.addEventListener('click', toggleMenu);
  }

  menuLinks.forEach(link => {
      link.addEventListener('click', () => {
          if (nav.classList.contains('header__nav--open')) {
              toggleMenu();
          }
      });
  });

  // ==========================================
  // 3. HERO ANIMATIONS
  // ==========================================
  if (document.querySelector('.hero__title')) {
      const heroTitle = new SplitType('.hero__title', { types: 'lines, words' });

      // Fix Gradient Text Bug
      const words = document.querySelectorAll('.hero__title .word');
      words.forEach(word => {
          if (word.innerText.includes('технология') || word.innerText.includes('technology')) {
              word.classList.add('text-gradient');
              word.style.display = 'inline-block';
          }
      });

      gsap.from(heroTitle.words, {
          opacity: 0,
          y: 40,
          rotationX: -20,
          stagger: 0.1,
          duration: 1,
          ease: 'back.out(1.5)',
          delay: 0.5
      });

      gsap.from('.hero__desc', { opacity: 0, y: 20, duration: 0.8, delay: 1.2, ease: 'power2.out' });
      gsap.from('.hero__actions', { opacity: 0, y: 20, duration: 0.8, delay: 1.4, ease: 'power2.out' });
      gsap.from('.hero__badge', { opacity: 0, scale: 0.8, duration: 0.8, delay: 0.2, ease: 'power2.out' });
  }

  // ==========================================
  // 4. THREE.JS PARTICLE SPHERE
  // ==========================================
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer && window.THREE) {
      const scene = new THREE.Scene();
      scene.background = null;
      const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
      camera.position.z = 2.2;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasContainer.appendChild(renderer.domElement);

      const geometry = new THREE.BufferGeometry();
      const count = 700;
      const positions = new Float32Array(count * 3);
      for(let i = 0; i < count * 3; i++) {
          positions[i] = (Math.random() - 0.5) * 3.5;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({ size: 0.012, color: 0x2563EB, transparent: true, opacity: 0.8 });
      const particlesMesh = new THREE.Points(geometry, material);
      scene.add(particlesMesh);

      let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;

      document.addEventListener('mousemove', (event) => {
          mouseX = (event.clientX - windowHalfX);
          mouseY = (event.clientY - windowHalfY);
      });

      const animate = () => {
          requestAnimationFrame(animate);
          targetX = mouseX * 0.001;
          targetY = mouseY * 0.001;
          particlesMesh.rotation.y += 0.002;
          particlesMesh.rotation.x += 0.001;
          particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
          particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
          particlesMesh.position.y = Math.sin(Date.now() * 0.0005) * 0.05;
          renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', () => {
          if (!canvasContainer) return;
          const width = canvasContainer.clientWidth;
          const height = canvasContainer.clientHeight;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
      });
  }

  // ==========================================
  // 5. SCROLL REVEAL ANIMATION
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('active');
              revealObserver.unobserve(entry.target); // Trigger only once
          }
      });
  }, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // 6. FAQ ACCORDION
  // ==========================================
  const accordions = document.querySelectorAll('.accordion__header');
  accordions.forEach(acc => {
      acc.addEventListener('click', () => {
          const item = acc.parentElement;
          const body = acc.nextElementSibling;

          // Close others (optional - can remove if you want multiple open)
          document.querySelectorAll('.accordion__item').forEach(other => {
              if (other !== item) {
                  other.classList.remove('active');
                  other.querySelector('.accordion__body').style.maxHeight = null;
              }
          });

          item.classList.toggle('active');
          if (item.classList.contains('active')) {
              body.style.maxHeight = body.scrollHeight + "px";
          } else {
              body.style.maxHeight = null;
          }
      });
  });

  // ==========================================
  // 7. CONTACT FORM VALIDATION & CAPTCHA
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
      // Math Captcha Logic
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const captchaLabel = document.getElementById('captchaLabel');
      const captchaInput = document.getElementById('captchaInput');
      captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;

      contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          let isValid = true;

          // Simple validation helper
          const validateField = (id, condition) => {
              const field = document.getElementById(id);
              const group = field.parentElement;
              if (!condition(field.value)) {
                  group.classList.add('error');
                  isValid = false;
              } else {
                  group.classList.remove('error');
              }
          };

          // Rules
          validateField('name', val => val.trim().length > 1);
          validateField('email', val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
          validateField('phone', val => /^\d+$/.test(val.replace(/[\s\-\+\(\)]/g, ''))); // Only digits allowed check

          // Captcha Check
          const captchaGroup = captchaInput.parentElement;
          if (parseInt(captchaInput.value) !== num1 + num2) {
              captchaGroup.classList.add('error');
              isValid = false;
          } else {
              captchaGroup.classList.remove('error');
          }

          if (isValid) {
              const btn = contactForm.querySelector('.form-btn');
              const originalText = btn.innerHTML;
              btn.innerHTML = '<span>Отправка...</span>';
              btn.disabled = true;

              // Simulate AJAX
              setTimeout(() => {
                  document.getElementById('formSuccess').classList.add('visible');
                  contactForm.reset();
                  btn.innerHTML = originalText;
                  btn.disabled = false;

                  // Reset Captcha
                  captchaInput.value = '';
                  captchaGroup.classList.remove('error');
              }, 1500);
          }
      });
  }

  // ==========================================
  // 8. COOKIE POPUP
  // ==========================================
  const cookiePopup = document.getElementById('cookiePopup');
  const cookieAccept = document.getElementById('cookieAccept');

  if (!localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => {
          cookiePopup.classList.add('show');
      }, 2000);
  }

  if (cookieAccept) {
      cookieAccept.addEventListener('click', () => {
          localStorage.setItem('cookiesAccepted', 'true');
          cookiePopup.classList.remove('show');
      });
  }

  // ==========================================
  // 9. ICONS INIT
  // ==========================================
  if (window.lucide) {
      window.lucide.createIcons();
  }
});