import worker from '../../../worker.js';
import { authClient, storageClient } from '../../../server/supabase.js';
import { allowedUser, sameOrigin, trustedRequest } from '../../../server/access.js';
import { database, createD1Adapter } from '../../../server/database.js';
import { createBucketAdapter } from '../../../server/storage.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
async function handle(request) {
  if (!['GET','HEAD'].includes(request.method) && !sameOrigin(request))
    return Response.json({error:'This request could not be verified.'}, {status:403});
  try {
    const supabase = await authClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !allowedUser(user)) return Response.json({error:'Sign in to open your private closet.'}, {status:401, headers:{'Cache-Control':'no-store'}});
    return await worker.fetch(trustedRequest(request, user), {
      DB: createD1Adapter(database()),
      BUCKET: createBucketAdapter(storageClient()),
    });
  } catch {
    return Response.json({error:'Your closet is temporarily unavailable. Please try again.'}, {status:503, headers:{'Cache-Control':'no-store'}});
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE, handle as PUT };
