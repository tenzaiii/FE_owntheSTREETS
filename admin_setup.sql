-- Admin Dashboard Tables & Policies

-- ==========================================
-- PROFILES (Sync with auth.users for Customer Management)
-- ==========================================
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  role text default 'customer',
  created_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policies
create policy "Public profiles are viewable by everyone" on profiles for select using ( true );
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );

-- ==========================================
-- ORDERS
-- ==========================================
create table public.orders (
  id bigserial primary key,
  user_id uuid references auth.users(id), -- Nullable for guest
  guest_email text, -- For guest checkout
  guest_info jsonb, -- { name, address, etc }
  total_amount decimal not null,
  status text default 'pending', -- pending, processing, shipped, delivered, cancelled
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders" on orders for select using ( auth.uid() = user_id );
create policy "Admin can view all orders" on orders for all using ( auth.jwt() ->> 'email' = 'admin@ownthestreets.com' );
-- Allow inserts for everyone (checkout)
create policy "Anyone can create orders" on orders for insert with check ( true ); 

-- ==========================================
-- ORDER ITEMS
-- ==========================================
create table public.order_items (
  id bigserial primary key,
  order_id bigint references public.orders(id) on delete cascade,
  product_id bigint references public.products(id),
  quantity int not null,
  size text,
  price_at_time decimal not null,
  product_name text -- Snapshot in case product is deleted
);

alter table public.order_items enable row level security;

create policy "Users can view own order items" on order_items for select using ( 
    exists ( select 1 from orders where id = order_items.order_id and user_id = auth.uid() ) 
);
create policy "Admin can view all order items" on order_items for all using ( auth.jwt() ->> 'email' = 'admin@ownthestreets.com' );
create policy "Anyone can create order items" on order_items for insert with check ( true );

-- ==========================================
-- UPDATE PRODUCTS POLICIES FOR ADMIN
-- ==========================================
-- Add policy for Admin to Insert/Update/Delete Products
create policy "Admin can manage products" on products for all using ( auth.jwt() ->> 'email' = 'admin@ownthestreets.com' );
