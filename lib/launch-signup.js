import { saveLaunchSignup } from './shopify-launch-signups.js';
import { launchSignupRateLimiter, rateLimitResponse, RATE_LIMIT_MESSAGE } from './rate-limit.js';

const MAX_BYTES = 2048;

function reply(message, status) {
  return Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Submit only validated, explicitly consented launch notifications. */
export async function handleLaunchSignup(request, env = process.env, send = fetch, save = saveLaunchSignup, limiter = launchSignupRateLimiter) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return reply('Please submit from this website.', 403);
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return reply('Invalid request.', 415);
  }
  // Counted after the cheap same-origin checks so a third-party page cannot burn a visitor's quota.
  const limited = rateLimitResponse(request, limiter, { message: RATE_LIMIT_MESSAGE });
  if (limited) return limited;
  if (Number(request.headers.get('content-length')) > MAX_BYTES) return reply('Request too large.', 413);

  let data;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply('Invalid request.', 400);
    const decoder = new TextDecoder();
    let body = '';
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        return reply('Request too large.', 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    data = JSON.parse(body + decoder.decode());
  } catch {
    return reply('Invalid request.', 400);
  }
  const email = typeof data?.email === 'string' ? data.email.trim() : '';
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || data?.consent !== true || data?.website) {
    return reply('Enter a valid email and agree to the launch notification.', 400);
  }

  if (env.LAUNCH_SIGNUP_STORAGE === 'shopify') {
    try {
      await save(email, env, send);
      return reply('Thank you. We will email you when ordering opens.', 200);
    } catch {
      console.error('Launch signup storage failed');
      return reply('Could not save your email. Please try again shortly.', 502);
    }
  }

  const formId = env.NEXT_PUBLIC_FORMSPREE_ID;
  const endpoint = env.LAUNCH_SIGNUP_ENDPOINT || (formId && /^[a-zA-Z0-9]+$/.test(formId) ? `https://formspree.io/f/${formId}` : '');
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid endpoint');
  } catch {
    return reply('Launch notifications are not available yet. Please try again later.', 503);
  }
  try {
    const response = await send(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Referer: `${new URL(request.url).origin}/` },
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ email, consent: true, source: 'website-launch', message: 'Please notify me when La Propagande is ready to take orders.', _captcha: 'false' }),
    });
    if (!response.ok) {
      console.error('Launch signup provider HTTP failure', response.status);
      return reply('Could not save your email. Please try again shortly.', 502);
    }
    if (new URL(endpoint).hostname === 'formsubmit.co') {
      const result = await response.json();
      if (result.success !== true && result.success !== 'true') {
        return reply('Email signup is temporarily unavailable. Please contact us directly.', 502);
      }
    }
    return reply('Thank you. We will email you when ordering opens.', 200);
  } catch (error) {
    console.error('Launch signup provider request failed', error?.name, error?.cause?.code);
    return reply('Could not save your email. Please try again shortly.', 502);
  }
}
