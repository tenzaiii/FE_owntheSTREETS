-- owntheSTREETS Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- ==========================================
-- PRODUCTS TABLE
-- ==========================================
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  price DECIMAL NOT NULL,
  image_url TEXT,
  tag TEXT,
  sizes TEXT[], -- Array of available sizes like ['S', 'M', 'L', 'XL']
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access for products
CREATE POLICY "Public read access" 
ON products FOR SELECT 
USING (true);

-- ==========================================
-- USER FAVORITES TABLE
-- ==========================================
CREATE TABLE user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own favorites
CREATE POLICY "Users can manage own favorites" 
ON user_favorites FOR ALL 
USING (auth.uid() = user_id);

-- ==========================================
-- CART ITEMS TABLE (Optional - for persistent cart)
-- ==========================================
CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, size)
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own cart
CREATE POLICY "Users can manage own cart" 
ON cart_items FOR ALL 
USING (auth.uid() = user_id);

-- ==========================================
-- INDEXES for better performance
-- ==========================================
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- ==========================================
-- STORAGE BUCKET SETUP
-- ==========================================
-- Run this to create the storage bucket (or create via UI)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('product-images', 'product-images', true);

-- Allow public read access to product images
-- CREATE POLICY "Public read access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'product-images');

-- Allow authenticated users to upload (if needed for admin)
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
