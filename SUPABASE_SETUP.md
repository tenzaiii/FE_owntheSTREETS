# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: owntheSTREETS
   - **Database Password**: (choose a strong password)
   - **Region**: (choose closest to your users)
5. Click "Create new project" and wait for setup to complete

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Configure the Client

1. Open `supabase-client.js`
2. Replace `YOUR_SUPABASE_URL` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase-schema.sql`
4. Paste into the editor
5. Click "Run" to execute

## Step 5: Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `product-images`
4. Set it to **Public**
5. Click "Create bucket"

## Step 6: Configure Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider (should be on by default)
3. Optional: Disable email confirmation for testing
   - Go to **Authentication** > **Settings**
   - Uncheck "Enable email confirmations" (re-enable in production)

## Step 7: Upload Product Images

You'll need to upload your product images to the `product-images` bucket. You can do this via:

- The Supabase dashboard UI (Storage section)
- Or programmatically using the Supabase client

The image URLs will be: `https://[your-project-ref].supabase.co/storage/v1/object/public/product-images/[filename]`

## Step 8: Seed Product Data

After uploading images, you'll need to insert your product data into the `products` table. You can:

- Use the Supabase dashboard Table Editor
- Run INSERT statements in SQL Editor
- Or use the migration script I'll provide

## Next Steps

Once setup is complete:

1. Update `supabase-client.js` with your credentials
2. The website will automatically use Supabase for authentication and data
3. Test user signup, login, and product browsing
