 // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const closeMenuBtn = document.getElementById("close-menu");

    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.add("active");
    });

    closeMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
    // Parallax scrolling effects
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;

      // Hero parallax
      const heroBg = document.querySelector(".hero-bg");
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
      }

      // Parallax zoom sections
      const parallaxZooms = document.querySelectorAll(".parallax-zoom");
      parallaxZooms.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const scrollPercent =
          (window.innerHeight - rect.top) / window.innerHeight;
        if (scrollPercent > 0 && scrollPercent < 1) {
          element.style.transform = `scale(${1 + scrollPercent * 0.1})`;
        }
      });

      // Navbar background on scroll
      const navbar = document.getElementById("navbar");
      if (scrolled > 100) {
        navbar.classList.add("nav-scroll");
      } else {
        navbar.classList.remove("nav-scroll");
      }
    });

    // Fade-in animation on scroll
    const fadeInElements = document.querySelectorAll(".fade-in");

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

     const slider = document.getElementById('brandSlider');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicators = document.querySelectorAll('.indicator-dot');
  
  let currentPosition = 0;
  const slideWidth = window.innerWidth < 768 ? 176 : 216; // w-40 + gap or w-48 + gap
  const visibleSlides = window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 5;
  const totalSlides = 8;
  const maxPosition = totalSlides - visibleSlides;

  function updateSlider() {
    slider.style.transform = `translateX(-${currentPosition * slideWidth}px)`;
    updateIndicators();
  }

  function updateIndicators() {
    const activeIndex = Math.floor(currentPosition / Math.ceil(maxPosition / 2));
    indicators.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
      dot.style.backgroundColor = index === activeIndex ? 'white' : 'rgba(255,255,255,0.3)';
    });
  }

  nextBtn.addEventListener('click', () => {
    if (currentPosition < maxPosition) {
      currentPosition++;
      updateSlider();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentPosition > 0) {
      currentPosition--;
      updateSlider();
    }
  });

  // Touch/Swipe support
  let startX, moveX;
  
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  slider.addEventListener('touchmove', (e) => {
    moveX = e.touches[0].clientX;
  });

  slider.addEventListener('touchend', () => {
    if (startX - moveX > 50 && currentPosition < maxPosition) {
      currentPosition++;
      updateSlider();
    } else if (moveX - startX > 50 && currentPosition > 0) {
      currentPosition--;
      updateSlider();
    }
  });

  // Recalculate on resize
  window.addEventListener('resize', () => {
    currentPosition = 0;
    updateSlider();
  });
