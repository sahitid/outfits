import { authClient } from '../../../server/supabase';
import { allowedUser, sameOrigin } from '../../../server/access';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body, status = 200) => Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request, context) {
  if (!sameOrigin(request)) return json({error:'This request could not be verified.'},403);
  try {
    const { action } = await context.params;
    const client = await authClient();
    if (action === 'logout') { await client.auth.signOut(); return json({ok:true}); }
    const { email, password, token } = await request.json();
    if (!process.env.CLOSET_OWNER_EMAIL || typeof email !== 'string' || email.trim().toLowerCase() !== process.env.CLOSET_OWNER_EMAIL.trim().toLowerCase())
      return json({error:'This is a private closet. Please use the owner’s email address.'},403);
    const normalized = email.trim().toLowerCase();
    if (action === 'verify') {
      const { data, error } = await client.auth.verifyOtp({email:normalized, token, type:'signup'});
      if (error || !allowedUser(data.user)) return json({error:'That code is invalid or has expired.'},400);
      return json({ok:true});
    }
    if (!['login','signup'].includes(action)) return json({error:'Not found'},404);
    if (typeof password !== 'string' || password.length < 12 || password.length > 128)
      return json({error:'Use a password between 12 and 128 characters.'},400);
    const { data, error } = action === 'signup'
      ? await client.auth.signUp({email:normalized, password, options:{emailRedirectTo:new URL('/auth/callback',request.url).href}})
      : await client.auth.signInWithPassword({email:normalized,password});
    if (error) return json({error:action === 'login' ? 'Check your email and password, and confirm your email before signing in.' : 'Could not create your account. Try signing in if you already registered, or check email delivery in Supabase.'},400);
    if (action === 'signup' && !data.session) return json({confirmation:true});
    if (!allowedUser(data.user)) { await client.auth.signOut(); return json({error:'Please confirm your email first.'},403); }
    return json({ok:true});
  } catch { return json({error:'Sign-in is temporarily unavailable. Please try again.'},503); }
}
