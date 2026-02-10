// Cart Modal Utility
// Handles the size and quantity selection modal for both Product and Catalog pages

window.CartModal = {
    // Inject modal HTML into body
    injectModal() {
        if (document.getElementById('add-to-cart-modal')) return;

        const modalHTML = `
        <div
          id="add-to-cart-modal"
          class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] hidden items-center justify-center p-4"
        >
          <div
            class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl transform transition-all"
          >
            <!-- Modal Header -->
            <div class="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 class="text-xl font-bold text-white">Add to Bag</h3>
              <button
                id="close-modal-btn"
                class="text-gray-400 hover:text-white transition"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-6">
              <!-- Product Preview -->
              <div class="flex gap-4">
                <div class="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    id="modal-product-image"
                    src=""
                    alt=""
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1">
                  <h4 id="modal-product-name" class="font-bold text-sm text-white line-clamp-2"></h4>
                  <p id="modal-product-price" class="text-lg font-bold text-white mt-1"></p>
                </div>
              </div>

              <!-- Size Selection -->
              <div>
                <label class="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Select Size</label>
                <div id="modal-size-options" class="grid grid-cols-4 gap-2">
                  <!-- Size buttons will be rendered here -->
                </div>
                <p id="modal-size-error" class="hidden text-sm text-red-500 mt-2"></p>
              </div>

              <!-- Quantity Selection -->
              <div>
                <label class="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Quantity</label>
                <div class="flex items-center gap-4">
                  <button
                    id="modal-qty-minus"
                    class="w-10 h-10 border border-gray-700 text-white hover:border-white rounded-lg flex items-center justify-center transition"
                  >
                    <i class="fas fa-minus text-sm"></i>
                  </button>
                  <input
                    id="modal-quantity"
                    type="number"
                    value="1"
                    min="1"
                    max="10"
                    class="w-16 text-center bg-gray-800 border border-gray-700 rounded-lg py-2 text-white font-bold focus:outline-none focus:border-white"
                  />
                  <button
                    id="modal-qty-plus"
                    class="w-10 h-10 border border-gray-700 text-white hover:border-white rounded-lg flex items-center justify-center transition"
                  >
                    <i class="fas fa-plus text-sm"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-gray-800">
              <button
                id="modal-add-to-cart-btn"
                class="w-full bg-white text-black py-4 font-bold text-lg rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // Open modal with product data
    open(product) {
        this.injectModal();

        const modal = document.getElementById('add-to-cart-modal');
        const modalImage = document.getElementById('modal-product-image');
        const modalName = document.getElementById('modal-product-name');
        const modalPrice = document.getElementById('modal-product-price');
        const modalSizeOptions = document.getElementById('modal-size-options');
        const modalQuantity = document.getElementById('modal-quantity');
        const addBtn = document.getElementById('modal-add-to-cart-btn');
        const sizeError = document.getElementById('modal-size-error');

        // Populate modal with product info
        modalImage.src = product.image;
        modalImage.alt = product.name;
        modalName.textContent = product.name;
        modalPrice.textContent = `₱${product.price.toLocaleString("en-PH")}.00`;

        // Render size options
        const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
        modalSizeOptions.innerHTML = sizes.map(size => `
          <button class="modal-size-btn border border-gray-700 text-gray-300 hover:border-white py-2 rounded-lg transition text-sm font-medium" data-size="${size}">
            ${size}
          </button>
        `).join('');

        // Reset state
        modalQuantity.value = 1;
        addBtn.disabled = true;
        sizeError.classList.add('hidden');

        let selectedSize = null;

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Event Listeners for this specific open instance
        const closeBtn = document.getElementById('close-modal-btn');
        const qtyMinus = document.getElementById('modal-qty-minus');
        const qtyPlus = document.getElementById('modal-qty-plus');

        const closeModal = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        };

        closeBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        // Size selection
        modalSizeOptions.querySelectorAll('.modal-size-btn').forEach(btn => {
            btn.onclick = () => {
                modalSizeOptions.querySelectorAll('.modal-size-btn').forEach(b => {
                    b.classList.remove('bg-white', 'text-black', 'border-white');
                    b.classList.add('text-gray-300', 'border-gray-700');
                });
                btn.classList.add('bg-white', 'text-black', 'border-white');
                btn.classList.remove('text-gray-300', 'border-gray-700');
                selectedSize = btn.dataset.size;
                addBtn.disabled = false;
                sizeError.classList.add('hidden');
            };
        });

        // Quantity controls
        qtyMinus.onclick = () => {
            const val = parseInt(modalQuantity.value);
            if (val > 1) modalQuantity.value = val - 1;
        };

        qtyPlus.onclick = () => {
            const val = parseInt(modalQuantity.value);
            if (val < 10) modalQuantity.value = val + 1;
        };

        // Add to cart
        addBtn.onclick = () => {
            if (!selectedSize) {
                sizeError.textContent = 'Please select a size';
                sizeError.classList.remove('hidden');
                return;
            }

            const quantity = parseInt(modalQuantity.value);
            if (typeof Cart !== 'undefined' && Cart.addItem) {
                Cart.addItem(product, quantity, selectedSize);

                // Show toast
                if (window.Toast) {
                    Toast.success(`Added ${quantity}x ${product.name} (${selectedSize}) to bag!`, 3000);
                }

                closeModal();
            } else {
                console.error('Cart utility not found');
            }
        };
    }
};
