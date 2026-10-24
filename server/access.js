export function allowedUser(user, ownerEmail = process.env.CLOSET_OWNER_EMAIL) {
  return !!(ownerEmail && user?.email_confirmed_at && user?.email && user.email.toLowerCase() === ownerEmail.trim().toLowerCase());
}
export function sameOrigin(request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
export function trustedRequest(request, user) {
  const headers = new Headers(request.headers);
  for (const key of [...headers.keys()]) if (key.startsWith('oai-')) headers.delete(key);
  headers.set('oai-authenticated-user-id', user.id);
  headers.set('oai-authenticated-user-email', user.email);
  headers.set('oai-authenticated-user-full-name', encodeURIComponent(user.user_metadata?.name || 'Sahiti'));
  headers.set('oai-authenticated-user-full-name-encoding', 'percent-encoded-utf-8');
  const url = new URL(request.url);
  // Next.js may canonicalize API URLs with a trailing slash; the service uses exact paths.
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return new Request(new Request(url, request), { headers });
}
