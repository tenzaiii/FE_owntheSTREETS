-- Allow users to insert their own profile row (for pre-existing users who missed the signup trigger)
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );
