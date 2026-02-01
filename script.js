// Shared UI Logic
// Handles Mobile Menu and Sticky Navbar

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const closeMenuBtn = document.getElementById("close-menu");

  if (mobileMenuBtn && mobileMenu && closeMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.add("active");
    });

    closeMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  }

  // Navbar background on scroll and other shared scroll effects
  // (Parallax effects moved to index.js, but keeping basic navbar scroll here if used globally)
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;

    // Navbar background on scroll
    const navbar = document.getElementById("navbar");
    if (navbar) {
      if (scrolled > 100) {
        navbar.classList.add("nav-scroll");
      } else {
        navbar.classList.remove("nav-scroll");
      }
    }
  });
});
