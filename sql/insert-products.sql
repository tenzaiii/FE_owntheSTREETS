-- Insert Products into Supabase Database
-- Run this in Supabase SQL Editor after running supabase-schema.sql

-- New Era Products
INSERT INTO products (id, name, brand, category, type, price, image_url, tag, sizes, description) VALUES
(1, 'New Era Wordmark Year of the Horse Black 9FORTY Adjustable Cap', 'New Era', 'Headwear', 'Cap', 2395, 'IMG/NWElogo.png', 'New', ARRAY['One Size'], 'New Era Wordmark Year of the Horse Black 9FORTY Adjustable Cap featuring premium construction and classic streetwear styling. Perfect for everyday wear and street style enthusiasts.'),
(2, 'New Era Script Year of the Horse Walnut Skully Hat', 'New Era', 'Headwear', 'Cap', 2595, 'IMG/NWElogo.png', 'New', ARRAY['One Size'], ''),
(3, 'New Era Poly Suede Black Fleece Pants', 'New Era', 'Bottom', 'Apparel', 5595, 'IMG/ESNlogo.png', 'New', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'New Era Poly Suede Black Fleece Pants with soft poly suede finish for premium comfort. Made in China from 95% polyester and 5% polyurethane for durable, flexible sportswear wear. Fleece-lined construction delivers warmth and all-day comfort. Easy to style with sports t shirt, coolera t shirt, or jersey shirt for casual sports attire. Versatile sportswear essential that pairs well with headwear, caps for men, and new era womens looks.'),
(4, 'New Era Wordmark Tough Gear Pack Cordura 9FORTY Adjustable Cap', 'New Era', 'Headwear', 'Cap', 3095, 'IMG/NWElogo.png', 'Online Exclusive', ARRAY['One Size'], ''),
(5, 'New Era Box Logo Metal Badge 9FORTY Adjustable Cap', 'New Era', 'Headwear', 'Cap', 2395, 'IMG/NWElogo.png', 'New', ARRAY['One Size'], ''),
(6, 'New Era Logo White 3 Pack Ankle Socks', 'New Era', 'Accessory', 'Accessory', 895, 'IMG/NWElogo.png', 'Essentials', ARRAY['One Size'], ''),
(7, 'New Era Wordmark Year of the Horse Walnut Drawstring Bag', 'New Era', 'Accessory', 'Accessory', 2095, 'IMG/NWElogo.png', 'New', ARRAY['One Size'], '');

-- Essentials Products
INSERT INTO products (id, name, brand, category, type, price, image_url, tag, sizes, description) VALUES
(20, 'Essentials Relaxed Fit Graphic T-Shirt', 'Essentials', 'Top', 'Apparel', 2895, 'IMG/ESNlogo.png', 'Bestseller', ARRAY['S', 'M', 'L', 'XL'], ''),
(21, 'Essentials Everyday Sweatshorts', 'Essentials', 'Bottom', 'Apparel', 3295, 'IMG/ESNlogo.png', 'New', ARRAY['S', 'M', 'L', 'XL'], ''),
(22, 'Essentials Heavyweight Jersey Longsleeve', 'Essentials', 'Top', 'Apparel', 3595, 'IMG/ESNlogo.png', 'Bestseller', ARRAY['S', 'M', 'L', 'XL'], '');

-- Nike Products
INSERT INTO products (id, name, brand, category, type, price, image_url, tag, sizes, description) VALUES
(30, 'Nike Club Fleece Pullover Hoodie', 'Nike', 'Top', 'Apparel', 4495, 'IMG/NKElogo.png', 'Online Exclusive', ARRAY['S', 'M', 'L', 'XL'], ''),
(31, 'Nike Club Cargo Track Pants', 'Nike', 'Bottom', 'Apparel', 5095, 'IMG/NKElogo.png', 'New', ARRAY['S', 'M', 'L', 'XL'], '');

-- Stussy Products
INSERT INTO products (id, name, brand, category, type, price, image_url, tag, sizes, description) VALUES
(40, 'Stussy Stock Logo Pigment Dyed Tee Black', 'Stussy', 'Top', 'Apparel', 3495, 'IMG/STSlogo.jpg', 'New', ARRAY['S', 'M', 'L', 'XL'], ''),
(41, 'Stussy International Work Gear Canvas Jacket', 'Stussy', 'Top', 'Apparel', 8995, 'IMG/STSlogo.jpg', 'Limited', ARRAY['S', 'M', 'L', 'XL'], ''),
(42, 'Stussy Script Logo Bucket Hat Natural', 'Stussy', 'Headwear', 'Cap', 3295, 'IMG/STSlogo.jpg', 'New', ARRAY['One Size'], '');

-- Carhartt Products
INSERT INTO products (id, name, brand, category, type, price, image_url, tag, sizes, description) VALUES
(50, 'Carhartt WIP OG Active Jacket Black', 'Carhartt', 'Top', 'Apparel', 9995, 'IMG/CRTlogo.png', 'Iconic', ARRAY['S', 'M', 'L', 'XL'], ''),
(51, 'Carhartt WIP Single Knee Rinse Wash Pants', 'Carhartt', 'Bottom', 'Apparel', 6495, 'IMG/CRTlogo.png', 'New', ARRAY['S', 'M', 'L', 'XL'], ''),
(52, 'Carhartt WIP Chase Beanie Hamilton Brown', 'Carhartt', 'Headwear', 'Cap', 1995, 'IMG/CRTlogo.png', 'Essentials', ARRAY['One Size'], '');

-- Chrome Hearts Products
INSERT INTO products (id, name, brand, category, type, price, image_url, tag, sizes, description) VALUES
(60, 'Chrome Hearts Cross Patch Trucker Cap Black', 'Chrome Hearts', 'Headwear', 'Cap', 12995, 'IMG/CHRlogo.png', 'Exclusive', ARRAY['One Size'], ''),
(61, 'Chrome Hearts Horseshoe Logo Pocket Tee White', 'Chrome Hearts', 'Top', 'Apparel', 10995, 'IMG/CHRlogo.png', 'New', ARRAY['S', 'M', 'L', 'XL'], ''),
(62, 'Chrome Hearts Leather Cross Patch Sweatpants', 'Chrome Hearts', 'Bottom', 'Apparel', 15995, 'IMG/CHRlogo.png', 'Limited', ARRAY['S', 'M', 'L', 'XL'], ''),
(63, 'Los Angeles Dodgers Upside Down Dark Royal 59FIFTY Fitted Cap', 'New Era', 'Headwear', 'Cap', 2695, 'IMG/CATALOG/cap1.webp', 'Limited', ARRAY['One Size'], '');

-- Verify insertion
SELECT COUNT(*) as total_products FROM products;
