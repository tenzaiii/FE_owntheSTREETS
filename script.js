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

  // Navbar Scroll Effect (Logo Scale)
  const navbar = document.getElementById('navbar');
  const logoLink = navbar.querySelector('a.font-black'); // The logo text

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('bg-black/90', 'backdrop-blur-sm', 'shadow-lg');
      navbar.classList.remove('bg-black');
      if (logoLink) logoLink.classList.add('scale-75', 'origin-left');
    } else {
      navbar.classList.add('bg-black');
      navbar.classList.remove('bg-black/90', 'backdrop-blur-sm', 'shadow-lg');
      if (logoLink) logoLink.classList.remove('scale-75', 'origin-left');
    }
  });

  // Global Search Functionality
  const setupSearch = () => {
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Search"]'); // Catch-all for varied IDs
    const searchButtons = document.querySelectorAll('button[aria-label="Search"]');

    const performSearch = (query) => {
      if (!query) return;
      window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
    };

    searchInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch(input.value);
        }
      });
    });

    // If there's a search icon button nearby the input, or just general search buttons
    searchButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Try to find a visible search input? Or prompt?
        // For now, assume if there is a header search input, use that.
        // Or if it's just an icon without input (like in nav), maybe toggle an input?
        // The current HTML shows a button but no input in the top nav (hidden sm:inline-flex).
        // I will assume for now we need to enable the input or prompt.
        // Let's toggle a search overlay or prompt for simplicity if no input is visible.
        const navSearchInput = document.getElementById('nav-search-input');
        if (navSearchInput) {
          performSearch(navSearchInput.value);
        } else {
          let q = prompt("Search for products:");
          performSearch(q);
        }
      });
    });
  };
  setupSearch();

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
