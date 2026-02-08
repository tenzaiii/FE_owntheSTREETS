-- Add new columns to orders table for checkout
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS payment_method text, -- 'gcash' or 'cod'
ADD COLUMN IF NOT EXISTS contact_number text;

-- Make sure RLS policies allow update if needed, but insert is already open.
