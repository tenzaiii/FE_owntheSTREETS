
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
          <div class="flex items-center min-w-0 flex-shrink-0">
            <a
              href="index.html"
              class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight truncate"
            >
              owntheSTREETS
            </a>
          </div>

          <!-- Desktop Navigation (Visible on MD and up) -->
          <div class="hidden md:flex items-center space-x-1 lg:space-x-8 text-[10px] lg:text-base whitespace-nowrap font-bold tracking-tight">
            <a href="index.html#top" class="hover:text-gray-300 transition px-2 py-1">FEATURED</a>
            <a href="catalog.html" class="hover:text-gray-300 transition px-2 py-1 ${activePage === 'catalog' ? 'text-white underline' : ''}">CATALOG</a>
            <a href="catalog.html?category=Apparel" class="hover:text-gray-300 transition px-2 py-1">APPAREL</a>
            <a href="catalog.html?category=Headwear" class="hover:text-gray-300 transition px-2 py-1">HEADWEAR</a>
            <a href="index.html#brandSlider" class="hover:text-gray-300 transition px-2 py-1">BRANDS</a>
            <a href="collections.html" class="hover:text-gray-300 transition px-2 py-1 ${activePage === 'collections' ? 'text-white underline' : ''}">COLLECTIONS</a>
            <a href="#" class="text-red-500 hover:text-red-400 transition px-2 py-1">SALE</a>
          </div>

          <!-- Right Icons -->
          <div class="flex items-center flex-shrink-0 space-x-3 sm:space-x-4 lg:space-x-6">
            
            <!-- Search Form (Visible on MD+) -->
            <form action="catalog.html" class="hidden md:flex items-center relative group">
                <input 
                    type="text" 
                    name="search" 
                    placeholder="Search..." 
                    class="bg-transparent border-b border-transparent focus:border-white text-white text-sm w-0 group-hover:w-32 focus:w-32 transition-all duration-300 outline-none px-1"
                >
                <button type="submit" class="hover:text-gray-300 transition p-1">
                    <i class="fas fa-search text-lg"></i>
                </button>
            </form>
            
            <!-- Mobile Search Icon (To toggle simple search or link) -->
             <a
               href="catalog.html"
               class="md:hidden hover:text-gray-300 transition"
               aria-label="Search"
            >
              <i class="fas fa-search text-lg"></i>
            </a>

            <a
              href="profile.html"
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
              class="md:hidden hover:text-gray-300 transition"
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
        class="mobile-menu fixed top-0 left-0 w-full h-full bg-black z-50 md:hidden hidden transform transition-transform duration-300 ease-in-out"
      >
        <div class="flex flex-col h-full">
          <div
            class="flex justify-between items-center p-4 border-b border-gray-800"
          >
            <span class="text-xl font-black">MENU</span>
            <button id="close-menu" class="text-2xl p-2">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto">
            <!-- Mobile Search -->
            <form action="catalog.html" class="p-6 pb-0">
                <div class="flex items-center border border-gray-700 rounded px-3 py-2">
                    <input type="text" name="search" placeholder="Search products..." class="w-full bg-transparent text-white outline-none">
                    <button type="submit" class="text-gray-400"><i class="fas fa-search"></i></button>
                </div>
            </form>

            <div class="flex flex-col space-y-4 p-6">
              <a href="index.html#top" class="hover:text-gray-300 transition font-medium text-lg">FEATURED</a>
              <a href="catalog.html" class="hover:text-gray-300 transition font-medium text-lg">CATALOG</a>
              <a href="catalog.html?category=Apparel" class="hover:text-gray-300 transition font-medium text-lg">APPAREL</a>
              <a href="catalog.html?category=Headwear" class="hover:text-gray-300 transition font-medium text-lg">HEADWEAR</a>
              <a href="index.html#brandSlider" class="hover:text-gray-300 transition font-medium text-lg">BRANDS</a>
              <a href="collections.html" class="hover:text-gray-300 transition font-medium text-lg">COLLECTIONS</a>
              <a href="#" class="text-red-500 hover:text-red-400 transition font-bold text-lg">SALE</a>
              <hr class="border-gray-800">
              <a href="profile.html" class="nav-user-link hover:text-gray-300 transition font-medium text-lg"><i class="fas fa-user mr-2"></i> ACCOUNT</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
    `;

    // Initialize Mobile Menu Logic
    // We use a small timeout or verify existence to ensure elements are in DOM
    setTimeout(() => {
        const btnBox = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const closeBtn = document.getElementById('close-menu');

        // Clean previous listeners if any (though innerHTML replacement handles this mostly)
        // Add new listeners
        if (btnBox && menu && closeBtn) {
            btnBox.onclick = (e) => {
                e.preventDefault();
                menu.classList.remove('hidden');
                // Force reflow/next frame for animation if needed, but 'hidden' removal usually enough if CSS handles transform
                requestAnimationFrame(() => {
                    menu.classList.add('active'); // If using CSS translate
                });
            };

            closeBtn.onclick = (e) => {
                e.preventDefault();
                menu.classList.remove('active');
                setTimeout(() => {
                    menu.classList.add('hidden');
                }, 300); // Match transition duration
            };
        }
    }, 0);

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
