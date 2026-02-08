// Supabase Client Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://thkveciwgbpeodjddqse.supabase.co'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoa3ZlY2l3Z2JwZW9kamRkcXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjE3NzUsImV4cCI6MjA4NTQzNzc3NX0.zhF9WmPMBW7deJJBr0XhEDUEEyN1IKUTs0cZMlutelQ'; // Your public anon key

// Initialize Supabase client
try {
    if (!window.supabase) {
        console.error('CRITICAL ERROR: window.supabase is not defined. The Supabase CDN script may not have loaded correctly.');
        throw new Error('window.supabase not found');
    }

    const { createClient } = window.supabase;
    if (typeof createClient !== 'function') {
        console.error('CRITICAL ERROR: createClient function not found on window.supabase.');
        throw new Error('createClient not found');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Export for use in other files
    window.supabaseClient = supabase;
    console.log('✅ Supabase client initialized successfully.');

} catch (error) {
    console.error('FAILED to initialize Supabase client:', error);
    // Explicitly set to null to avoid undefined checks passing if variable exists but is undefined
    window.supabaseClient = null;
}
