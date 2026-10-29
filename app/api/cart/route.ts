import { COMMERCE_ENABLED, DEMO_MESSAGE } from '@/lib/commerce';
import { NextResponse } from 'next/server';
import { isAllowedRequestOrigin, normalizeCartId } from '@/lib/cart-validation';
import { createCart, getCart } from '@/lib/queries/cart';
import { cartCreateRateLimiter, rateLimitResponse } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function rejectCrossSite(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');
  if (isAllowedRequestOrigin(origin, new URL(request.url).origin)) return null;
  return NextResponse.json({ error: 'Request origin is not allowed' }, { status: 403 });
}

export async function POST(request: Request) {
  if (!COMMERCE_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 403 });
  }

  const originError = rejectCrossSite(request);
  if (originError) return originError;

  // Best-effort per-instance cap; the Vercel WAF rule is the durable layer (see lib/rate-limit.js).
  const limited = rateLimitResponse(request, cartCreateRateLimiter);
  if (limited) return limited;

  try {
    const cart = await createCart();
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('[Cart API] create failed:', error);
    return NextResponse.json({ error: 'Unable to create cart' }, { status: 502 });
  }
}

export async function GET(request: Request) {
  if (!COMMERCE_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = normalizeCartId(url.searchParams.get('id'));

  if (!id) {
    return NextResponse.json({ error: 'A valid cart id is required' }, { status: 400 });
  }

  try {
    const cart = await getCart(id);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('[Cart API] load failed:', error);
    return NextResponse.json({ error: 'Unable to load cart' }, { status: 502 });
  }
}
