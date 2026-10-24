import ClosetApp from '../components/closet-app';
import { authClient } from '../server/supabase';
import { allowedUser } from '../server/access';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Page() {
  let user;
  try { const client = await authClient(); ({ data: { user } } = await client.auth.getUser()); } catch { redirect('/login?setup=1'); }
  if (!allowedUser(user)) redirect('/login');
  return <ClosetApp />;
}
