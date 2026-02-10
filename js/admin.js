document.addEventListener("DOMContentLoaded", async () => {
    // 1. Admin Auth Check
    const user = await Auth.getCurrentUser();
    const ADMIN_EMAIL = "admin@ownthestreets.com";

    if (!user || user.email !== ADMIN_EMAIL) {
        alert("Access Denied: Admins only.");
        window.location.href = "index.html";
        return;
    }

    // 2. Setup Navigation
    const contentArea = document.getElementById("content-area");
    const pageTitle = document.getElementById("page-title");
    const tabs = document.querySelectorAll(".sidebar-link");
    const supabase = getSupabase();
    let currentView = 'dashboard'; // Default

    // Refresh Button
    const btnRefresh = document.getElementById("btn-refresh");
    if (btnRefresh) {
        btnRefresh.addEventListener("click", () => {
            // Add spin animation
            const icon = btnRefresh.querySelector('i');
            icon.classList.add('fa-spin');

            // Reload view
            renderView(currentView);

            // Remove spin after short delay (or handle within renderView if it was async returning promise)
            setTimeout(() => icon.classList.remove('fa-spin'), 1000);
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // UI Toggle
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Render View
            const viewName = tab.getAttribute("data-tab");
            renderView(viewName);
        });
    });

    // Logout
    document.getElementById("admin-logout").addEventListener("click", () => {
        Auth.logout();
    });

    // 3. Render Functions
    function renderView(viewName) {
        currentView = viewName; // Update state
        contentArea.innerHTML = ""; // Clear
        const template = document.getElementById(`view-${viewName}`);
        if (!template) return;

        const clone = template.content.cloneNode(true);
        contentArea.appendChild(clone);

        // Update Header
        pageTitle.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);

        // Load Data
        if (viewName === 'dashboard') loadDashboardStats();
        if (viewName === 'orders') loadOrders();
        if (viewName === 'products') loadProducts();
        if (viewName === 'customers') loadCustomers();
    }

    // --- DATA LOADERS ---

    async function loadDashboardStats() {
        // Parallel fetching
        const p1 = supabase.from('products').select('*', { count: 'exact', head: true });
        const p2 = supabase.from('profiles').select('*', { count: 'exact', head: true });
        const p3 = supabase.from('orders').select('*', { count: 'exact', head: true });

        const [products, customers, orders] = await Promise.all([p1, p2, p3]);

        document.getElementById("stat-products-count").textContent = products.count || 0;
        document.getElementById("stat-customers-count").textContent = customers.count || 0;
        document.getElementById("stat-orders-count").textContent = orders.count || 0;

        // Load recent orders snippet
        loadRecentOrdersSnippet();
    }

    async function loadRecentOrdersSnippet() {
        // Limit 5
        const { data: orders } = await supabase
            .from('orders')
            .select(`*`)
            .order('created_at', { ascending: false })
            .limit(5);

        const tbody = document.getElementById("dashboard-recent-orders");
        if (!tbody) return;

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center">No recent orders</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr class="hover:bg-gray-800 transition-colors">
                <td class="px-6 py-4 font-mono text-xs">#${o.id}</td>
                <td class="px-6 py-4">${o.guest_email || 'User ' + o.user_id.slice(0, 6)}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-bold ${getStatusColor(o.status)}">${o.status}</span></td>
                <td class="px-6 py-4 text-right">₱${o.total_amount.toLocaleString()}</td>
            </tr>
        `).join("");
    }

    let allOrders = []; // Store all orders for filtering

    async function loadOrders() {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);

        allOrders = orders || []; // Store for filtering
        renderOrdersTable(allOrders);

        // Attach search and filter listeners
        const searchInput = document.getElementById('order-search');
        const statusFilter = document.getElementById('order-status-filter');

        if (searchInput && statusFilter) {
            // Remove old listeners by cloning
            const newSearchInput = searchInput.cloneNode(true);
            const newStatusFilter = statusFilter.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);
            statusFilter.parentNode.replaceChild(newStatusFilter, statusFilter);

            // Add new listeners
            newSearchInput.addEventListener('input', filterOrders);
            newStatusFilter.addEventListener('change', filterOrders);
        }
    }

    function filterOrders() {
        const searchInput = document.getElementById('order-search');
        const statusFilter = document.getElementById('order-status-filter');

        const searchTerm = searchInput?.value.toLowerCase() || '';
        const statusValue = statusFilter?.value || 'all';

        let filtered = allOrders;

        // Filter by status
        if (statusValue !== 'all') {
            filtered = filtered.filter(o => o.status === statusValue);
        }

        // Filter by search term (order ID, email, amount)
        if (searchTerm) {
            filtered = filtered.filter(o => {
                const orderId = `#${o.id}`.toLowerCase();
                const email = (o.guest_email || '').toLowerCase();
                const amount = o.total_amount.toString();
                return orderId.includes(searchTerm) || email.includes(searchTerm) || amount.includes(searchTerm);
            });
        }

        renderOrdersTable(filtered);
    }

    function renderOrdersTable(orders) {
        const tbody = document.getElementById("orders-table-body");
        if (!tbody) return;

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-gray-500">No orders found.</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs">#${o.id}</td>
                <td class="px-6 py-4 text-xs">${new Date(o.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-white">${o.guest_email || 'Registered User'}</div>
                </td>
                <td class="px-6 py-4 text-xs text-gray-500">View Details (TODO)</td>
                <td class="px-6 py-4 font-bold text-white">₱${o.total_amount.toLocaleString()}</td>
                <td class="px-6 py-4">
                    <select class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-white status-select" data-id="${o.id}">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
                <td class="px-6 py-4 text-right">
                    <button class="text-gray-400 hover:text-white"><i class="fas fa-ellipsis-v"></i></button>
                </td>
            </tr>
        `).join("");

        // Bind status change
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const status = e.target.value;
                await supabase.from('orders').update({ status }).eq('id', id);
                // Feedback
                e.target.classList.add('text-green-500');
                setTimeout(() => e.target.classList.remove('text-green-500'), 1000);

                // Update local data
                const order = allOrders.find(o => o.id == id);
                if (order) order.status = status;
            });
        });
    }

    async function loadProducts() {
        // Elements
        const tbody = document.getElementById("products-table-body");
        const searchInput = document.getElementById("product-search");
        const filterBrand = document.getElementById("filter-brand");
        const filterCategory = document.getElementById("filter-category");

        const btnAdd = document.getElementById("btn-add-product");
        const modal = document.getElementById("modal-add-product");
        const btnCloseModal = document.getElementById("modal-close-btn");
        const formAdd = document.getElementById("form-add-product");
        const modalTitle = document.getElementById("modal-product-title");
        const btnSave = document.getElementById("btn-save-product");

        // --- FILTER LOGIC ---
        const fetchAndRender = async () => {
            let query = supabase.from('products').select('*').order('id', { ascending: false }); // Newest first

            // Apply Filters
            if (searchInput && searchInput.value.trim()) {
                query = query.ilike('name', `%${searchInput.value.trim()}%`);
            }
            if (filterBrand && filterBrand.value) {
                query = query.eq('brand', filterBrand.value);
            }
            if (filterCategory && filterCategory.value) {
                query = query.eq('category', filterCategory.value);
            }

            const { data: products, error } = await query;

            if (error) {
                console.error(error);
                return;
            }

            if (!products || products.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center">No products found matching filters.</td></tr>`;
                return;
            }

            tbody.innerHTML = products.map(p => `
                <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${p.is_hidden ? 'opacity-50 grayscale' : ''}">
                    <td class="px-6 py-4">
                        <div class="w-12 h-12 bg-gray-800 rounded overflow-hidden border border-gray-700 relative">
                            <img src="${p.image_url}" class="w-full h-full object-cover" onerror="this.src='IMG/esnlPlaceholder.jpg'">
                            ${p.is_hidden ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center"><i class="fas fa-eye-slash text-white text-xs"></i></div>' : ''}
                        </div>
                    </td>
                    <td class="px-6 py-4 font-mono text-xs text-gray-400">#${p.id}</td>
                    <td class="px-6 py-4 font-bold text-white text-sm">
                        ${p.name}
                        ${p.is_hidden ? '<span class="ml-2 text-xs text-red-500 font-normal border border-red-500 px-1 rounded">HIDDEN</span>' : ''}
                    </td>
                    <td class="px-6 py-4 text-xs uppercase text-gray-400">${p.brand}</td>
                    <td class="px-6 py-4 text-xs text-gray-400">${p.category}</td>
                    <td class="px-6 py-4 text-sm font-medium text-white">₱${p.price.toLocaleString()}</td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                        <button class="text-blue-500 hover:text-blue-400 p-2 rounded hover:bg-blue-500/10 transition edit-product-btn" data-id="${p.id}" title="Edit">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="text-yellow-500 hover:text-yellow-400 p-2 rounded hover:bg-yellow-500/10 transition toggle-visibility-btn" data-id="${p.id}" data-hidden="${p.is_hidden}" title="${p.is_hidden ? 'Show' : 'Hide'}">
                            <i class="fas ${p.is_hidden ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        </button>
                        <button class="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition delete-product-btn" data-id="${p.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
             `).join("");

            // Re-bind buttons
            document.querySelectorAll('.delete-product-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.getAttribute('data-id');
                    if (!confirm("Are you sure you want to permanently delete this product?")) return;

                    const { error } = await supabase.from('products').delete().eq('id', id);
                    if (error) {
                        alert("Error deleting: " + error.message);
                    } else {
                        fetchAndRender(); // Reload
                    }
                });
            });

            document.querySelectorAll('.toggle-visibility-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.getAttribute('data-id');
                    const isHidden = btn.getAttribute('data-hidden') === 'true';
                    const newStatus = !isHidden;

                    // Optimistic update
                    const icon = btn.querySelector('i');
                    icon.className = `fas fa-spinner fa-spin`;

                    const { error } = await supabase.from('products').update({ is_hidden: newStatus }).eq('id', id);
                    if (error) {
                        alert("Error updating visibility: " + error.message);
                        fetchAndRender(); // Revert
                    } else {
                        fetchAndRender();
                    }
                });
            });

            document.querySelectorAll('.edit-product-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    const product = products.find(p => p.id == id);
                    if (product) openEditModal(product);
                });
            });
        };

        // Event Listeners for Filters
        if (searchInput) searchInput.addEventListener('input', fetchAndRender);
        if (filterBrand) filterBrand.addEventListener('change', fetchAndRender);
        if (filterCategory) filterCategory.addEventListener('change', fetchAndRender);

        // --- MODAL LOGIC ---
        function openAddModal() {
            formAdd.reset();
            document.getElementById('product-id').value = ''; // Clear ID
            modalTitle.textContent = "Add New Product";
            btnSave.textContent = "ADD PRODUCT TO INVENTORY";
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function openEditModal(product) {
            formAdd.reset();
            document.getElementById('product-id').value = product.id;
            document.getElementById('input-name').value = product.name;
            document.getElementById('input-price').value = product.price;
            document.getElementById('input-brand').value = product.brand;
            document.getElementById('input-category').value = product.category;
            document.getElementById('input-type').value = product.type;
            document.getElementById('input-image_url').value = product.image_url;

            // Populate Additional Images
            const additionalImages = product.additional_images || [];
            document.getElementById('input-additional_images').value = additionalImages.join('\n');

            document.getElementById('input-description').value = product.description || "";
            document.getElementById('input-tag').value = product.tag || "";

            modalTitle.textContent = "Edit Product";
            btnSave.textContent = "UPDATE PRODUCT";
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        if (btnAdd) {
            btnAdd.addEventListener('click', openAddModal);
        }

        if (btnCloseModal) {
            btnCloseModal.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            });
        }



        // --- UPLOAD LOGIC ---
        async function uploadFile(file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            return publicUrl;
        }

        const fileMain = document.getElementById('file-main-image');
        if (fileMain) {
            fileMain.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const btnLabel = fileMain.parentElement;
                const originalContent = btnLabel.innerHTML;
                btnLabel.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                try {
                    const publicUrl = await uploadFile(file);
                    document.getElementById('input-image_url').value = publicUrl;
                } catch (err) {
                    alert("Upload failed: " + err.message);
                } finally {
                    btnLabel.innerHTML = originalContent;
                }
            });
        }

        const fileAdditional = document.getElementById('file-additional-images');
        if (fileAdditional) {
            fileAdditional.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;

                const btnLabel = fileAdditional.parentElement;
                const originalContent = btnLabel.innerHTML;
                btnLabel.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                try {
                    const uploadPromises = files.map(file => uploadFile(file));
                    const urls = await Promise.all(uploadPromises);

                    const textarea = document.getElementById('input-additional_images');
                    const currentVal = textarea.value.trim();
                    textarea.value = currentVal ? currentVal + '\n' + urls.join('\n') : urls.join('\n');
                } catch (err) {
                    alert("Upload failed: " + err.message);
                } finally {
                    btnLabel.innerHTML = originalContent;
                }
            });
        }

        if (formAdd) {
            formAdd.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(formAdd);
                const id = formData.get('id'); // Check if editing

                const productData = {
                    name: formData.get('name'),
                    price: parseFloat(formData.get('price')),
                    brand: formData.get('brand'),
                    category: formData.get('category'),
                    type: formData.get('type'),
                    image_url: formData.get('image_url'),
                    // Parse Additional Images
                    additional_images: formData.get('additional_images')
                        ? formData.get('additional_images').split(/[\n,]+/).map(url => url.trim()).filter(url => url)
                        : [],
                    description: formData.get('description') || null,
                    tag: formData.get('tag') || null,
                    // Persist sizes if editing, or default if new. 
                    // Ideally we should have a sizes input, but for now we keep default.
                };

                if (!id) {
                    productData.sizes = ["S", "M", "L", "XL"];
                }

                const originalText = btnSave.textContent;
                btnSave.textContent = "SAVING...";
                btnSave.disabled = true;

                try {
                    let error;
                    if (id) {
                        // Update
                        const res = await supabase.from('products').update(productData).eq('id', id);
                        error = res.error;
                    } else {
                        // Insert
                        const res = await supabase.from('products').insert([productData]);
                        error = res.error;
                    }

                    if (error) throw error;

                    alert(id ? "Product updated!" : "Product added!");
                    formAdd.reset();
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                    fetchAndRender();
                } catch (err) {
                    alert("Error saving product: " + err.message);
                    console.error(err);
                } finally {
                    btnSave.textContent = originalText;
                    btnSave.disabled = false;
                }
            });
        }

        // Initial Fetch
        fetchAndRender();
    }

    async function loadCustomers() {
        const { data: profiles } = await supabase.from('profiles').select('*');
        const tbody = document.getElementById("customers-table-body");

        if (!profiles || profiles.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center">No customers found (requires profiles table sync).</td></tr>`;
            return;
        }

        tbody.innerHTML = profiles.map(p => `
             <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs">${p.id.slice(0, 8)}...</td>
                <td class="px-6 py-4 text-white">${p.email}</td>
                <td class="px-6 py-4">${p.full_name || '-'}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 bg-gray-800 rounded text-xs">${p.role}</span></td>
                <td class="px-6 py-4 text-xs text-gray-500">${new Date(p.created_at).toLocaleDateString()}</td>
            </tr>
        `).join("");
    }

    function getStatusColor(status) {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-500';
            case 'processing': return 'bg-blue-500/20 text-blue-500';
            case 'shipped': return 'bg-purple-500/20 text-purple-500';
            case 'delivered': return 'bg-green-500/20 text-green-500';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    }

    // Initial Load
    renderView("dashboard");
});
