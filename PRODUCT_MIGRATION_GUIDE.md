# Supabase Product Migration Guide

## Overview

This guide explains how to migrate your product catalog to Supabase and integrate it with your website.

## Step 1: Run the SQL Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to create the tables

## Step 2: Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **Create a new bucket**
3. Name: `product-images`
4. Set to **Public**
5. Click **Create bucket**

## Step 3: Migrate Product Data

1. Open `migrate-products.html` in your browser
2. Click **Migrate Products**
3. Wait for all products to be imported
4. Verify in Supabase Dashboard > Table Editor > products

## Step 4: Upload Product Images (Optional)

Currently, products are using local image paths (`IMG/...`). To use Supabase Storage:

### Option A: Manual Upload via Dashboard

1. Go to **Storage** > `product-images` bucket
2. Upload images from your `IMG/` folder
3. Update product `image_url` in the database to use Supabase URLs:
   - Format: `https://[project-ref].supabase.co/storage/v1/object/public/product-images/[filename]`

### Option B: Keep Local Images

- Products will continue to use local paths
- This works fine for development
- For production, consider using a CDN or Supabase Storage

## Step 5: Test the Integration

1. Open `index.html` in your browser
2. Check the browser console for "✅ Loaded X products from Supabase"
3. Navigate to catalog and product pages
4. Verify products load correctly

## Troubleshooting

### Products not loading

- Check browser console for errors
- Verify `supabase-client.js` has correct credentials
- Ensure SQL schema was run successfully
- Check Network tab for failed requests

### Images not displaying

- Verify image paths in database
- Check if `product-images` bucket is public
- For local images, ensure `IMG/` folder exists

## Files Updated

- ✅ `index.html` - Uses `products-loader.js`
- ✅ `catalog.html` - Uses `products-loader.js`
- ✅ `product.html` - Uses `products-loader.js`
- ✅ `profile.html` - Uses `products-loader.js`

## Next Steps

- Update remaining pages (cart.html) if needed
- Upload images to Supabase Storage
- Test authentication flow with Supabase
- Deploy to production
