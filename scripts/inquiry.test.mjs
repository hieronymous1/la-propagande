import assert from 'node:assert/strict';
import test from 'node:test';
import { handleInquiry } from '../lib/inquiry.js';

const request = (data, origin = 'https://www.lapropagande.net') => new Request('https://www.lapropagande.net/api/inquiry', {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(data),
});
const valid = { inquiryType: 'archive', name: 'Test visitor', email: 'visitor@example.org', message: 'An archive contribution' };

test('inquiries reject invalid submissions before reaching the mail provider', async () => {
  const send = () => { throw new Error('Must not send'); };
  for (const data of [{ ...valid, email: 'invalid' }, { ...valid, inquiryType: 'other' }, { ...valid, name: '' }, { ...valid, website: 'bot' }]) {
    assert.equal((await handleInquiry(request(data), {}, send)).status, 400);
  }
  assert.equal((await handleInquiry(request(valid, 'https://other.example'), {}, send)).status, 403);
  assert.equal((await handleInquiry(request({ ...valid, message: 'x'.repeat(20000) }), {}, send)).status, 413);
});

test('Resend sends only to the configured brand inbox, using the visitor as reply-to', async () => {
  let body;
  const result = await handleInquiry(request({ ...valid, to: 'attacker@example.org' }), { RESEND_API_KEY: 'test-key', MAIL_FROM: 'La Propagande <forms@example.org>' }, async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    body = JSON.parse(options.body);
    return Response.json({ id: 'delivery-123' });
  });
  assert.equal(result.status, 200);
  assert.deepEqual(body.to, ['lapropagandeparisbey@outlook.com']);
  assert.equal(body.reply_to, valid.email);
  assert.ok(body.text.includes(valid.message));
});

test('provider rejection, missing mail configuration and inactive FormSubmit never report success', async () => {
  assert.equal((await handleInquiry(request(valid), {})).status, 503);
  const env = { INQUIRY_FORM_ENDPOINT: 'https://formsubmit.co/ajax/lapropagandeparisbey@outlook.com' };
  assert.equal((await handleInquiry(request(valid), env, async () => Response.json({ success: 'false' }))).status, 502);
  assert.equal((await handleInquiry(request(valid), env, async () => new Response(null, { status: 500 }))).status, 502);
  assert.equal((await handleInquiry(request(valid), env, async () => Response.json({ success: 'true' }))).status, 200);
});

test('FormSubmit receives the website referrer required for server-side delivery', async () => {
  const env = { INQUIRY_FORM_ENDPOINT: 'https://formsubmit.co/ajax/lapropagandeparisbey@outlook.com' };
  const result = await handleInquiry(request(valid), env, async (_url, options) => {
    assert.equal(options.headers.Referer, 'https://www.lapropagande.net/');
    assert.equal(JSON.parse(options.body)._captcha, 'false');
    return Response.json({ success: 'true' });
  });
  assert.equal(result.status, 200);
});
