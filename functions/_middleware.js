/**
 * HTTP Basic Auth for Cloudflare Pages preview.
 * Set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in Pages → Settings → Environment variables.
 */
export async function onRequest(context) {
  const { request, env, next } = context;
  const user = env.BASIC_AUTH_USER;
  const pass = env.BASIC_AUTH_PASSWORD;

  if (!user || !pass) {
    return new Response(
      'Preview auth is not configured. Set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in Cloudflare Pages.',
      { status: 503, headers: { 'Content-Type': 'text/plain' } },
    );
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      let decoded;
      try {
        decoded = atob(encoded);
      } catch {
        decoded = '';
      }
      const colon = decoded.indexOf(':');
      if (colon !== -1) {
        const providedUser = decoded.slice(0, colon);
        const providedPass = decoded.slice(colon + 1);
        if (providedUser === user && providedPass === pass) {
          return next();
        }
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Hydra App Prototype Preview", charset="UTF-8"',
    },
  });
}
