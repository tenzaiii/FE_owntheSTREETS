// Product page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));

  if (!productId) {
    window.location.href = "catalog.html";
    return;
  }

  // Mobile menu is handled by script.js now (ensure script.js is included in HTML)

  let product = null;

  // Function to initialize logic once products are available
  function initializeWhenReady() {
    if (!window.catalogProducts || window.catalogProducts.length === 0) return;

    product = window.catalogProducts.find((p) => p.id === productId);

    if (!product) {
      // Product not found after loading
      window.location.href = "catalog.html";
      return;
    }

    initProductPage();
  }

  // Check immediately or wait
  if (window.productsLoaded && window.catalogProducts.length > 0) {
    initializeWhenReady();
  } else {
    window.addEventListener('productsLoaded', initializeWhenReady);
  }

  // Logic moved to initializeWhenReady

  // Product state
  const state = {
    selectedSize: null,
    currentImageIndex: 0,
    isFavorite: false,
  };

  // Format price
  function formatPrice(value) {
    return `₱${value.toLocaleString("en-PH")}.00`;
  }

  // Initialize product page
  async function initProductPage() {
    // Set product details
    document.getElementById("product-breadcrumb").textContent = product.name;
    document.getElementById("product-brand").textContent = product.brand;
    document.getElementById("product-title").textContent = product.name;
    document.getElementById("product-price").textContent = formatPrice(product.price);
    document.getElementById("product-description").textContent =
      product.description || "Premium quality product from " + product.brand + ".";
    document.getElementById("product-sku").textContent = product.sku || `PRD-${product.id}`;

    // Tag
    if (product.tag) {
      const tagEl = document.getElementById("product-tag");
      tagEl.textContent = product.tag;
      tagEl.classList.remove("hidden");
    }

    // Images
    const images = product.images || [product.image, product.image, product.image];
    state.currentImageIndex = 0;
    renderImages(images);

    // Sizes
    const sizes = product.sizes || (product.type === "Cap" ? ["One Size"] : ["S", "M", "L", "XL"]);
    renderSizes(sizes);

    // Check favorite status
    state.isFavorite = await Favorites.isFavorite(product.id);
    updateFavoriteBtn();

    // Suggested products
    renderSuggestedProducts();
  }

  // Render product images
  function renderImages(images) {
    const mainImage = document.getElementById("product-main-image");
    const thumbnailsContainer = document.getElementById("product-thumbnails");

    if (images.length === 0) return;

    // Set main image
    mainImage.src = images[0];
    mainImage.alt = product.name;

    // Clear thumbnails
    thumbnailsContainer.innerHTML = "";

    // Create thumbnails
    images.forEach((img, index) => {
      const thumbnail = document.createElement("button");
      thumbnail.className = `flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${index === state.currentImageIndex
        ? "border-white"
        : "border-gray-700 hover:border-gray-500"
        }`;
      thumbnail.type = "button";
      thumbnail.addEventListener("click", () => {
        state.currentImageIndex = index;
        mainImage.src = img;
        updateThumbnailSelection();
      });

      const imgEl = document.createElement("img");
      imgEl.src = img;
      imgEl.alt = `${product.name} - Image ${index + 1}`;
      imgEl.className = "w-full h-full object-cover bg-gray-900";

      thumbnail.appendChild(imgEl);
      thumbnailsContainer.appendChild(thumbnail);
    });
  }

  function updateThumbnailSelection() {
    const thumbnails = document.querySelectorAll("#product-thumbnails button");
    thumbnails.forEach((thumb, index) => {
      if (index === state.currentImageIndex) {
        thumb.classList.remove("border-gray-700", "hover:border-gray-500");
        thumb.classList.add("border-white");
      } else {
        thumb.classList.remove("border-white");
        thumb.classList.add("border-gray-700", "hover:border-gray-500");
      }
    });
  }

  // Render size selector
  function renderSizes(sizes) {
    const sizesContainer = document.getElementById("product-sizes");
    sizesContainer.innerHTML = "";

    sizes.forEach((size) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "px-6 py-3 rounded-full border border-gray-700 hover:border-white transition-colors";
      button.textContent = size;
      button.dataset.size = size;

      button.addEventListener("click", () => {
        // Remove selected state from all
        document.querySelectorAll("#product-sizes button").forEach((btn) => {
          btn.classList.remove("bg-white", "text-black", "border-white");
          btn.classList.add("border-gray-700");
        });

        // Add selected state
        button.classList.add("bg-white", "text-black", "border-white");
        button.classList.remove("border-gray-700");

        state.selectedSize = size;
        updateAddToCartButton();
      });

      sizesContainer.appendChild(button);
    });

    // Auto-select if only one size
    if (sizes.length === 1) {
      sizesContainer.querySelector("button").click();
    }
  }

  // Update add to cart button state
  function updateAddToCartButton() {
    const addToCartBtn = document.getElementById("product-add-to-cart");
    const sizeError = document.getElementById("product-size-error");

    if (state.selectedSize) {
      addToCartBtn.disabled = false;
      sizeError.classList.add("hidden");
    } else {
      addToCartBtn.disabled = true;
    }
  }

  // Add to cart handler
  document.getElementById("product-add-to-cart").addEventListener("click", () => {
    if (!Auth.getCurrentUser()) {
      window.location.href = 'login.html';
      return;
    }

    if (!state.selectedSize) {
      const sizeError = document.getElementById("product-size-error");
      sizeError.textContent = "Please select a size";
      sizeError.classList.remove("hidden");
      return;
    }

    Cart.addItem(product, 1, state.selectedSize);

    // Show success feedback
    const btn = document.getElementById("product-add-to-cart");
    const originalText = btn.textContent;
    btn.textContent = "Added to Bag!";
    btn.classList.add("bg-green-500", "hover:bg-green-600");
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("bg-green-500", "hover:bg-green-600");
    }, 2000);
  });

  function updateFavoriteBtn() {
    const btn = document.getElementById("product-favorite-btn");
    const icon = btn.querySelector("i");
    if (state.isFavorite) {
      icon.classList.remove("far");
      icon.classList.add("fas", "text-red-500");
    } else {
      icon.classList.remove("fas", "text-red-500");
      icon.classList.add("far");
    }
  }

  // Favorite handler
  document.getElementById("product-favorite-btn").addEventListener("click", () => {
    const success = Favorites.toggle(product.id);
    if (success) {
      state.isFavorite = !state.isFavorite;
      updateFavoriteBtn();
    } else {
      // User not logged in
      const shouldLogin = confirm("Please login to add favorites. Go to login page?");
      if (shouldLogin) {
        window.location.href = "login.html";
      }
    }
  });

  // Suggested products slider
  let suggestedPosition = 0;
  let suggestedProducts = [];

  function renderSuggestedProducts() {
    // Filter products here, when data is guaranteed to be loaded
    suggestedProducts = window.catalogProducts
      .filter((p) => p.id !== product.id && p.brand === product.brand)
      .slice(0, 8);

    const slider = document.getElementById("suggested-slider");
    if (!slider || suggestedProducts.length === 0) {
      document.getElementById("suggested-prev").style.display = "none";
      document.getElementById("suggested-next").style.display = "none";
      return;
    }

    slider.innerHTML = "";

    suggestedProducts.forEach((p) => {
      const card = document.createElement("a");
      card.href = `product.html?id=${p.id}`;
      card.className =
        "flex-shrink-0 w-64 group bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-white/70 transition-colors";

      card.innerHTML = `
        <div class="relative bg-gray-900 overflow-hidden">
          <img
            src="${p.image}"
            alt="${p.name}"
            class="w-full h-64 object-contain bg-gradient-to-br from-gray-900 via-black to-gray-800 transform group-hover:scale-105 transition-transform duration-300"
          />
          ${p.tag
          ? `<span class="absolute top-3 left-3 inline-flex items-center rounded-full bg-white text-black text-xs font-semibold tracking-wide px-2 py-1 uppercase">
                  ${p.tag}
                </span>`
          : ""
        }
        </div>
        <div class="flex-1 flex flex-col px-4 py-4 space-y-2">
          <p class="text-xs uppercase tracking-wide text-gray-400">${p.brand}</p>
          <h3 class="text-sm font-semibold leading-snug line-clamp-2 mb-1">
            ${p.name}
          </h3>
          <p class="text-xs text-gray-500 uppercase tracking-wide">
            ${p.category}
          </p>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-base font-semibold">${formatPrice(p.price)}</span>
            <button
              class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-700 hover:border-white hover:bg-white hover:text-black transition-colors"
              type="button"
              aria-label="Add to bag"
              onclick="event.preventDefault(); if(!Auth.getCurrentUser()) { window.location.href='login.html'; return; } Cart.addItem(window.catalogProducts.find(prod => prod.id === ${p.id}), 1, 'One Size')"
            >
              <i class="fas fa-shopping-bag text-sm"></i>
            </button>
          </div>
        </div>
      `;

      slider.appendChild(card);
    });

    updateSuggestedSlider();
  }

  function updateSuggestedSlider() {
    const slider = document.getElementById("suggested-slider");
    const cardWidth = 272; // w-64 (256px) + gap (16px)
    const maxPosition = Math.max(0, suggestedProducts.length - 4);
    const translateX = -suggestedPosition * cardWidth;

    slider.style.transform = `translateX(${translateX}px)`;

    // Update button states
    const prevBtn = document.getElementById("suggested-prev");
    const nextBtn = document.getElementById("suggested-next");

    if (prevBtn) prevBtn.disabled = suggestedPosition === 0;
    if (nextBtn) nextBtn.disabled = suggestedPosition >= maxPosition;
  }

  const prevBtn = document.getElementById("suggested-prev");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (suggestedPosition > 0) {
        suggestedPosition--;
        updateSuggestedSlider();
      }
    });
  }

  const nextBtn = document.getElementById("suggested-next");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const maxPosition = Math.max(0, suggestedProducts.length - 4);
      if (suggestedPosition < maxPosition) {
        suggestedPosition++;
        updateSuggestedSlider();
      }
    });
  }

  // Initialize
  initProductPage();
});
