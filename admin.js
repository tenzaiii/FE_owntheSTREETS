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

    async function loadOrders() {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);

        const tbody = document.getElementById("orders-table-body");
        if (!orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-gray-500">No orders found.</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs">#${o.id}</td>
                <td class="px-6 py-4 text-xs">${new Date(o.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-white">${o.guest_email || 'Register User'}</div>
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
                // Feedback?
                e.target.classList.add('text-green-500');
                setTimeout(() => e.target.classList.remove('text-green-500'), 1000);
            });
        });
    }

    async function loadProducts() {
        const { data: products } = await supabase.from('products').select('*').order('id');
        const tbody = document.getElementById("products-table-body");

        if (!products || products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center">No products found.</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="w-10 h-10 bg-gray-800 rounded overflow-hidden">
                        <img src="${p.image_url}" class="w-full h-full object-cover">
                    </div>
                </td>
                <td class="px-6 py-4 font-bold text-white">${p.name}</td>
                <td class="px-6 py-4 text-xs uppercase">${p.brand}</td>
                <td class="px-6 py-4 text-xs">${p.category}</td>
                <td class="px-6 py-4 text-sm">₱${p.price.toLocaleString()}</td>
                <td class="px-6 py-4 text-right">
                    <button class="text-blue-500 hover:text-blue-400 mr-2 delete-product-btn" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                    <button class="text-gray-400 hover:text-white"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `).join("");

        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!confirm("Are you sure?")) return;
                const id = btn.getAttribute('data-id');
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) alert("Error deleting: " + error.message);
                else loadProducts();
            });
        });
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
