-- Allow public (or anon) insert access to products for migration purposes
-- Run this in your Supabase SQL Editor to fix the "new row violates row-level security policy" error

CREATE POLICY "Enable insert for authenticated users only" 
ON products FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- OPTION 2: If you are running the migration from a script without logging in (using anon key only),
-- you might need to temporarily allow public inserts. UNCOMMENT the following if Option 1 fails:

CREATE POLICY "Enable insert for anon key" 
ON products FOR INSERT 
WITH CHECK (true);

-- Be sure to delete or disable the anon policy after migration is complete!
