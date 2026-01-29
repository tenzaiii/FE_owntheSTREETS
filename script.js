// Wrap in DOMContentLoaded to ensure elements exist
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
    if (navbar) {
      if (scrolled > 100) {
        navbar.classList.add("nav-scroll");
      } else {
        navbar.classList.remove("nav-scroll");
      }
    }
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

    // Recalculate on resize
    window.addEventListener("resize", () => {
      currentPosition = 0;
      ({ slideWidth, maxPosition } = getSlideMetrics());
      updateSlider();
    });

    // Initial position
    updateSlider();
  }

  // Catalog data (from separate file)
  const products = Array.isArray(window.catalogProducts)
    ? window.catalogProducts
    : [];

  // Catalog DOM references
  const catalogGrid = document.getElementById("catalog-grid");
  const catalogEmpty = document.getElementById("catalog-empty");
  const searchInput = document.getElementById("catalog-search");
  const sortSelect = document.getElementById("catalog-sort");
  const productCountDesktop = document.getElementById("catalog-product-count");
  const productCountMobile = document.getElementById(
    "catalog-product-count-mobile"
  );
  const brandFilterContainer = document.getElementById(
    "catalog-brand-filters"
  );

  // Dynamically build brand filters based on catalog data
  if (brandFilterContainer && products.length) {
    const uniqueBrands = Array.from(
      new Set(products.map((p) => p.brand).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    uniqueBrands.forEach((brand) => {
      const label = document.createElement("label");
      label.className =
        "flex items-center justify-between cursor-pointer";

      const span = document.createElement("span");
      span.className = "text-gray-200";
      span.textContent = brand;

      const input = document.createElement("input");
      input.type = "checkbox";
      input.className =
        "form-checkbox h-4 w-4 text-white bg-gray-900 border-gray-700 rounded-sm";
      input.setAttribute("data-filter-group", "brand");
      input.setAttribute("data-filter-value", brand);

      label.appendChild(span);
      label.appendChild(input);
      brandFilterContainer.appendChild(label);
    });
  }

  const filterInputs = document.querySelectorAll("[data-filter-group]");
  const clearFiltersBtn = document.getElementById("catalog-clear");
  const clearPriceBtn = document.getElementById("catalog-clear-price");
  const clearMobileBtn = document.getElementById("catalog-clear-mobile");

  if (!catalogGrid) {
    // Catalog section not present
    return;
  }

  const state = {
    search: "",
    sort: "featured",
    filters: {
      type: [],
      brand: [],
      category: [],
      price: [],
    },
    currentPage: 1,
    itemsPerPage: 12,
    filteredResults: [],
  };

  function formatPrice(value) {
    return `₱${value.toLocaleString("en-PH")}.00`;
  }

  function getPriceBucket(value) {
    if (value < 3000) return "under-3000";
    if (value <= 5000) return "3000-5000";
    return "over-5000";
  }

  function applyFilters() {
    let result = [...products];

    // Search
    if (state.search.trim()) {
      const query = state.search.toLowerCase();
      result = result.filter((p) => {
        return (
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      });
    }

    // Checkbox filters
    Object.entries(state.filters).forEach(([group, values]) => {
      if (!values.length || group === "price") return;
      result = result.filter((p) => values.includes(p[group]));
    });

    // Price radio
    if (state.filters.price.length) {
      const priceFilter = state.filters.price[0];
      result = result.filter(
        (p) => getPriceBucket(p.price) === priceFilter
      );
    }

    // Sort
    if (state.sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (state.sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    // Store filtered results and reset to page 1 when filters change
    state.filteredResults = result;
    state.currentPage = 1;
    renderProducts();
  }

  function renderProducts() {
    const list = state.filteredResults;
    catalogGrid.innerHTML = "";

    if (!list.length) {
      catalogEmpty.classList.remove("hidden");
      renderPagination(0);
    } else {
      catalogEmpty.classList.add("hidden");
      
      // Calculate pagination
      const totalPages = Math.ceil(list.length / state.itemsPerPage);
      const startIndex = (state.currentPage - 1) * state.itemsPerPage;
      const endIndex = startIndex + state.itemsPerPage;
      const paginatedList = list.slice(startIndex, endIndex);

      paginatedList.forEach((product) => {
        const card = document.createElement("a");
        card.href = `product.html?id=${product.id}`;
        card.className =
          "group bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-white/70 transition-colors";

        card.innerHTML = `
          <div class="relative bg-gray-900 overflow-hidden">
            <img
              src="${product.image}"
              alt="${product.name}"
              class="w-full h-52 object-contain bg-gradient-to-br from-gray-900 via-black to-gray-800 transform group-hover:scale-105 transition-transform duration-300"
            />
            ${
              product.tag
                ? `<span class="absolute top-3 left-3 inline-flex items-center rounded-full bg-white text-black text-2xs font-semibold tracking-wide px-2 py-1 uppercase">
                    ${product.tag}
                  </span>`
                : ""
            }
          </div>
          <div class="flex-1 flex flex-col px-4 py-4 space-y-2">
            <p class="text-xs uppercase tracking-wide text-gray-400">${product.brand}</p>
            <h3 class="text-sm font-semibold leading-snug line-clamp-2 mb-1">
              ${product.name}
            </h3>
            <p class="text-xs text-gray-500 uppercase tracking-wide">
              ${product.category}
            </p>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-base font-semibold">${formatPrice(
                product.price
              )}</span>
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-700 hover:border-white hover:bg-white hover:text-black transition-colors"
                type="button"
                aria-label="Add to bag"
                onclick="event.preventDefault(); window.location.href='product.html?id=${product.id}';"
              >
                <i class="fas fa-shopping-bag text-sm"></i>
              </button>
            </div>
          </div>
        `;

        catalogGrid.appendChild(card);
      });

      renderPagination(list.length, totalPages);
    }

    const count = list.length;
    if (productCountDesktop) {
      productCountDesktop.textContent = count.toString();
    }
    if (productCountMobile) {
      productCountMobile.textContent = count.toString();
    }
  }

  function renderPagination(totalItems, totalPages = 0) {
    const paginationContainer = document.getElementById("catalog-pagination");
    if (!paginationContainer) return;

    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    const currentPage = state.currentPage;
    let paginationHTML = '<div class="flex items-center justify-center gap-2 mt-8">';

    // Previous button
    paginationHTML += `
      <button
        id="pagination-prev"
        class="px-3 py-2 rounded-full border border-gray-700 hover:border-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        ${currentPage === 1 ? 'disabled' : ''}
        aria-label="Previous page"
      >
        <i class="fas fa-chevron-left text-xs"></i>
      </button>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      paginationHTML += `
        <button
          class="pagination-page px-4 py-2 rounded-full border border-gray-700 hover:border-white hover:bg-white hover:text-black transition-colors"
          data-page="1"
        >
          1
        </button>
      `;
      if (startPage > 2) {
        paginationHTML += '<span class="px-2 text-gray-500">...</span>';
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button
          class="pagination-page px-4 py-2 rounded-full border transition-colors ${
            i === currentPage
              ? 'border-white bg-white text-black'
              : 'border-gray-700 hover:border-white hover:bg-white hover:text-black'
          }"
          data-page="${i}"
        >
          ${i}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += '<span class="px-2 text-gray-500">...</span>';
      }
      paginationHTML += `
        <button
          class="pagination-page px-4 py-2 rounded-full border border-gray-700 hover:border-white hover:bg-white hover:text-black transition-colors"
          data-page="${totalPages}"
        >
          ${totalPages}
        </button>
      `;
    }

    // Next button
    paginationHTML += `
      <button
        id="pagination-next"
        class="px-3 py-2 rounded-full border border-gray-700 hover:border-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        ${currentPage === totalPages ? 'disabled' : ''}
        aria-label="Next page"
      >
        <i class="fas fa-chevron-right text-xs"></i>
      </button>
    `;

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;

    // Attach event listeners
    document.querySelectorAll('.pagination-page').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.target.getAttribute('data-page'));
        state.currentPage = page;
        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    const prevBtn = document.getElementById('pagination-prev');
    const nextBtn = document.getElementById('pagination-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          renderProducts();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.currentPage < totalPages) {
          state.currentPage++;
          renderProducts();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  function syncFilterStateFromInputs() {
    // Reset filters
    state.filters = {
      type: [],
      brand: [],
      category: [],
      price: [],
    };

    filterInputs.forEach((input) => {
      const group = input.getAttribute("data-filter-group");
      const value = input.getAttribute("data-filter-value");
      if (!group || !value) return;

      if (input.type === "checkbox" && input.checked) {
        state.filters[group].push(value);
      }

      if (input.type === "radio" && input.checked) {
        state.filters[group] = [value];
      }
    });
  }

  // Event listeners
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.sort = e.target.value;
      applyFilters();
    });
  }

  if (filterInputs.length) {
    filterInputs.forEach((input) => {
      input.addEventListener("change", () => {
        syncFilterStateFromInputs();
        applyFilters();
      });
    });
  }

  function clearAllFilters() {
    filterInputs.forEach((input) => {
      if (input.type === "checkbox" || input.type === "radio") {
        input.checked = false;
      }
    });
    syncFilterStateFromInputs();
    applyFilters();
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearAllFilters);
  }

  if (clearMobileBtn) {
    clearMobileBtn.addEventListener("click", clearAllFilters);
  }

  if (clearPriceBtn) {
    clearPriceBtn.addEventListener("click", () => {
      filterInputs.forEach((input) => {
        if (
          input.getAttribute("data-filter-group") === "price" &&
          input.type === "radio"
        ) {
          input.checked = false;
        }
      });
      syncFilterStateFromInputs();
      applyFilters();
    });
  }

  // Initial render - populate filtered results
  if (products.length) {
    state.filteredResults = [...products];
  }
  applyFilters();
});
