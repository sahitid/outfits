import { authClient } from '../../../server/supabase';
import { allowedUser } from '../../../server/access';
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    try {
      const client = await authClient();
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (!error && allowedUser(data.user)) return Response.redirect(new URL('/',url),303);
      await client.auth.signOut();
    } catch {}
  }
  return Response.redirect(new URL('/login?confirmation=failed',url),303);
}
