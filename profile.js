// Profile Page Logic
document.addEventListener("DOMContentLoaded", async () => {
    // Check Auth
    const user = await Auth.getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Render User Info
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");

    if (profileName) profileName.textContent = user.user_metadata?.name || user.email.split('@')[0];
    if (profileEmail) profileEmail.textContent = user.email;

    // Logout Handlers
    const logoutHandler = () => Auth.logout();
    const logoutBtn = document.getElementById("logout-btn");
    const navLogout = document.getElementById("nav-logout");

    if (logoutBtn) logoutBtn.addEventListener("click", logoutHandler);
    if (navLogout) navLogout.addEventListener("click", logoutHandler);

    // Profile Update Form Logic (Modal or Section)
    // For now, let's assume we might add a simple edit button or form later.
    // User requested "profile details and forgot password section".
    // Let's inject a "Reset Password" button and "Update Details" button.

    const sidebar = document.querySelector(".md\\:w-1\\/4 div");
    if (sidebar) {
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "mt-4 space-y-2";

        actionsDiv.innerHTML = `
            <button id="update-profile-btn" class="w-full py-2 px-4 border border-gray-700 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-colors">
                UPDATE DETAILS
            </button>
            <button id="reset-pwd-btn" class="w-full py-2 px-4 border border-gray-700 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-colors">
                RESET PASSWORD
            </button>
        `;

        // Insert before logout
        sidebar.insertBefore(actionsDiv, logoutBtn);

        // Modal for Update Details
        const modalHTML = `
            <div id="profile-modal" class="fixed inset-0 bg-black/80 hidden items-center justify-center z-50">
                <div class="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md relative">
                    <button id="close-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                    <h3 id="modal-title" class="text-2xl font-bold mb-6">Update Profile</h3>
                    
                    <form id="profile-form" class="space-y-4">
                        <div>
                            <label class="block text-xs uppercase text-gray-400 mb-2">Name</label>
                            <input type="text" id="edit-name" class="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-white transition-colors" value="${user.user_metadata?.name || ''}">
                        </div>
                        <button type="submit" class="w-full py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                            SAVE CHANGES
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Bind Modal Events
        const modal = document.getElementById('profile-modal');
        const updateBtn = document.getElementById('update-profile-btn');
        const closeBtn = document.getElementById('close-modal');
        const form = document.getElementById('profile-form');
        const resetBtn = document.getElementById('reset-pwd-btn');

        updateBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = document.getElementById('edit-name').value;
            const btn = form.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = "Saving...";
            btn.disabled = true;

            const supabase = getSupabase();
            const { data, error } = await supabase.auth.updateUser({
                data: { name: newName }
            });

            if (error) {
                alert("Error updating profile: " + error.message);
            } else {
                alert("Profile updated successfully!");
                if (profileName) profileName.textContent = newName;
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }

            btn.textContent = originalText;
            btn.disabled = false;
        });

        resetBtn.addEventListener('click', async () => {
            const supabase = getSupabase();
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: window.location.href, // This usually sends an email
            });
            if (error) {
                alert("Error sending reset email: " + error.message);
            } else {
                alert(`Password reset email sent to ${user.email}. Check your inbox.`);
            }
        });
    }

    // Render Favorites (Async Supabase)
    const grid = document.getElementById("favorites-grid");
    const favoritesIds = await Favorites.getFavorites(); // This needs to be checked in utils.js if it returns array of IDs

    // We need logic to fetch product details for these IDs if they aren't in window.catalogProducts (or race condition)
    // Luckily script.js or product-loader.js loads catalogProducts.
    // Let's wait for products if needed.

    const renderFavorites = () => {
        if (!window.catalogProducts) return;

        const favoriteProducts = window.catalogProducts.filter(p => favoritesIds.includes(p.id));

        if (favoriteProducts.length > 0) {
            grid.innerHTML = "";
            favoriteProducts.forEach((product) => {
                const card = document.createElement("div");
                card.className =
                    "group bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-white/70 transition-colors";
                card.innerHTML = `
                  <div class="relative bg-gray-900 overflow-hidden">
                    <img
                      src="${product.image}"
                      alt="${product.name}"
                      class="w-full h-52 object-contain bg-gradient-to-br from-gray-900 via-black to-gray-800 transform group-hover:scale-105 transition-transform duration-300"
                    />
                     <button
                        class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 transition remove-fav-btn"
                        data-id="${product.id}"
                        title="Remove from favorites"
                      >
                       <i class="fas fa-times"></i>
                      </button>
                  </div>
                  <div class="flex-1 flex flex-col px-4 py-4 space-y-2">
                    <p class="text-xs uppercase tracking-wide text-gray-400">${product.brand}</p>
                    <h3 class="text-sm font-semibold leading-snug line-clamp-2 mb-1">
                      <a href="product.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <p class="text-base font-semibold">₱${product.price.toLocaleString("en-PH")}.00</p>
                     <button
                        class="w-full py-2 mt-2 text-xs font-bold uppercase tracking-wide border border-gray-700 rounded-full hover:bg-white hover:text-black transition-colors"
                        onclick="window.location.href='product.html?id=${product.id}'"
                      >
                        View Product
                      </button>
                  </div>
                `;
                grid.appendChild(card);
            });

            // Attach remove handlers
            document.querySelectorAll(".remove-fav-btn").forEach((btn) => {
                btn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const id = parseInt(e.currentTarget.getAttribute("data-id"));
                    const success = await Favorites.toggle(id);
                    if (success) {
                        const card = btn.closest('.group');
                        if (card) card.remove();
                    }
                });
            });
        } else {
            grid.innerHTML = '<p class="text-gray-500 col-span-full text-center py-10">You usually show no love. Add items to favorites!</p>';
        }
    };

    if (window.catalogProducts && window.catalogProducts.length > 0) {
        renderFavorites();
    } else {
        window.addEventListener('productsLoaded', renderFavorites);
    }

    // --- Tabs Logic ---
    const tabs = document.querySelectorAll('.profile-tab-btn');
    const views = document.querySelectorAll('.tab-content');

    const switchTab = (tabName) => {
        // Toggle Buttons
        tabs.forEach(t => {
            if (t.dataset.tab === tabName) {
                t.classList.add('active', 'text-white', 'bg-gray-800');
                t.classList.remove('text-gray-400');
            } else {
                t.classList.remove('active', 'text-white', 'bg-gray-800');
                t.classList.add('text-gray-400');
            }
        });

        // Toggle Views
        views.forEach(v => {
            if (v.id === `view-${tabName}`) {
                v.classList.remove('hidden');
            } else {
                v.classList.add('hidden');
            }
        });
    };

    tabs.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Check URL hash for initial tab
    if (window.location.hash === '#cart') {
        switchTab('cart');
    }

    // --- Cart Rendering Logic ---
    const renderCartTab = () => {
        const cart = Cart ? Cart.getCart() : [];
        const container = document.getElementById('cart-container');
        const countBadge = document.getElementById('profile-cart-count');
        const subtotalEl = document.getElementById('cart-tab-subtotal');
        const totalEl = document.getElementById('cart-tab-total');

        if (countBadge) countBadge.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);

        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '<p class="text-gray-500 py-10 text-center">Your bag is empty.</p>';
            subtotalEl.textContent = '₱0.00';
            totalEl.textContent = '₱0.00';
            return;
        }

        let subtotal = 0;
        container.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `
                 <div class="flex gap-4 p-4 border border-gray-800 rounded-xl bg-gray-950">
                    <div class="w-20 h-20 bg-gray-900 rounded-lg flex-shrink-0 overflow-hidden">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">
                    </div>
                    <div class="flex-1 flex flex-col justify-between">
                        <div class="flex justify-between items-start gap-2">
                            <div>
                                <h3 class="font-bold text-sm line-clamp-1"><a href="product.html?id=${item.id}">${item.name}</a></h3>
                                <p class="text-xs text-gray-400">Size: ${item.selectedSize || "OS"}</p>
                            </div>
                            <button class="text-gray-500 hover:text-white remove-cart-btn" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <div class="flex items-center border border-gray-700 rounded-full scale-90 origin-left">
                                <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white qty-btn" data-id="${item.id}" data-action="minus">-</button>
                                <span class="text-xs font-medium w-4 text-center">${item.quantity}</span>
                                <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white qty-btn" data-id="${item.id}" data-action="plus">+</button>
                            </div>
                            <span class="font-bold text-sm">₱${itemTotal.toLocaleString("en-PH")}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        subtotalEl.textContent = `₱${subtotal.toLocaleString("en-PH")}.00`;
        totalEl.textContent = `₱${subtotal.toLocaleString("en-PH")}.00`;

        // Bind Cart Events
        container.querySelectorAll('.remove-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Cart.removeItem(parseInt(btn.dataset.id));
                renderCartTab();
            });
        });

        container.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const action = btn.dataset.action;
                const item = cart.find(i => i.id === id);
                if (item) {
                    let newQty = item.quantity + (action === 'plus' ? 1 : -1);
                    if (newQty > 0) {
                        Cart.updateQuantity(id, newQty);
                        renderCartTab();
                    }
                }
            });
        });
    };

    // Initial Render
    renderCartTab();

    // Checkout Btn
    const checkoutBtn = document.getElementById('cart-tab-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert("Proceeding to checkout...");
            // Mock checkout logic or redirect
            Cart.clearCart();
            renderCartTab();
            window.location.href = 'index.html';
        });
    }

});
