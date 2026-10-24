import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
export async function proxy(request) {
  let response = NextResponse.next({request});
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookieOptions: { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV === 'production', path:'/' },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({name,value}) => request.cookies.set(name,value));
        response = NextResponse.next({request});
        values.forEach(({name,value,options}) => response.cookies.set(name,value,options));
      },
    },
  });
  await supabase.auth.getUser();
  response.headers.set('Cache-Control','private, no-store');
  return response;
}
export const config = { matcher:['/', '/login', '/auth/:path*'] };
