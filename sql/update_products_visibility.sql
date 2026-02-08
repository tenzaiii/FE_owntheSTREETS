-- Add is_hidden column to products table
ALTER TABLE products 
ADD COLUMN is_hidden BOOLEAN DEFAULT false;

-- Index for performance (optional but good practice)
CREATE INDEX idx_products_is_hidden ON products(is_hidden);
