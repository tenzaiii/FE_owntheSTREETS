// Product Loader - Fetches products from Supabase
// Replaces the static catalog-data.js

// Global products array (populated from Supabase)
window.catalogProducts = [];
window.productsLoaded = false;

// Load products from Supabase
async function loadProducts() {
    if (window.productsLoaded) return window.catalogProducts;

    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase client not initialized');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        // Transform Supabase data to match frontend format
        window.catalogProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            type: product.type,
            price: product.price,
            tag: product.tag,
            image: product.image_url,
            images: [product.image_url], // Can expand if multiple images stored
            sizes: product.sizes || ['One Size'],
            description: product.description || ''
        }));

        window.productsLoaded = true;
        console.log(`✅ Loaded ${window.catalogProducts.length} products from Supabase`);

        // Dispatch event so pages know products are ready
        window.dispatchEvent(new Event('productsLoaded'));

        return window.catalogProducts;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// Load single product by ID
async function loadProductById(productId) {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        // Transform to frontend format
        return {
            id: data.id,
            name: data.name,
            brand: data.brand,
            category: data.category,
            type: data.type,
            price: data.price,
            tag: data.tag,
            image: data.image_url,
            images: [data.image_url],
            sizes: data.sizes || ['One Size'],
            description: data.description || ''
        };
    } catch (error) {
        console.error('Error loading product:', error);
        return null;
    }
}

// Auto-load products when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
} else {
    loadProducts();
}
