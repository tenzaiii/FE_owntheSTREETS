-- Populate additional_images for existing products (Demo Data)
-- This just duplicates the main image to verify gallery functionality

UPDATE products
SET additional_images = ARRAY[image_url, image_url]
WHERE additional_images IS NULL OR array_length(additional_images, 1) IS NULL;
