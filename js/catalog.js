// Catalog Page Logic
// Handles filtering, sorting, pagination, and rendering

document.addEventListener("DOMContentLoaded", () => {
    // Catalog DOM references
    const catalogGrid = document.getElementById("catalog-grid");
    const catalogEmpty = document.getElementById("catalog-empty");
    const searchInput = document.getElementById("catalog-search");
    const sortSelect = document.getElementById("catalog-sort");
    const productCountDesktop = document.getElementById("catalog-product-count");
    const productCountMobile = document.getElementById("catalog-product-count-mobile");
    const brandFilterContainer = document.getElementById("catalog-brand-filters");
    const filterInputs = document.querySelectorAll("[data-filter-group]");
    const clearFiltersBtn = document.getElementById("catalog-clear");
    const clearPriceBtn = document.getElementById("catalog-clear-price");
    const clearMobileBtn = document.getElementById("catalog-clear-mobile");

    if (!catalogGrid) return; // Exit if not on catalog page

    // Catalog data
    let products = Array.isArray(window.catalogProducts) ? window.catalogProducts : [];

    const state = {
        search: "",
        tag: null,
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

    // Listen for products loaded event from Supabase loader
    window.addEventListener('productsLoaded', () => {
        products = window.catalogProducts;

        // Update brand filters
        if (brandFilterContainer) {
            brandFilterContainer.innerHTML = '';
            if (products.length) {
                const uniqueBrands = Array.from(
                    new Set(products.map((p) => p.brand).filter(Boolean))
                ).sort((a, b) => a.localeCompare(b));

                uniqueBrands.forEach((brand) => {
                    const label = document.createElement("label");
                    label.className = "flex items-center justify-between cursor-pointer";

                    const span = document.createElement("span");
                    span.className = "text-gray-200";
                    span.textContent = brand;

                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.className = "form-checkbox h-4 w-4 text-white bg-gray-900 border-gray-700 rounded-sm";
                    input.setAttribute("data-filter-group", "brand");
                    input.setAttribute("data-filter-value", brand);

                    // Check if this brand is already active in state
                    if (state.filters.brand.includes(brand)) {
                        input.checked = true;
                    }

                    label.appendChild(span);
                    label.appendChild(input);
                    brandFilterContainer.appendChild(label);
                });

                // Re-attach listeners to new inputs
                const newInputs = brandFilterContainer.querySelectorAll('input');
                newInputs.forEach(input => {
                    input.addEventListener("change", () => {
                        syncFilterStateFromInputs();
                        applyFilters();
                    });
                });
            }
        }

        // Update state and render
        state.filteredResults = [...products];
        applyFilters();
        console.log('Updated catalog with loaded products:', products.length);
    });

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

        // Tag Filter
        if (state.tag) {
            result = result.filter(p => p.tag && p.tag.includes(state.tag));
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
                card.className = "group bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-white/70 transition-colors";

                card.innerHTML = `
          <div class="relative bg-gray-900 overflow-hidden">
            <img
              src="${product.image}"
              alt="${product.name}"
              class="w-full h-52 object-contain bg-gradient-to-br from-gray-900 via-black to-gray-800 transform group-hover:scale-105 transition-transform duration-300"
            />
            ${product.tag
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
              <span class="text-base font-semibold">${formatPrice(product.price)}</span>
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-700 hover:border-white hover:bg-white hover:text-black transition-colors"
                type="button"
                aria-label="Add to bag"
                onclick="event.preventDefault(); if(!Auth.getCurrentUser()) { window.location.href='login.html'; return; } if(window.CartModal) { CartModal.open(window.catalogProducts.find(p => p.id === ${product.id})); } else { console.error('CartModal not found'); }"
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
        if (productCountDesktop) productCountDesktop.textContent = count.toString();
        if (productCountMobile) productCountMobile.textContent = count.toString();
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
          class="pagination-page px-4 py-2 rounded-full border transition-colors ${i === currentPage
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
        state.filters = {
            type: [],
            brand: [],
            category: [],
            price: [],
        };

        const currentInputs = document.querySelectorAll("[data-filter-group]");
        currentInputs.forEach((input) => {
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

    function initFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);

        const tag = params.get('tag');
        if (tag) {
            state.tag = tag;
        }

        const search = params.get('search');
        if (params.get('search')) {
            const query = decodeURIComponent(params.get('search'));
            if (searchInput) searchInput.value = query;
            state.search = query; // Assuming state.search is the correct property
        }

        const category = params.get('category');
        if (category) {
            const input = document.querySelector(`input[data-filter-group="category"][data-filter-value="${category}"]`);
            if (input) input.checked = true;
        }

        if (params.get('price')) {
            const price = params.get('price');
            const radio = document.querySelector(`input[name="price-filter"][data-filter-value="${price}"]`);
            if (radio) radio.checked = true;
            state.filters.price = [price]; // Ensure it's an array for consistency with other filters
        }

        const brand = params.get('brand');
        if (brand) {
            // Decode the URL encoded brand (e.g., "New%20Era" -> "New Era")
            const decodedBrand = decodeURIComponent(brand);

            // Since brand inputs are dynamic, they might not exist yet when this runs immediately.
            // We set the state so applyFilters() respects it.
            state.filters.brand = [decodedBrand];

            // Try to check input if it already exists (unlikely on first load, but consistent)
            const input = document.querySelector(`input[data-filter-group="brand"][data-filter-value="${decodedBrand}"]`);
            if (input) input.checked = true;
        }

        // syncFilterStateFromInputs(); // Removed to avoid overwriting state we just set manually
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
        const inputs = document.querySelectorAll("[data-filter-group]");
        inputs.forEach((input) => {
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
            const inputs = document.querySelectorAll("[data-filter-group='price']");
            inputs.forEach((input) => {
                if (input.type === "radio") {
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

    // Initialize from URL then apply
    initFiltersFromURL();
    applyFilters();
});
