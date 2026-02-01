// Homepage Logic
// Handles hero parallax and brand slider

document.addEventListener("DOMContentLoaded", () => {
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
    });
  
    // Brand slider
    const slider = document.getElementById("brandSlider");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const indicators = document.querySelectorAll(".indicator-dot");
  
    if (slider && prevBtn && nextBtn && indicators.length) {
      let currentPosition = 0;
  
      const getSlideMetrics = () => {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth < 1024;
        const slideWidth = isMobile ? 176 : 216; // w-40 + gap or w-48 + gap
        const visibleSlides = isMobile ? 2 : isTablet ? 3 : 5;
        const totalSlides = 8;
        const maxPosition = totalSlides - visibleSlides;
        return { slideWidth, maxPosition };
      };
  
      let { slideWidth, maxPosition } = getSlideMetrics();
  
      function updateSlider() {
        slider.style.transform = `translateX(-${currentPosition * slideWidth}px)`;
        updateIndicators();
      }
  
      function updateIndicators() {
        const activeIndex =
          maxPosition > 0
            ? Math.floor(currentPosition / Math.ceil(maxPosition / 2 || 1))
            : 0;
        indicators.forEach((dot, index) => {
          const isActive = index === activeIndex;
          dot.classList.toggle("active", isActive);
          dot.style.backgroundColor = isActive
            ? "white"
            : "rgba(255,255,255,0.3)";
        });
      }
  
      nextBtn.addEventListener("click", () => {
        if (currentPosition < maxPosition) {
          currentPosition++;
          updateSlider();
        }
      });
  
      prevBtn.addEventListener("click", () => {
        if (currentPosition > 0) {
          currentPosition--;
          updateSlider();
        }
      });
  
      // Touch/Swipe support
      let startX = 0;
      let moveX = 0;
  
      slider.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        moveX = startX;
      });
  
      slider.addEventListener("touchmove", (e) => {
        moveX = e.touches[0].clientX;
      });
  
      slider.addEventListener("touchend", () => {
        const delta = startX - moveX;
        if (delta > 50 && currentPosition < maxPosition) {
          currentPosition++;
          updateSlider();
        } else if (delta < -50 && currentPosition > 0) {
          currentPosition--;
          updateSlider();
        }
      });
  
      // Recalcul on resize
      window.addEventListener("resize", () => {
        currentPosition = 0;
        ({ slideWidth, maxPosition } = getSlideMetrics());
        updateSlider();
      });
  
      // Initial position
      updateSlider();
    }
  });
