import { inquiryRateLimiter, rateLimitResponse, RATE_LIMIT_MESSAGE } from './rate-limit.js';

const MAX_BYTES = 16384;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
/** Per-field character caps (the whole body is still capped at MAX_BYTES). */
export const FIELD_MAX_LENGTHS = {
  name: 150, email: 254, message: 8000, phoneWhatsapp: 40, city: 120, jacketSize: 20, fitPreference: 40,
  colorPreference: 500, reference: 1000, prints: 500, embroideries: 500, patches: 300, patchQuantity: 10, notes: 5000,
};
const FIELDS = Object.keys(FIELD_MAX_LENGTHS);
const reply = (message, status) => Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });

/** Same-origin mail gateway. Recipients and provider credentials never come from the browser. */
export async function handleInquiry(request, env = process.env, send = fetch, limiter = inquiryRateLimiter) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply('Please submit from this website.', 403);
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return reply('Invalid request.', 415);
  // Counted after the cheap same-origin checks so a third-party page cannot burn a visitor's quota.
  const limited = rateLimitResponse(request, limiter, { message: RATE_LIMIT_MESSAGE });
  if (limited) return limited;
  let data;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply('Invalid request.', 400);
    const chunks = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); return reply('Request too large.', 413); }
      chunks.push(value);
    }
    data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return reply('Invalid request.', 400); }
  if (!data || !['archive', 'custom-jackets'].includes(data.inquiryType) || data.website || typeof data.name !== 'string' || !data.name.trim() || data.name.length > 150 || typeof data.email !== 'string' || data.email.length > 254 || !EMAIL.test(data.email.trim())) return reply('Enter your name and a valid email.', 400);
  if (data.inquiryType === 'archive' && (typeof data.message !== 'string' || !data.message.trim())) return reply('Please include your contribution.', 400);
  if (data.inquiryType === 'custom-jackets' && data.consent !== true) return reply('Please agree to be contacted about your inquiry.', 400);
  if (FIELDS.some(key => typeof data[key] === 'string' && data[key].trim().length > FIELD_MAX_LENGTHS[key])) return reply('One of the fields is too long. Please shorten it and try again.', 400);
  const fields = Object.fromEntries(FIELDS.filter(key => typeof data[key] === 'string').map(key => [key, data[key].trim()]));
  const subject = data.inquiryType === 'archive' ? 'New Archive Contribution' : 'New Custom Jacket Inquiry';
  let endpoint; let headers; let body;
  if (env.RESEND_API_KEY && env.MAIL_FROM) {
    endpoint = 'https://api.resend.com/emails';
    headers = { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' };
    body = { from: env.MAIL_FROM, to: [env.MAIL_TO || 'lapropagandeparisbey@outlook.com'], reply_to: fields.email, subject, text: Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n\n') };
  } else {
    endpoint = env.INQUIRY_FORM_ENDPOINT || env.NEXT_PUBLIC_CUSTOM_JACKETS_FORM_ENDPOINT || env.LAUNCH_SIGNUP_ENDPOINT;
    try { const url = new URL(endpoint); if (url.protocol !== 'https:' || url.username || url.password) throw new Error(); }
    catch { return reply('Email is temporarily unavailable. Please use the direct email link below.', 503); }
    headers = { 'Content-Type': 'application/json', Accept: 'application/json', Referer: `${new URL(request.url).origin}/` };
    body = { ...fields, _subject: subject, _captcha: 'false', _template: 'table', _url: new URL(request.url).origin, inquiryType: data.inquiryType };
  }
  try {
    const response = await send(endpoint, { method: 'POST', headers, body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error();
    if (new URL(endpoint).hostname === 'formsubmit.co') {
      const result = await response.json();
      if (result.success !== true && result.success !== 'true') throw new Error();
    }
    return reply('Your inquiry has been received.', 200);
  } catch { return reply('Email delivery failed. Your details are still here; use the direct email link below.', 502); }
}
