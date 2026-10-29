import { COMMERCE_ENABLED, DEMO_MESSAGE } from '@/lib/commerce';
import { NextResponse } from 'next/server';
import {
  isAllowedRequestOrigin,
  MAX_CART_LINES,
  normalizeCartId,
  normalizeCartLines,
  normalizeLineIds,
  readJsonBody,
} from '@/lib/cart-validation';
import { cartLinesRateLimiter, rateLimitResponse } from '@/lib/rate-limit';
import {
  addToCart,
  removeFromCart,
  updateCartLines,
} from '@/lib/queries/cart';

export const dynamic = 'force-dynamic';

type CartLinesAction = 'add' | 'update' | 'remove';

interface CartLinesPayload {
  action?: CartLinesAction;
  cartId?: string;
  lines?: { merchandiseId?: string; id?: string; quantity?: number }[];
  lineIds?: string[];
}

export async function POST(request: Request) {
  if (!COMMERCE_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 403 });
  }

  const origin = request.headers.get('origin');
  if (!isAllowedRequestOrigin(origin, new URL(request.url).origin)) {
    return NextResponse.json({ error: 'Request origin is not allowed' }, { status: 403 });
  }

  // Best-effort per-instance cap; the Vercel WAF rule is the durable layer (see lib/rate-limit.js).
  const limited = rateLimitResponse(request, cartLinesRateLimiter);
  if (limited) return limited;

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.status === 413
      ? NextResponse.json({ error: 'Request body is too large' }, { status: 413 })
      : NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const payload = body.data as CartLinesPayload;

  if (
    (Array.isArray(payload.lines) && payload.lines.length > MAX_CART_LINES) ||
    (Array.isArray(payload.lineIds) && payload.lineIds.length > MAX_CART_LINES)
  ) {
    return NextResponse.json({ error: `At most ${MAX_CART_LINES} lines per request` }, { status: 400 });
  }

  const cartId = normalizeCartId(payload.cartId);

  if (!cartId) {
    return NextResponse.json({ error: 'A valid cart id is required' }, { status: 400 });
  }

  try {
    if (payload.action === 'add') {
      const lines = normalizeCartLines(payload.lines) as { merchandiseId: string; quantity: number }[];

      if (lines.length === 0) {
        return NextResponse.json({ error: 'At least one valid line is required' }, { status: 400 });
      }

      const cart = await addToCart(cartId, lines);
      return NextResponse.json({ cart });
    }

    if (payload.action === 'update') {
      const lines = normalizeCartLines(payload.lines, { idKey: 'id', allowZero: true }) as { id: string; quantity: number }[];

      if (lines.length === 0) {
        return NextResponse.json({ error: 'At least one valid line is required' }, { status: 400 });
      }

      const cart = await updateCartLines(cartId, lines);
      return NextResponse.json({ cart });
    }

    if (payload.action === 'remove') {
      const lineIds = normalizeLineIds(payload.lineIds) as string[];

      if (lineIds.length === 0) {
        return NextResponse.json({ error: 'At least one line id is required' }, { status: 400 });
      }

      const cart = await removeFromCart(cartId, lineIds);
      return NextResponse.json({ cart });
    }

    return NextResponse.json({ error: 'Unsupported cart line action' }, { status: 400 });
  } catch (error) {
    console.error('[Cart API] line mutation failed:', error);
    return NextResponse.json({ error: 'Unable to update cart' }, { status: 502 });
  }
}
