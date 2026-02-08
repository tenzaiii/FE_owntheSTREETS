-- Update the sequence for valid 14-digit IDs
-- 14 Digits starts at 10,000,000,000,000
-- This keeps it within BigInt / JS Safe Integer limits (16 digits)

ALTER SEQUENCE public.orders_id_seq RESTART WITH 10000000000000;
