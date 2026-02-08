
// Layout Modularization
// This file contains the shared Header and Footer HTML for the website.

function renderHeader(activePage = '') {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) return;

    headerContainer.innerHTML = `
    <!-- Announcement Bar -->
    <div class="bg-black border-b border-gray-800 overflow-hidden">
      <div
        class="announcement-slide whitespace-nowrap py-2 text-center text-sm font-bold text-white"
      >
        <span class="inline-block px-8">FREE SHIPPING ON ORDERS $50+</span>
        <span class="inline-block px-8">|</span>
        <span class="inline-block px-8">HOLIDAY SALE - UP TO 40% OFF</span>
        <span class="inline-block px-8">|</span>
        <span class="inline-block px-8">NEW ARRIVALS DAILY</span>
        <span class="inline-block px-8">|</span>
        <span class="inline-block px-8">FREE SHIPPING ON ORDERS $50+</span>
        <span class="inline-block px-8">|</span>
        <span class="inline-block px-8">HOLIDAY SALE - UP TO 40% OFF</span>
        <span class="inline-block px-8">|</span>
        <span class="inline-block px-8">NEW ARRIVALS DAILY</span>
        <span class="inline-block px-8">|</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav
      id="navbar"
      class="sticky top-0 z-50 bg-black text-white transition-all duration-300"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between gap-3 py-3 sm:py-4">
          <!-- Logo -->
          <div class="flex items-center min-w-0">
            <a
              href="index.html"
              class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight truncate"
            >
              owntheSTREETS
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-8">
            <a href="index.html#top" class="hover:text-gray-300 transition font-medium">FEATURED</a>
            <a href="catalog.html" class="hover:text-gray-300 transition font-medium ${activePage === 'catalog' ? 'text-white underline' : ''}">CATALOG</a>
            <a href="catalog.html?category=Apparel" class="hover:text-gray-300 transition font-medium">APPAREL</a>
            <a href="catalog.html?category=Headwear" class="hover:text-gray-300 transition font-medium">HEADWEAR</a>
            <a href="index.html#brandSlider" class="hover:text-gray-300 transition font-medium">BRANDS</a>
            <a href="collections.html" class="hover:text-gray-300 transition font-medium ${activePage === 'collections' ? 'text-white underline' : ''}">COLLECTIONS</a>
            <a href="#" class="text-red-500 hover:text-red-400 transition font-bold">SALE</a>
          </div>

          <!-- Right Icons -->
          <div class="flex items-center flex-shrink-0 space-x-4 sm:space-x-6">
            <a
               href="catalog.html"
               class="hidden sm:inline-flex hover:text-gray-300 transition"
               aria-label="Search"
            >
              <i class="fas fa-search text-lg"></i>
            </a>
            <a
              href="login.html"
              class="nav-user-link hidden sm:inline-flex hover:text-gray-300 transition"
              aria-label="Account"
            >
              <i class="fas fa-user text-lg"></i>
            </a>
            <a
              href="profile.html#cart"
              class="hover:text-gray-300 transition relative"
              aria-label="Shopping bag"
            >
              <i class="fas fa-shopping-bag text-lg"></i>
              <span
                class="cart-badge absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0"
                style="display: none"
                >0</span
              >
            </a>
            <button
              class="lg:hidden hover:text-gray-300 transition"
              id="mobile-menu-btn"
              aria-label="Open menu"
            >
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        id="mobile-menu"
        class="mobile-menu fixed top-0 left-0 w-full h-full bg-black z-50 lg:hidden hidden"
      >
        <div class="flex flex-col h-full">
          <div
            class="flex justify-between items-center p-4 border-b border-gray-800"
          >
            <span class="text-xl font-black">MENU</span>
            <button id="close-menu" class="text-2xl">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="flex flex-col space-y-4 p-6">
              <a href="index.html#top" class="hover:text-gray-300 transition font-medium">FEATURED</a>
              <a href="catalog.html" class="hover:text-gray-300 transition font-medium">CATALOG</a>
              <a href="catalog.html?category=Apparel" class="hover:text-gray-300 transition font-medium">APPAREL</a>
              <a href="catalog.html?category=Headwear" class="hover:text-gray-300 transition font-medium">HEADWEAR</a>
              <a href="index.html#brandSlider" class="hover:text-gray-300 transition font-medium">BRANDS</a>
              <a href="collections.html" class="hover:text-gray-300 transition font-medium">COLLECTIONS</a>
              <a href="#" class="text-red-500 hover:text-red-400 transition font-bold">SALE</a>
              <a href="login.html" class="nav-user-link hover:text-gray-300 transition font-medium">ACCOUNT</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
    `;

    // Re-initialize mobile menu script if needed
    // Simple inline logic for the mobile menu toggle
    const btnBox = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const closeBtn = document.getElementById('close-menu');

    if (btnBox && menu && closeBtn) {
        btnBox.addEventListener('click', () => {
            menu.classList.remove('hidden');
        });
        closeBtn.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    }

    // Dispatch event to signal header is ready (for badge updates)
    document.dispatchEvent(new Event('headerLoaded'));
}

function renderFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
    <footer class="bg-black text-white py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <!-- Company Info -->
          <div>
            <h3 class="text-Xl font-black mb-6">owntheSTREETS</h3>
            <p class="text-gray-400 mb-4">
              Founded in 1920 in Buffalo, NY. A global brand of sport, culture,
              style, & self-expression.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-2xl hover:text-gray-400 transition">
                <i class="fab fa-facebook"></i>
              </a>
              <a href="#" class="text-2xl hover:text-gray-400 transition">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#" class="text-2xl hover:text-gray-400 transition">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="text-2xl hover:text-gray-400 transition">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-lg font-bold mb-6">SHOP</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-white transition">MLB</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">NFL</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">NBA</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">NHL</a></li>
              <li><a href="collections.html" class="text-gray-400 hover:text-white transition">Collections</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">Sale</a></li>
            </ul>
          </div>

          <!-- Customer Service -->
          <div>
            <h4 class="text-lg font-bold mb-6">CUSTOMER SERVICE</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-white transition">Contact Us</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">Shipping & Returns</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">Size Guide</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">Track Order</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">FAQ</a></li>
            </ul>
          </div>

          <!-- About -->
          <div>
            <h4 class="text-lg font-bold mb-6">ABOUT</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-white transition">Our Story</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">Careers</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">Press</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">Sustainability</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">Store Locator</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <p class="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 owntheSTREETS Co., LLC. All Rights Reserved.
            </p>
            <div class="flex space-x-6 text-sm">
              <a href="#" class="text-gray-400 hover:text-white transition">Privacy Policy</a>
              <a href="#" class="text-gray-400 hover:text-white transition">Terms of Service</a>
              <a href="#" class="text-gray-400 hover:text-white transition">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    `;
}
