import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
export function authConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Authentication is not configured');
  return { url, key };
}
export async function authClient() {
  const jar = await cookies();
  const { url, key } = authConfig();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: values => { try { values.forEach(({name,value,options}) => jar.set(name,value,options)); } catch { /* Proxy refreshes cookies for server components. */ } },
    },
  });
}
export function storageClient() {
  const { url } = authConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('Private storage is not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
