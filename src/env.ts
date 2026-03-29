export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)!
};

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables. Please check .env.local.");
}
