// (No content here, switching to view login.html first)
// Handles Authentication (Supabase), Cart (localStorage), and Favorites (Supabase)

const STORAGE_KEYS = {
    CART: 'ownthestreets_cart'
};

// Helper to get Supabase client
function getSupabase() {
    if (!window.supabaseClient) {
        console.error('Supabase client not initialized. Make sure supabase-client.js is loaded.');
        return null;
    }
    return window.supabaseClient;
}

const Auth = {
    async getCurrentUser() {
        const supabase = getSupabase();
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async login(email, password) {
        const supabase = getSupabase();
        if (!supabase) return { success: false, message: 'Supabase client not initialized' };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, user: data.user };
    },

    async signup(name, email, password) {
        const supabase = getSupabase();
        if (!supabase) return { success: false, message: 'Supabase client not initialized' };
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });
        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, user: data.user };
    },

    async logout() {
        const supabase = getSupabase();
        if (!supabase) return;
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    },

    async isLoggedIn() {
        const user = await this.getCurrentUser();
        return !!user;
    }
};

const Cart = {
    getCart() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
    },

    addItem(product, quantity = 1, size = null) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id && item.size === size);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity, size });
        }

        this.saveCart(cart);
        this.updateBadge();
    },

    removeItem(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        this.saveCart(cart);
        this.updateBadge();
    },

    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(productId);
                return;
            }
        }
        this.saveCart(cart);
        this.updateBadge();
    },

    clearCart() {
        localStorage.removeItem(STORAGE_KEYS.CART);
        this.updateBadge();
    },

    saveCart(cart) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    },

    getTotalItems() {
        return this.getCart().reduce((total, item) => total + item.quantity, 0);
    },

    updateBadge() {
        const count = this.getTotalItems();
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
            // Remove or add hidden class if using Tailwind hidden logic, but inline style works for now as override
            if (count > 0) {
                badge.classList.remove('hidden');
                badge.style.display = 'flex';
            } else {
                badge.classList.add('hidden');
                badge.style.display = 'none';
            }
        });
    }
};

// Favorites Module (Supabase)
const Favorites = {
    async toggle(productId) {
        const supabase = getSupabase();
        if (!supabase) return false;

        const user = await Auth.getCurrentUser();
        if (!user) return false;

        // Check if already favorited
        const { data: existing } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();

        if (existing) {
            // Remove favorite
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);

            if (error) console.error('Error removing favorite:', error);
            return !error;
        } else {
            // Add favorite
            const { error } = await supabase
                .from('user_favorites')
                .insert({ user_id: user.id, product_id: productId });

            if (error) console.error('Error adding favorite:', error);
            return !error;
        }
    },

    async isFavorite(productId) {
        const supabase = getSupabase();
        if (!supabase) return false;

        const user = await Auth.getCurrentUser();
        if (!user) return false;

        const { data } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();

        return !!data;
    },

    async getFavorites() {
        const supabase = getSupabase();
        if (!supabase) return [];

        const user = await Auth.getCurrentUser();
        if (!user) return [];

        const { data } = await supabase
            .from('user_favorites')
            .select('product_id')
            .eq('user_id', user.id);

        return data ? data.map(f => f.product_id) : [];
    },

    async getFavoriteProducts() {
        const supabase = getSupabase();
        if (!supabase) return [];

        const user = await Auth.getCurrentUser();
        if (!user) return [];

        const { data } = await supabase
            .from('user_favorites')
            .select(`
        product_id,
        products (
          id,
          name,
          brand,
          category,
          type,
          price,
          image_url,
          tag
        )
      `)
            .eq('user_id', user.id);

        return data ? data.map(f => f.products) : [];
    }
};

async function updateNavbarAuth() {
    const user = await Auth.getCurrentUser();
    const userLinks = document.querySelectorAll('.nav-user-link');

    userLinks.forEach(link => {
        if (user) {
            link.href = 'profile.html';
        } else {
            link.href = 'login.html';
        }
    });

    // Admin Link Injection
    if (user && user.email === 'admin@ownthestreets.com') {
        const navContainer = document.querySelector('.hidden.lg\\:flex.items-center.space-x-8');
        if (navContainer && !document.getElementById('nav-admin-link')) {
            const adminLink = document.createElement('a');
            adminLink.id = 'nav-admin-link';
            adminLink.href = 'admin.html';
            adminLink.className = 'text-red-500 font-bold hover:text-red-400 transition';
            adminLink.textContent = 'ADMIN DASHBOARD';
            navContainer.appendChild(adminLink);
        }
    }
}

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateBadge();
    updateNavbarAuth();
});
