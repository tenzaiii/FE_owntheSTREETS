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
            <div id="profile-modal" class="fixed inset-0 bg-black/80 hidden items-center justify-center z-50 p-4">
                <div class="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl w-full max-w-md relative overflow-y-auto max-h-[90vh]">
                    <button id="close-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                    <h3 id="modal-title" class="text-2xl font-bold mb-6">Update Profile</h3>
                    
                    <form id="profile-form" class="space-y-4">
                        <div>
                            <label class="block text-xs uppercase text-gray-400 mb-2">Full Name</label>
                            <input type="text" id="edit-name" class="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-white transition-colors" value="${user.user_metadata?.name || ''}">
                        </div>
                        <div>
                            <label class="block text-xs uppercase text-gray-400 mb-2">Phone Number</label>
                            <input type="tel" id="edit-phone" class="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-white transition-colors" placeholder="0912 345 6789">
                        </div>
                        <div>
                            <label class="block text-xs uppercase text-gray-400 mb-2">Shipping Address</label>
                            <textarea id="edit-address" rows="3" class="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-white transition-colors" placeholder="Unit, Street, City, Province, Zip Code"></textarea>
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

        // Load existing profile data when opening modal
        updateBtn.addEventListener('click', async () => {
            const supabase = getSupabase();
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                if (document.getElementById('edit-phone')) document.getElementById('edit-phone').value = profile.phone || '';
                if (document.getElementById('edit-address')) document.getElementById('edit-address').value = profile.address || '';
                // Name is usually in user_metadata, but we can sync it if needed.
            }

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
            const newPhone = document.getElementById('edit-phone').value;
            const newAddress = document.getElementById('edit-address').value;

            const btn = form.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = "Saving...";
            btn.disabled = true;

            const supabase = getSupabase();

            try {
                // 1. Update Auth Metadata (Name)
                const { error: authError } = await supabase.auth.updateUser({
                    data: { name: newName }
                });
                if (authError) throw authError;

                // 2. Update Profiles Table (Phone, Address, Name)
                // Use upsert to handle cases where the profile row doesn't exist yet (pre-trigger users)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email,
                        full_name: newName,
                        phone: newPhone,
                        address: newAddress,
                        role: 'customer' // Default role if creating new
                    }, { onConflict: 'id' });

                if (profileError) throw profileError;

                alert("Profile updated successfully!");
                if (profileName) profileName.textContent = newName;
                modal.classList.add('hidden');
                modal.classList.remove('flex');

            } catch (error) {
                alert("Error updating profile: " + error.message);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
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

    // --- Orders Logic ---
    let userOrders = [];

    const fetchOrders = async () => {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        ordersList.innerHTML = '<p class="text-gray-500 text-center py-10">Loading orders...</p>';

        const supabase = getSupabase();

        // Fetch orders and their items (removed nested products join to avoid potential errors)
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id, product_id, product_name, quantity, size, price_at_time
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            ordersList.innerHTML = '<p class="text-red-500 text-center py-10">Failed to load orders.</p>';
            return;
        }

        userOrders = orders || [];

        // 2. Fetch images for products in these orders
        const productIds = new Set();
        userOrders.forEach(o => {
            o.order_items.forEach(i => {
                if (i.product_id) productIds.add(i.product_id);
            });
        });

        if (productIds.size > 0) {
            const { data: products } = await supabase
                .from('products')
                .select('id, image_url')
                .in('id', Array.from(productIds));

            // Map images to a lookup object
            const imageMap = {};
            if (products) {
                products.forEach(p => {
                    imageMap[p.id] = p.image_url;
                });
            }

            // Attach images to userOrders items
            userOrders.forEach(o => {
                o.order_items.forEach(i => {
                    i.image_url = imageMap[i.product_id];
                });
            });
        }

        renderOrders('all');
    };

    const renderOrders = (statusFilter) => {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        let filtered = userOrders;
        if (statusFilter !== 'all') {
            filtered = userOrders.filter(o => o.status === statusFilter);
        }

        if (filtered.length === 0) {
            ordersList.innerHTML = '<p class="text-gray-500 text-center py-10">No orders found.</p>';
            return;
        }

        ordersList.innerHTML = filtered.map(order => {
            // Calculate local status label color
            let statusColor = 'text-gray-400';
            let statusLabel = order.status.toUpperCase();

            switch (order.status) {
                case 'pending': statusColor = 'text-orange-500'; statusLabel = 'TO PAY'; break;
                case 'processing': statusColor = 'text-blue-500'; statusLabel = 'TO SHIP'; break;
                case 'shipped': statusColor = 'text-purple-500'; statusLabel = 'TO RECEIVE'; break;
                case 'delivered': statusColor = 'text-green-500'; statusLabel = 'COMPLETED'; break;
                case 'cancelled': statusColor = 'text-red-500'; break;
            }

            // Render items (first 2, then +more if needed)
            const itemsHtml = order.order_items.map(item => {
                const imgUrl = item.image_url || 'https://via.placeholder.com/150?text=No+Image'; // Fallback
                return `
                <div class="flex gap-4 py-2">
                    <div class="w-16 h-16 bg-gray-900 rounded border border-gray-800 flex items-center justify-center overflow-hidden">
                        <img src="${imgUrl}" alt="${item.product_name}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1">
                         <h4 class="font-bold text-sm text-white line-clamp-1">${item.product_name}</h4>
                         <p class="text-xs text-gray-500">Size: ${item.size} x${item.quantity}</p>
                         <p class="text-xs text-gray-400">₱${item.price_at_time.toLocaleString("en-PH")}</p>
                    </div>
                </div>
             `}).join('');

            return `
                <div class="bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-6 transition hover:border-gray-700">
                    <div class="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-bold">Order ID: #${order.id}</p>
                            <p class="text-xs text-gray-600">${new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <span class="text-xs font-bold ${statusColor} border border-current px-3 py-1 rounded-full">${statusLabel}</span>
                    </div>
                    
                    <div class="space-y-2 mb-4">
                        ${itemsHtml}
                    </div>

                    <div class="flex justify-between items-center pt-4 border-t border-gray-800">
                        <div>
                             <p class="text-xs text-gray-500">Total Amount</p>
                             <p class="font-bold text-lg text-white">₱${order.total_amount.toLocaleString("en-PH")}</p>
                        </div>
                        <!-- Icon Action Buttons -->
                        <div class="flex gap-2">
                             ${order.status === 'pending' ? `
                             <button class="text-green-500 hover:text-green-400 p-2 rounded-lg hover:bg-green-500/10 transition pay-now-btn" data-id="${order.id}" title="Pay Now">
                                 <i class="fas fa-credit-card text-lg"></i>
                             </button>` : ''}
                             ${order.status === 'delivered' ? `
                             <button class="text-blue-500 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-500/10 transition reorder-btn" data-id="${order.id}" title="Order Again">
                                 <i class="fas fa-redo text-lg"></i>
                             </button>` : ''}
                             ${(order.status === 'pending' || order.status === 'processing') ? `
                             <button class="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition cancel-order-btn" data-id="${order.id}" title="Cancel Order">
                                 <i class="fas fa-times-circle text-lg"></i>
                             </button>` : ''}
                        </div>
                    </div>
                </div>
             `;
        }).join('');

        // Attach Event Listeners
        ordersList.querySelectorAll('.cancel-order-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const orderId = e.currentTarget.dataset.id; // Use currentTarget to ensure we get the button's data
                if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

                const supabase = getSupabase();
                const { error } = await supabase
                    .from('orders')
                    .update({ status: 'cancelled' })
                    .eq('id', orderId);

                if (error) {
                    alert("Failed to cancel order: " + error.message);
                } else {
                    alert("Order cancelled successfully.");
                    fetchOrders(); // Refresh list
                }
            });
        });

        // Pay Now Button (placeholder)
        ordersList.querySelectorAll('.pay-now-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.id;
                alert(`Payment for Order #${orderId}\n\nRedirecting to payment page...\n(Payment integration coming soon!)`);
            });
        });

        // Reorder Button (placeholder)
        ordersList.querySelectorAll('.reorder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.id;
                const order = userOrders.find(o => o.id == orderId);
                if (order && confirm(`Add all items from Order #${orderId} to your cart?`)) {
                    alert('Items added to cart!\n(Reorder functionality coming soon!)');
                }
            });
        });
    };

    // Filter Tabs Logic
    const statusTabs = document.querySelectorAll('.order-status-tab');
    statusTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Active state
            statusTabs.forEach(t => {
                t.classList.remove('active', 'text-white', 'border-b-2', 'border-white');
                t.classList.add('text-gray-500');
            });
            tab.classList.add('active', 'text-white', 'border-b-2', 'border-white');
            tab.classList.remove('text-gray-500');

            renderOrders(tab.dataset.status);
        });
    });

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

        if (tabName === 'orders') {
            fetchOrders();
        } else if (tabName === 'cart') {
            renderCartTab();
        }
    };

    tabs.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });




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
                                <p class="text-xs text-gray-400">Size: ${item.size || "One Size"}</p>
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

    // Checkout Btn & Modal Logic
    const checkoutBtn = document.getElementById('cart-tab-checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckout = document.getElementById('close-checkout');
    const checkoutForm = document.getElementById('checkout-form');

    // Store profile data for checkout
    let currentProfile = null;

    if (checkoutBtn && checkoutModal) {
        // Open Modal
        checkoutBtn.addEventListener('click', async () => {
            const cart = Cart.getCart();
            if (cart.length === 0) {
                alert("Your bag is empty.");
                return;
            }

            // Calculate totals
            const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            document.getElementById('checkout-subtotal').textContent = `₱${total.toLocaleString("en-PH")}.00`;
            document.getElementById('checkout-total').textContent = `₱${total.toLocaleString("en-PH")}.00`;

            checkoutModal.classList.remove('hidden');
            checkoutModal.classList.add('flex');

            // Fetch & Display Profile Data
            const infoDiv = document.getElementById('checkout-profile-info');
            const missingMsg = document.getElementById('checkout-missing-info');
            const placeOrderBtn = document.getElementById('btn-place-order');

            infoDiv.innerHTML = '<p class="italic text-gray-500">Loading details...</p>';
            missingMsg.classList.add('hidden');
            placeOrderBtn.disabled = true;

            const supabase = getSupabase();
            const user = await Auth.getCurrentUser();

            if (user) {
                // Try to get profile
                let { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // If profile doesn't exist (rare if trigger works), or just in case
                if (!profile) {
                    // Fallback using auth meta
                    profile = { full_name: user.user_metadata?.name || user.email.split('@')[0], email: user.email };
                }

                currentProfile = profile; // Save for submit

                if (profile && profile.address && profile.phone) {
                    infoDiv.innerHTML = `
                        <p class="font-bold text-white">${profile.full_name || user.email}</p>
                        <p>${profile.phone}</p>
                        <p class="opacity-80">${profile.address}</p>
                    `;
                    placeOrderBtn.disabled = false;
                } else {
                    infoDiv.innerHTML = `
                        <p class="font-bold text-white">${profile?.full_name || user.email}</p>
                        <p class="text-gray-500 italic">No address/phone saved.</p>
                    `;
                    missingMsg.classList.remove('hidden');
                    placeOrderBtn.disabled = true;
                }
            }
        });

        // Close Modal
        closeCheckout.addEventListener('click', () => {
            checkoutModal.classList.add('hidden');
            checkoutModal.classList.remove('flex');
        });

        // Edit Profile Link in Checkout
        const editLink = document.getElementById('checkout-edit-profile');
        if (editLink) {
            editLink.addEventListener('click', (e) => {
                e.preventDefault();
                checkoutModal.classList.add('hidden');
                checkoutModal.classList.remove('flex');
                document.getElementById('update-profile-btn').click(); // Trigger other modal
            });
        }

        // Submit Order
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentProfile || !currentProfile.address || !currentProfile.phone) {
                alert("Please update your profile with shipping details first.");
                return;
            }

            const btn = document.getElementById('btn-place-order');
            const originalText = btn.textContent;
            btn.textContent = "PROCESSING...";
            btn.disabled = true;

            try {
                const formData = new FormData(checkoutForm);
                const cart = Cart.getCart();
                const user = await Auth.getCurrentUser();
                const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const paymentMethod = formData.get('payment');

                // Generate Random 14-digit Order ID
                const orderId = Math.floor(Math.random() * 90000000000000) + 10000000000000;

                const orderData = {
                    id: orderId, // Manually set ID
                    user_id: user.id,
                    total_amount: totalAmount,
                    // COD orders skip 'pending' (To Pay) and go straight to 'processing' (To Ship)
                    status: paymentMethod === 'cod' ? 'processing' : 'pending',
                    guest_email: user.email,
                    shipping_address: currentProfile.address,
                    contact_number: currentProfile.phone,
                    payment_method: paymentMethod,
                    guest_info: {
                        name: currentProfile.full_name || user.user_metadata?.name
                    }
                };

                const supabase = getSupabase();

                // 1. Insert Order
                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .insert(orderData)
                    .select()
                    .single();

                if (orderError) throw orderError;

                // 2. Insert Items
                const orderItems = cart.map(item => ({
                    order_id: order.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    size: item.size || "One Size",
                    price_at_time: item.price,
                    product_name: item.name
                }));

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);

                if (itemsError) throw itemsError;

                // 3. Success
                Cart.clearCart();
                renderCartTab();

                checkoutModal.classList.add('hidden');
                checkoutModal.classList.remove('flex');
                checkoutForm.reset();

                // Show success toast
                if (window.Toast) {
                    Toast.success(`Order #${order.id} placed successfully via ${paymentMethod.toUpperCase()}! 🎉`, 4000);
                } else {
                    alert(`Order #${order.id} placed successfully via ${paymentMethod.toUpperCase()}!`);
                }

            } catch (err) {
                console.error('Order Logic Error:', err);
                alert("Failed to place order. " + err.message);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }

    // Check URL hash for initial tab (Moved to end to ensure functions are defined)
    if (window.location.hash === '#cart') {
        switchTab('cart');
    } else if (window.location.hash === '#orders') {
        switchTab('orders');
    }

});
